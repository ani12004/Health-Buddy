import sys
import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Flowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

# ── Palette ──────────────────────────────────────────────────────────────────
GREEN       = colors.HexColor("#1D9E75")
GREEN_BG    = colors.HexColor("#E1F5EE")
GREEN_DARK  = colors.HexColor("#0f6e56")
DARK        = colors.HexColor("#0a1a12")
RED         = colors.HexColor("#E24B4A")
RED_BG      = colors.HexColor("#FFF2F2")
AMBER       = colors.HexColor("#EF9F27")
AMBER_BG    = colors.HexColor("#FAEEDA")
GREY        = colors.HexColor("#6b7280")
GREY_LT     = colors.HexColor("#f3f4f6")
GREY_BD     = colors.HexColor("#e5e7eb")
BLACK       = colors.HexColor("#111827")
WHITE       = colors.white

PAGE_W, PAGE_H = A4
MARGIN   = 14 * mm
USABLE_W = PAGE_W - 2 * MARGIN

# ── Mini horizontal bar flowable ──────────────────────────────────────────────
class MiniBar(Flowable):
    def __init__(self, pct, color, width=60, height=6):
        super().__init__()
        self.pct    = pct
        self.color  = color
        self.width  = width
        self.height = height + 4

    def draw(self):
        c = self.canv
        # Background track
        c.setFillColor(GREY_LT)
        c.roundRect(0, 3, self.width, 4, 2, fill=1, stroke=0)
        
        # Calculation for filling
        val = float(self.pct)
        # Handle decimal (0-1) vs percentage (0-100)
        if val <= 1.0 and val > 0:
            val = val * 100
            
        fw = self.width * (min(val, 100.0) / 100.0)
        
        if fw > 0:
            c.setFillColor(self.color)
            c.roundRect(0, 3, max(fw, 4), 4, 2, fill=1, stroke=0)

# ── Style factory ─────────────────────────────────────────────────────────────
def st(name, size=8, bold=False, color=BLACK, align=TA_LEFT, leading=None):
    return ParagraphStyle(
        name,
        fontSize=size,
        fontName="Helvetica-Bold" if bold else "Helvetica",
        textColor=color,
        alignment=align,
        leading=leading or (size + 4),
    )

FLAG_CLR    = {"critical": RED, "warning": AMBER, None: GREEN, "normal": GREEN}
FLAG_STATUS = {"critical": "HIGH", "warning": "ELEV.", None: "OK", "normal": "OK"}

# ── Section header helper ─────────────────────────────────────────────────────
def sec_hdr(txt):
    t = Table([[Paragraph(txt, st("sh", 9, True, BLACK))]], colWidths=[USABLE_W])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), GREEN_BG),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("RIGHTPADDING",  (0,0),(-1,-1), 10),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LINEBELOW",     (0,0),(-1,-1), 1.5, GREEN),
    ]))
    return t

