/* src/app/components/ui/input.tsx */

import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full min-h-12 rounded-[var(--radius)] border border-slate-200 bg-white px-4 py-2 text-[14px] font-medium text-slate-900 shadow-sm shadow-slate-200/40 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#004C8F]/12 focus-visible:border-[#004C8F] disabled:cursor-not-allowed disabled:opacity-60",
          "transition-[border-color,box-shadow,background-color] duration-150 ease-out",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }