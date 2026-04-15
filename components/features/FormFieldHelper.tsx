'use client'

import { useState, useEffect } from 'react'
import { Calculator, X, Info, Zap, Activity, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FormFieldHelperProps {
  label: string
  name: string
  value: string
  onChange: (e: any) => void
  type?: string
  placeholder?: string
  description?: string
  calculatorType?: 'bmi' | 'waist-height' | 'ldl' | 'generic'
}

export function FormFieldHelper({
  label,
  name,
  value,
  onChange,
  type = 'number',
  placeholder,
  description,
  calculatorType
}: FormFieldHelperProps) {
  const [isOpen, setIsOpen] = useState(false)

  // BMI Calculator State
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bmiResult, setBmiResult] = useState<number | null>(null)

  // Waist-to-Height Ratio State
  const [waist, setWaist] = useState('')
  const [waistHeightResult, setWaistHeightResult] = useState<number | null>(null)

  // LDL Calculator State (Friedewald formula: LDL = TC - HDL - TG/5)
  const [tc, setTc] = useState('')
  const [hdl, setHdl] = useState('')
  const [tg, setTg] = useState('')
  const [ldlResult, setLdlResult] = useState<number | null>(null)

  const calculateBMI = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100 // cm to m
    if (w > 0 && h > 0) {
      const res = w / (h * h)
      setBmiResult(parseFloat(res.toFixed(1)))
    }
  }

  const calculateWaistHeight = () => {
    const w = parseFloat(waist)
    const h = parseFloat(height)
    if (w > 0 && h > 0) {
      const res = w / h
      setWaistHeightResult(parseFloat(res.toFixed(2)))
    }
  }

  const calculateLDL = () => {
    const total = parseFloat(tc)
    const good = parseFloat(hdl)
    const tri = parseFloat(tg)
    if (total > 0 && good > 0 && tri > 0) {
      const res = total - good - (tri / 5)
      setLdlResult(parseFloat(res.toFixed(1)))
    }
  }

  const applyResult = (res: number) => {
    onChange({ target: { name, value: res.toString() } })
    setIsOpen(false)
  }

  // Helper function for conditional class names
  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

  return (
    <div className="space-y-1.5 relative group">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-all">
          {label}
        </label>
        {calculatorType && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-all border-b border-primary/20 hover:border-primary px-0.5"
            title="Open Calculator"
          >
            <Calculator className="w-3 h-3" />
            Calculate
          </button>
        )}
      </div>
      
      <div className="relative group">
        <Input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-slate-800 focus:ring-primary/20 focus:scale-[1.01] transition-all px-4 pr-10 text-sm font-medium"
        />
        {value && !isOpen && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-4 h-4 text-emerald-500 opacity-50" />
           </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-neutral-surface-dark rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-100 dark:border-slate-800">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/25">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {calculatorType?.toUpperCase()} <span className="text-primary">Assistant</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">HealthBuddy Medical Laboratory</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {description && (
                <div className="flex gap-4 p-5 bg-slate-50/50 dark:bg-white/5 rounded-3xl text-sm text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800/50 group/desc relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                  <Info className="w-6 h-6 text-primary shrink-0 opacity-50 relative z-10" />
                  <p className="relative z-10">{description}</p>
                </div>
              )}

              {calculatorType === 'bmi' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {/* Visual Formula Card */}
                  <div className="relative p-6 bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden group/formula">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover/formula:bg-primary/30 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-4">Body Mass Index Formula</div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Weight</div>
                          <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-mono">kg</div>
                        </div>
                        <div className="text-2xl font-light text-slate-700">/</div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Height</div>
                          <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-mono">m²</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3 group/field">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-primary transition-colors">Body Weight</label>
                        <span className="text-[10px] font-bold text-primary opacity-0 group-focus-within/field:opacity-100 transition-opacity">REQUIRED</span>
                      </div>
                      <div className="relative group/input">
                        <Input 
                          type="number" 
                          value={weight} 
                          onChange={(e) => setWeight(e.target.value)} 
                          placeholder="00.0" 
                          className="h-16 rounded-[1.25rem] bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-bold pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                           <span className="text-xs font-black text-slate-300 dark:text-slate-600">KG</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 group/field">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-primary transition-colors">Body Height</label>
                        <span className="text-[10px] font-bold text-primary opacity-0 group-focus-within/field:opacity-100 transition-opacity">REQUIRED</span>
                      </div>
                      <div className="relative group/input">
                        <Input 
                          type="number" 
                          value={height} 
                          onChange={(e) => setHeight(e.target.value)} 
                          placeholder="000" 
                          className="h-16 rounded-[1.25rem] bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-bold pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                           <span className="text-xs font-black text-slate-300 dark:text-slate-600">CM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Action */}
                  <div className="relative">
                    <Button 
                      onClick={calculateBMI} 
                      className="w-full h-16 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/25 transition-all active:scale-[0.97] group/btn"
                    >
                      <Zap className="w-5 h-5 mr-2 text-yellow-400 group-hover/btn:scale-125 transition-transform" />
                      Run Clinical Calculation
                    </Button>
                    {/* Decorative glow */}
                    <div className="absolute -inset-1 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 -z-10 transition-opacity" />
                  </div>

                  {/* Advanced Result Card */}
                  {bmiResult !== null && (
                    <div className="p-1 rounded-[2.25rem] bg-gradient-to-br from-primary via-purple-500 to-primary animate-gradient overflow-hidden">
                      <div className="bg-white dark:bg-neutral-surface-dark rounded-[2.15rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Calculated Index</div>
                            <div className="flex items-baseline gap-2">
                               <span className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{bmiResult}</span>
                               <span className="text-xl font-bold text-slate-400">kg/m²</span>
                            </div>
                          </div>
                          <div className={cn(
                            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner",
                            bmiResult < 18.5 ? "bg-blue-50 text-blue-500" :
                            bmiResult < 25 ? "bg-emerald-50 text-emerald-500" :
                            bmiResult < 30 ? "bg-amber-50 text-amber-500" :
                            "bg-red-50 text-red-500"
                          )}>
                             <Activity className="w-8 h-8" />
                          </div>
                        </div>

                        {/* Visual Range Slider */}
                        <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden group/slider">
                          <div className="absolute inset-0 flex">
                            <div className="h-full w-[18.5%] bg-blue-400/30" />
                            <div className="h-full w-[6.5%] bg-emerald-400/30" />
                            <div className="h-full w-[5%] bg-amber-400/30" />
                            <div className="h-full grow bg-red-400/30" />
                          </div>
                          <div 
                            className={cn(
                              "absolute h-full w-2 top-0 -ml-1 rounded-full shadow-lg transition-all duration-1000",
                              bmiResult < 18.5 ? "bg-blue-500" :
                              bmiResult < 25 ? "bg-emerald-500" :
                              bmiResult < 30 ? "bg-amber-500" :
                              "bg-red-500"
                            )} 
                            style={{ left: `${Math.min(Math.max((bmiResult / 40) * 100, 5), 95)}%` }} 
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.1em]",
                            bmiResult < 18.5 ? "bg-blue-50 text-blue-600" :
                            bmiResult < 25 ? "bg-emerald-50 text-emerald-600" :
                            bmiResult < 30 ? "bg-amber-50 text-amber-600" :
                            "bg-red-50 text-red-600"
                          )}>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            {bmiResult < 18.5 ? 'UNDERWEIGHT' :
                             bmiResult < 25 ? 'NORMAL RANGE' :
                             bmiResult < 30 ? 'OVERWEIGHT' :
                             'CLINICAL OBESITY'}
                          </div>
                          
                          <Button 
                            className="h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all"
                            onClick={() => applyResult(bmiResult)}
                          >
                            Sync to Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {calculatorType === 'waist-height' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {/* Visual Formula Card */}
                  <div className="relative p-6 bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden group/formula">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover/formula:bg-primary/30 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-4">Waist-to-Height Ratio (WtHR)</div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Waist</div>
                          <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-mono">cm</div>
                        </div>
                        <div className="text-2xl font-light text-slate-700">/</div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Height</div>
                          <div className="px-3 py-1 bg-white/5 rounded-lg text-white font-mono">cm</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3 group/field">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-primary transition-colors">Waist Circ.</label>
                      </div>
                      <div className="relative group/input">
                        <Input 
                          type="number" 
                          value={waist} 
                          onChange={(e) => setWaist(e.target.value)} 
                          placeholder="00.0" 
                          className="h-16 rounded-[1.25rem] bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-bold pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                           <span className="text-xs font-black text-slate-300 dark:text-slate-600">CM</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 group/field">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within/field:text-primary transition-colors">Body Height</label>
                      </div>
                      <div className="relative group/input">
                        <Input 
                          type="number" 
                          value={height} 
                          onChange={(e) => setHeight(e.target.value)} 
                          placeholder="000" 
                          className="h-16 rounded-[1.25rem] bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-bold pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                           <span className="text-xs font-black text-slate-300 dark:text-slate-600">CM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={calculateWaistHeight} 
                    className="w-full h-16 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/25 transition-all active:scale-[0.97] group/btn"
                  >
                    <Zap className="w-5 h-5 mr-2 text-yellow-400 group-hover/btn:scale-125 transition-transform" />
                    Calculate WtHR
                  </Button>

                  {waistHeightResult !== null && (
                    <div className="p-1 rounded-[2.25rem] bg-gradient-to-br from-primary via-purple-500 to-primary animate-gradient overflow-hidden">
                      <div className="bg-white dark:bg-neutral-surface-dark rounded-[2.15rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Calculated Ratio</div>
                            <div className="flex items-baseline gap-2">
                               <span className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{waistHeightResult}</span>
                            </div>
                          </div>
                          <div className={cn(
                            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner",
                            waistHeightResult <= 0.5 ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                          )}>
                             <Activity className="w-8 h-8" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.1em]",
                            waistHeightResult <= 0.5 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            {waistHeightResult <= 0.5 ? 'HEALTHY RATIO' : 'CENTRAL OBESITY RISK'}
                          </div>
                          
                          <Button 
                            className="h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all"
                            onClick={() => applyResult(waistHeightResult)}
                          >
                            Sync to Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {calculatorType === 'ldl' && (
                <div className="space-y-4 pt-2">
                   <div className="space-y-3">
                    <Input type="number" value={tc} onChange={(e) => setTc(e.target.value)} placeholder="Total Cholesterol (mg/dL)" />
                    <Input type="number" value={hdl} onChange={(e) => setHdl(e.target.value)} placeholder="HDL Cholesterol (mg/dL)" />
                    <Input type="number" value={tg} onChange={(e) => setTg(e.target.value)} placeholder="Triglycerides (mg/dL)" />
                  </div>
                  <Button onClick={calculateLDL} className="w-full bg-blue-600 hover:bg-blue-700">Calculate LDL</Button>
                  {ldlResult !== null && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Calculated LDL</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-white">{ldlResult}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => applyResult(ldlResult)}>Use Result</Button>
                    </div>
                  )}
                </div>
              )}

              {!calculatorType && (
                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl italic text-sm text-gray-500 text-center">
                    Check your recent medical report or consult a professional for exact values.
                 </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700">
               <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
