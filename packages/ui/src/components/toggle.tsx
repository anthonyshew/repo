import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../lib/utils";

const toggleVariants = cva(
	"ui:inline-flex ui:items-center ui:justify-center ui:gap-2 ui:rounded-md ui:text-sm ui:font-medium ui:hover:bg-muted ui:hover:text-muted-foreground ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:data-[state=on]:bg-accent ui:data-[state=on]:text-accent-foreground ui:[&_svg]:pointer-events-none ui:[&_svg:not([class*=size-])]:size-4 ui:[&_svg]:shrink-0 ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:focus-visible:ring-[3px] ui:outline-none ui:transition-[color,box-shadow] ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "ui:bg-transparent",
				outline:
					"ui:border ui:border-input ui:bg-transparent ui:shadow-xs ui:hover:bg-accent ui:hover:text-accent-foreground",
			},
			size: {
				default: "ui:h-9 ui:px-2 ui:min-w-9",
				sm: "ui:h-8 ui:px-1.5 ui:min-w-8",
				lg: "ui:h-10 ui:px-2.5 ui:min-w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Toggle({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
	VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Toggle, toggleVariants };
