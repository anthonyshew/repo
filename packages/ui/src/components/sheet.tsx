import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="sheet-overlay"
			className={cn(
				"ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=open]:fade-in-0 ui:fixed ui:inset-0 ui:z-50 ui:bg-black/50",
				className,
			)}
			{...props}
		/>
	);
}

function SheetContent({
	className,
	children,
	side = "right",
	...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
	side?: "top" | "right" | "bottom" | "left";
}) {
	return (
		<SheetPortal>
			<SheetOverlay />
			<SheetPrimitive.Content
				data-slot="sheet-content"
				className={cn(
					"ui:bg-background ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:fixed ui:z-50 ui:flex ui:flex-col ui:gap-4 ui:shadow-lg ui:transition ui:ease-in-out ui:data-[state=closed]:duration-300 ui:data-[state=open]:duration-500",
					side === "right" &&
						"ui:data-[state=closed]:slide-out-to-right ui:data-[state=open]:slide-in-from-right ui:inset-y-0 ui:right-0 ui:h-full ui:w-3/4 ui:border-l ui:sm:max-w-sm",
					side === "left" &&
						"ui:data-[state=closed]:slide-out-to-left ui:data-[state=open]:slide-in-from-left ui:inset-y-0 ui:left-0 ui:h-full ui:w-3/4 ui:border-r ui:sm:max-w-sm",
					side === "top" &&
						"ui:data-[state=closed]:slide-out-to-top ui:data-[state=open]:slide-in-from-top ui:inset-x-0 ui:top-0 ui:h-auto ui:border-b",
					side === "bottom" &&
						"ui:data-[state=closed]:slide-out-to-bottom ui:data-[state=open]:slide-in-from-bottom ui:inset-x-0 ui:bottom-0 ui:h-auto ui:border-t",
					className,
				)}
				{...props}
			>
				{children}
				<SheetPrimitive.Close className="ui:ring-offset-background ui:focus:ring-ring ui:data-[state=open]:bg-secondary ui:absolute ui:top-4 ui:right-4 ui:rounded-xs ui:opacity-70 ui:transition-opacity ui:hover:opacity-100 ui:focus:ring-2 ui:focus:ring-offset-2 ui:focus:outline-hidden ui:disabled:pointer-events-none">
					<XIcon className="ui:size-4" />
					<span className="ui:sr-only">Close</span>
				</SheetPrimitive.Close>
			</SheetPrimitive.Content>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("ui:flex ui:flex-col ui:gap-1.5 ui:p-4", className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn(
				"ui:mt-auto ui:flex ui:flex-col ui:gap-2 ui:p-4",
				className,
			)}
			{...props}
		/>
	);
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn("ui:text-foreground ui:font-semibold", className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn("ui:text-muted-foreground ui:text-sm", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
