"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";

import { cn } from "../lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"ui:peer ui:data-[state=checked]:bg-primary ui:data-[state=unchecked]:bg-input ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:dark:data-[state=unchecked]:bg-input/80 ui:inline-flex ui:h-[1.15rem] ui:w-8 ui:shrink-0 ui:items-center ui:rounded-full ui:border ui:border-transparent ui:shadow-xs ui:transition-all ui:outline-none ui:focus-visible:ring-[3px] ui:disabled:cursor-not-allowed ui:disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					"ui:bg-background ui:dark:data-[state=unchecked]:bg-foreground ui:dark:data-[state=checked]:bg-primary-foreground ui:pointer-events-none ui:block ui:size-4 ui:rounded-full ui:ring-0 ui:transition-transform ui:data-[state=checked]:translate-x-[calc(100%-2px)] ui:data-[state=unchecked]:translate-x-0",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
