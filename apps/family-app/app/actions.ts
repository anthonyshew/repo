"use server";

import webpush from "web-push";
import { checkEnvVar } from "@repo/utils/check-env-var";

const vapidPublicKey = checkEnvVar("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
const vapidPrivateKey = checkEnvVar("VAPID_PRIVATE_KEY");

webpush.setVapidDetails(
	"mailto:your-email@example.com", // TODO: Does it matter what I put here?
	vapidPublicKey,
	vapidPrivateKey,
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
	console.log(sub);
	subscription = sub;
	// TODO: In a production environment, you would want to store the subscription in a database
	// For example: await db.subscriptions.create({ data: sub })

	return { success: true };
}

export async function unsubscribeUser() {
	subscription = null;
	// In a production environment, you would want to remove the subscription from the database
	// For example: await db.subscriptions.delete({ where: { ... } })
	return { success: true };
}

export async function sendNotification(message: string) {
	if (!subscription) {
		throw new Error("No subscription available");
	}

	try {
		await webpush.sendNotification(
			// @ts-expect-error -- TODO: Type is messed up - or code is actually wrong?
			subscription,
			JSON.stringify({
				title: "Family App Notification",
				body: message,
				icon: "/next.svg",
			}),
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}
