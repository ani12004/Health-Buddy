import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // PDF generation temporarily disabled - using Gemini-only mode
    // Will be re-enabled with v10 ML deployment
    return NextResponse.json(
        { error: 'PDF generation is temporarily unavailable. View your report online instead.' },
        { status: 503 }
    );
}
