import pino from "pino";

const env = process.env.NODE_ENV;

const doDebug = env === "LOCAL" || env === "DEV";

export const logger = pino({
	level: doDebug ? "debug" : "info",
	...(doDebug && {
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:HH:MM:ss",
				ignore: "pid,hostname",
			},
		},
	}),
	redact: {
		paths: ["password", "token", "apiKey", "authorization", "req.headers.authorization", "req.headers.cookie"],
		censor: "[REDACTED]",
	},
});
