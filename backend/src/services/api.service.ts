import ApiGateway from "moleculer-web";
import type { ServiceSchema } from "moleculer";
import type { Context } from "moleculer";
import type { IncomingMessage, ServerResponse } from "node:http";

import { corsOrigins, env, rateLimitSkipPaths } from "../config";
import { appLogger } from "../logger";
import { API_ALIASES } from "../modules/api";
import {
	extractPathname,
	normalizeMethod,
	resolveClientIp,
} from "../modules/rate-limit";
import type { RateLimitConsumeResult } from "../modules/rate-limit";
import type { ServiceMeta } from "../types/service-meta";
import {
	formatApiError,
	tooManyRequestsError,
	unauthorizedError,
} from "../utils";

const apiLogger = appLogger.child({
	service: "api",
});

const isRateLimitExcluded = (path: string) => {
	return rateLimitSkipPaths.some((excludedPath) => excludedPath === path);
};

type AuthMode = "optional" | "required" | "refresh";

const OPTIONAL_ROUTE_KEYS = new Set([
	"GET /health",
	"POST /auth/register",
	"POST /auth/login",
]);

const REFRESH_ROUTE_KEYS = new Set([
	"POST /auth/refresh",
	"POST /auth/logout",
	"POST /auth/validate",
]);

const resolveRequestAuthMode = (req: IncomingMessage): AuthMode => {
	const method = normalizeMethod(req.method);
	const path = extractPathname(req.url);
	const routeKey = `${method} ${path}`;

	if (OPTIONAL_ROUTE_KEYS.has(routeKey)) {
		return "optional";
	}

	if (REFRESH_ROUTE_KEYS.has(routeKey)) {
		return "refresh";
	}

	return "required";
};

const extractBearerToken = (req: IncomingMessage): string | null => {
	const header = req.headers.authorization;
	if (!header || Array.isArray(header)) {
		return null;
	}

	const [scheme, token] = header.split(" ", 2);
	if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
		return null;
	}

	const normalized = token.trim();
	return normalized.length > 0 ? normalized : null;
};

