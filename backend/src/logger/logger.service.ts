import type { Logger as WinstonLogger } from "winston";

import type { LogContext, LogLevel } from "./types";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

const extractErrorPayload = (error: unknown): LogContext => {
	if (!error) {
		return {};
	}

	if (error instanceof Error) {
		const errorContext: LogContext = {
			errorName: error.name,
			errorMessage: error.message,
			errorStack: error.stack,
		};

		const withCode = error as Error & { code?: string | number };
		if (withCode.code !== undefined) {
			errorContext.errorCode = withCode.code;
		}

		return errorContext;
	}

	if (isPlainObject(error)) {
		return { error };
	}

	return { errorMessage: String(error) };
};

const resolveContextAndError = (context?: LogContext, error?: unknown) => {
	if (!error && context && context instanceof Error) {
		return {
			context: {},
			error: context,
		};
	}

	return {
		context: context ?? {},
		error,
	};
};

export class AppLoggerService {
	constructor(
		private readonly logger: WinstonLogger,
		private readonly defaultContext: LogContext = {},
	) {}

	child(context: LogContext) {
		return new AppLoggerService(this.logger, {
			...this.defaultContext,
			...context,
		});
	}

	trace(message: string, context?: LogContext) {
		this.log("trace", message, context);
	}

	debug(message: string, context?: LogContext) {
		this.log("debug", message, context);
	}

	info(message: string, context?: LogContext) {
		this.log("info", message, context);
	}

	warn(message: string, context?: LogContext) {
		this.log("warn", message, context);
	}

	error(message: string, context?: LogContext, error?: unknown) {
		const normalized = resolveContextAndError(context, error);
		this.log("error", message, normalized.context, normalized.error);
	}

	fatal(message: string, context?: LogContext, error?: unknown) {
		const normalized = resolveContextAndError(context, error);
		this.log("fatal", message, normalized.context, normalized.error);
	}

	private log(
		level: LogLevel,
		message: string,
		context?: LogContext,
		error?: unknown,
	) {
		const payload = {
			message,
			...this.defaultContext,
			...(context ?? {}),
			...extractErrorPayload(error),
		};

		if (level === "trace") {
			this.logger.log("silly", payload);
			return;
		}

		if (level === "fatal") {
			this.logger.log("error", payload);
			return;
		}

		this.logger.log(level, payload);
	}
}
