"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
var chat_1 = require("#/components/chat");
var install_prompt_1 = require("#/components/install-prompt");
var push_notification_manager_1 = require("#/components/push-notification-manager");
function Home() {
    return (<div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] items-center sm:items-start w-full max-w-4xl mx-auto">
				<chat_1.Chat />
				<push_notification_manager_1.PushNotificationManager />
				<install_prompt_1.InstallPrompt />
			</main>
		</div>);
}
