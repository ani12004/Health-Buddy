'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

type Notification = {
    id: string
    message: string
    type: 'info' | 'alert' | 'success'
    is_read: boolean
    created_at: string
}

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchNotifications()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const newNotification = payload.new as Notification
                setNotifications(prev => [newNotification, ...prev])
                if (!newNotification.is_read) {
                    setUnreadCount(prev => prev + 1)
                }
            })
            .subscribe()

        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            supabase.removeChannel(channel)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        }
    }

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
            default: return <Info className="w-4 h-4 text-primary" />
        }
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-full bg-white dark:bg-neutral-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/30 transition-all shadow-sm relative group"
            >
                <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-surface-dark animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-neutral-surface-dark rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        className={cn(
                                            "p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3",
                                            !notification.is_read && "bg-blue-50/30 dark:bg-blue-900/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                                            "bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 shadow-sm"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn(
                                                "text-sm text-slate-800 dark:text-slate-200 leading-snug",
                                                !notification.is_read && "font-semibold"
                                            )}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
