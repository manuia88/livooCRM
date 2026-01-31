import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => children
const Tooltip = ({ children }: { children: React.ReactNode }) => children
const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>{children}</button>
))
const TooltipContent = ({ className, children, ...props }: any) => (
    <div className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)} {...props}>
        {children}
    </div>
)

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
