import { z } from "zod";

// IMPORTANT: Must add fields here first before adding new secrets.
const configSchema = z.object({
	NODE_ENV: z.enum(["LOCAL", "DEV", "TEST", "PROD"]),
	IS_PRODUCTION: z.boolean().default(false), // Preserves as an actual boolean
	PORT: z.coerce.number(), // Preserves as an actual number

	DB_URL: z.string().min(1),
	LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
});

export type AppConfig = Readonly<z.infer<typeof configSchema>>;
export default configSchema;