# ── Main build function ───────────────────────────────────────────────────────
def build_report(data, output_path="HealthBuddy_Report.pdf"):
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN,  bottomMargin=12*mm,
        title="Health Buddy Report",
    )
    story = []

    # ── HEADER ───────────────────────────────────────────────────────────────
    severity = data.get("severity", "normal")
    sev_clr = RED  if severity == "critical" else AMBER
    sev_lbl = "CRITICAL" if severity == "critical" else "WARNING" if severity == "warning" else "STABLE"

    hdr = Table([[
        Table([
            [Paragraph("Health Buddy",              st("br",  11, True,  GREEN))],
            [Paragraph("AI Health Assessment Report",st("brs",  8, False, colors.HexColor("#a0c4b4")))],
        ], colWidths=[USABLE_W*0.45]),
        Table([
            [Paragraph(data.get("patient", "Patient"), st("pn", 10, True,  WHITE))],
            [Paragraph(data.get("email", ""),   st("pe",  7, False, colors.HexColor("#a0c4b4")))],
        ], colWidths=[USABLE_W*0.35]),
        Table([
            [Paragraph(sev_lbl, st("sv", 8, True,  sev_clr, TA_RIGHT))],
            [Paragraph(data.get("date", ""),st("dt", 7, False, colors.HexColor("#a0c4b4"), TA_RIGHT))],
        ], colWidths=[USABLE_W*0.2]),
    ]], colWidths=[USABLE_W*0.45, USABLE_W*0.35, USABLE_W*0.2])
    hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), DARK),
        ("LEFTPADDING",   (0,0),(-1,-1), 14),
        ("RIGHTPADDING",  (0,0),(-1,-1), 14),
        ("TOPPADDING",    (0,0),(-1,-1), 12),
        ("BOTTOMPADDING", (0,0),(-1,-1), 12),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
        ("LINEBELOW",     (0,0),(-1,-1), 2.5, GREEN),
    ]))
    story.append(hdr)
    story.append(Spacer(1, 3*mm))

    # ── ROW 1: SCORE | RISK BARS | EMERGENCY ─────────────────────────────────
    cw = USABLE_W / 3 - 3

    score_text = "N/A"
    score_val = data.get("health_score", 0)
    score_desc = "/ 100 — Optimal"
    score_clr = GREEN
    if score_val < 30:
        score_desc = "/ 100 — Critical"
        score_clr = RED
    elif score_val < 60:
        score_desc = "/ 100 — Elevated Risk"
        score_clr = AMBER

    score_t = Table([
        [Paragraph("Health Score",    st("sl",  7, False, GREY))],
        [Paragraph(str(score_val), st("sb", 36, True, score_clr, leading=40))],
        [Paragraph(score_desc, st("ss",  7, False, score_clr))],
        [Spacer(1, 2*mm)],
        [Paragraph(data.get("summary", ""),      st("sm",  7, False, GREY, leading=10))],
    ], colWidths=[cw])
    score_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), GREY_LT),
        ("BOX",           (0,0),(-1,-1), 0.5, GREY_BD),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("RIGHTPADDING",  (0,0),(-1,-1), 10),
        ("TOPPADDING",    (0,0),(-1,-1), 6),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
    ]))

    risk_rows = [
        [Paragraph("Risk Probabilities", st("rh", 7, True, GREY))],
        [Spacer(1, 1*mm)],
    ]
    probs = data.get("probs", {})
    if not probs:
        risk_rows.append([Paragraph("No probability data available", st("rp", 7, False, GREY))])
    else:
        for cond, pct in probs.items():
            clr = RED if pct > 75 else AMBER if pct > 30 else GREEN
            risk_rows.append([Table([
                [Paragraph(cond, st("rc", 7, False, BLACK)),
                Paragraph(f"{float(pct):.1f}%", st("rv", 7, True, clr, TA_RIGHT))],
                [MiniBar(pct, clr, cw-20), Paragraph("")],
            ], colWidths=[cw-70, 50],
            style=TableStyle([
                ("LEFTPADDING",   (0,0),(-1,-1), 0),
                ("RIGHTPADDING",  (0,0),(-1,-1), 0),
                ("TOPPADDING",    (0,0),(-1,-1), 1),
                ("BOTTOMPADDING", (0,0),(-1,-1), 3),
                ("SPAN",          (0,1),(1,1)),
            ]))])
            risk_rows.append([Spacer(1, 1*mm)])

    conf = data.get("conf", {})
    if conf:
        risk_rows += [
            [Spacer(1, 2*mm)],
            [Paragraph("Model Confidence", st("ch", 7, True, GREY))],
            [Spacer(1, 1*mm)],
        ]
        for cond, pct in conf.items():
            clr = RED if pct > 95 else AMBER if pct > 80 else GREEN
            risk_rows.append([Table([
                [Paragraph(cond, st("cc", 7, False, BLACK)),
                Paragraph(f"{float(pct):.2f}%", st("cv", 7, True, clr, TA_RIGHT))],
            ], colWidths=[cw-70, 50],
            style=TableStyle([
                ("LEFTPADDING",   (0,0),(-1,-1), 0),
                ("RIGHTPADDING",  (0,0),(-1,-1), 0),
                ("TOPPADDING",    (0,0),(-1,-1), 2),
                ("BOTTOMPADDING", (0,0),(-1,-1), 2),
            ]))])

    risk_t = Table(risk_rows, colWidths=[cw])
    risk_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), WHITE),
        ("BOX",           (0,0),(-1,-1), 0.5, GREY_BD),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("RIGHTPADDING",  (0,0),(-1,-1), 10),
        ("TOPPADDING",    (0,0),(-1,-1), 6),
        ("BOTTOMPADDING", (0,0),(-1,-1), 2),
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
    ]))

    emerg_t = Table([
        [Paragraph("Clinical Intelligence Notes",  st("et",  7, True,  RED))],
        [Spacer(1, 1*mm)],
        [Paragraph(data.get("emergency", "Generic medical disclaimer applies."),       st("eb",  7, False, colors.HexColor("#7f1d1d"), leading=11))],
        [Spacer(1, 3*mm)],
        [Paragraph("Report ID",          st("ri",  7, True,  GREY))],
        [Paragraph(data.get("report_id", "N/A"),       st("rv2", 7, False, GREY))],
    ], colWidths=[cw])
    emerg_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), RED_BG),
        ("BOX",           (0,0),(-1,-1), 1, RED),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("RIGHTPADDING",  (0,0),(-1,-1), 10),
        ("TOPPADDING",    (0,0),(-1,-1), 6),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
    ]))

    row1 = Table([[score_t, risk_t, emerg_t]], colWidths=[cw, cw, cw])
    row1.setStyle(TableStyle([
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",   (0,0),(-1,-1), 0),
        ("RIGHTPADDING",  (0,0),(-1,-1), 0),
        ("TOPPADDING",    (0,0),(-1,-1), 0),
        ("BOTTOMPADDING", (0,0),(-1,-1), 0),
    ]))
    story.append(row1)
    story.append(Spacer(1, 3*mm))

    # ── ROW 2: VITALS TABLE ───────────────────────────────────────────────────
    vital_hdr = [
        Paragraph("Parameter", st("vh",  7, True, WHITE)),
        Paragraph("Value",     st("vh2", 7, True, WHITE)),
        Paragraph("",          st("vh3", 7, True, WHITE)),
        Paragraph("Parameter", st("vh4", 7, True, WHITE)),
        Paragraph("Value",     st("vh5", 7, True, WHITE)),
        Paragraph("",          st("vh6", 7, True, WHITE)),
        Paragraph("Parameter", st("vh7", 7, True, WHITE)),
        Paragraph("Value",     st("vh8", 7, True, WHITE)),
        Paragraph("",          st("vh9", 7, True, WHITE)),
    ]

    raw_inputs = data.get("inputs", [])
    inputs  = raw_inputs[:18]
    per_col = 6
    rows    = [vital_hdr]

    # Split into 3 columns
    col1 = inputs[0:6]
    col2 = inputs[6:12]
    col3 = inputs[12:18]

    for i in range(per_col):
        row = []
        # Column 1
        if i < len(col1):
            p, v, f = col1[i]
            row += [Paragraph(p, st(f"v1p{i}",7,False,GREY)), Paragraph(str(v), st(f"v1v{i}",7,True,BLACK)), Paragraph(FLAG_STATUS.get(f, "OK"), st(f"v1s{i}",7,True, FLAG_CLR.get(f, GREEN)))]
        else:
            row += [Paragraph(""), Paragraph(""), Paragraph("")]
        
        # Column 2
        if i < len(col2):
            p, v, f = col2[i]
            row += [Paragraph(p, st(f"v2p{i}",7,False,GREY)), Paragraph(str(v), st(f"v2v{i}",7,True,BLACK)), Paragraph(FLAG_STATUS.get(f, "OK"), st(f"v2s{i}",7,True, FLAG_CLR.get(f, GREEN)))]
        else:
            row += [Paragraph(""), Paragraph(""), Paragraph("")]

        # Column 3
        if i < len(col3):
            p, v, f = col3[i]
            row += [Paragraph(p, st(f"v3p{i}",7,False,GREY)), Paragraph(str(v), st(f"v3v{i}",7,True,BLACK)), Paragraph(FLAG_STATUS.get(f, "OK"), st(f"v3s{i}",7,True, FLAG_CLR.get(f, GREEN)))]
        else:
            row += [Paragraph(""), Paragraph(""), Paragraph("")]
        
        rows.append(row)

    cw9     = USABLE_W / 9
    vital_t = Table(rows, colWidths=[cw9*1.6, cw9*0.9, cw9*0.5,
                                      cw9*1.6, cw9*0.9, cw9*0.5,
                                      cw9*1.6, cw9*0.9, cw9*0.5])
    vital_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,0),  DARK),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, GREY_LT]),
        ("BOX",           (0,0),(-1,-1), 0.5, GREY_BD),
        ("INNERGRID",     (0,0),(-1,-1), 0.3, GREY_BD),
        ("LEFTPADDING",   (0,0),(-1,-1), 5),
        ("RIGHTPADDING",  (0,0),(-1,-1), 5),
        ("TOPPADDING",    (0,0),(-1,-1), 4),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
        ("LINEAFTER",     (2,0),(2,-1),  1, GREY_BD),
        ("LINEAFTER",     (5,0),(5,-1),  1, GREY_BD),
    ]))

    story.append(sec_hdr("Patient Vitals"))
    story.append(Spacer(1, 1*mm))
    story.append(vital_t)
    story.append(Spacer(1, 3*mm))

    # ── ROW 3: RISK FACTORS | RECOMMENDATIONS ────────────────────────────────
    half_w = (USABLE_W - 4) / 2

    factors = data.get("factors", [])
    fac_rows = [
        [Paragraph("Key Risk Factors", st("fh", 8, True, BLACK))],
        [Spacer(1, 1*mm)],
    ]
    if not factors:
        fac_rows.append([Paragraph("No major risk factors identified.", st("fn", 7, False, GREY))])
    else:
        for i, f in enumerate(factors, 1):
            fac_rows.append([Table([[
                Paragraph(str(i), st(f"fi{i}", 8, True, WHITE, TA_CENTER)),
                Paragraph(str(f),      st(f"ft{i}", 7, False, GREY, leading=10)),
            ]], colWidths=[16, half_w - 36],
            style=TableStyle([
                ("BACKGROUND",    (0,0),(0,-1), RED),
                ("BACKGROUND",    (1,0),(1,-1), WHITE),
                ("LEFTPADDING",   (0,0),(0,-1), 4),
                ("RIGHTPADDING",  (0,0),(0,-1), 4),
                ("TOPPADDING",    (0,0),(-1,-1), 5),
                ("BOTTOMPADDING", (0,0),(-1,-1), 5),
                ("LEFTPADDING",   (1,0),(1,-1), 7),
                ("RIGHTPADDING",  (1,0),(1,-1), 7),
                ("BOX",           (0,0),(-1,-1), 0.3, GREY_BD),
                ("VALIGN",        (0,0),(-1,-1), "TOP"),
            ]))])
            fac_rows.append([Spacer(1, 1.5*mm)])

    fac_t = Table(fac_rows, colWidths=[half_w])
    fac_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), WHITE),
        ("BOX",           (0,0),(-1,-1), 0.5, GREY_BD),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("RIGHTPADDING",  (0,0),(-1,-1), 8),
        ("TOPPADDING",    (0,0),(-1,-1), 8),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
    ]))

    pri_clr  = {"URGENT": RED, "HIGH": AMBER, "MEDIUM": GREEN}
    recs = data.get("recs", [])
    rec_rows = [
        [Paragraph("Recommendations", st("rh2", 8, True, BLACK))],
        [Spacer(1, 1*mm)],
    ]
    if not recs:
        rec_rows.append([Paragraph("No specific recommendations found.", st("rn", 7, False, GREY))])
    else:
        for i, (pri, txt) in enumerate(recs):
            clr = pri_clr.get(pri, GREEN)
            rec_rows.append([Table([[
                Paragraph(pri, st(f"rp{pri}{i}", 6, True, WHITE, TA_CENTER)),
                Paragraph(txt, st(f"rt{pri}{i}", 7, False, GREY, leading=10)),
            ]], colWidths=[38, half_w - 56],
            style=TableStyle([
                ("BACKGROUND",    (0,0),(0,-1), clr),
                ("BACKGROUND",    (1,0),(1,-1), WHITE),
                ("LEFTPADDING",   (0,0),(0,-1), 4),
                ("RIGHTPADDING",  (0,0),(0,-1), 4),
                ("TOPPADDING",    (0,0),(-1,-1), 5),
                ("BOTTOMPADDING", (0,0),(-1,-1), 5),
                ("LEFTPADDING",   (1,0),(1,-1), 7),
                ("RIGHTPADDING",  (1,0),(1,-1), 7),
                ("BOX",           (0,0),(-1,-1), 0.3, GREY_BD),
                ("VALIGN",        (0,0),(-1,-1), "TOP"),
                ("LINEAFTER",     (0,0),(0,-1), 2, clr),
            ]))])
            rec_rows.append([Spacer(1, 1.5*mm)])

    rec_t = Table(rec_rows, colWidths=[half_w])
    rec_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), WHITE),
        ("BOX",           (0,0),(-1,-1), 0.5, GREY_BD),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("RIGHTPADDING",  (0,0),(-1,-1), 8),
        ("TOPPADDING",    (0,0),(-1,-1), 8),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
    ]))

    row3 = Table([[fac_t, rec_t]], colWidths=[half_w, half_w])
    row3.setStyle(TableStyle([
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",   (0,0),(-1,-1), 0),
        ("RIGHTPADDING",  (0,0),(-1,-1), 0),
        ("TOPPADDING",    (0,0),(-1,-1), 0),
        ("BOTTOMPADDING", (0,0),(-1,-1), 0),
    ]))
    story.append(row3)
    story.append(Spacer(1, 3*mm))

    # ── ROW 4: SHAP TABLE ────────────────────────────────────────────────────
    shap_data = data.get("shap", [])
    if shap_data:
        shap_hdr = [
            Paragraph("Feature",   st("sph",  7, True, WHITE)),
            Paragraph("Model",     st("sph2", 7, True, WHITE)),
            Paragraph("Impact",    st("sph3", 7, True, WHITE)),
            Paragraph("Direction", st("sph4", 7, True, WHITE)),
            Paragraph("SHAP",      st("sph5", 7, True, WHITE)),
        ]
        shap_rows = [shap_hdr]
        max_v     = max(abs(v) for _, _, v, _ in shap_data) if shap_data else 1.0

        for i, (feat, model, val, pos) in enumerate(shap_data):
            clr    = RED if pos else GREEN
            direct = "Increases risk" if pos else "Protective"
            pct    = abs(val) / max_v * 100 if max_v > 0 else 0
            shap_rows.append([
                Paragraph(feat,            st(f"sf{feat}{i}", 7, False, BLACK)),
                Paragraph(model,           st(f"sm{feat}{i}", 7, False, GREY)),
                MiniBar(pct, clr, 80, 6),
                Paragraph(direct,          st(f"sd{feat}{i}", 7, True,  clr)),
                Paragraph(f"{val:+.3f}",   st(f"sv{feat}{i}", 7, True,  clr, TA_RIGHT)),
            ])

        shap_t = Table(shap_rows, colWidths=[
            USABLE_W*0.22, USABLE_W*0.15, USABLE_W*0.22,
            USABLE_W*0.25, USABLE_W*0.16
        ])
        shap_t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,0),  DARK),
            ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, GREY_LT]),
            ("BOX",           (0,0),(-1,-1), 0.5, GREY_BD),
            ("INNERGRID",     (0,0),(-1,-1), 0.3, GREY_BD),
            ("LEFTPADDING",   (0,0),(-1,-1), 7),
            ("RIGHTPADDING",  (0,0),(-1,-1), 7),
            ("TOPPADDING",    (0,0),(-1,-1), 5),
            ("BOTTOMPADDING", (0,0),(-1,-1), 5),
            ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
        ]))

        story.append(sec_hdr("AI Feature Importance (SHAP)"))
        story.append(Spacer(1, 1*mm))
        story.append(shap_t)

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width=USABLE_W, thickness=0.5, color=GREY_BD))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        f"Health Buddy AI  ·  Report {data.get('report_id', 'N/A')}  ·  {data.get('date', '')}  ·  "
        "AI-generated — not a substitute for professional medical advice.",
        ParagraphStyle("ft", fontSize=7, textColor=GREY,
                       alignment=TA_CENTER, leading=10)))

    doc.build(story)

# ── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] != '-':
        # Load from file if argument provided and not '-'
        with open(sys.argv[1], 'r') as f:
            D = json.load(f)
    else:
        # Read from stdin if no arg or arg is '-'
        try:
            # sys.stdin.read() might be empty if not piped correctly
            input_text = sys.stdin.read()
            if input_text:
                D = json.loads(input_text)
            else:
                D = {}
        except Exception as e:
            # Fallback to empty context if no input
            print(f"Error reading from stdin: {e}", file=sys.stderr)
            D = {}

    output = sys.argv[2] if len(sys.argv) > 2 else "HealthBuddy_Report.pdf"
    build_report(D, output)
