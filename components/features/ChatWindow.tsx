'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { chatWithAI } from '@/lib/actions/gemini'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

// Message Type
interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
    created_at: string
}

export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])


    const [sessionId] = useState(() => crypto.randomUUID())

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
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // 1. Save User Message to DB
                await supabase.from('chats').insert({
                    user_id: user.id,
                    session_id: sessionId,
                    sender: 'user',
                    message: userMessageContent
                })
            }

            // 2. Call AI
            const response = await chatWithAI(userMessageContent)

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: response,
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, aiMessage])

            if (user) {
                // 3. Save AI Message to DB
                await supabase.from('chats').insert({
                    user_id: user.id,
                    session_id: sessionId,
                    sender: 'ai',
                    message: response
                })
            }

        } catch (error) {
            toast.error('Failed to send message.')
            console.error(error)
            // Rollback optimistic update if needed (omitted for brevity)
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
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
