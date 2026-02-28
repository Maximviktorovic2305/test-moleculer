export type RateLimitConsumeParams = {
	method?: string;
	path?: string;
	ip?: string;
	userId?: number;
	limit?: number;
	windowMs?: number;
};

export type RateLimitConsumeResult = {
	allowed: boolean;
	key: string;
	limit: number;
	remaining: number;
	retryAfterMs: number;
	resetAt: string;
	windowMs: number;
};
