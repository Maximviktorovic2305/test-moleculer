import { createWinstonLogger } from "./factory";
import { AppLoggerService } from "./logger.service";
import { createMoleculerLoggerAdapter } from "./moleculer-adapter";

const winstonLogger = createWinstonLogger();

export const appLogger = new AppLoggerService(winstonLogger, {
	layer: "application",
});

export const moleculerLogger = createMoleculerLoggerAdapter(
	appLogger.child({
		layer: "moleculer",
	}),
);
