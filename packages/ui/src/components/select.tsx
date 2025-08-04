import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils";

function Select({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
	className,
	size = "default",
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
	size?: "sm" | "default";
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"ui:border-input ui:data-[placeholder]:text-muted-foreground ui:[&_svg:not([class*=text-])]:text-muted-foreground ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:dark:bg-input/30 ui:dark:hover:bg-input/50 ui:flex ui:w-fit ui:items-center ui:justify-between ui:gap-2 ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:py-2 ui:text-sm ui:whitespace-nowrap ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none ui:focus-visible:ring-[3px] ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:data-[size=default]:h-9 ui:data-[size=sm]:h-8 ui:*:data-[slot=select-value]:line-clamp-1 ui:*:data-[slot=select-value]:flex ui:*:data-[slot=select-value]:items-center ui:*:data-[slot=select-value]:gap-2 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon className="ui:size-4 ui:opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = "popper",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				className={cn(
					"ui:bg-popover ui:text-popover-foreground ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=open]:fade-in-0 ui:data-[state=closed]:zoom-out-95 ui:data-[state=open]:zoom-in-95 ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:relative ui:z-50 ui:max-h-(--radix-select-content-available-height) ui:min-w-[8rem] ui:origin-(--radix-select-content-transform-origin) ui:overflow-x-hidden ui:overflow-y-auto ui:rounded-md ui:border ui:shadow-md",
					position === "popper" &&
						"ui:data-[side=bottom]:translate-y-1 ui:data-[side=left]:-translate-x-1 ui:data-[side=right]:translate-x-1 ui:data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"ui:p-1",
						position === "popper" &&
							"ui:h-[var(--radix-select-trigger-height)] ui:w-full ui:min-w-[var(--radix-select-trigger-width)] ui:scroll-my-1",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn(
				"ui:text-muted-foreground ui:px-2 ui:py-1.5 ui:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"ui:focus:bg-accent ui:focus:text-accent-foreground ui:[&_svg:not([class*=text-])]:text-muted-foreground ui:relative ui:flex ui:w-full ui:cursor-default ui:items-center ui:gap-2 ui:rounded-sm ui:py-1.5 ui:pr-8 ui:pl-2 ui:text-sm ui:outline-hidden ui:select-none ui:data-[disabled]:pointer-events-none ui:data-[disabled]:opacity-50 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4 ui:*:[span]:last:flex ui:*:[span]:last:items-center ui:*:[span]:last:gap-2",
				className,
			)}
			{...props}
		>
			<span className="ui:absolute ui:right-2 ui:flex ui:size-3.5 ui:items-center ui:justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="ui:size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn(
				"ui:bg-border ui:pointer-events-none ui:-mx-1 ui:my-1 ui:h-px",
				className,
			)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn(
				"ui:flex ui:cursor-default ui:items-center ui:justify-center ui:py-1",
				className,
			)}
			{...props}
		>
			<ChevronUpIcon className="ui:size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn(
				"ui:flex ui:cursor-default ui:items-center ui:justify-center ui:py-1",
				className,
			)}
			{...props}
		>
			<ChevronDownIcon className="ui:size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
