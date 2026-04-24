import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ReportRecord = {
    id: string
    patient_id: string
    doctor_id: string | null
    title: string | null
    summary: string | null
    severity: string | null
    health_score: number | null
    created_at: string
    content: any
    patient: {
        full_name: string | null
        email: string | null
    } | null
    assessment: {
        probabilities: Record<string, number> | null
        explanation: {
            recommendations?: string[]
            summary?: string
        } | null
    } | null
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) return value[0] ?? null
    return value ?? null
}

function scaleProb(v: unknown): number {
    const value = Number(v)
    if (!Number.isFinite(value)) return 0
    return value <= 1 ? value * 100 : value
}

function escapePdfText(input: string): string {
    return input.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function splitLongLine(line: string, maxLen: number): string[] {
    if (line.length <= maxLen) return [line]

    const words = line.split(' ')
    const out: string[] = []
    let current = ''

    for (const word of words) {
        const proposal = current ? `${current} ${word}` : word
        if (proposal.length > maxLen) {
            if (current) out.push(current)
            current = word
        } else {
            current = proposal
        }
    }

    if (current) out.push(current)
    return out
}

function buildLines(report: ReportRecord): string[] {
    const probs = report.assessment?.probabilities || {}
    const content = report.content || {}
    const mlRaw = content.ml_raw || {}

    const heart = scaleProb(probs.heart_disease ?? mlRaw['Heart Disease']?.risk_percent)
    const hyper = scaleProb(probs.hypertension ?? mlRaw['Hypertension']?.risk_percent)
    const diabetes = scaleProb(probs.diabetes ?? mlRaw['Diabetes']?.risk_percent)

    const recommendations =
        report.assessment?.explanation?.recommendations ||
        content.suggestions ||
        []

    const summary =
        report.summary ||
        report.assessment?.explanation?.summary ||
        content.overallAssessment ||
        'Assessment generated successfully.'

    const dateText = new Date(report.created_at).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    const lines: string[] = [
        'Health Buddy - Clinical Report',
        `Report ID: ${report.id.slice(0, 8).toUpperCase()}`,
        `Created: ${dateText}`,
        `Patient: ${report.patient?.full_name || content.patient_name || 'Patient'}`,
        `Email: ${report.patient?.email || 'N/A'}`,
        `Severity: ${(report.severity || 'normal').toUpperCase()}`,
        `Health Score: ${Math.round(Number(report.health_score || 0))}`,
        '',
        'Risk Probabilities',
        `Heart Disease: ${heart.toFixed(1)}%`,
        `Hypertension: ${hyper.toFixed(1)}%`,
        `Diabetes: ${diabetes.toFixed(1)}%`,
        '',
        'Summary',
        ...splitLongLine(String(summary), 90),
        '',
        'Top Recommendations',
    ]

    const recItems = Array.isArray(recommendations) ? recommendations.slice(0, 6) : []
    if (recItems.length === 0) {
        lines.push('- Maintain regular health checkups and follow your physician guidance.')
    } else {
        for (const item of recItems) {
            if (typeof item === 'string') {
                lines.push(...splitLongLine(`- ${item}`, 90))
            } else if (item && typeof item === 'object') {
                const text = `${item.title || 'Recommendation'}${item.body ? `: ${item.body}` : ''}`
                lines.push(...splitLongLine(`- ${text}`, 90))
            }
        }
    }

    lines.push('')
    lines.push('Disclaimer: This report is AI-assisted prediction support and not a final medical diagnosis.')
    lines.push('For accurate diagnosis and treatment decisions, consult a licensed in-person doctor.')

    return lines
}

function createPdfBuffer(lines: string[]): Buffer {
    const maxLines = 44
    const safeLines = lines.slice(0, maxLines)

    if (lines.length > maxLines) {
        safeLines[maxLines - 1] = '[Output trimmed for single-page PDF.]'
    }

    const textCommands: string[] = ['BT', '/F1 11 Tf', '50 760 Td']

    safeLines.forEach((line, index) => {
        const escaped = escapePdfText(line)
        if (index === 0) {
            textCommands.push(`(${escaped}) Tj`)
        } else {
            textCommands.push('0 -16 Td')
            textCommands.push(`(${escaped}) Tj`)
        }
    })

    textCommands.push('ET')

    const stream = textCommands.join('\n')
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
    ]

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = [0]

    for (let i = 0; i < objects.length; i++) {
        offsets.push(Buffer.byteLength(pdf, 'utf8'))
        pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
    }

    const xrefOffset = Buffer.byteLength(pdf, 'utf8')
    pdf += `xref\n0 ${objects.length + 1}\n`
    pdf += '0000000000 65535 f \n'

    for (let i = 1; i < offsets.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
    return Buffer.from(pdf, 'utf8')
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: report, error } = await supabase
        .from('reports')
        .select(
            `
            id,
            patient_id,
            doctor_id,
            title,
            summary,
            severity,
            health_score,
            created_at,
            content,
            patient:patient_id(full_name,email),
            assessment:assessment_id(probabilities,explanation)
        `,
        )
        .eq('id', id)
        .single()

    if (error || !report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const canAccess = report.patient_id === user.id || report.doctor_id === user.id
    if (!canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const normalizedReport: ReportRecord = {
        id: report.id,
        patient_id: report.patient_id,
        doctor_id: report.doctor_id,
        title: report.title,
        summary: report.summary,
        severity: report.severity,
        health_score: report.health_score,
        created_at: report.created_at,
        content: report.content,
        patient: firstOrNull(report.patient),
        assessment: firstOrNull(report.assessment),
    }

    const lines = buildLines(normalizedReport)
    const pdfBuffer = createPdfBuffer(lines)

    return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="healthbuddy-report-${id.slice(0, 8)}.pdf"`,
            'Cache-Control': 'no-store, max-age=0',
        },
    })
}
