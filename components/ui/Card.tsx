import * as React from "react"
import { cn } from "@/lib/utils/cn"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 shadow-sm",
                className
            )}
            {...props}
        />
    )
)
Card.displayName = "Card"

export { Card }
