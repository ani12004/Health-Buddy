'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { chatWithAI } from '@/app/actions';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am Health Buddy. How can I assist you with your health today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Convert messages to history format for AI
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithAI(history, userMessage.content);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-secondary/30 pt-20 pb-4">
            <div className="flex-1 max-w-2xl mx-auto w-full p-4 overflow-y-auto space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex items-start gap-3",
                                message.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    message.role === 'user' ? "bg-primary text-white" : "bg-white text-primary"
                                )}
                            >
                                {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div
                                className={cn(
                                    "p-4 rounded-2xl max-w-[80%] shadow-sm text-sm",
                                    message.role === 'user'
                                        ? "bg-primary text-white rounded-tr-sm"
                                        : "bg-white text-foreground rounded-tl-sm"
                                )}
                            >
                                {message.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center shrink-0">
                            <Bot size={14} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="max-w-2xl mx-auto w-full px-4">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your health question..."
                        className="w-full glass p-4 pr-12 rounded-[2rem] border-white/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
