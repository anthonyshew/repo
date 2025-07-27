"use client";

import { checkEnvVar } from "@repo/utils/check-env-var";
import { useCallback, useEffect, useState } from "react";
import {
	sendNotification,
	subscribeUser,
	unsubscribeUser,
} from "../app/actions";
import { urlBase64ToUint8Array } from "../lib/utils";

export function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [message, setMessage] = useState("");

	const registerServiceWorker = useCallback(async () => {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none",
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}, []);

	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			void registerServiceWorker();
		}
	}, [registerServiceWorker]);
	async function subscribeToPush() {
		const registration = await navigator.serviceWorker.ready;

		const vapidPublicKey = checkEnvVar("NEXT_PUBLIC_VAPID_PUBLIC_KEY");

		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));
		await subscribeUser(serializedSub);
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification(message);
			setMessage("");
		}
	}

	if (!isSupported) {
		return (
			<p className="text-red-500">
				Push notifications are not supported in this browser.
			</p>
		);
	}

	return (
		<div className="mb-8 p-4 border rounded-lg">
			<h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
			{subscription ? (
				<>
					<p className="text-green-600 mb-4">
						You are subscribed to push notifications.
					</p>
					<div className="flex gap-2 mb-4">
						<input
							type="text"
							placeholder="Enter notification message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="flex-1 px-3 py-2 border rounded"
						/>
						<button
							type="button"
							onClick={sendTestNotification}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							{" "}
							Send Test
						</button>
					</div>
					<button
						type="button"
						onClick={unsubscribeFromPush}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					>
						{" "}
						Unsubscribe
					</button>
				</>
			) : (
				<>
					<p className="text-gray-600 mb-4">
						You are not subscribed to push notifications.
					</p>
					<button
						type="button"
						onClick={subscribeToPush}
						className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					>
						{" "}
						Subscribe
					</button>
				</>
			)}
		</div>
	);
}
