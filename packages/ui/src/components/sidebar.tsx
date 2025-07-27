"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import * as React from "react";

import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import { Button } from "./Button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
	state: "expanded" | "collapsed";
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.");
	}

	return context;
}

function SidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange: setOpenProp,
	className,
	style,
	children,
	...props
}: React.ComponentProps<"div"> & {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = React.useState(false);

	// This is the internal state of the sidebar.
	// We use openProp and setOpenProp for control from outside the component.
	const [_open, _setOpen] = React.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React.useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === "function" ? value(open) : value;
			if (setOpenProp) {
				setOpenProp(openState);
			} else {
				_setOpen(openState);
			}

			// This sets the cookie to keep the sidebar state.
			// biome-ignore lint/suspicious/noDocumentCookie: In shadcn we trust.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
		[setOpenProp, open],
	);

	// Helper to toggle the sidebar.
	const toggleSidebar = React.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [isMobile, setOpen]);

	// Adds a keyboard shortcut to toggle the sidebar.
	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				toggleSidebar();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);

	// We add a state so that we can do data-state="expanded" or "collapsed".
	// This makes it easier to style the sidebar with Tailwind classes.
	const state = open ? "expanded" : "collapsed";

	const contextValue = React.useMemo<SidebarContextProps>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar,
		}),
		[state, open, setOpen, isMobile, openMobile, toggleSidebar],
	);

	return (
		<SidebarContext.Provider value={contextValue}>
			<TooltipProvider delayDuration={0}>
				<div
					data-slot="sidebar-wrapper"
					style={
						{
							"--sidebar-width": SIDEBAR_WIDTH,
							"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
							...style,
						} as React.CSSProperties
					}
					className={cn(
						"ui:group/sidebar-wrapper ui:has-data-[variant=inset]:bg-sidebar ui:flex ui:min-h-svh ui:w-full",
						className,
					)}
					{...props}
				>
					{children}
				</div>
			</TooltipProvider>
		</SidebarContext.Provider>
	);
}

