"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

function InputOTP({
	className,
	containerClassName,
	...props
}: React.ComponentProps<typeof OTPInput> & {
	containerClassName?: string;
}) {
	return (
		<OTPInput
			data-slot="input-otp"
			containerClassName={cn(
				"flex items-center gap-2 has-disabled:opacity-50",
				containerClassName,
			)}
			className={cn("ui:disabled:cursor-not-allowed", className)}
			{...props}
		/>
	);
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-otp-group"
			className={cn("ui:flex ui:items-center", className)}
			{...props}
		/>
	);
}

function InputOTPSlot({
	index,
	className,
	...props
}: React.ComponentProps<"div"> & {
	index: number;
}) {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				"ui:data-[active=true]:border-ring ui:data-[active=true]:ring-ring/50 ui:data-[active=true]:aria-invalid:ring-destructive/20 ui:dark:data-[active=true]:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:data-[active=true]:aria-invalid:border-destructive ui:dark:bg-input/30 ui:border-input ui:relative ui:flex ui:h-9 ui:w-9 ui:items-center ui:justify-center ui:border-y ui:border-r ui:text-sm ui:shadow-xs ui:transition-all ui:outline-none ui:first:rounded-l-md ui:first:border-l ui:last:rounded-r-md ui:data-[active=true]:z-10 ui:data-[active=true]:ring-[3px]",
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="ui:pointer-events-none ui:absolute ui:inset-0 ui:flex ui:items-center ui:justify-center">
					<div className="ui:animate-caret-blink ui:bg-foreground ui:h-4 ui:w-px ui:duration-1000" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="input-otp-separator" {...props}>
			<MinusIcon />
		</div>
	);
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
