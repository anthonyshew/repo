export const checkEnvVar = (varName: string | undefined): string => {
	if (!varName) {
		throw new Error("No variable name provided.");
	}

	if (!process.env[varName]) {
		throw new Error(`process.env.${varName} does not exist.`);
	}

	return process.env[varName];
};
