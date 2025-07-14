import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Shew Family App",
		short_name: "Shew Family App",
		description: "We are the best.",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#432dd7",
		icons: [
			{
				src: "/favicon/favicon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				src: "/favicon/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicon/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/favicon/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	};
}
