import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils";

function Accordion({
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
	return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn("ui:border-b ui:last:border-b-0", className)}
			{...props}
		/>
	);
}

function AccordionTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
	return (
		<AccordionPrimitive.Header className="ui:flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className={cn(
					"ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:flex ui:flex-1 ui:items-start ui:justify-between ui:gap-4 ui:rounded-md ui:py-4 ui:text-left ui:text-sm ui:font-medium ui:transition-all ui:outline-none ui:hover:underline ui:focus-visible:ring-[3px] ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:[&[data-state=open]>svg]:rotate-180",
					className,
				)}
				{...props}
			>
				{children}
				<ChevronDownIcon className="ui:text-muted-foreground ui:pointer-events-none ui:size-4 ui:shrink-0 ui:translate-y-0.5 ui:transition-transform ui:duration-200" />
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			className="ui:data-[state=closed]:animate-accordion-up ui:data-[state=open]:animate-accordion-down ui:overflow-hidden ui:text-sm"
			{...props}
		>
			<div className={cn("ui:pt-0 ui:pb-4", className)}>{children}</div>
		</AccordionPrimitive.Content>
	);
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
