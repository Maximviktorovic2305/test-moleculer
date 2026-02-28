import { describe, expect, it } from "vitest";

import {
	normalizeCategoryId,
	serializeNote,
} from "../../src/modules/notes/helpers";
import { hashRefreshToken } from "../../src/modules/tokens/helpers";

describe("helpers unit", () => {
	it("normalizes category id from string and preserves nullish values", () => {
		expect(normalizeCategoryId("42")).toBe(42);
		expect(normalizeCategoryId(7)).toBe(7);
		expect(normalizeCategoryId(null)).toBeNull();
		expect(normalizeCategoryId(undefined)).toBeUndefined();
	});

	it("serializes note with category and ISO dates", () => {
		const now = new Date("2026-02-28T10:00:00.000Z");
		const note = {
			id: 1,
			title: "Test",
			content: "Body",
			categoryId: 2,
			category: {
				id: 2,
				name: "Work",
			},
			createdAt: now,
			updatedAt: now,
		} as any;

		const serialized = serializeNote(note);

		expect(serialized).toEqual({
			id: 1,
			title: "Test",
			content: "Body",
			categoryId: 2,
			category: {
				id: 2,
				name: "Work",
			},
			createdAt: "2026-02-28T10:00:00.000Z",
			updatedAt: "2026-02-28T10:00:00.000Z",
		});
	});

	it("hashes refresh token deterministically", () => {
		const token = "refresh-token-sample";
		const hashA = hashRefreshToken(token);
		const hashB = hashRefreshToken(token);
		const hashOther = hashRefreshToken("different-token");

		expect(hashA).toBe(hashB);
		expect(hashA).not.toBe(hashOther);
		expect(hashA).toMatch(/^[a-f0-9]{64}$/);
	});
});
