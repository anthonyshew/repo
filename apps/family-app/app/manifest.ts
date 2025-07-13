import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Family App",
		short_name: "FamilyApp",
		description: "A family application built with Next.js",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		icons: [
			{
				src: "/next.svg",
				sizes: "192x192",
				type: "image/svg+xml",
			},
			{
				src: "/next.svg",
				sizes: "512x512",
				type: "image/svg+xml",
			},
		],
	};
}
