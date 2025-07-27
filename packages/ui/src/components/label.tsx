"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";

import { cn } from "../lib/utils";

function Label({
	className,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"ui:flex ui:items-center ui:gap-2 ui:text-sm ui:leading-none ui:font-medium ui:select-none ui:group-data-[disabled=true]:pointer-events-none ui:group-data-[disabled=true]:opacity-50 ui:peer-disabled:cursor-not-allowed ui:peer-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
