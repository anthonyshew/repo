import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../lib/utils";

const buttonVariants = cva(
	"ui:inline-flex ui:items-center ui:justify-center ui:gap-2 ui:whitespace-nowrap ui:rounded-md ui:text-sm ui:font-medium ui:transition-all ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:[&_svg]:pointer-events-none ui:[&_svg:not([class*=size-])]:size-4 ui:shrink-0 ui:[&_svg]:shrink-0 ui:outline-none ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:focus-visible:ring-[3px] ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"ui:bg-primary ui:text-primary-foreground ui:shadow-xs ui:hover:bg-primary/90",
				destructive:
					"ui:bg-destructive ui:text-white ui:shadow-xs ui:hover:bg-destructive/90 ui:focus-visible:ring-destructive/20 ui:dark:focus-visible:ring-destructive/40 ui:dark:bg-destructive/60",
				outline:
					"ui:border ui:bg-background ui:shadow-xs ui:hover:bg-accent ui:hover:text-accent-foreground ui:dark:bg-input/30 ui:dark:border-input ui:dark:hover:bg-input/50",
				secondary:
					"ui:bg-secondary ui:text-secondary-foreground ui:shadow-xs ui:hover:bg-secondary/80",
				ghost:
					"ui:hover:bg-accent ui:hover:text-accent-foreground ui:dark:hover:bg-accent/50",
				link: "ui:text-primary ui:underline-offset-4 ui:hover:underline",
			},
			size: {
				default: "ui:h-9 ui:px-4 ui:py-2 ui:has-[>svg]:px-3",
				sm: "ui:h-8 ui:rounded-md ui:gap-1.5 ui:px-3 ui:has-[>svg]:px-2.5",
				lg: "ui:h-10 ui:rounded-md ui:px-6 ui:has-[>svg]:px-4",
				icon: "ui:size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
