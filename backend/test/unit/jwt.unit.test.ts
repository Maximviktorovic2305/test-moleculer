import { describe, expect, it } from "vitest";

import {
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
} from "../../src/utils/jwt";

describe("jwt utils", () => {
	it("signs and verifies access token payload", () => {
		const token = signAccessToken({
			userId: 42,
			email: "demo@example.com",
		});
		const payload = verifyAccessToken(token);

		expect(payload.userId).toBe(42);
		expect(payload.email).toBe("demo@example.com");
		expect(payload.tokenType).toBe("access");
	});

	it("signs and verifies refresh token payload", () => {
		const refresh = signRefreshToken({
			userId: 24,
			email: "jane@example.com",
		});
		const payload = verifyRefreshToken(refresh.token);

		expect(payload.userId).toBe(24);
		expect(payload.email).toBe("jane@example.com");
		expect(payload.tokenType).toBe("refresh");
		expect(refresh.expiresAt instanceof Date).toBe(true);
		expect(refresh.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});

	it("throws on token type mismatch", () => {
		const access = signAccessToken({
			userId: 10,
			email: "type-check@example.com",
		});

		expect(() => verifyRefreshToken(access)).toThrow();
	});
});
