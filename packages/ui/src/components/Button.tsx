import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
	"ui:inline-flex ui:items-center ui:justify-center ui:rounded-md ui:text-sm ui:font-medium ui:ring-offset-background ui:transition-colors focus-visible:ui:outline-hidden focus-visible:ui:ring-2 focus-visible:ui:ring-ring focus-visible:ui:ring-offset-2 disabled:ui:pointer-events-none disabled:ui:opacity-50",
	{
		variants: {
			variant: {
				default: "ui:bg-primary ui:text-primary-foreground hover:ui:bg-primary/90",
				destructive:
					"ui:bg-destructive ui:text-destructive-foreground hover:ui:bg-destructive/90",
				outline:
					"ui:border ui:border-input ui:bg-background hover:ui:bg-accent hover:ui:text-accent-foreground",
				secondary:
					"ui:bg-secondary ui:text-secondary-foreground hover:ui:bg-secondary/80",
				ghost: "hover:ui:bg-accent hover:ui:text-accent-foreground",
				link: "ui:text-primary ui:underline-offset-4 hover:ui:underline",
			},
			size: {
				default: "ui:h-10 ui:px-4 ui:py-2",
				sm: "ui:h-9 ui:rounded-md ui:px-3",
				lg: "ui:h-11 ui:rounded-md ui:px-8",
				icon: "ui:h-10 ui:w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={twMerge(buttonVariants({ variant, size }), className)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
