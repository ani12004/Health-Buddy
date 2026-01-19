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

            // --- PAGE 1: COVER ---
            addHeader(logoBase64);
            currentY = 60;

            // Box Title
            doc.setFillColor(245, 247, 250); // Very light gray/blue
            doc.setDrawColor(200);
            doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 75, 2, 2, 'FD');

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.setFont("helvetica", "bold");
            doc.text("PATIENT IDENTIFICATION", margin + 5, currentY + 10);
            doc.setDrawColor(220);
            doc.line(margin + 5, currentY + 14, pageWidth - margin - 5, currentY + 14);

            // Columns
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(50);

            const rowHeight = 10;
            const col1X = margin + 5;
            const col2X = margin + 90; // Second column start
            let rowY = currentY + 25;

            // Row 1
            doc.setFont("helvetica", "bold");
            doc.text("Patient Name:", col1X, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(patientName, col1X + 30, rowY);

            doc.setFont("helvetica", "bold");
            doc.text("Patient ID:", col2X, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(data.patientDetails?.id || 'HB-Unknown', col2X + 25, rowY);

            // Row 2
            rowY += rowHeight;
            doc.setFont("helvetica", "bold");
            doc.text("Age / Gender:", col1X, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(`${data.patientDetails?.age || '--'} / ${data.patientDetails?.gender || '--'}`, col1X + 30, rowY);

            doc.setFont("helvetica", "bold");
            doc.text("Report Date:", col2X, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(new Date().toLocaleDateString(), col2X + 25, rowY);

            // Row 3
            rowY += rowHeight;
            doc.setFont("helvetica", "bold");
            doc.text("Ref. Doctor:", col1X, rowY);
            doc.setFont("helvetica", "normal");
            doc.text(data.patientDetails?.referringDoctor || 'Not Assigned', col1X + 30, rowY);

            doc.setFont("helvetica", "bold");
            doc.text("Generated By:", col2X, rowY);
            doc.setFont("helvetica", "normal");
            doc.text("Health Buddy AI (Gemini)", col2X + 25, rowY);

            // Confidentiality Notice Box
            currentY += 85;
            doc.setDrawColor(220, 53, 69); // Red border
            doc.setLineWidth(0.5);
            doc.rect(margin, currentY, pageWidth - (margin * 2), 20, 'S');

            doc.setTextColor(220, 53, 69);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("CONFIDENTIAL MEDICAL DOCUMENT", margin + (pageWidth - margin * 2) / 2, currentY + 8, { align: 'center' });

            doc.setTextColor(80);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("This document contains privileged and confidential medical information intended", margin + (pageWidth - margin * 2) / 2, currentY + 14, { align: 'center' });
            doc.text("solely for the use of the individual or entity named above.", margin + (pageWidth - margin * 2) / 2, currentY + 18, { align: 'center' });

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

            doc.setFontSize(14); // Standard section header
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text("Vital Signs Overview", margin, currentY);
            currentY += 10;

            // Official Table Header
            const colWidth = (pageWidth - (margin * 2)) / 4;
            let tableY = currentY;

            doc.setFillColor(240, 240, 240); // Light gray header
            doc.rect(margin, tableY, pageWidth - (margin * 2), 8, 'F');

            doc.setFontSize(9); // Smaller, official font
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");

            doc.text("PARAMETER", margin + 2, tableY + 5.5);
            doc.text("VALUE", margin + colWidth, tableY + 5.5);
            doc.text("REF RANGE", margin + (colWidth * 2), tableY + 5.5);
            doc.text("INTERPRETATION", margin + (colWidth * 3), tableY + 5.5);

            tableY += 8;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50);

            data.vitals?.forEach((v: any, i: number) => {
                // Alternate row bg? Maybe too busy. Stick to lines.
                doc.text(String(v.parameter), margin + 2, tableY + 5.5);
                doc.text(String(v.value), margin + colWidth, tableY + 5.5);
                doc.text(String(v.referenceRange), margin + (colWidth * 2), tableY + 5.5);

                // Color code interpretation if possible, else black
                const interp = String(v.interpretation);
                if (interp.includes('High') || interp.includes('Abnormal')) doc.setTextColor(220, 53, 69);
                else doc.setTextColor(50);

                doc.text(interp, margin + (colWidth * 3), tableY + 5.5);
                doc.setTextColor(50); // Reset

                // Very light separator
                doc.setDrawColor(230);
                doc.line(margin, tableY + 8, pageWidth - margin, tableY + 8);
                tableY += 8;
            });

            addFooter(3);

            // --- PAGE 4: RISK ---
            doc.addPage();
            addHeader(logoBase64);
            currentY = 55;

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text("AI-Generated Risk Assessment", margin, currentY);
            currentY += 15;

            const riskLevel = data.riskAssessment?.level || "UNKNOWN";
            // Risk Badge Colors
            let badgeColor = [108, 117, 125]; // Grey
            if (riskLevel === 'HIGH') badgeColor = [220, 53, 69]; // Red
            else if (riskLevel === 'MODERATE') badgeColor = [255, 193, 7]; // Yellow/Orange
            else if (riskLevel === 'LOW') badgeColor = [40, 167, 69]; // Green

            // Risk Badge
            doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
            doc.roundedRect(margin, currentY, 40, 10, 2, 2, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(riskLevel, margin + 20, currentY + 6.5, { align: 'center' }); // Center text in badge

            currentY += 15;

            doc.setFontSize(10);
            doc.setTextColor(60);
            doc.setFont("helvetica", "normal");
            const riskLines = doc.splitTextToSize(data.riskAssessment?.details || "No details.", pageWidth - (margin * 2));
            doc.text(riskLines, margin, currentY);
            currentY += (riskLines.length * 5) + 15;

            // AI Caution Box
            doc.setDrawColor(255, 193, 7); // Warning yellow border
            doc.setFillColor(255, 252, 240);
            doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 20, 2, 2, 'FD');

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("NOTICE: This assessment is AI-generated based on provided data.", margin + 5, currentY + 8);
            doc.text("It is NOT a medical diagnosis. Consult a professional immediately for concerns.", margin + 5, currentY + 14);

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
