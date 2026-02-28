export type AuthUserMeta = {
	id: number;
	email: string;
	name: string;
};

export type ServiceMeta = {
	user?: AuthUserMeta;
	requestStartedAt?: number;
	rateLimit?: {
		limit: number;
		remaining: number;
		resetAt: string;
		retryAfterMs: number;
	};
};

export type PaginationQuery = {
	search?: string;
	categoryId?: number;
};
