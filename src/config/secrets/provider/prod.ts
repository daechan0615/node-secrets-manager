import { InfisicalClient } from "@infisical/sdk";

type ClientOptions = {
	projectId: string;
	environment: string;
};

export function createInfisicalProvider(client: InfisicalClient, options: ClientOptions) {
	const { projectId, environment } = options;

	return {
		async resolveSecret(key: string) {
			if (key.startsWith("infisical://")) {
				key = key.replace("infisical://", "");
			}

			const response = await client.getSecret({
				secretName: key,
				projectId,
				environment,
				secretPath: "/",
			});

			return response.secretValue;
		},
	};
}
