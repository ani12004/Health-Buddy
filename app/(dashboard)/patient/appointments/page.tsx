export default function AppointmentsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Appointments Coming Soon</h2>
            <p className="text-slate-500 max-w-md">Schedule management and booking history will be available here.</p>
        </div>
    )
}
