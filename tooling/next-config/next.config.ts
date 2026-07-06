export const config = {
	// We do these in GitHub Actions checks so we don't do them here.
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
};
