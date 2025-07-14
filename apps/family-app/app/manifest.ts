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
				src: "/heart-shoe.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/heart-shoe.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
