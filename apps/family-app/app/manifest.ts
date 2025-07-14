import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Team Shew",
		short_name: "Team Shew",
		description: "We are the best.",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#432dd7",
		icons: [
			{
				src: "/icons/48.png",
				sizes: "48x48",
				type: "image/png",
			},
			{
				src: "/icons/57.png",
				sizes: "57x57",
				type: "image/png",
			},
			{
				src: "/icons/60.png",
				sizes: "60x60",
				type: "image/png",
			},
			{
				src: "/icons/72.png",
				sizes: "72x72",
				type: "image/png",
			},
			{
				src: "/icons/76.png",
				sizes: "76x76",
				type: "image/png",
			},
			{
				src: "/icons/96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				src: "/icons/114.png",
				sizes: "114x114",
				type: "image/png",
			},
			{
				src: "/icons/120.png",
				sizes: "120x120",
				type: "image/png",
			},
			{
				src: "/icons/152.png",
				sizes: "152x152",
				type: "image/png",
			},
			{
				src: "/icons/167.png",
				sizes: "167x167",
				type: "image/png",
			},
			{
				src: "/icons/180.png",
				sizes: "180x180",
				type: "image/png",
			},

			{
				src: "/icons/192.png",
				sizes: "192x192",
				type: "image/png",
			},

			{
				src: "/icons/512.png",
				sizes: "512",
				type: "image/png",
			},
		],
	};
}
