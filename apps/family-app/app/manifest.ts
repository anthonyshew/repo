import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Team Shew",
		short_name: "Team Shew",
		description: "We are the best.",
		start_url: "https://shew-fam-app.vercel.app/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#000000",
		// icons: [
		// 	{
		// 		src: "/favicon/favicon-96x96.png",
		// 		sizes: "96x96",
		// 		type: "image/png",
		// 	},
		// 	{
		// 		src: "/favicon/web-app-manifest-192x192.png",
		// 		sizes: "192x192",
		// 		type: "image/png",
		// 	},
		// 	{
		// 		src: "/favicon/web-app-manifest-512x512.png",
		// 		sizes: "512x512",
		// 		type: "image/png",
		// 	},
		// 	{
		// 		src: "/favicon/apple-touch-icon.png",
		// 		sizes: "180x180",
		// 		type: "image/png",
		// 		purpose: "maskable",
		// 	},
		// ],
	};
}
