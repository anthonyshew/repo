import type { NextConfig } from "next";

export const config: NextConfig = {
	// We do these in GitHub Actions checks so we don't do them here.
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
};
