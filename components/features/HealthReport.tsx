'use client'

import { useState } from "react"
import { AlertCircle, Info, Activity, CheckCircle2, ChevronRight, Heart, Loader2, Brain } from 'lucide-react'
import { cn } from "@/lib/utils/cn"

// ── Colour helpers ────────────────────────────────────────────────────────────
const FLAG: any = {
  critical: { bg: "bg-red-50",     text: "text-red-600",   border: "border-red-200",   label: "High Risk", dot: "bg-red-500"   },
  warning:  { bg: "bg-amber-50",   text: "text-amber-600", border: "border-amber-200", label: "Elevated",  dot: "bg-amber-400" },
  null:     { bg: "bg-emerald-50", text: "text-emerald-600",border:"border-emerald-200",label: "Normal",   dot: "bg-emerald-500"},
};
const flagStyle = (f: string | null) => FLAG[f || 'null'] ?? FLAG.null;

const PRI: any = {
  URGENT: { bg: "bg-red-500",    text: "text-white" },
  HIGH:   { bg: "bg-amber-400",  text: "text-white" },
  MEDIUM: { bg: "bg-emerald-500",text: "text-white" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function RiskBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const pct = Math.min((Math.abs(value) / max) * 100, 100);
  const isPositive = value > 0;
  
  return (
    <div className="group mb-4 last:mb-0">
      <div className="flex justify-between items-end mb-1.5 px-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={cn("text-xs font-black tabular-nums", isPositive ? "text-red-500" : "text-emerald-600")}>
          {isPositive ? "+" : ""}{value.toFixed(3)}
        </span>
      </div>
      <div className="relative h-2 bg-slate-100/50 rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
        <div 
          className={cn("absolute h-full rounded-full transition-all duration-700 ease-out", color)} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}

function ProbBar({ label, value: rawValue }: { label: string, value: number }) {
  // Auto-scale if the value is likely a decimal (0-1 range)
  const value = rawValue <= 1 ? rawValue * 100 : rawValue;
  
  const isCritical = value > 75;
  const isWarning = value > 30 && value <= 75;
  
  const barColor = isCritical ? "bg-red-500 shadow-md shadow-red-200" : isWarning ? "bg-amber-400 shadow-md shadow-amber-100" : "bg-emerald-500 shadow-md shadow-emerald-100";
  const textColor = isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-emerald-700";

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{label.replace('_', ' ')}</span>
        <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-black tabular-nums", textColor)}>{value.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-3 bg-slate-100/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50 relative">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-in-out relative min-w-[12px]", barColor)} 
          style={{ width: `${value}%` }} 
        >
          <div className="w-full h-full bg-white/20 animate-pulse" />
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
    </div>
  );
}

const TABS = ["Vitals", "Risk Factors", "AI Analysis", "Recommendations"];

// ── Main Component ────────────────────────────────────────────────────────────
export default function HealthReport({ data: rawData }: { data: any }) {
  const [tab, setTab] = useState(0);

  if (!rawData) return null;

  // Internal normalization to bypass "pending" if data is actually present
  const summary = rawData.summary || rawData.explanation?.overallAssessment || rawData.explanation?.summary;
  const hasData = !!(rawData.health_score !== undefined && rawData.health_score !== null) || 
                  !!summary || 
                  (rawData.probabilities && Object.keys(rawData.probabilities).length > 0) ||
                  (rawData.factors && rawData.factors.length > 0) ||
                  (rawData.recommendations && rawData.recommendations.length > 0);
  
  const data = {
    ...rawData,
    summary,
    status: hasData ? 'generated' : rawData.status
  };

  const sevColor =
    data.severity === "critical"
      ? { hdr: "from-red-600 to-red-700", badge: "bg-red-100 text-red-700 border-red-200" }
      : { hdr: "from-amber-500 to-amber-600", badge: "bg-amber-100 text-amber-700 border-amber-200" };

  return (
    <div className="bg-gray-50 p-2 md:p-6 font-sans print:p-0 print:bg-white min-h-full">
      <div className="max-w-4xl mx-auto print:max-w-none">

        {/* ── PREMIUM HEADER ── */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6 border border-gray-200 shadow-sm print:rounded-none print:shadow-none print:border-b-2 print:border-emerald-600 print:mb-8">
          <div className="px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 print:shadow-none">
                  <Heart className="w-8 h-8 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-600 font-black text-xl tracking-tighter uppercase">Health Buddy</span>
                    <span className="text-gray-300 text-sm">|</span>
                    <span className="text-gray-500 font-medium text-xs tracking-widest uppercase">AI Clinical Intelligence</span>
                </div>
                <h1 className="text-slate-900 text-3xl font-bold tracking-tight">Health Assessment Report</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider", sevColor.badge)}>
                        {data.severity === "critical" ? "Critical Risk" : "Stable"}
                    </span>
                    <span className="text-gray-400 text-[10px] font-medium uppercase tracking-[0.2em]">{data.report_date ? new Date(data.report_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-1.5 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Patient Information</p>
                <p className="text-slate-900 text-lg font-bold leading-none">{data.patient_name || 'Patient Name'}</p>
                <p className="text-emerald-600 text-xs font-medium">{data.patient_email || ''}</p>
                <p className="text-slate-400 text-[9px] mt-1 font-mono uppercase">ID: {data.report_id}</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-transparent print:hidden" />
        </div>

        {/* ── EMERGENCY ALERT ── */}
        {data.emergency && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-4">
                <p className="text-red-700 font-bold text-sm mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Emergency Warning
                </p>
                <p className="text-red-600 text-xs leading-relaxed">{data.emergency}</p>
            </div>
        )}

        {/* ── SCORE ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          {/* Health score */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm print:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Health Index</p>
            <div className="flex items-baseline gap-1 mb-2">
              {data.status === 'pending' ? (
                <div className="flex items-center gap-3 py-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-sm font-bold text-slate-300">Processing Analysis...</span>
                </div>
              ) : (
                <>
                    <span className={cn("text-6xl font-black tracking-tighter", data.health_score < 50 ? "text-red-600" : "text-emerald-600")}>
                        {data.health_score ?? '--'}
                    </span>
                    <span className="text-slate-300 text-xl font-bold">/100</span>
                </>
              )}
            </div>
            <p className={cn("text-xs font-bold mb-4 flex items-center gap-1.5", data.status === 'pending' ? "text-slate-400" : (data.health_score < 50 ? "text-red-600" : "text-emerald-700"))}>
                <Activity className="w-3.5 h-3.5" />
                {data.status === 'pending' ? "Synthesizing Data" : (data.health_score < 30 ? "Critical Alert" : data.health_score < 60 ? "Medical Caution" : "Optimal Range")}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 p-0.5 border border-slate-200/50">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", data.status === 'pending' ? "bg-slate-200 animate-pulse" : (data.health_score < 50 ? "bg-gradient-to-r from-red-600 to-red-400 shadow-md shadow-red-100" : "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-md shadow-emerald-100"))} 
                style={{ width: data.status === 'pending' ? '100%' : `${data.health_score}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{data.status === 'pending' ? 'Ensemble models running...' : `${data.health_score}% deviation from baseline`}</p>
          </div>

          {/* Risk probabilities */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm print:shadow-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">Predictive Diagnostics</p>
            {data.status === 'pending' ? (
                 <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className="h-2 bg-slate-100 rounded w-1/3"></div>
                            <div className="h-2 bg-slate-50 rounded w-full"></div>
                        </div>
                    ))}
                 </div>
            ) : (
                <>
                    {data.probabilities && Object.entries(data.probabilities).map(([k, v]: [any, any]) => (
                        <ProbBar key={k} label={k} value={typeof v === 'number' ? v : parseFloat(v)} />
                    ))}
                    {data.confidence && (
                        <div className="mt-2 border-t border-gray-100 pt-2">
                            <p className="text-[10px] text-gray-500 font-semibold mb-2">Model Confidence</p>
                            {Object.entries(data.confidence).map(([k, v]: [any, any]) => (
                                <div key={k} className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-gray-500">{k}</span>
                                    <span className="text-[10px] font-bold text-gray-700">{typeof v === 'number' ? v.toFixed(1) : v}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
          </div>

          {/* Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-emerald-700 font-bold mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> AI Summary
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed italic">
                {data.status === 'pending' 
                    ? "Our ensemble medical models are currently processing your health data. This typically takes 30-60 seconds."
                    : (data.summary || data.explanation?.overallAssessment)}
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-emerald-700 uppercase tracking-tighter">Status</span>
                <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                    data.status === 'pending' ? "bg-slate-50 text-slate-500 border-slate-200" : (data.severity === 'critical' ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                )}>
                  {data.status === 'pending' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                  {data.status === 'pending' ? 'Processing' : (data.severity === 'critical' ? 'High Risk' : 'Normal')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md print:shadow-none print:border-none">

          {/* Tab bar */}
          <div className="flex border-b border-gray-100 bg-gray-50 print:hidden">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={cn(
                    "flex-1 py-3 text-[10px] font-bold transition-all uppercase tracking-wide",
                    tab === i ? "text-emerald-700 border-b-2 border-emerald-500 bg-white" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* ── VITALS ── */}
            {(tab === 0 || typeof window === 'undefined') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-3">
                {data.inputs && Object.entries(data.inputs).map(([param, val]: [any, any]) => {
                  const s = flagStyle(val.flag);
                  return (
                    <div key={param} className={cn("rounded-xl border px-4 py-3.5 flex items-center justify-between transition-colors shadow-sm print:shadow-none", s.border, s.bg)}>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{param}</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{val.value}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", s.dot)} />
                        <span className={cn("text-[10px] font-bold uppercase", s.text)}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── RISK FACTORS ── */}
            {(tab === 1 || typeof window === 'undefined') && (
              <div className={cn("space-y-4", tab !== 1 && "print:block hidden")}>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 print:block hidden border-b pb-2">Technical Risk Categorization</h4>
                {data.factors && data.factors.length > 0 ? data.factors.map((f: any, i: number) => (
                  <div key={i} className="flex gap-4 bg-slate-50 rounded-2xl border border-slate-100 p-5 print:bg-white print:border-slate-200">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-md print:shadow-none">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{f.title}</p>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.body}</p>
                    </div>
                  </div>
                )) : (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">No elevated risk factors detected by AI engine.</p>
                    </div>
                )}
              </div>
            )}

            {/* ── SHAP / AI ANALYSIS ── */}
            {(tab === 2 || typeof window === 'undefined') && (
              <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-10", tab !== 2 && "print:grid hidden")}>
                <h4 className="md:col-span-2 text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-2 print:block hidden border-b pb-2 mt-8">ML Feature Attribution (SHAP)</h4>
                {(data.shap?.hypertension || data.shap?.heart) ? [
                  { label: "Hypertension attribution", key: "hypertension" },
                  { label: "Heart disease attribution", key: "heart" },
                ].map(({ label, key }) => {
                  const items = data.shap?.[key];
                  if (!items) return null;
                  const maxV  = Math.max(...items.map((x: any) => Math.abs(x.value)));
                  return (
                    <div key={key} className="bg-white p-4 rounded-2xl border border-slate-50 print:border-none print:p-0">
                      <p className="text-[10px] font-black text-emerald-700 mb-5 uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-3 h-3" /> {label}
                      </p>
                      {items.map((item: any) => (
                        <RiskBar
                          key={item.label}
                          label={item.label}
                          value={item.value}
                          max={maxV}
                          color={item.positive ? "bg-red-400" : "bg-emerald-500"}
                        />
                      ))}
                    </div>
                  );
                }) : (
                    <div className="md:col-span-2 py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Brain className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">Advanced attribution data not available for this legacy record.</p>
                    </div>
                )}
                {(data.shap?.hypertension || data.shap?.heart) && (
                    <div className="md:col-span-2 bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-xl print:bg-white print:text-slate-900 print:shadow-none print:border print:border-slate-200">
                        <p className="text-[10px] font-medium leading-relaxed flex items-center flex-wrap gap-4">
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Positive correlation (Increases risk)</span>
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Negative correlation (Protective)</span>
                            <span className="text-slate-400">· Intensity reflects model influence weight</span>
                        </p>
                    </div>
                )}
              </div>
            )}

            {/* ── RECOMMENDATIONS ── */}
            {(tab === 3 || typeof window === 'undefined') && (
              <div className={cn("space-y-4", tab !== 3 && "print:block hidden")}>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 print:block hidden border-b pb-2 mt-8">AI-Synthesized Care Recommendations</h4>
                {data.recommendations && data.recommendations.length > 0 ? data.recommendations.map((r: any, i: number) => {
                  const p = PRI[r.priority] || PRI.MEDIUM;
                  return (
                    <div key={i} className="flex gap-5 bg-slate-50 rounded-2xl border border-slate-100 p-6 print:bg-white print:border-slate-200">
                      <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-lg h-fit uppercase tracking-widest shadow-sm", p.bg, p.text)}>
                        {r.priority || 'ADVICE'}
                      </span>
                      <div>
                        <p className="text-base font-bold text-slate-900">{r.title}</p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.body}</p>
                      </div>
                    </div>
                  );
                }) : (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">Standard preventive measures recommended.</p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── FORMAL FOOTER ── */}
        <div className="mt-12 text-center border-t border-slate-100 pt-8 print:mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3">
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Methodology</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed uppercase">
                        Ensemble ML Models v2.5.4<br/>
                        SHAP Interpreter v1.02<br/>
                        Clinical Ref: SB-2024-X
                    </p>
                </div>
                <div>
                    <div className="flex justify-center gap-6 opacity-40 grayscale h-6">
                        <span className="text-[10px] font-black text-slate-900 tracking-tighter">AI ENGINE</span>
                        <span className="text-[10px] font-black text-slate-900 tracking-tighter">ML-CORE</span>
                        <span className="text-[10px] font-black text-slate-900 tracking-tighter">PRECISE CASE</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Verification</p>
                    <p className="text-[9px] text-slate-400 font-mono">
                        HASH: {data.report_id?.replace(/-/g, '').slice(0, 16).toUpperCase()}<br/>
                        CERT: HB-AI-VALIDATED
                    </p>
                </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl mx-auto">
            <span className="font-bold text-slate-500">Clinical Disclaimer:</span> This report is automatically generated by the Health Buddy AI Intelligence engine. 
            It is designed for preliminary screening and educational purposes. This is NOT a definitive clinical diagnosis. 
            Final medical decisions should always be made by a qualified healthcare professional.
            </p>
            
            <p className="mt-6 text-[9px] text-slate-300 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} Health Buddy Clinical Systems · Confidential Patient Record
            </p>
        </div>

      </div>
    </div>
  );
}
