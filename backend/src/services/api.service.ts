import ApiGateway from "moleculer-web";
import type { ServiceSchema } from "moleculer";
import type { Context } from "moleculer";
import type { IncomingMessage, ServerResponse } from "node:http";

import { corsOrigins, env, rateLimitSkipPaths } from "../config/env";
import { appLogger } from "../logger";
import { API_ALIASES } from "../modules/api/aliases";
import {
	extractPathname,
	normalizeMethod,
	resolveClientIp,
} from "../modules/rate-limit/helpers";
import type { RateLimitConsumeResult } from "../modules/rate-limit/types";
import type { ServiceMeta } from "../types/service-meta";
import { formatApiError, tooManyRequestsError } from "../utils/errors";

const apiLogger = appLogger.child({
	service: "api",
});

const isRateLimitExcluded = (path: string) => {
	return rateLimitSkipPaths.some((excludedPath) => excludedPath === path);
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
			handler() {
				return {
					status: "ok",
					timestamp: new Date().toISOString(),
				};
			},
		},
	},
};

export default ApiService;