function Sidebar({
	side = "left",
	variant = "sidebar",
	collapsible = "offcanvas",
	className,
	children,
	...props
}: React.ComponentProps<"div"> & {
	side?: "left" | "right";
	variant?: "sidebar" | "floating" | "inset";
	collapsible?: "offcanvas" | "icon" | "none";
}) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

	if (collapsible === "none") {
		return (
			<div
				data-slot="sidebar"
				className={cn(
					"ui:bg-sidebar ui:text-sidebar-foreground ui:flex ui:h-full ui:w-(--sidebar-width) ui:flex-col",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	}

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
				<SheetContent
					data-sidebar="sidebar"
					data-slot="sidebar"
					data-mobile="true"
					className="ui:bg-sidebar ui:text-sidebar-foreground ui:w-(--sidebar-width) ui:p-0 ui:[&>button]:hidden"
					style={
						{
							"--sidebar-width": SIDEBAR_WIDTH_MOBILE,
						} as React.CSSProperties
					}
					side={side}
				>
					<SheetHeader className="ui:sr-only">
						<SheetTitle>Sidebar</SheetTitle>
						<SheetDescription>Displays the mobile sidebar.</SheetDescription>
					</SheetHeader>
					<div className="ui:flex ui:h-full ui:w-full ui:flex-col">
						{children}
					</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			className="ui:group ui:peer ui:text-sidebar-foreground ui:hidden ui:md:block"
			data-state={state}
			data-collapsible={state === "collapsed" ? collapsible : ""}
			data-variant={variant}
			data-side={side}
			data-slot="sidebar"
		>
			{/* This is what handles the sidebar gap on desktop */}
			<div
				data-slot="sidebar-gap"
				className={cn(
					"ui:relative ui:w-(--sidebar-width) ui:bg-transparent ui:transition-[width] ui:duration-200 ui:ease-linear",
					"ui:group-data-[collapsible=offcanvas]:w-0",
					"ui:group-data-[side=right]:rotate-180",
					variant === "floating" || variant === "inset"
						? "ui:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
						: "ui:group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
				)}
			/>
			<div
				data-slot="sidebar-container"
				className={cn(
					"ui:fixed ui:inset-y-0 ui:z-10 ui:hidden ui:h-svh ui:w-(--sidebar-width) ui:transition-[left,right,width] ui:duration-200 ui:ease-linear ui:md:flex",
					side === "left"
						? "ui:left-0 ui:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
						: "ui:right-0 ui:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
					// Adjust the padding for floating and inset variants.
					variant === "floating" || variant === "inset"
						? "ui:p-2 ui:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
						: "ui:group-data-[collapsible=icon]:w-(--sidebar-width-icon) ui:group-data-[side=left]:border-r ui:group-data-[side=right]:border-l",
					className,
				)}
				{...props}
			>
				<div
					data-sidebar="sidebar"
					data-slot="sidebar-inner"
					className="ui:bg-sidebar ui:group-data-[variant=floating]:border-sidebar-border ui:flex ui:h-full ui:w-full ui:flex-col ui:group-data-[variant=floating]:rounded-lg ui:group-data-[variant=floating]:border ui:group-data-[variant=floating]:shadow-sm"
				>
					{children}
				</div>
			</div>
		</div>
	);
}

function SidebarTrigger({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			data-sidebar="trigger"
			data-slot="sidebar-trigger"
			variant="ghost"
			size="icon"
			className={cn("ui:size-7", className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<PanelLeftIcon />
			<span className="ui:sr-only">Toggle Sidebar</span>
		</Button>
	);
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
	const { toggleSidebar } = useSidebar();

	return (
		<button
			data-sidebar="rail"
			data-slot="sidebar-rail"
			aria-label="Toggle Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			className={cn(
				"ui:hover:after:bg-sidebar-border ui:absolute ui:inset-y-0 ui:z-20 ui:hidden ui:w-4 ui:-translate-x-1/2 ui:transition-all ui:ease-linear ui:group-data-[side=left]:-right-4 ui:group-data-[side=right]:left-0 ui:after:absolute ui:after:inset-y-0 ui:after:left-1/2 ui:after:w-[2px] ui:sm:flex",
				"ui:in-data-[side=left]:cursor-w-resize ui:in-data-[side=right]:cursor-e-resize",
				"ui:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize ui:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
				"ui:hover:group-data-[collapsible=offcanvas]:bg-sidebar ui:group-data-[collapsible=offcanvas]:translate-x-0 ui:group-data-[collapsible=offcanvas]:after:left-full",
				"ui:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
				"ui:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
	return (
		<main
			data-slot="sidebar-inset"
			className={cn(
				"ui:bg-background ui:relative ui:flex ui:w-full ui:flex-1 ui:flex-col",
				"ui:md:peer-data-[variant=inset]:m-2 ui:md:peer-data-[variant=inset]:ml-0 ui:md:peer-data-[variant=inset]:rounded-xl ui:md:peer-data-[variant=inset]:shadow-sm ui:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarInput({
	className,
	...props
}: React.ComponentProps<typeof Input>) {
	return (
		<Input
			data-slot="sidebar-input"
			data-sidebar="input"
			className={cn(
				"ui:bg-background ui:h-8 ui:w-full ui:shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-header"
			data-sidebar="header"
			className={cn("ui:flex ui:flex-col ui:gap-2 ui:p-2", className)}
			{...props}
		/>
	);
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-footer"
			data-sidebar="footer"
			className={cn("ui:flex ui:flex-col ui:gap-2 ui:p-2", className)}
			{...props}
		/>
	);
}

function SidebarSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="sidebar-separator"
			data-sidebar="separator"
			className={cn("ui:bg-sidebar-border ui:mx-2 ui:w-auto", className)}
			{...props}
		/>
	);
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-content"
			data-sidebar="content"
			className={cn(
				"ui:flex ui:min-h-0 ui:flex-1 ui:flex-col ui:gap-2 ui:overflow-auto ui:group-data-[collapsible=icon]:overflow-hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-group"
			data-sidebar="group"
			className={cn(
				"ui:relative ui:flex ui:w-full ui:min-w-0 ui:flex-col ui:p-2",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupLabel({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="sidebar-group-label"
			data-sidebar="group-label"
			className={cn(
				"ui:text-sidebar-foreground/70 ui:ring-sidebar-ring ui:flex ui:h-8 ui:shrink-0 ui:items-center ui:rounded-md ui:px-2 ui:text-xs ui:font-medium ui:outline-hidden ui:transition-[margin,opacity] ui:duration-200 ui:ease-linear ui:focus-visible:ring-2 ui:[&>svg]:size-4 ui:[&>svg]:shrink-0",
				"ui:group-data-[collapsible=icon]:-mt-8 ui:group-data-[collapsible=icon]:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupAction({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="sidebar-group-action"
			data-sidebar="group-action"
			className={cn(
				"ui:text-sidebar-foreground ui:ring-sidebar-ring ui:hover:bg-sidebar-accent ui:hover:text-sidebar-accent-foreground ui:absolute ui:top-3.5 ui:right-3 ui:flex ui:aspect-square ui:w-5 ui:items-center ui:justify-center ui:rounded-md ui:p-0 ui:outline-hidden ui:transition-transform ui:focus-visible:ring-2 ui:[&>svg]:size-4 ui:[&>svg]:shrink-0",
				// Increases the hit area of the button on mobile.
				"ui:after:absolute ui:after:-inset-2 ui:md:after:hidden",
				"ui:group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-group-content"
			data-sidebar="group-content"
			className={cn("ui:w-full ui:text-sm", className)}
			{...props}
		/>
	);
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="sidebar-menu"
			data-sidebar="menu"
			className={cn(
				"ui:flex ui:w-full ui:min-w-0 ui:flex-col ui:gap-1",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="sidebar-menu-item"
			data-sidebar="menu-item"
			className={cn("ui:group/menu-item ui:relative", className)}
			{...props}
		/>
	);
}

const sidebarMenuButtonVariants = cva(
	"ui:peer/menu-button ui:flex ui:w-full ui:items-center ui:gap-2 ui:overflow-hidden ui:rounded-md ui:p-2 ui:text-left ui:text-sm ui:outline-hidden ui:ring-sidebar-ring ui:transition-[width,height,padding] ui:hover:bg-sidebar-accent ui:hover:text-sidebar-accent-foreground ui:focus-visible:ring-2 ui:active:bg-sidebar-accent ui:active:text-sidebar-accent-foreground ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:group-has-data-[sidebar=menu-action]/menu-item:pr-8 ui:aria-disabled:pointer-events-none ui:aria-disabled:opacity-50 ui:data-[active=true]:bg-sidebar-accent ui:data-[active=true]:font-medium ui:data-[active=true]:text-sidebar-accent-foreground ui:data-[state=open]:hover:bg-sidebar-accent ui:data-[state=open]:hover:text-sidebar-accent-foreground ui:group-data-[collapsible=icon]:size-8! ui:group-data-[collapsible=icon]:p-2! ui:[&>span:last-child]:truncate ui:[&>svg]:size-4 ui:[&>svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"ui:hover:bg-sidebar-accent ui:hover:text-sidebar-accent-foreground",
				outline:
					"ui:bg-background ui:shadow-[0_0_0_1px_hsl(var(--sidebar-border))] ui:hover:bg-sidebar-accent ui:hover:text-sidebar-accent-foreground ui:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
			},
			size: {
				default: "ui:h-8 ui:text-sm",
				sm: "ui:h-7 ui:text-xs",
				lg: "ui:h-12 ui:text-sm ui:group-data-[collapsible=icon]:p-0!",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function SidebarMenuButton({
	asChild = false,
	isActive = false,
	variant = "default",
	size = "default",
	tooltip,
	className,
	...props
}: React.ComponentProps<"button"> & {
	asChild?: boolean;
	isActive?: boolean;
	tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();

	const button = (
		<Comp
			data-slot="sidebar-menu-button"
			data-sidebar="menu-button"
			data-size={size}
			data-active={isActive}
			className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
			{...props}
		/>
	);

	if (!tooltip) {
		return button;
	}

	if (typeof tooltip === "string") {
		tooltip = {
			children: tooltip,
		};
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent
				side="right"
				align="center"
				hidden={state !== "collapsed" || isMobile}
				{...tooltip}
			/>
		</Tooltip>
	);
}

function SidebarMenuAction({
	className,
	asChild = false,
	showOnHover = false,
	...props
}: React.ComponentProps<"button"> & {
	asChild?: boolean;
	showOnHover?: boolean;
}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="sidebar-menu-action"
			data-sidebar="menu-action"
			className={cn(
				"ui:text-sidebar-foreground ui:ring-sidebar-ring ui:hover:bg-sidebar-accent ui:hover:text-sidebar-accent-foreground ui:peer-hover/menu-button:text-sidebar-accent-foreground ui:absolute ui:top-1.5 ui:right-1 ui:flex ui:aspect-square ui:w-5 ui:items-center ui:justify-center ui:rounded-md ui:p-0 ui:outline-hidden ui:transition-transform ui:focus-visible:ring-2 ui:[&>svg]:size-4 ui:[&>svg]:shrink-0",
				// Increases the hit area of the button on mobile.
				"ui:after:absolute ui:after:-inset-2 ui:md:after:hidden",
				"ui:peer-data-[size=sm]/menu-button:top-1",
				"ui:peer-data-[size=default]/menu-button:top-1.5",
				"ui:peer-data-[size=lg]/menu-button:top-2.5",
				"ui:group-data-[collapsible=icon]:hidden",
				showOnHover &&
					"ui:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground ui:group-focus-within/menu-item:opacity-100 ui:group-hover/menu-item:opacity-100 ui:data-[state=open]:opacity-100 ui:md:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuBadge({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-menu-badge"
			data-sidebar="menu-badge"
			className={cn(
				"ui:text-sidebar-foreground ui:pointer-events-none ui:absolute ui:right-1 ui:flex ui:h-5 ui:min-w-5 ui:items-center ui:justify-center ui:rounded-md ui:px-1 ui:text-xs ui:font-medium ui:tabular-nums ui:select-none",
				"ui:peer-hover/menu-button:text-sidebar-accent-foreground ui:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
				"ui:peer-data-[size=sm]/menu-button:top-1",
				"ui:peer-data-[size=default]/menu-button:top-1.5",
				"ui:peer-data-[size=lg]/menu-button:top-2.5",
				"ui:group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSkeleton({
	className,
	showIcon = false,
	...props
}: React.ComponentProps<"div"> & {
	showIcon?: boolean;
}) {
	// Random width between 50 to 90%.
	const width = React.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);

	return (
		<div
			data-slot="sidebar-menu-skeleton"
			data-sidebar="menu-skeleton"
			className={cn(
				"ui:flex ui:h-8 ui:items-center ui:gap-2 ui:rounded-md ui:px-2",
				className,
			)}
			{...props}
		>
			{showIcon && (
				<Skeleton
					className="ui:size-4 ui:rounded-md"
					data-sidebar="menu-skeleton-icon"
				/>
			)}
			<Skeleton
				className="ui:h-4 ui:max-w-(--skeleton-width) ui:flex-1"
				data-sidebar="menu-skeleton-text"
				style={
					{
						"--skeleton-width": width,
					} as React.CSSProperties
				}
			/>
		</div>
	);
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="sidebar-menu-sub"
			data-sidebar="menu-sub"
			className={cn(
				"ui:border-sidebar-border ui:mx-3.5 ui:flex ui:min-w-0 ui:translate-x-px ui:flex-col ui:gap-1 ui:border-l ui:px-2.5 ui:py-0.5",
				"ui:group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSubItem({
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="sidebar-menu-sub-item"
			data-sidebar="menu-sub-item"
			className={cn("ui:group/menu-sub-item ui:relative", className)}
			{...props}
		/>
	);
}

function SidebarMenuSubButton({
	asChild = false,
	size = "md",
	isActive = false,
	className,
	...props
}: React.ComponentProps<"a"> & {
	asChild?: boolean;
	size?: "sm" | "md";
	isActive?: boolean;
}) {
	const Comp = asChild ? Slot : "a";

	return (
		<Comp
			data-slot="sidebar-menu-sub-button"
			data-sidebar="menu-sub-button"
			data-size={size}
			data-active={isActive}
			className={cn(
				"ui:text-sidebar-foreground ui:ring-sidebar-ring ui:hover:bg-sidebar-accent ui:hover:text-sidebar-accent-foreground ui:active:bg-sidebar-accent ui:active:text-sidebar-accent-foreground ui:[&>svg]:text-sidebar-accent-foreground ui:flex ui:h-7 ui:min-w-0 ui:-translate-x-px ui:items-center ui:gap-2 ui:overflow-hidden ui:rounded-md ui:px-2 ui:outline-hidden ui:focus-visible:ring-2 ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:aria-disabled:pointer-events-none ui:aria-disabled:opacity-50 ui:[&>span:last-child]:truncate ui:[&>svg]:size-4 ui:[&>svg]:shrink-0",
				"ui:data-[active=true]:bg-sidebar-accent ui:data-[active=true]:text-sidebar-accent-foreground",
				size === "sm" && "ui:text-xs",
				size === "md" && "ui:text-sm",
				"ui:group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
};
