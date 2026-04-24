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
        confidence_scores: Record<string, number> | null
        shap_values: Record<string, any[]> | null
        inputs: any | null
        explanation: {
            recommendations?: string[]
            summary?: string
            factors?: any[]
        } | null
    } | null
}

type ReportBaseRow = {
    id: string
    patient_id: string
    doctor_id: string | null
    assessment_id?: string | null
    title: string | null
    summary: string | null
    severity: string | null
    created_at: string
    content: any
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
    const inputs = report.assessment?.inputs || content.inputs || {}

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
        'TITLE: Health Buddy - Clinical Report',
        `ID: ${report.id.slice(0, 8).toUpperCase()} | Date: ${dateText}`,
        `Patient: ${report.patient?.full_name || content.patient_name || 'Patient'}`,
        `Severity: ${(report.severity || 'normal').toUpperCase()}`,
        `Health Score: ${Math.round(Number(report.health_score || 0))}/100`,
        '',
        'H: Clinical Vitals',
        `Age: ${inputs.age || 'N/A'}y | BMI: ${inputs.bmi || 'N/A'} | BP: ${inputs.systolic_bp || 'N/A'}/${inputs.diastolic_bp || 'N/A'} mmHg`,
        `Glucose: ${inputs.fasting_glucose || 'N/A'} mg/dL | HbA1c: ${inputs.hba1c || 'N/A'}% | HR: ${inputs.heart_rate || 'N/A'} bpm`,
        `Cholesterol (T/L/H): ${inputs.total_cholesterol || 'N/A'}/${inputs.ldl || 'N/A'}/${inputs.hdl || 'N/A'} mg/dL`,
        '',
        'H: Risk Analysis',
        `Heart Disease: ${heart.toFixed(1)}%`,
        `Hypertension:  ${hyper.toFixed(1)}%`,
        `Diabetes:      ${diabetes.toFixed(1)}%`,
        '',
    ]

    // Add Risk Drivers if available
    const shap = report.assessment?.shap_values || {}
    const hasDrivers = Object.values(shap).some(v => Array.isArray(v) && v.length > 0)
    
    if (hasDrivers) {
        lines.push('H: Key Risk Drivers')
        const diseases = [
            { key: 'heart_disease', name: 'Heart' },
            { key: 'hypertension', name: 'BP' },
            { key: 'diabetes', name: 'Diabetes' }
        ]
        diseases.forEach(d => {
            const drivers = shap[d.key] || []
            if (drivers.length > 0) {
                const driverLabels = drivers.slice(0, 3).map((dr: any) => dr.label || dr.feature)
                lines.push(`${d.name}: ${driverLabels.join(', ')}`)
            }
        })
        lines.push('')
    }

    lines.push('H: Clinical Summary')
    lines.push(...splitLongLine(String(summary), 85))
    lines.push('')

    lines.push('H: Recommendations')
    const recItems = Array.isArray(recommendations) ? recommendations.slice(0, 4) : []
    if (recItems.length === 0) {
        lines.push('- Maintain regular health checkups.')
    } else {
        for (const item of recItems) {
            const text = typeof item === 'string' ? item : `${item.title || 'Note'}: ${item.body || ''}`
            lines.push(...splitLongLine(`- ${text}`, 85))
        }
    }

    lines.push('')
    lines.push('D: Disclaimer: AI-assisted support. Consult a licensed doctor for diagnosis.')

    return lines
}

