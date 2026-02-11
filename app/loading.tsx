export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
            <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 dark:border-slate-800 rounded-full opacity-25"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                        <span className="w-6 h-6 bg-primary rounded-full"></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
