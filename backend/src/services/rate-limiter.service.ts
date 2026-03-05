import type { Context, ServiceSchema } from "moleculer";

import { env } from "../config";
import { appLogger } from "../logger";
import { buildRateLimitKey, rateLimitConsumeSchema } from "../modules/rate-limit";
import type {
	RateLimitConsumeParams,
	RateLimitConsumeResult,
} from "../modules/rate-limit";
import { createValidationError } from "../utils";

type RateLimitBucket = {
	count: number;
	resetAt: number;
};

const rateLimiterLogger = appLogger.child({
	service: "rate-limiter",
});

const buckets = new Map<string, RateLimitBucket>();
let cleanupTimer: NodeJS.Timeout | null = null;

const cleanupExpiredBuckets = () => {
	const now = Date.now();

	for (const [key, bucket] of buckets.entries()) {
		if (bucket.resetAt <= now) {
			buckets.delete(key);
		}
	}
};

const RateLimiterService: ServiceSchema = {
	name: "rateLimiter",

	started() {
		cleanupTimer = setInterval(
			cleanupExpiredBuckets,
			Math.min(env.RATE_LIMIT_WINDOW_MS, 10_000),
		);
		cleanupTimer.unref();
		rateLimiterLogger.info("Rate limiter service started", {
			maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
			windowMs: env.RATE_LIMIT_WINDOW_MS,
		});
	},

	stopped() {
		if (cleanupTimer) {
			clearInterval(cleanupTimer);
			cleanupTimer = null;
		}

		buckets.clear();
		rateLimiterLogger.info("Rate limiter service stopped");
	},

	actions: {
		consume: {
			visibility: "protected",
			params: {
				method: { type: "string", optional: true },
				path: { type: "string", optional: true },
				ip: { type: "string", optional: true },
				userId: {
					type: "number",
					integer: true,
					positive: true,
					optional: true,
				},
				limit: {
					type: "number",
					integer: true,
					positive: true,
					optional: true,
				},
				windowMs: {
					type: "number",
					integer: true,
					positive: true,
					optional: true,
				},
			},
			handler(
				ctx: Context<RateLimitConsumeParams>,
			): RateLimitConsumeResult {
				const parsed = rateLimitConsumeSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const params = parsed.data;
				const limit = params.limit ?? env.RATE_LIMIT_MAX_REQUESTS;
				const windowMs = params.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
				const key = buildRateLimitKey(params);
				const now = Date.now();

				const existing = buckets.get(key);
				const bucket =
					existing && existing.resetAt > now
						? existing
						: {
								count: 0,
								resetAt: now + windowMs,
							};

				bucket.count += 1;
				buckets.set(key, bucket);

				const allowed = bucket.count <= limit;
				const remaining = Math.max(limit - bucket.count, 0);
				const retryAfterMs = allowed
					? 0
					: Math.max(bucket.resetAt - now, 0);

				if (!allowed) {
					rateLimiterLogger.warn("Rate limit exceeded", {
						key,
						limit,
						count: bucket.count,
						retryAfterMs,
					});
				}

				return {
					allowed,
					key,
					limit,
					remaining,
					retryAfterMs,
					resetAt: new Date(bucket.resetAt).toISOString(),
					windowMs,
				};
			},
		},

		reset: {
			visibility: "protected",
			handler() {
				const before = buckets.size;
				buckets.clear();
				rateLimiterLogger.info("Rate limiter buckets reset", {
					before,
				});
				return { success: true, cleared: before };
			},
		},
	},
};

export default RateLimiterService;
