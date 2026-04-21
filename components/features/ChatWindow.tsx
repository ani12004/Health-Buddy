'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Sparkles } from 'lucide-react'
// import { createClient } from '@/lib/supabase/client' // Removed
import { chatWithAI } from '@/lib/actions/gemini/chat'
import { saveMessage, getChatMessages, getLatestCheckupResult } from '@/lib/actions/chat'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

// Message Type
interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
    created_at: string
}

type CheckupDisease = {
    risk_percent?: number
    risk_level?: 'LOW' | 'MODERATE' | 'HIGH' | string
}

function riskBadgeStyles(level?: string) {
    if (level === 'HIGH') {
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
    }
    if (level === 'MODERATE') {
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
}

function riskBarStyles(level?: string) {
    if (level === 'HIGH') return 'bg-rose-500'
    if (level === 'MODERATE') return 'bg-amber-500'
    return 'bg-emerald-500'
}

export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [checkupResults, setCheckupResults] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [sessionId] = useState(() => crypto.randomUUID())

    const checkupSnapshot: Array<{ key: string; label: string; data: CheckupDisease | null }> = [
        { key: 'Heart Disease', label: 'Heart', data: checkupResults?.['Heart Disease'] ?? null },
        { key: 'Hypertension', label: 'Blood Pressure', data: checkupResults?.['Hypertension'] ?? null },
        { key: 'Diabetes', label: 'Diabetes', data: checkupResults?.['Diabetes'] ?? null },
    ]

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Load history
    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true)
            const history = await getChatMessages(sessionId)
            if (history.length > 0) {
                setMessages(history)
            }
            setIsLoading(false)
        }
        loadHistory()
        
        const loadCheckup = async () => {
            const results = await getLatestCheckupResult()
            if (results) setCheckupResults(results)
        }
        loadCheckup()
    }, [sessionId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessageContent = input
        setInput('')
        setIsLoading(true)

        // Optimistic UI update
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessageContent,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, userMessage])

        try {
            // 1. Save User Message to DB
            await saveMessage(userMessageContent, 'user', sessionId)

            // 2. Call AI with History
            const formattedHistory = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }))
            
            const result = await chatWithAI(userMessageContent, checkupResults, formattedHistory)

            if (result.error || !result.data) {
                toast.error(result.error || 'Failed to get response.')
                if (result.error?.includes('Rate limit')) {
                    setCooldown(30)
                    const timer = setInterval(() => {
                        setCooldown(prev => {
                            if (prev <= 1) {
                                clearInterval(timer)
                                return 0
                            }
                            return prev - 1
                        })
                    }, 1000)
                }
                setIsLoading(false)
                return
            }

            const response = result.data as string

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: response,
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, aiMessage])

            // 3. Save AI Message to DB
            await saveMessage(response, 'ai', sessionId)

        } catch (error) {
            toast.error('Failed to send message.')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Health Buddy Assistant</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {checkupResults && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-white/[0.03]">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    Latest Checkup Snapshot
                                </p>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Chat Context
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {checkupSnapshot.map((item) => {
                                const level = item.data?.risk_level || 'LOW'
                                const risk = typeof item.data?.risk_percent === 'number' ? item.data.risk_percent : 0

                                return (
                                    <div key={item.key} className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-black/20">
                                        <div className="mb-1.5 flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskBadgeStyles(level)}`}>
                                                {level}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div
                                                className={`h-full rounded-full ${riskBarStyles(level)}`}
                                                style={{ width: `${Math.max(4, Math.min(100, risk))}%` }}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">{risk}% risk</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                        <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-500 text-sm">Start a conversation to get health advice.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        {msg.role === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        <div className={cn(
                            "p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed",
                            msg.role === 'user'
                                ? "bg-primary text-white rounded-tr-none shadow-md shadow-primary/20"
                                : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-white/5"
                        )}>
                            {msg.content}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
                                <User className="w-4 h-4 text-slate-500" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/5 flex gap-1 items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-neutral-surface-dark">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your health question..."
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || cooldown > 0}
                        className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[40px] justify-center"
                    >
                        {cooldown > 0 ? (
                            <span className="text-[10px] font-bold">{cooldown}s</span>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
