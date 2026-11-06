export function createLocalProvider() {
	return {
		async resolveSecret(key: string) {
			if (key.startsWith("infisical://")) {
				key = key.replace("infisical://", "");
			}

			const value = process.env[key];

			if (value === undefined) {
				throw new Error(`Could not fetch from secrets manager: ${key}`);
			}

			return value;
		},
	};
}
