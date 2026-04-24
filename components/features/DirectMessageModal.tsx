'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, X, Loader2, User, Check, CheckCheck } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { sendMessage, getConversation, markAsRead } from '@/lib/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

interface DirectMessageModalProps {
    isOpen: boolean
    onClose: () => void
    receiverId: string
    receiverName: string
}

export function DirectMessageModal({ isOpen, onClose, receiverId, receiverName }: DirectMessageModalProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && receiverId) {
            fetchMessages()
            getCurrentUser()
            
            // Subscribe to new messages
            const channel = supabase
                .channel(`room-${receiverId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages'
                }, (payload) => {
                    const newMsg = payload.new
                    if (
                        (newMsg.sender_id === receiverId && newMsg.receiver_id === currentUserId) ||
                        (newMsg.sender_id === currentUserId && newMsg.receiver_id === receiverId)
                    ) {
                        setMessages(prev => [...prev, newMsg])
                    }
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [isOpen, receiverId, currentUserId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)
    }

    const fetchMessages = async () => {
        setFetching(true)
        const res = await getConversation(receiverId)
        if (res.success) {
            setMessages(res.data || [])
            // Mark all unread messages from receiver as read
            const unread = res.data?.filter(m => m.receiver_id === currentUserId && !m.is_read)
            if (unread?.length) {
                unread.forEach(m => markAsRead(m.id))
            }
        }
        setFetching(false)
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || loading) return

        setLoading(true)
        const res = await sendMessage(receiverId, content)
        if (res.success) {
            setContent('')
            // Optimistic update handled by real-time subscription mostly, 
            // but we add it manually here if subscription is slow
            const tempMsg = {
                id: Math.random().toString(),
                sender_id: currentUserId,
                receiver_id: receiverId,
                content: content,
                created_at: new Date().toISOString(),
                is_read: false
            }
            if (!messages.find(m => m.content === content && m.sender_id === currentUserId)) {
                setMessages(prev => [...prev, tempMsg])
            }
        } else {
            toast.error(res.error || 'Failed to send message')
        }
        setLoading(false)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Message with ${receiverName}`}
            className="max-w-2xl h-[80vh] flex flex-col p-0"
        >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {fetching ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <User className="w-12 h-12 opacity-20 mb-2" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[80%] space-y-1",
                                msg.sender_id === currentUserId ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                    msg.sender_id === currentUserId
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-bl-none"
                                )}
                            >
                                {msg.content}
                            </div>
                            <div className="flex items-center gap-1.5 px-1">
                                <span className="text-[10px] text-slate-400">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.sender_id === currentUserId && (
                                    msg.is_read ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3 text-slate-300" />
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 h-12 px-4 bg-white dark:bg-neutral-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Button type="submit" disabled={loading || !content.trim()} className="h-12 w-12 rounded-xl p-0">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
