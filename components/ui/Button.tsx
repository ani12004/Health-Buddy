import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "sm" | "md" | "lg"
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-primary hover:bg-primary-600 text-white shadow-lg shadow-primary/25",
            secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
            outline: "border border-primary text-primary hover:bg-primary/5",
            ghost: "text-slate-600 hover:text-primary hover:bg-slate-100/50",
        }

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-5 py-2.5 text-sm",
            lg: "px-8 py-4 text-base",
        }

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 transform active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
