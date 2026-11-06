import { createLocalProvider } from "./local.js";
import { createInfisicalProvider } from "./prod";

export async function createSecretProvider(env: string) {
	if (env !== "PROD") {
		return createLocalProvider();
	}

	const clientId = process.env.INFISICAL_CLIENT_ID;
	const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
	const projectId = process.env.INFISICAL_PROJECT_ID;

	if (!clientId || !clientSecret || !projectId) {
		throw new Error("Missing Infisical settings");
	}

	const { InfisicalClient } = await import("@infisical/sdk");

	const client = new InfisicalClient({
		auth: {
			universalAuth: {
				clientId,
				clientSecret,
			},
		},
	});

	return createInfisicalProvider(client, {
		projectId,
		environment: "prod",
	});
}
