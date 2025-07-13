import { config } from "@repo/next-config";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const moduleExports = {
	...config,
	async redirects() {
		return [
			{
				source: "/monorepos/:path*",
				destination: "https://turborepo.com",
				permanent: true,
			},
		];
	},
};

export default withMDX(moduleExports);
