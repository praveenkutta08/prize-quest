import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium " +
    "transition-[background-color,border-color,box-shadow,transform,color] duration-fast ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 " +
    "active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // Primary — the one brand-accent action per view.
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-brand-bright hover:shadow-glow",
        secondary:
          "bg-surface-2 text-text-primary border border-hairline hover:bg-surface-3 hover:border-hairline-strong",
        outline:
          "border border-hairline-strong bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary",
        ghost: "bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary",
        subtle: "bg-brand-subtle text-brand-bright hover:bg-surface-3",
        danger: "bg-danger text-danger-foreground shadow-sm hover:brightness-110",
        link: "text-brand hover:text-brand-bright underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-md",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
