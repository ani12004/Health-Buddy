import { ChatWindow } from '@/components/features/ChatWindow'

export default function ChatPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">AI Health Assistant</h1>
            <ChatWindow />
        </div>
    )
}
