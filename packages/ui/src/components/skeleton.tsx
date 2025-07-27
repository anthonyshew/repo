import { cn } from "../lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("ui:bg-accent ui:animate-pulse ui:rounded-md", className)}
			{...props}
		/>
	);
}

export { Skeleton };
