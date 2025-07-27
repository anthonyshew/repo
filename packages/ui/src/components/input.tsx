import type * as React from "react";

import { cn } from "../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"ui:file:text-foreground ui:placeholder:text-muted-foreground ui:selection:bg-primary ui:selection:text-primary-foreground ui:dark:bg-input/30 ui:border-input ui:flex ui:h-9 ui:w-full ui:min-w-0 ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:py-1 ui:text-base ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none ui:file:inline-flex ui:file:h-7 ui:file:border-0 ui:file:bg-transparent ui:file:text-sm ui:file:font-medium ui:disabled:pointer-events-none ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:md:text-sm",
				"ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:focus-visible:ring-[3px]",
				"ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
