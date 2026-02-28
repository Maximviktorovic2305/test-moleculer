import { Errors } from "moleculer";

const { MoleculerClientError } = Errors;

type ApiErrorCode =
	| "UNAUTHORIZED"
	| "INVALID_TOKEN"
	| "INVALID_REFRESH_TOKEN"
	| "INVALID_CREDENTIALS"
	| "VALIDATION_ERROR"
	| "NOT_FOUND"
	| "CONFLICT"
	| "RATE_LIMITED"
	| "INTERNAL_ERROR";

type ErrorLike = {
	code?: unknown;
	type?: unknown;
	message?: unknown;
	data?: unknown;
};

export const createApiError = (
	message: string,
	statusCode: number,
	code: ApiErrorCode | string,
	details?: unknown,
) => {
	return new MoleculerClientError(message, statusCode, code, details);
};

export const unauthorizedError = (message = "Unauthorized") => {
	return createApiError(message, 401, "UNAUTHORIZED");
};

export const invalidTokenError = (message = "Invalid or expired token") => {
	return createApiError(message, 401, "INVALID_TOKEN");
};

export const invalidRefreshTokenError = (message = "Invalid refresh token") => {
	return createApiError(message, 401, "INVALID_REFRESH_TOKEN");
};

export const invalidCredentialsError = (message = "Invalid credentials") => {
	return createApiError(message, 401, "INVALID_CREDENTIALS");
};

export const notFoundError = (
	message = "Resource not found",
	code = "NOT_FOUND",
) => {
	return createApiError(message, 404, code);
};

export const conflictError = (message = "Conflict", code = "CONFLICT") => {
	return createApiError(message, 409, code);
};

export const tooManyRequestsError = (
	message = "Too many requests",
	details?: unknown,
) => {
	return createApiError(message, 429, "RATE_LIMITED", details);
};

const asErrorLike = (error: unknown): ErrorLike => {
	if (!error || typeof error !== "object") {
		return {};
	}

	return error as ErrorLike;
};

export const formatApiError = (error: unknown) => {
	const parsed = asErrorLike(error);
	const statusCode =
		typeof parsed.code === "number" && Number.isInteger(parsed.code)
			? Number(parsed.code)
			: 500;
	const code =
		typeof parsed.type === "string" ? parsed.type : "INTERNAL_ERROR";
	const message =
		typeof parsed.message === "string" && parsed.message.length > 0
			? parsed.message
			: "Internal Server Error";

	return {
		statusCode,
		body: {
			message,
			code,
			details: parsed.data ?? null,
			timestamp: new Date().toISOString(),
		},
	};
};