const ApiService: ServiceSchema = {
	name: "api",
	mixins: [ApiGateway as unknown as ServiceSchema],

	settings: {
		port: env.PORT,
		ip: "0.0.0.0",
		routes: [
			{
				path: "/",
				whitelist: ["**"],
				autoAliases: false,
				aliases: API_ALIASES,
				authentication: true,
				authorization: true,
				mappingPolicy: "restrict",
				bodyParsers: {
					json: true,
					urlencoded: { extended: true },
				},
				async onBeforeCall(
					ctx: Context<unknown, ServiceMeta>,
					_route: unknown,
					req: IncomingMessage,
					_res: ServerResponse,
				) {
					ctx.meta.requestStartedAt = Date.now();
					const method = normalizeMethod(req.method);
					const path = extractPathname(req.url);
					const ip = resolveClientIp(req);

					apiLogger.debug("Incoming API request", {
						requestId: ctx.requestID,
						actionName: ctx.action?.name,
						method,
						path,
						remoteAddress: ip,
					});

					if (!env.RATE_LIMIT_ENABLED || isRateLimitExcluded(path)) {
						return;
					}

					const result = (await ctx.call("rateLimiter.consume", {
						method,
						path,
						ip,
						userId: ctx.meta.user?.id,
					})) as RateLimitConsumeResult;

					ctx.meta.rateLimit = {
						limit: result.limit,
						remaining: result.remaining,
						resetAt: result.resetAt,
						retryAfterMs: result.retryAfterMs,
					};

					if (!result.allowed) {
						throw tooManyRequestsError(
							"Too many requests. Please retry later.",
							{
								limit: result.limit,
								remaining: result.remaining,
								resetAt: result.resetAt,
								retryAfterMs: result.retryAfterMs,
								windowMs: result.windowMs,
							},
						);
					}
				},
				onAfterCall(
					ctx: Context<unknown, ServiceMeta>,
					_route: unknown,
					req: IncomingMessage,
					res: ServerResponse,
					data: unknown,
				) {
					const durationMs =
						typeof ctx.meta.requestStartedAt === "number"
							? Date.now() - ctx.meta.requestStartedAt
							: undefined;
					const path = extractPathname(req.url);
					const method = normalizeMethod(req.method);

					if (ctx.meta.rateLimit) {
						res.setHeader(
							"X-RateLimit-Limit",
							String(ctx.meta.rateLimit.limit),
						);
						res.setHeader(
							"X-RateLimit-Remaining",
							String(ctx.meta.rateLimit.remaining),
						);
						res.setHeader(
							"X-RateLimit-Reset",
							ctx.meta.rateLimit.resetAt,
						);
					}

					apiLogger.info("API request completed", {
						requestId: ctx.requestID,
						actionName: ctx.action?.name,
						method,
						path,
						statusCode: res.statusCode,
						durationMs,
						rateLimitRemaining: ctx.meta.rateLimit?.remaining,
					});

					return data;
				},
				cors: {
					origin: corsOrigins,
					methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
					credentials: true,
					allowedHeaders: ["Content-Type", "Authorization"],
				},
				onError(
					req: IncomingMessage,
					res: ServerResponse,
					err: unknown,
				) {
					const path = extractPathname(req.url);
					const method = normalizeMethod(req.method);
					const ip = resolveClientIp(req);

					const formatted = formatApiError(err);
					const details =
						formatted.statusCode === 429 &&
						formatted.body.details &&
						typeof formatted.body.details === "object"
							? (formatted.body.details as Record<
									string,
									unknown
								>)
							: null;

					if (details) {
						if (details.limit !== undefined) {
							res.setHeader(
								"X-RateLimit-Limit",
								String(details.limit),
							);
						}
						if (details.remaining !== undefined) {
							res.setHeader(
								"X-RateLimit-Remaining",
								String(details.remaining),
							);
						}
						if (details.resetAt !== undefined) {
							res.setHeader(
								"X-RateLimit-Reset",
								String(details.resetAt),
							);
						}
						if (details.retryAfterMs !== undefined) {
							const retrySeconds = Math.ceil(
								Number(details.retryAfterMs) / 1000,
							);
							res.setHeader("Retry-After", String(retrySeconds));
						}
					}

					apiLogger.error(
						"API request failed",
						{
							method,
							path,
							remoteAddress: ip,
							statusCode: formatted.statusCode,
						},
						err,
					);

					res.writeHead(formatted.statusCode, {
						"Content-Type": "application/json; charset=utf-8",
					});
					res.end(JSON.stringify(formatted.body));
				},
			},
		],
		assets: false,
	},

	actions: {
		health: {
			auth: "optional",
			handler() {
				return {
					status: "ok",
					timestamp: new Date().toISOString(),
				};
			},
		},
	},

	methods: {
		async authenticate(
			ctx: Context<unknown, ServiceMeta>,
			_route: unknown,
			req: IncomingMessage,
		) {
			const authMode = resolveRequestAuthMode(req);
			const token = extractBearerToken(req);

			if (!token) {
				if (authMode === "optional") {
					return null;
				}

				throw unauthorizedError("Authorization token is required");
			}

			try {
				const payload =
					authMode === "refresh"
						? ((await ctx.call("tokens.validateRefresh", {
								refreshToken: token,
							})) as {
								userId: number;
								email: string;
							})
						: ((await ctx.call("tokens.validateAccess", {
								accessToken: token,
							})) as {
								userId: number;
								email: string;
							});

				const user = (await ctx.call("users.getById", {
					id: payload.userId,
				})) as { id: number; email: string; name: string };

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			} catch (error) {
				if (authMode === "optional") {
					return null;
				}

				throw error;
			}
		},

		async authorize(
			ctx: Context<unknown, ServiceMeta>,
			_route: unknown,
			req: IncomingMessage,
		) {
			const authMode = resolveRequestAuthMode(req);
			if (authMode === "optional") {
				return;
			}

			if (!ctx.meta.user) {
				throw unauthorizedError("Unauthorized");
			}
		},
	},
};

export default ApiService;
