import type { AppLoggerService } from "./logger.service";
import type { LogContext, MoleculerLoggerAdapter } from "./types";

const toMessageAndContext = (args: unknown[]) => {
	if (args.length === 0) {
		return {
			message: "Moleculer log event",
			context: {},
		};
	}

	const [first, ...rest] = args;
	const message = typeof first === "string" ? first : "Moleculer log event";

	if (rest.length === 0 && typeof first === "string") {
		return {
			message,
			context: {},
		};
	}

	if (
		rest.length === 1 &&
		typeof first === "string" &&
		typeof rest[0] === "object" &&
		rest[0] !== null
	) {
		return {
			message,
			context: rest[0] as LogContext,
		};
	}

	return {
		message,
		context: {
			logArgs: typeof first === "string" ? rest : args,
		},
	};
};

export const createMoleculerLoggerAdapter = (
	logger: AppLoggerService,
): MoleculerLoggerAdapter => {
	return {
		trace(...args: unknown[]) {
			const payload = toMessageAndContext(args);
			logger.trace(payload.message, payload.context);
		},
		debug(...args: unknown[]) {
			const payload = toMessageAndContext(args);
			logger.debug(payload.message, payload.context);
		},
		info(...args: unknown[]) {
			const payload = toMessageAndContext(args);
			logger.info(payload.message, payload.context);
		},
		warn(...args: unknown[]) {
			const payload = toMessageAndContext(args);
			logger.warn(payload.message, payload.context);
		},
		error(...args: unknown[]) {
			const payload = toMessageAndContext(args);
			logger.error(payload.message, payload.context);
		},
		fatal(...args: unknown[]) {
			const payload = toMessageAndContext(args);
			logger.fatal(payload.message, payload.context);
		},
	};
};
