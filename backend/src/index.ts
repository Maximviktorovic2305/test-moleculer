import "reflect-metadata";

import { ServiceBroker } from "moleculer";

import { env } from "./config/env";
import { AppDataSource } from "./db/data-source";
import { appLogger } from "./logger";
import ApiService from "./services/api.service";
import AuthService from "./services/auth.service";
import CategoriesService from "./services/categories.service";
import NotesService from "./services/notes.service";
import RateLimiterService from "./services/rate-limiter.service";
import TokensService from "./services/tokens.service";
import UsersService from "./services/users.service";

const startupLogger = appLogger.child({
	scope: "bootstrap",
});

const start = async () => {
	startupLogger.info("Starting backend application", {
		nodeEnv: env.NODE_ENV,
		port: env.PORT,
	});

	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
		startupLogger.info("Database connection initialized");
		if (env.DB_RUN_MIGRATIONS) {
			await AppDataSource.runMigrations();
			startupLogger.info("Database migrations completed");
		}
	}

	const broker = new ServiceBroker({
		logger: false,
		logLevel: env.LOG_LEVEL,
		validator: true,
	});

	broker.createService(UsersService);
	broker.createService(TokensService);
	broker.createService(AuthService);
	broker.createService(CategoriesService);
	broker.createService(NotesService);
	broker.createService(RateLimiterService);
	broker.createService(ApiService);

	await broker.start();
	startupLogger.info("Service broker started");

	const shutdown = async () => {
		try {
			startupLogger.info("Shutdown signal received");
			await broker.stop();
			if (AppDataSource.isInitialized) {
				await AppDataSource.destroy();
			}
			startupLogger.info("Application shutdown completed");
		} catch (error) {
			startupLogger.error("Application shutdown failed", {}, error);
		} finally {
			process.exit(0);
		}
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
};

start().catch((error) => {
	startupLogger.fatal("Failed to start application", {}, error);
	process.exit(1);
});
