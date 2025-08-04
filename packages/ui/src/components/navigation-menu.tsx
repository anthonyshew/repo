import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils";

function NavigationMenu({
	className,
	children,
	viewport = true,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
	viewport?: boolean;
}) {
	return (
		<NavigationMenuPrimitive.Root
			data-slot="navigation-menu"
			data-viewport={viewport}
			className={cn(
				"ui:group/navigation-menu ui:relative ui:flex ui:max-w-max ui:flex-1 ui:items-center ui:justify-center",
				className,
			)}
			{...props}
		>
			{children}
			{viewport && <NavigationMenuViewport />}
		</NavigationMenuPrimitive.Root>
	);
}

function NavigationMenuList({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
	return (
		<NavigationMenuPrimitive.List
			data-slot="navigation-menu-list"
			className={cn(
				"ui:group ui:flex ui:flex-1 ui:list-none ui:items-center ui:justify-center ui:gap-1",
				className,
			)}
			{...props}
		/>
	);
}

function NavigationMenuItem({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
	return (
		<NavigationMenuPrimitive.Item
			data-slot="navigation-menu-item"
			className={cn("ui:relative", className)}
			{...props}
		/>
	);
}

const navigationMenuTriggerStyle = cva(
	"ui:group ui:inline-flex ui:h-9 ui:w-max ui:items-center ui:justify-center ui:rounded-md ui:bg-background ui:px-4 ui:py-2 ui:text-sm ui:font-medium ui:hover:bg-accent ui:hover:text-accent-foreground ui:focus:bg-accent ui:focus:text-accent-foreground ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:data-[state=open]:hover:bg-accent ui:data-[state=open]:text-accent-foreground ui:data-[state=open]:focus:bg-accent ui:data-[state=open]:bg-accent/50 ui:focus-visible:ring-ring/50 ui:outline-none ui:transition-[color,box-shadow] ui:focus-visible:ring-[3px] ui:focus-visible:outline-1",
);

function NavigationMenuTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
	return (
		<NavigationMenuPrimitive.Trigger
			data-slot="navigation-menu-trigger"
			className={cn(navigationMenuTriggerStyle(), "ui:group", className)}
			{...props}
		>
			{children}{" "}
			<ChevronDownIcon
				className="ui:relative ui:top-[1px] ui:ml-1 ui:size-3 ui:transition ui:duration-300 ui:group-data-[state=open]:rotate-180"
				aria-hidden="true"
			/>
		</NavigationMenuPrimitive.Trigger>
	);
}

function NavigationMenuContent({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
	return (
		<NavigationMenuPrimitive.Content
			data-slot="navigation-menu-content"
			className={cn(
				"ui:data-[motion^=from-]:animate-in ui:data-[motion^=to-]:animate-out ui:data-[motion^=from-]:fade-in ui:data-[motion^=to-]:fade-out ui:data-[motion=from-end]:slide-in-from-right-52 ui:data-[motion=from-start]:slide-in-from-left-52 ui:data-[motion=to-end]:slide-out-to-right-52 ui:data-[motion=to-start]:slide-out-to-left-52 ui:top-0 ui:left-0 ui:w-full ui:p-2 ui:pr-2.5 ui:md:absolute ui:md:w-auto",
				"ui:group-data-[viewport=false]/navigation-menu:bg-popover ui:group-data-[viewport=false]/navigation-menu:text-popover-foreground ui:group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in ui:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out ui:group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 ui:group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 ui:group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 ui:group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 ui:group-data-[viewport=false]/navigation-menu:top-full ui:group-data-[viewport=false]/navigation-menu:mt-1.5 ui:group-data-[viewport=false]/navigation-menu:overflow-hidden ui:group-data-[viewport=false]/navigation-menu:rounded-md ui:group-data-[viewport=false]/navigation-menu:border ui:group-data-[viewport=false]/navigation-menu:shadow ui:group-data-[viewport=false]/navigation-menu:duration-200 ui:**:data-[slot=navigation-menu-link]:focus:ring-0 ui:**:data-[slot=navigation-menu-link]:focus:outline-none",
				className,
			)}
			{...props}
		/>
	);
}

function NavigationMenuViewport({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
	return (
		<div
			className={cn(
				"ui:absolute ui:top-full ui:left-0 ui:isolate ui:z-50 ui:flex ui:justify-center",
			)}
		>
			<NavigationMenuPrimitive.Viewport
				data-slot="navigation-menu-viewport"
				className={cn(
					"ui:origin-top-center ui:bg-popover ui:text-popover-foreground ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[state=closed]:zoom-out-95 ui:data-[state=open]:zoom-in-90 ui:relative ui:mt-1.5 ui:h-[var(--radix-navigation-menu-viewport-height)] ui:w-full ui:overflow-hidden ui:rounded-md ui:border ui:shadow ui:md:w-[var(--radix-navigation-menu-viewport-width)]",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function NavigationMenuLink({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
	return (
		<NavigationMenuPrimitive.Link
			data-slot="navigation-menu-link"
			className={cn(
				"ui:data-[active=true]:focus:bg-accent ui:data-[active=true]:hover:bg-accent ui:data-[active=true]:bg-accent/50 ui:data-[active=true]:text-accent-foreground ui:hover:bg-accent ui:hover:text-accent-foreground ui:focus:bg-accent ui:focus:text-accent-foreground ui:focus-visible:ring-ring/50 ui:[&_svg:not([class*=text-])]:text-muted-foreground ui:flex ui:flex-col ui:gap-1 ui:rounded-sm ui:p-2 ui:text-sm ui:transition-all ui:outline-none ui:focus-visible:ring-[3px] ui:focus-visible:outline-1 ui:[&_svg:not([class*=size-])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function NavigationMenuIndicator({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
	return (
		<NavigationMenuPrimitive.Indicator
			data-slot="navigation-menu-indicator"
			className={cn(
				"ui:data-[state=visible]:animate-in ui:data-[state=hidden]:animate-out ui:data-[state=hidden]:fade-out ui:data-[state=visible]:fade-in ui:top-full ui:z-[1] ui:flex ui:h-1.5 ui:items-end ui:justify-center ui:overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="ui:bg-border ui:relative ui:top-[60%] ui:h-2 ui:w-2 ui:rotate-45 ui:rounded-tl-sm ui:shadow-md" />
		</NavigationMenuPrimitive.Indicator>
	);
}

export {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
	navigationMenuTriggerStyle,
};
