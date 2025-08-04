"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils";

function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"ui:peer ui:border-input ui:dark:bg-input/30 ui:data-[state=checked]:bg-primary ui:data-[state=checked]:text-primary-foreground ui:dark:data-[state=checked]:bg-primary ui:data-[state=checked]:border-primary ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:size-4 ui:shrink-0 ui:rounded-[4px] ui:border ui:shadow-xs ui:transition-shadow ui:outline-none ui:focus-visible:ring-[3px] ui:disabled:cursor-not-allowed ui:disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="ui:flex ui:items-center ui:justify-center ui:text-current ui:transition-none"
			>
				<CheckIcon className="ui:size-3.5" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
