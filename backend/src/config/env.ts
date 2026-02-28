import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const boolFromEnv = z.preprocess((value) => {
	if (typeof value === "boolean") return value;
	if (typeof value !== "string") return value;
	const normalized = value.trim().toLowerCase();
	if (["1", "true", "yes", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "off"].includes(normalized)) return false;
	return value;
}, z.boolean());

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().positive().default(3000),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	LOG_PRETTY: boolFromEnv.default(true),
	LOG_TO_FILE: boolFromEnv.default(false),
	LOG_DIR: z.string().default("./logs"),
	RATE_LIMIT_ENABLED: boolFromEnv.default(true),
	RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
	RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
	RATE_LIMIT_SKIP_PATHS: z.string().default("/health"),
	CORS_ORIGIN: z.string().default("http://localhost:5173"),

	DB_HOST: z.string().default("localhost"),
	DB_PORT: z.coerce.number().int().positive().default(5432),
	DB_NAME: z.string().default("notes_db"),
	DB_USER: z.string().default("postgres"),
	DB_PASSWORD: z.string().default("postgres"),
	DB_SYNC: boolFromEnv.default(false),
	DB_RUN_MIGRATIONS: boolFromEnv.default(true),

	JWT_SECRET: z
		.string()
		.min(16, "JWT_SECRET must be at least 16 characters")
		.default("change-me-in-production-secret"),
	JWT_EXPIRES_IN: z.string().default("15m"),
	REFRESH_TOKEN_SECRET: z
		.string()
		.min(16, "REFRESH_TOKEN_SECRET must be at least 16 characters")
		.default("change-me-in-production-refresh-secret"),
	REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const details = parsed.error.issues
		.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
		.join("; ");
	throw new Error(`Invalid environment variables: ${details}`);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(",")
	.map((item) => item.trim())
	.filter(Boolean);

export const rateLimitSkipPaths = env.RATE_LIMIT_SKIP_PATHS.split(",")
	.map((item) => item.trim())
	.filter(Boolean);
