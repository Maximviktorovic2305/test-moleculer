import type { IncomingMessage } from "node:http";

import type { RateLimitConsumeParams } from "./types";

const parseForwardedFor = (value: string | string[] | undefined) => {
	if (!value) {
		return undefined;
	}

	const raw = Array.isArray(value) ? value[0] : value;
	const candidate = raw.split(",")[0]?.trim();
	return candidate || undefined;
};

export const extractPathname = (rawUrl: string | undefined) => {
	if (!rawUrl) {
		return "/";
	}

	try {
		return new URL(rawUrl, "http://localhost").pathname;
	} catch {
		return rawUrl.split("?")[0] || "/";
	}
};

export const resolveClientIp = (req: IncomingMessage) => {
	return (
		parseForwardedFor(req.headers["x-forwarded-for"]) ??
		req.socket.remoteAddress ??
		req.headers["x-real-ip"] ??
		"unknown"
	);
};

export const normalizeMethod = (method?: string) => {
	return (method ?? "GET").toUpperCase();
};

export const buildRateLimitKey = (input: RateLimitConsumeParams) => {
	const method = normalizeMethod(input.method);
	const path = input.path ?? "/";

	if (input.userId) {
		return `user:${input.userId}:${method}:${path}`;
	}

	const ip = input.ip ?? "unknown";
	return `ip:${ip}:${method}:${path}`;
};
