import type * as React from "react";

import { cn } from "../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"ui:border-input ui:placeholder:text-muted-foreground ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:dark:bg-input/30 ui:flex ui:field-sizing-content ui:min-h-16 ui:w-full ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:py-2 ui:text-base ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none ui:focus-visible:ring-[3px] ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
