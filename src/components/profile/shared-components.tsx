'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// --- Types ---
interface HealthCellProps {
    icon?: React.ReactNode;
    label: string;
    value?: string | number | null;
    subValue?: string;
    onClick?: () => void;
    isLink?: boolean;
    className?: string;
    rightElement?: React.ReactNode;
}

interface EditCellProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select';
    options?: string[]; // For select type
    placeholder?: string;
}

// --- Components ---

/**
 * Apple-style grouped list container.
 */
export function GlassGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white/60 backdrop-blur-xl rounded-[24px] border border-white/40 shadow-sm overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

/**
 * Interactive list item row.
 */
export function HealthCell({ icon, label, value, subValue, onClick, isLink, className = '', rightElement }: HealthCellProps) {
    return (
        <motion.div
            whileTap={onClick ? { scale: 0.98, backgroundColor: 'rgba(255,255,255,0.5)' } : undefined}
            onClick={onClick}
            className={`min-h-[56px] flex items-center px-4 py-3 gap-3 border-b border-black/5 last:border-0 cursor-pointer transition-colors hover:bg-white/40 ${className}`}
        >
            {icon && <div className="text-primary text-xl">{icon}</div>}

            <div className="flex-1 flex flex-col justify-center">
                <span className="text-[17px] text-foreground font-normal leading-snug">{label}</span>
                {subValue && <span className="text-[13px] text-muted-foreground leading-none mt-0.5">{subValue}</span>}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
                {rightElement}
                {value && <span className="text-[17px] text-muted-foreground/80">{value}</span>}
                {isLink && <ChevronRight className="w-5 h-5 text-muted-foreground/40" />}
            </div>
        </motion.div>
    );
}

/**
 * Editable Input Row (Soft Input).
 */
export function EditCell({ label, value, onChange, type = 'text', options, placeholder }: EditCellProps) {
    return (
        <div className="min-h-[56px] flex items-center px-4 py-3 gap-3 border-b border-black/5 last:border-0">
            <div className="w-1/3 text-[17px] text-foreground font-normal">{label}</div>
            <div className="flex-1">
                {type === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-primary/5 text-foreground rounded-lg px-3 py-2 text-[17px] outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                    >
                        <option value="" disabled>{placeholder || 'Select'}</option>
                        {options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-primary/5 text-foreground rounded-lg px-3 py-2 text-[17px] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    />
                )}
            </div>
        </div>
    );
}

/**
 * iOS-style Toggle Switch.
 */
export function LavenderSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <motion.button
            layout
            onClick={() => onChange(!checked)}
            className={`w-[51px] h-[31px] rounded-full p-[2px] flex items-center transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-slate-200'
                }`}
        >
            <motion.div
                layout
                className="w-[27px] h-[27px] bg-white rounded-full shadow-sm"
                animate={{ x: checked ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </motion.button>
    );
}

/**
 * Page Header that mimics iOS large title.
 */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-end justify-between px-4 pb-4 pt-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md transition-all">
            <div>
                <h1 className="text-[34px] font-bold tracking-tight text-foreground leading-tight">{title}</h1>
                {subtitle && <p className="text-muted-foreground text-[17px] mt-1">{subtitle}</p>}
            </div>
            {action && (
                <div className="mb-2">
                    {action}
                </div>
            )}
        </div>
    );
}
