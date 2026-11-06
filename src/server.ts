import express from "express";
import { initializeConfig } from "./config/secrets/secrets";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger";

export async function createApp() {
	// Load secrets/configurations from vault first
	await initializeConfig();

	const app = express();

	app.use(pinoHttp({ logger }));
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true }));

	app.get("/health", (_, res) => {
		res.status(200).json({ status: "ok" });
	});

	return app;
}
