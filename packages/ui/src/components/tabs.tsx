"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";

import { cn } from "../lib/utils";

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("ui:flex ui:flex-col ui:gap-2", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"ui:bg-muted ui:text-muted-foreground ui:inline-flex ui:h-9 ui:w-fit ui:items-center ui:justify-center ui:rounded-lg ui:p-[3px]",
				className,
			)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"ui:data-[state=active]:bg-background ui:dark:data-[state=active]:text-foreground ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:focus-visible:outline-ring ui:dark:data-[state=active]:border-input ui:dark:data-[state=active]:bg-input/30 ui:text-foreground ui:dark:text-muted-foreground ui:inline-flex ui:h-[calc(100%-1px)] ui:flex-1 ui:items-center ui:justify-center ui:gap-1.5 ui:rounded-md ui:border ui:border-transparent ui:px-2 ui:py-1 ui:text-sm ui:font-medium ui:whitespace-nowrap ui:transition-[color,box-shadow] ui:focus-visible:ring-[3px] ui:focus-visible:outline-1 ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:data-[state=active]:shadow-sm ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("ui:flex-1 ui:outline-none", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
