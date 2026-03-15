import { NextRequest, NextResponse } from 'next/server';
import { getReportPDFData } from '@/lib/actions/gemini/checkup';
import { createClient } from '@/lib/supabase/server';

const ML_API_URL = process.env.ML_API_URL || 'https://anilsuthar2004-health-buddy-ai.hf.space'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get formatted data for the report
    const data = await getReportPDFData(id);
    if (!data) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    try {
        // Call Python microservice via REST API
        const pdfRes = await fetch(`${ML_API_URL}/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: AbortSignal.timeout(60_000), // 60s for PDF generation
        });

        if (!pdfRes.ok) {
            const err = await pdfRes.json().catch(() => ({ detail: 'PDF generation failed' }));
            console.error('PDF API error:', err);
            return NextResponse.json({ error: err.detail || 'Failed to generate PDF' }, { status: 500 });
        }

        const pdfBuffer = await pdfRes.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="HealthBuddy_Report_${data.report_id}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('PDF route error:', error.message);
        return NextResponse.json(
            { error: 'PDF service unavailable. Ensure the ML API is running.' }, 
            { status: 503 }
        );
    }
}
