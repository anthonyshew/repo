import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@repo/ui/styles.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Team Shew",
	description: "We are the best.",
	appleWebApp: {
		title: "Team Shew",
		capable: true,
		statusBarStyle: "black-translucent",
	},
	icons: [
		{ url: "/favicon.ico", rel: "shortcut icon" },
		{ url: "/favicon.svg", type: "image/svg+xml" },
		{ sizes: "48x48", url: "/icons/48.png", type: "image/png" },
		{ sizes: "57x57", url: "/icons/57.png", rel: "apple-touch-icon" },
		{ sizes: "60x60", url: "/icons/60.png", rel: "apple-touch-icon" },
		{ sizes: "72x72", url: "/icons/72.png", rel: "apple-touch-icon" },
		{ sizes: "76x76", url: "/icons/76.png", rel: "apple-touch-icon" },
		{ sizes: "96x96", url: "/icons/96.png", rel: "apple-touch-icon" },
		{ sizes: "114x114", url: "/icons/114.png", rel: "apple-touch-icon" },
		{ sizes: "120x120", url: "/icons/120.png", rel: "apple-touch-icon" },
		{ sizes: "152x152", url: "/icons/152.png", rel: "apple-touch-icon" },
		{ sizes: "167x167", url: "/icons/167.png", rel: "apple-touch-icon" },
		{ sizes: "180x180", url: "/icons/180.png", rel: "apple-touch-icon" },
		{ sizes: "192x192", url: "/icons/192.png", rel: "apple-touch-icon" },
		{ sizes: "512x512", url: "/icons/512.png", rel: "apple-touch-icon" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
