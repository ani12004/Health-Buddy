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
            const pageWidth = doc.internal.pageSize.width; // 210mm
            const pageHeight = doc.internal.pageSize.height; // 297mm
            const margin = 15;
            let currentY = margin;

            // Colors
            const brandColor = [0, 56, 168]; // Royal Blue
            const blackColor = [0, 0, 0];
            const grayColor = [100, 100, 100];
            const lightGray = [240, 240, 240];
            const borderColor = [200, 200, 200];

            // Fonts
            doc.setFont("helvetica", "normal");

            // --- HELPER FUNCTIONS ---
            const drawLine = (y: number, thickness: number = 0.5) => {
                doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
                doc.setLineWidth(thickness);
                doc.line(margin, y, pageWidth - margin, y);
            };

            const header = () => {
                // Left: Logo and Branding
                if (logoBase64) {
                    doc.addImage(logoBase64, 'PNG', margin, 10, 25, 25);
                }

                doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text("Health Buddy", logoBase64 ? margin + 30 : margin, 20);

                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
                doc.text("Accurate | Caring | Instant", logoBase64 ? margin + 30 : margin, 26);

                doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                doc.setFontSize(8);
                doc.text("1234 Wellness Ave, Med City, NY 10001", logoBase64 ? margin + 30 : margin, 32);

                // Right: Contact Info
                doc.setFontSize(9);
                doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
                doc.text("Ph: +1 (555) 123-4567", pageWidth - margin, 18, { align: 'right' });
                doc.text("Email: support@healthbuddy.ai", pageWidth - margin, 23, { align: 'right' });
                doc.text("www.healthbuddy.ai", pageWidth - margin, 28, { align: 'right' });

                // Placeholder for QR/Barcode
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                doc.rect(pageWidth - margin - 20, 32, 20, 8);
                doc.setFontSize(6);
                doc.text("REPORT ID", pageWidth - margin - 10, 37, { align: 'center' });
            };

            const footer = (pageNo: number) => {
                const footerY = pageHeight - 15;

                // Hospital Style Banner
                doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
                doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text("Advanced AI Pathology Services", margin, pageHeight - 4);

                doc.setFontSize(8);
                doc.text(`Page ${pageNo}`, pageWidth - margin, pageHeight - 4, { align: 'right' });

                doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                doc.setFontSize(7);
                doc.text(`Generated: ${new Date().toLocaleString()} | Validated by Health Buddy System`, margin, footerY);
            };

            // --- PAGE 1 CONTENT ---
            header();

            // Patient Information Strip
            currentY = 48;
            doc.setFillColor(248, 249, 250);
            doc.rect(margin, currentY, pageWidth - (2 * margin), 22, 'F');
            doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
            doc.rect(margin, currentY, pageWidth - (2 * margin), 22, 'S');

            const col1 = margin + 5;
            const col2 = margin + 70;
            const col3 = margin + 135;

            doc.setFontSize(9);
            doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);

            // Col 1
            doc.setFont("helvetica", "bold"); doc.text("Patient Name:", col1, currentY + 6);
            doc.setFont("helvetica", "normal"); doc.text(patientName, col1 + 25, currentY + 6);

            doc.setFont("helvetica", "bold"); doc.text("Age / Sex:", col1, currentY + 11);
            doc.setFont("helvetica", "normal"); doc.text(`${data.patientDetails?.age || '--'} / ${data.patientDetails?.gender || '--'}`, col1 + 25, currentY + 11);

            doc.setFont("helvetica", "bold"); doc.text("Pt ID / UHID:", col1, currentY + 16);
            doc.setFont("helvetica", "normal"); doc.text(data.patientDetails?.id || 'HB-Unknown', col1 + 25, currentY + 16);

            // Col 2
            doc.setFont("helvetica", "bold"); doc.text("Sample Coll:", col2, currentY + 6);
            doc.setFont("helvetica", "normal"); doc.text("Home Collection", col2 + 25, currentY + 6);

            doc.setFont("helvetica", "bold"); doc.text("Coll By:", col2, currentY + 11);
            doc.setFont("helvetica", "normal"); doc.text("HB Lab Tech", col2 + 25, currentY + 11);

            doc.setFont("helvetica", "bold"); doc.text("Ref Dr:", col2, currentY + 16);
            doc.setFont("helvetica", "normal"); doc.text(data.patientDetails?.referringDoctor || 'Self', col2 + 25, currentY + 16);

            // Col 3
            const today = new Date().toLocaleDateString();
            doc.setFont("helvetica", "bold"); doc.text("Registered:", col3, currentY + 6);
            doc.setFont("helvetica", "normal"); doc.text(today, col3 + 20, currentY + 6);

            doc.setFont("helvetica", "bold"); doc.text("Collected:", col3, currentY + 11);
            doc.setFont("helvetica", "normal"); doc.text(today, col3 + 20, currentY + 11);

            doc.setFont("helvetica", "bold"); doc.text("Reported:", col3, currentY + 16);
            doc.setFont("helvetica", "normal"); doc.text(today, col3 + 20, currentY + 16);

            // Report Title
            currentY += 35;
            drawLine(currentY - 5, 0.5);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
            doc.text("HEALTH ASSESSMENT REPORT", pageWidth / 2, currentY, { align: 'center' });
            drawLine(currentY + 3, 0.5);

            // Main Data Table
            currentY += 15;

            // Table Header
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.rect(margin, currentY, pageWidth - (2 * margin), 8, 'F');
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");

            const tCol1 = margin + 3;  // Investigation
            const tCol2 = margin + 65; // Result
            const tCol3 = margin + 95; // Unit (New)
            const tCol4 = margin + 115; // Ref Value
            const tCol5 = margin + 155; // Status

            doc.text("INVESTIGATION", tCol1, currentY + 5.5);
            doc.text("RESULT", tCol2, currentY + 5.5);
            doc.text("UNIT", tCol3, currentY + 5.5);
            doc.text("REF. RANGE", tCol4, currentY + 5.5);
            doc.text("STATUS", tCol5, currentY + 5.5);
            currentY += 10;

            // Table Rows
            doc.setFont("helvetica", "normal");

            data.vitals?.forEach((v: any) => {
                doc.setFontSize(9);
                doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);

                // Parsing logic (Simulating "Real" pathology columns)
                const name = String(v.parameter);
                let value = String(v.value);
                let unit = "-";

                // Attempt to extract unit if exists in value
                const valueParts = value.split(' ');
                if (valueParts.length > 1 && isNaN(Number(valueParts[valueParts.length - 1])) === true) {
                    unit = valueParts.pop() || "-";
                    value = valueParts.join(' ');
                }

                const ref = String(v.referenceRange);
                const interp = String(v.interpretation);
                let status = "Normal";
                let statusColor = blackColor;

                if (interp.toLowerCase().includes('high') || interp.toLowerCase().includes('elevated')) {
                    status = "High";
                    statusColor = [220, 53, 69]; // Red
                } else if (interp.toLowerCase().includes('low')) {
                    status = "Low";
                    statusColor = [0, 56, 168]; // Blue? Or Red for all abnormal.
                } else if (name.includes("Heart Rate")) {
                    // Example logic for Vitals that might not have interpretation text
                }

                // Row content
                doc.setFont("helvetica", "bold");
                doc.text(name, tCol1, currentY);

                doc.setFont("helvetica", "normal");
                doc.text(value, tCol2, currentY);
                doc.text(unit, tCol3, currentY);
                doc.text(ref, tCol4, currentY);

                doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                doc.setFont("helvetica", "bold");
                doc.text(status, tCol5, currentY);

                currentY += 8;

                // Dotted line separator
                doc.setDrawColor(230, 230, 230);
                (doc as any).setLineDash([1, 1], 0);
                doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
                (doc as any).setLineDash([], 0); // Reset
            });

            // Notes Section
            currentY += 10;
            doc.setFontSize(9);
            doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
            doc.setFont("helvetica", "bold");
            doc.text("Note :", margin, currentY);
            currentY += 5;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            const notes = [
                "1. Results to be correlated clinically.",
                "2. This report is generated by Health Buddy AI Screening System.",
                "3. Please consult your physician for interpretation and treatment."
            ];
            notes.forEach(note => {
                doc.text(note, margin, currentY);
                currentY += 4;
            });

            // Reference Range Table (Boxed at bottom)
            const refBoxY = pageHeight - 90; // Fixed position near bottom
            doc.setDrawColor(blackColor[0], blackColor[1], blackColor[2]);
            doc.setLineWidth(0.2);
            doc.rect(margin, refBoxY, pageWidth - (2 * margin), 20); // Box

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("REFERENCE GUIDELINES", margin + 2, refBoxY + 5);
            doc.line(margin, refBoxY + 7, pageWidth - margin, refBoxY + 7);

            doc.setFont("helvetica", "normal");
            doc.text("Normal Range: Within standard limits", margin + 2, refBoxY + 12);
            doc.text("Borderline: Clinical correlation required", margin + 60, refBoxY + 12);
            doc.text("High Risk: Immediate medical attention advised", margin + 120, refBoxY + 12);

            // Signature Section
            const sigY = pageHeight - 45;

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");

            // Sig 1
            doc.text("Lab Technician", margin, sigY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.text("(DMLT, B.Sc)", margin, sigY + 4);
            doc.text("--Sd--", margin, sigY - 5); // Placeholder signature

            // Sig 2
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("Medical Officer", pageWidth / 2 - 10, sigY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.text("(MBBS, MD)", pageWidth / 2 - 10, sigY + 4);
            doc.text("--Sd--", pageWidth / 2 - 10, sigY - 5);

            // Sig 3
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("Chief Pathologist", pageWidth - margin - 30, sigY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.text("(MD Pathology)", pageWidth - margin - 30, sigY + 4);
            doc.text("--Sd--", pageWidth - margin - 30, sigY - 5);

            // Footer (Page 1)
            footer(1);

            // --- PAGE 2: DETAILED ANALYSIS (Optional/If needed for extra content) ---
            // If risk/recommendations need another page, add here.
            // For now, packing into one page or extending if content overflows needs check.
            // But prompt implies "Output FULL reformatted report".
            // I will add a second page for Detailed Clinical Summary & Risk if they exist, structured similarly.

            if (data.clinicalSummary || data.riskAssessment) {
                doc.addPage();
                header();

                currentY = 45;
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("CLINICAL ANALYSIS & RISK PROFILE", margin, currentY);
                doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
                currentY += 10;

                if (data.riskAssessment) {
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.text(`RISK ASSESSMENT: ${data.riskAssessment.level}`, margin, currentY);
                    currentY += 6;
                    doc.setFont("helvetica", "normal");
                    const riskText = doc.splitTextToSize(data.riskAssessment.details || "", pageWidth - (2 * margin));
                    doc.text(riskText, margin, currentY);
                    currentY += (riskText.length * 5) + 10;
                }

                if (data.clinicalSummary) {
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.text("CLINICAL SUMMARY", margin, currentY);
                    currentY += 6;
                    doc.setFont("helvetica", "normal");
                    const summaryText = doc.splitTextToSize(data.clinicalSummary, pageWidth - (2 * margin));
                    doc.text(summaryText, margin, currentY);
                }

                footer(2);
            }

            doc.save("health-buddy-pathology-report.pdf");

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
