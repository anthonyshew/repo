"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		setIsIOS(
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!(window as unknown as { MSStream?: unknown }).MSStream,
		);

		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	if (isStandalone) {
		return null;
	}

	return (
		<div className="mb-8 p-4 border rounded-lg bg-blue-50">
			<h3 className="text-lg font-semibold mb-2">Install App</h3>
			<button
				type="button"
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
			>
				Add to Home Screen
			</button>
			{isIOS && (
				<p className="text-sm text-gray-600">
					To install this app on your iOS device, tap the share button
					<span role="img" aria-label="share icon">
						{" "}
						⎋{" "}
					</span>
					and then "Add to Home Screen"
					<span role="img" aria-label="plus icon">
						{" "}
						➕{" "}
					</span>
					.
				</p>
			)}
		</div>
	);
}
