import { createApp } from "./server";
import { getConfig } from "./config/secrets/secrets";
import { logger } from "./lib/logger";

// App entry point
const app = await createApp().catch((error) => {
	logger.fatal(
		{
			error: error instanceof Error ? error.message : "UnknownError",
		},
		"Application startup failed",
	);
	process.exit(1);
});

app.listen(getConfig().PORT, () => {
	console.log("Server running on port " + getConfig().PORT);
});
