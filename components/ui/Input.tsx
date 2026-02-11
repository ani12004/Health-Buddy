import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <input
                    type={type}
                    className={cn(
                        "flex w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-4 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm text-slate-900 dark:text-white",
                        icon && "pr-12",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {icon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
