import fs from "node:fs";
import path from "node:path";

import {
	createLogger,
	format,
	transports,
	type Logger as WinstonLogger,
} from "winston";

import { env } from "../config";

const resolveWinstonLevel = (level: string) => {
	if (level === "trace") {
		return "silly";
	}

	if (level === "fatal") {
		return "error";
	}

	return level;
};

const ensureLogDirectory = (directory: string) => {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}
};

const buildFormat = () => {
	const base = [format.errors({ stack: true }), format.timestamp()];

	if (env.NODE_ENV === "development" && env.LOG_PRETTY) {
		return format.combine(
			...base,
			format.colorize({ all: true }),
			format.printf(({ timestamp, level, message, ...meta }) => {
				const serializedMeta =
					Object.keys(meta).length > 0
						? ` ${JSON.stringify(meta)}`
						: "";
				return `${timestamp} [${level}] ${message}${serializedMeta}`;
			}),
		);
	}

	return format.combine(...base, format.json());
};

const buildTransports = () => {
	const result: Array<
		transports.ConsoleTransportInstance | transports.FileTransportInstance
	> = [new transports.Console()];

	if (env.LOG_TO_FILE) {
		const logDir = path.resolve(process.cwd(), env.LOG_DIR);
		ensureLogDirectory(logDir);

		result.push(
			new transports.File({
				filename: path.join(logDir, "backend-error.log"),
				level: "error",
			}),
			new transports.File({
				filename: path.join(logDir, "backend-combined.log"),
			}),
		);
	}

	return result;
};

export const createWinstonLogger = (): WinstonLogger => {
	return createLogger({
		level: resolveWinstonLevel(env.LOG_LEVEL),
		silent: env.NODE_ENV === "test",
		defaultMeta: {
			app: "notes-backend",
			env: env.NODE_ENV,
		},
		format: buildFormat(),
		transports: buildTransports(),
	});
};
