'use client'

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleEsc)
        }
        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('keydown', handleEsc)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            <div className={cn(
                "relative w-full max-w-lg bg-white dark:bg-neutral-surface-dark rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200",
                className
            )}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

import { useEffect } from "react"
