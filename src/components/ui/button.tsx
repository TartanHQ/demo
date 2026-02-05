/* src/app/components/ui/button.tsx */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // --- MODIFIED: This is the new "bright" CTA ---
        "primary-cta":
          "bg-primary-cta text-primary-cta-foreground shadow-md hover:shadow-lg hover:shadow-primary-cta/30 hover:-translate-y-0.5",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // --- THIS IS THE FIX ---
  // We destructure the conflicting props out...
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    // Strip HTML drag handlers to avoid type conflict with Framer Motion's drag handlers
    onDrag,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,
    onDragLeave,
    ...props // ...so that `props` no longer contains them.
  }, ref) => {
    
    // Use motion.button for CTA and default
    if (variant === "primary-cta" || variant === "default") {
      return (
        <motion.button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          whileTap={{ scale: 0.98 }}
          {...props} // This `props` is now safe to spread
        />
      )
    }

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // We pass the original animation props here, since
        // this is just a standard React <button> or <Slot>
        onAnimationStart={onAnimationStart}
        onAnimationEnd={onAnimationEnd}
        onAnimationIteration={onAnimationIteration}
        // Preserve standard drag handlers on non-motion branch
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }