"use client";

import { Chat } from "#/components/chat";
import { InstallPrompt } from "#/components/install-prompt";
import { PushNotificationManager } from "#/components/push-notification-manager";

export default function Home() {
	return (
		<div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] items-center sm:items-start w-full max-w-4xl mx-auto">
				<Chat />
				<PushNotificationManager />
				<InstallPrompt />
			</main>
		</div>
	);
}
