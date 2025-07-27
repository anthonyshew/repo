import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../lib/utils";

const alertVariants = cva(
	"ui:relative ui:w-full ui:rounded-lg ui:border ui:px-4 ui:py-3 ui:text-sm ui:grid ui:has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] ui:grid-cols-[0_1fr] ui:has-[>svg]:gap-x-3 ui:gap-y-0.5 ui:items-start ui:[&>svg]:size-4 ui:[&>svg]:translate-y-0.5 ui:[&>svg]:text-current",
	{
		variants: {
			variant: {
				default: "ui:bg-card ui:text-card-foreground",
				destructive:
					"ui:text-destructive ui:bg-card ui:[&>svg]:text-current ui:*:data-[slot=alert-description]:text-destructive/90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"ui:col-start-2 ui:line-clamp-1 ui:min-h-4 ui:font-medium ui:tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"ui:text-muted-foreground ui:col-start-2 ui:grid ui:justify-items-start ui:gap-1 ui:text-sm ui:[&_p]:leading-relaxed",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription };
