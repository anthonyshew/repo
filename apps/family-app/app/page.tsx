"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/accordion";
import { Chat } from "#/components/chat";
import { InstallPrompt } from "#/components/install-prompt";
import { MealPlanner } from "#/components/meal-planner";
import { PushNotificationManager } from "#/components/push-notification-manager";
import { Recipe } from "#/components/recipe";

export default function Home() {
	return (
		<div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] items-center sm:items-start w-full max-w-4xl mx-auto">
				<Accordion type="single" collapsible>
					<AccordionItem value="item-1">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>
							Yes. It adheres to the WAI-ARIA design pattern.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
				<MealPlanner />
				<Recipe />
				<Chat />
				<PushNotificationManager />
				<InstallPrompt />
			</main>
		</div>
	);
}
