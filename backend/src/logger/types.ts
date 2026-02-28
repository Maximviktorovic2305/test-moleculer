export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export type LogContext = Record<string, unknown>;

export type LoggerMethod = (
	message: string,
	context?: LogContext,
	error?: unknown,
) => void;

export type MoleculerLoggerAdapter = {
	trace: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	fatal: (...args: unknown[]) => void;
};
