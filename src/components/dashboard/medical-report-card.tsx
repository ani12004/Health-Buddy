'use client';

import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateMedicalReportContent } from '@/app/actions';

export function MedicalReportCard() {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // 1. Fetch content from Gemini
            const reportContent = await generateMedicalReportContent();

            // 2. Generate PDF
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(139, 92, 246); // Primary Color (Violet-500)
            doc.text("Health Buddy Medical Report", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
            doc.line(20, 35, 190, 35); // Horizontal line

            // Body Content
            doc.setFontSize(12);
            doc.setTextColor(0);

            const splitText = doc.splitTextToSize(reportContent, 170);
            doc.text(splitText, 20, 45);

            // Footer Disclaimer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Disclaimer: This report is AI-generated and not a diagnosis. Consult a doctor.", 20, 280);

            doc.save("health-buddy-report.pdf");

        } catch (error) {
            console.error("Failed to generate report", error);
            alert("Could not generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-6 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                <FileText />
            </div>
            <h2 className="text-xl font-semibold">Medical Report</h2>
            <p className="text-sm text-muted-foreground">
                Download a hospital-grade summary of your health data.
            </p>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full py-3 bg-white border border-border text-foreground hover:bg-secondary/50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                Download PDF
            </button>
        </div>
    );
}
