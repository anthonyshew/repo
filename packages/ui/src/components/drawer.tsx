import type * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "../lib/utils";

function Drawer({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				"ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=open]:fade-in-0 ui:fixed ui:inset-0 ui:z-50 ui:bg-black/50",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	return (
		<DrawerPortal data-slot="drawer-portal">
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				className={cn(
					"ui:group/drawer-content ui:bg-background ui:fixed ui:z-50 ui:flex ui:h-auto ui:flex-col",
					"ui:data-[vaul-drawer-direction=top]:inset-x-0 ui:data-[vaul-drawer-direction=top]:top-0 ui:data-[vaul-drawer-direction=top]:mb-24 ui:data-[vaul-drawer-direction=top]:max-h-[80vh] ui:data-[vaul-drawer-direction=top]:rounded-b-lg ui:data-[vaul-drawer-direction=top]:border-b",
					"ui:data-[vaul-drawer-direction=bottom]:inset-x-0 ui:data-[vaul-drawer-direction=bottom]:bottom-0 ui:data-[vaul-drawer-direction=bottom]:mt-24 ui:data-[vaul-drawer-direction=bottom]:max-h-[80vh] ui:data-[vaul-drawer-direction=bottom]:rounded-t-lg ui:data-[vaul-drawer-direction=bottom]:border-t",
					"ui:data-[vaul-drawer-direction=right]:inset-y-0 ui:data-[vaul-drawer-direction=right]:right-0 ui:data-[vaul-drawer-direction=right]:w-3/4 ui:data-[vaul-drawer-direction=right]:border-l ui:data-[vaul-drawer-direction=right]:sm:max-w-sm",
					"ui:data-[vaul-drawer-direction=left]:inset-y-0 ui:data-[vaul-drawer-direction=left]:left-0 ui:data-[vaul-drawer-direction=left]:w-3/4 ui:data-[vaul-drawer-direction=left]:border-r ui:data-[vaul-drawer-direction=left]:sm:max-w-sm",
					className,
				)}
				{...props}
			>
				<div className="ui:bg-muted ui:mx-auto ui:mt-4 ui:hidden ui:h-2 ui:w-[100px] ui:shrink-0 ui:rounded-full ui:group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				"ui:flex ui:flex-col ui:gap-0.5 ui:p-4 ui:group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center ui:group-data-[vaul-drawer-direction=top]/drawer-content:text-center ui:md:gap-1.5 ui:md:text-left",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn(
				"ui:mt-auto ui:flex ui:flex-col ui:gap-2 ui:p-4",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerTitle({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn("ui:text-foreground ui:font-semibold", className)}
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn("ui:text-muted-foreground ui:text-sm", className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
