import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const moduleExports = {
	transpilePackages: ["@repo/ui"],
	// We do these in GitHub Actions checks so we don't do them here.
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
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
