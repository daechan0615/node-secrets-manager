import path from "path";
import { readFile } from "fs/promises";

import { createSecretProvider } from "@/config/secrets/provider";
import { logger } from "@/lib/logger";
import configSchema, { type AppConfig } from "./schema";

// Create a local reference that will hold finalized configuration data
let appConfig: AppConfig | null = null;
let initializationPromise: Promise<AppConfig> | null = null;

export function initializeConfig() {
	// Prevent double-initialization
	if (appConfig) return Promise.resolve(appConfig);

	if (initializationPromise) return initializationPromise;

	initializationPromise = loadConfig().catch((error) => {
		initializationPromise = null;
		throw error;
	});

	return initializationPromise;
}

async function loadConfig() {
	// Validate env
	const env = process.env.NODE_ENV;
	if (!env || !["LOCAL", "DEV", "TEST", "PROD"].includes(env)) {
		throw new Error("Missing or Invalid NODE_ENV. [LOCAL, DEV, TEST, PROD]");
	}

	// Validate config file path
	const configPath = path.resolve(process.cwd(), "configuration", env, "secrets.json");
	const rawConfig = JSON.parse(await readFile(configPath, "utf-8"));

	logger.info(`Initializing configuration for ${env} environment...`);

	const provider = await createSecretProvider(env);

	const resolvedConfig: Record<string, unknown> = Object.fromEntries(
		await Promise.all(
			Object.entries(rawConfig).map(async ([key, value]) => {
				if (
					value !== null &&
					typeof value === "object" &&
					!Array.isArray(value) &&
					"secretRef" in value &&
					typeof value.secretRef === "string"
				) {
					return [key, await provider.resolveSecret(value.secretRef)];
				}
				return [key, value];
			}),
		),
	);

	// Add extra non-vault flags
	resolvedConfig.IS_PRODUCTION = env === "PROD";
	resolvedConfig.NODE_ENV = env;

	// Validate against schema
	const parsedData = configSchema.safeParse(resolvedConfig);

	if (!parsedData.success) {
		logger.error(
			{
				issues: parsedData.error.issues.map((issue) => ({
					path: issue.path.join("."),
					code: issue.code,
				})),
			},
			"Configuration validation failed",
		);

		throw new Error("Invalid application configuration");
	}

	// Freeze the object to prevent runtime modification anywhere in the codebase
	appConfig = Object.freeze(parsedData.data);

	// Apply validated log level.
	logger.level = appConfig.LOG_LEVEL;

	logger.info({ env, logLevel: appConfig.LOG_LEVEL }, "Configuration loaded successfully");
	logger.info(Object.keys(appConfig), "Loaded configs:");

	return appConfig;
}

// Named getter to import your validated config directly into other files
export function getConfig() {
	if (!appConfig) {
		throw new Error("Configuration has not been initialized yet. Call initializeConfig() first.");
	}
	return appConfig;
}
