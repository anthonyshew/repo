import { GripVerticalIcon } from "lucide-react";
import type * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../lib/utils";

function ResizablePanelGroup({
	className,
	...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
	return (
		<ResizablePrimitive.PanelGroup
			data-slot="resizable-panel-group"
			className={cn(
				"ui:flex ui:h-full ui:w-full ui:data-[panel-group-direction=vertical]:flex-col",
				className,
			)}
			{...props}
		/>
	);
}

function ResizablePanel({
	...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
	return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
	withHandle,
	className,
	...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
	withHandle?: boolean;
}) {
	return (
		<ResizablePrimitive.PanelResizeHandle
			data-slot="resizable-handle"
			className={cn(
				"ui:bg-border ui:focus-visible:ring-ring ui:relative ui:flex ui:w-px ui:items-center ui:justify-center ui:after:absolute ui:after:inset-y-0 ui:after:left-1/2 ui:after:w-1 ui:after:-translate-x-1/2 ui:focus-visible:ring-1 ui:focus-visible:ring-offset-1 ui:focus-visible:outline-hidden ui:data-[panel-group-direction=vertical]:h-px ui:data-[panel-group-direction=vertical]:w-full ui:data-[panel-group-direction=vertical]:after:left-0 ui:data-[panel-group-direction=vertical]:after:h-1 ui:data-[panel-group-direction=vertical]:after:w-full ui:data-[panel-group-direction=vertical]:after:translate-x-0 ui:data-[panel-group-direction=vertical]:after:-translate-y-1/2 ui:[&[data-panel-group-direction=vertical]>div]:rotate-90",
				className,
			)}
			{...props}
		>
			{withHandle && (
				<div className="ui:bg-border ui:z-10 ui:flex ui:h-4 ui:w-3 ui:items-center ui:justify-center ui:rounded-xs ui:border">
					<GripVerticalIcon className="ui:size-2.5" />
				</div>
			)}
		</ResizablePrimitive.PanelResizeHandle>
	);
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
