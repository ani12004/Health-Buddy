'use client';

import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateMedicalReportContent } from '@/app/actions';

interface MedicalReportCardProps {
    patientName: string;
}

export function MedicalReportCard({ patientName }: MedicalReportCardProps) {
    const [loading, setLoading] = useState(false);

    const loadImage = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    reject('Canvas context failed');
                }
            };
            img.onerror = reject;
        });
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            // 1. Fetch structured content
            const data = await generateMedicalReportContent(patientName);
            if (!data) throw new Error("Failed to generate report data");

            // 2. Load Logo
            let logoBase64 = '';
            try {
                logoBase64 = await loadImage('/logo.png');
            } catch (e) {
                console.warn('Logo load failed', e);
            }

            // 3. Setup PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            let currentY = margin;

            // Helper: Header
            // Helper: Header
            const addHeader = (logo: string) => {
                if (logo) {
                    // Increased logo size from 15 to 30
                    doc.addImage(logo, 'PNG', margin, 10, 30, 30 * (488 / 443) || 30);
                }
                doc.setFontSize(22);
                doc.setTextColor(139, 92, 246); // Primary Color
                // Increased text offset to accommodate bigger logo (margin + 35)
                doc.text("Health Buddy", logo ? margin + 35 : margin, 25);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text("AI-Assisted Health Assessment Report", logo ? margin + 35 : margin, 31);

                doc.setDrawColor(200);
                // Moved separation line down to 45
                doc.line(margin, 45, pageWidth - margin, 45);
            };

            // Helper: Footer
            const addFooter = (pageNum: number) => {
                const footerY = pageHeight - 15;
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
                doc.text("Health Buddy System • Generated using Gemini AI", margin, footerY);
            };

            // --- PAGE 1: COVER ---
            addHeader(logoBase64);
            currentY = 60;

            // Patient Card Box
            doc.setDrawColor(220);
            doc.setFillColor(250, 250, 255);
            doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 60, 3, 3, 'FD');

            doc.setFontSize(14);
            doc.setTextColor(50);
            doc.text("Patient Details", margin + 5, currentY + 10);

            doc.setFontSize(11);
            doc.setTextColor(80);
            const detailsStart = currentY + 25;
            const col2 = margin + 80;

            doc.text(`Name: ${patientName}`, margin + 5, detailsStart);
            doc.text(`Age: ${data.patientDetails?.age || 'N/A'}`, margin + 5, detailsStart + 10);
            doc.text(`Gender: ${data.patientDetails?.gender || 'N/A'}`, margin + 5, detailsStart + 20);

            doc.text(`ID: ${data.patientDetails?.id || 'HB-Unknown'}`, col2, detailsStart);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, col2, detailsStart + 10);
            doc.text(`Ref. Doctor: ${data.patientDetails?.referringDoctor || 'Dr. Health Buddy'}`, col2, detailsStart + 20);

            // Confidentiality
            currentY += 80;
            doc.setFontSize(9);
            doc.setTextColor(200, 50, 50); // Reddish warning
            doc.text("CONFIDENTIALITY NOTICE:", margin, currentY);
            doc.setTextColor(100);
            doc.setFontSize(9);
            doc.text("This document contains confidential medical information and is intended solely for the patient.", margin, currentY + 6);

            addFooter(1);

            // --- PAGE 2: CLINICAL SUMMARY ---
            doc.addPage();
            addHeader(logoBase64);
            currentY = 55;

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("Clinical Summary", margin, currentY);
            currentY += 15;

            doc.setFontSize(11);
            doc.setTextColor(60);
            const summaryLines = doc.splitTextToSize(data.clinicalSummary || "No summary available.", pageWidth - (margin * 2));
            doc.text(summaryLines, margin, currentY);

            addFooter(2);

            // --- PAGE 3: VITALS ---
            doc.addPage();
            addHeader(logoBase64);
            currentY = 55;

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("Vital Signs Overview", margin, currentY);
            currentY += 15;

            // Simple Table Header
            const colWidth = (pageWidth - (margin * 2)) / 4;
            let tableY = currentY;
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, tableY, pageWidth - (margin * 2), 10, 'F');
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");

            doc.text("Parameter", margin + 2, tableY + 7);
            doc.text("Value", margin + colWidth, tableY + 7);
            doc.text("Ref Range", margin + (colWidth * 2), tableY + 7);
            doc.text("Interpretation", margin + (colWidth * 3), tableY + 7);

            tableY += 10;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50);

            data.vitals?.forEach((v: any, i: number) => {
                doc.text(String(v.parameter), margin + 2, tableY + 7);
                doc.text(String(v.value), margin + colWidth, tableY + 7);
                doc.text(String(v.referenceRange), margin + (colWidth * 2), tableY + 7);
                doc.text(String(v.interpretation), margin + (colWidth * 3), tableY + 7);

                // Light border line
                doc.setDrawColor(240);
                doc.line(margin, tableY + 12, pageWidth - margin, tableY + 12);
                tableY += 12;
            });



            addFooter(3);

            // --- PAGE 4: RISK ---
            doc.addPage();
            addHeader(logoBase64);
            currentY = 55;

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("AI-Generated Risk Assessment", margin, currentY);
            currentY += 20;

            const riskLevel = data.riskAssessment?.level || "UNKNOWN";
            const riskColor = riskLevel === 'HIGH' ? [220, 38, 38] : riskLevel === 'MODERATE' ? [234, 179, 8] : [22, 163, 74];

            doc.setFontSize(14);
            doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.text(`Risk Level: ${riskLevel}`, margin, currentY);
            currentY += 15;

            doc.setFontSize(11);
            doc.setTextColor(60);
            const riskLines = doc.splitTextToSize(data.riskAssessment?.details || "No details.", pageWidth - (margin * 2));
            doc.text(riskLines, margin, currentY);
            currentY += (riskLines.length * 6) + 20;

            // AI Note Box
            doc.setDrawColor(255, 200, 0);
            doc.setFillColor(255, 252, 230);
            doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 2, 2, 'FD');
            doc.setFontSize(9);
            doc.setTextColor(150, 100, 0);
            doc.text("IMPORTANT: This assessment is generated using artificial intelligence and does not", margin + 5, currentY + 10);
            doc.text("constitute a medical diagnosis. Always consult a certified medical professional.", margin + 5, currentY + 16);

            addFooter(4);

            // --- PAGE 5: RECOMMENDATIONS ---
            doc.addPage();
            addHeader(logoBase64);
            currentY = 55;

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("Preventive & Lifestyle Recommendations", margin, currentY);
            currentY += 15;

            const printRecs = (title: string, items: string[]) => {
                if (!items || items.length === 0) return;
                doc.setFontSize(12);
                doc.setTextColor(30);
                doc.setFont("helvetica", "bold");
                doc.text(title, margin, currentY);
                currentY += 8;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(60);
                items.forEach(item => {
                    doc.text(`• ${item}`, margin + 5, currentY);
                    currentY += 7;
                });
                currentY += 5;
            };

            printRecs("Stress Management", data.recommendations?.stressManagement);
            printRecs("Sleep & Recovery", data.recommendations?.sleep);
            printRecs("Physical Activity", data.recommendations?.activity);
            printRecs("Daily Habits", data.recommendations?.habits);

            addFooter(5);

            // --- PAGE 6: SIGNATURE ---
            doc.addPage();
            addHeader(logoBase64);
            currentY = 55;

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("Doctor Review & Validation", margin, currentY);
            currentY += 40;

            doc.line(margin, currentY, margin + 80, currentY);
            doc.setFontSize(10);
            doc.text("Doctor's Signature", margin, currentY + 5);

            doc.line(margin + 100, currentY, margin + 180, currentY);
            doc.text("Date", margin + 100, currentY + 5);

            currentY += 50;
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("DISCLAIMER: This report is a preliminary assessment tool and must be verified by a licensed physician.", margin, currentY);
            doc.text("Health Buddy AI (Gemini) is not liable for actions taken based on this automated report.", margin, currentY + 5);

            addFooter(6);

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
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Medical Report</h2>
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