function createPdfBuffer(lines: string[]): Buffer {
    const maxLines = 45
    const safeLines = lines.slice(0, maxLines)

    // PDF Graphics commands
    const graphics: string[] = [
        'q', // save state
        '0.13 0.27 0.48 rg', // Professional Dark Blue
        '40 735 532 35 re f', // Header Bar
        '0.96 0.97 0.98 rg', // Light subtle grey for vitals area
        '40 645 532 55 re f',
        '0.9 0.9 0.9 RG 0.5 w', // Light border
        '40 645 532 55 re S',
        'Q', // restore state
        '0 g' // reset to black
    ]

    const textCommands: string[] = ['BT']
    let currentY = 745;
    
    safeLines.forEach((line) => {
        const escaped = escapePdfText(line)
        
        if (line.startsWith('TITLE:')) {
            const title = escaped.replace('TITLE: ', '')
            textCommands.push(`/F2 14 Tf 1 1 1 rg 50 ${currentY} Td (${title}) Tj`)
        } else if (line.startsWith('H:')) {
            const header = escaped.replace('H: ', '')
            textCommands.push(`0 -24 Td /F2 11 Tf 0.13 0.27 0.48 rg (${header}) Tj 0 g /F1 10 Tf`)
            currentY -= 24
        } else if (line.startsWith('Severity:')) {
            const isCritical = line.includes('CRITICAL')
            const color = isCritical ? '0.8 0 0 rg' : '0.13 0.27 0.48 rg'
            textCommands.push(`0 -16 Td /F1 10 Tf (Severity: ) Tj /F2 10 Tf ${color} (${escaped.split(': ')[1]}) Tj 0 g /F1 10 Tf`)
            currentY -= 16
        } else if (line.startsWith('D:')) {
            const disclaimer = escaped.replace('D: ', '')
            textCommands.push(`0 -30 Td /F1 8 Tf 0.4 0.4 0.4 rg (${disclaimer}) Tj 0 g`)
            currentY -= 30
        } else {
            textCommands.push(`0 -16 Td (${escaped}) Tj`)
            currentY -= 16
        }
    })

    textCommands.push('ET')

    const stream = [...graphics, ...textCommands].join('\n')
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
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

    const { data: reportById, error: byIdError } = await supabase
        .from('reports')
        .select(
            `
            id,
            patient_id,
            doctor_id,
            assessment_id,
            title,
            summary,
            severity,
            created_at,
            content
        `,
        )
        .eq('id', id)
        .maybeSingle()

    let baseReport = reportById as ReportBaseRow | null
    let lookupError = byIdError

    // Support legacy links that accidentally pass assessment IDs instead of report IDs.
    if (!baseReport) {
        const { data: reportByAssessment, error: byAssessmentError } = await supabase
            .from('reports')
            .select(
                `
                id,
                patient_id,
                doctor_id,
                assessment_id,
                title,
                summary,
                severity,
                created_at,
                content
            `,
            )
            .eq('assessment_id', id)
            .maybeSingle()

        baseReport = reportByAssessment as ReportBaseRow | null
        lookupError = byAssessmentError
    }

    if (lookupError || !baseReport) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const canAccess = baseReport.patient_id === user.id || baseReport.doctor_id === user.id
    if (!canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [{ data: patient }, { data: assessment }] = await Promise.all([
        supabase
            .from('profiles')
            .select('full_name,email')
            .eq('id', baseReport.patient_id)
            .maybeSingle(),
        baseReport.assessment_id
            ? supabase
                  .from('health_assessments')
                  .select('probabilities,confidence_scores,shap_values,inputs,explanation,health_score')
                  .eq('id', baseReport.assessment_id)
                  .maybeSingle()
            : Promise.resolve({ data: null }),
    ])

    const normalizedReport: ReportRecord = {
        id: baseReport.id,
        patient_id: baseReport.patient_id,
        doctor_id: baseReport.doctor_id,
        title: baseReport.title,
        summary: baseReport.summary,
        severity: baseReport.severity,
        health_score: firstOrNull(assessment)?.health_score || baseReport.content?.health_score || 0,
        created_at: baseReport.created_at,
        content: baseReport.content,
        patient: firstOrNull(patient),
        assessment: firstOrNull(assessment),
    }

    const lines = buildLines(normalizedReport)
    const pdfBuffer = createPdfBuffer(lines)
    const pdfBody = new Uint8Array(pdfBuffer)

    return new NextResponse(pdfBody, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="healthbuddy-report-${id.slice(0, 8)}.pdf"`,
            'Cache-Control': 'no-store, max-age=0',
        },
    })
}
