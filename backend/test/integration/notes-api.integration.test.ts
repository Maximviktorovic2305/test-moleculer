import { ServiceBroker, type ServiceSchema } from "moleculer";
import { DataType, newDb } from "pg-mem";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
	replaceAppDataSource,
	resetAppDataSource,
} from "../../src/db";
import { Category, Note, RefreshSession, User } from "../../src/entities";
import {
	ApiService,
	AuthService,
	CategoriesService,
	NotesService,
	RateLimiterService,
	TokensService,
	UsersService,
} from "../../src/services";

type JsonResponse<T> = {
	status: number;
	body: T;
};

const TEST_PORT = 3307;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const request = async <T>(
	method: "GET" | "POST" | "PATCH" | "DELETE",
	path: string,
	body?: Record<string, unknown>,
	token?: string,
): Promise<JsonResponse<T>> => {
	const response = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const text = await response.text();
	const payload = text ? (JSON.parse(text) as T) : ({} as T);

	return {
		status: response.status,
		body: payload,
	};
};

describe.sequential("notes api integration", () => {
	let broker: ServiceBroker;
	let workCategoryId: number;
	let personalCategoryId: number;
	let firstNoteId: number;
	let accessToken: string;

	beforeAll(async () => {
		const db = newDb();
		db.public.registerFunction({
			implementation: () => "test",
			name: "current_database",
			returns: DataType.text,
		});
		db.public.registerFunction({
			implementation: () => "PostgreSQL 15.0",
			name: "version",
			returns: DataType.text,
		});

		const dataSource = await db.adapters.createTypeormDataSource({
			type: "postgres",
			entities: [User, Category, Note, RefreshSession],
			synchronize: true,
			logging: false,
		});

		await dataSource.initialize();
		replaceAppDataSource(dataSource);

		broker = new ServiceBroker({
			logger: false,
			validator: true,
		});

		const apiService = {
			...ApiService,
			settings: {
				...(ApiService.settings as Record<string, unknown>),
				port: TEST_PORT,
			},
		} as ServiceSchema;

		broker.createService(UsersService);
		broker.createService(TokensService);
		broker.createService(AuthService);
		broker.createService(CategoriesService);
		broker.createService(NotesService);
		broker.createService(RateLimiterService);
		broker.createService(apiService);

		await broker.start();
	});

	afterAll(async () => {
		if (broker) {
			await broker.stop();
		}

		resetAppDataSource();
	});

	it("returns health status", async () => {
		const response = await request<{ status: string }>("GET", "/health");
		expect(response.status).toBe(200);
		expect(response.body.status).toBe("ok");
	});

	it("blocks protected endpoints without token", async () => {
		const listNotes = await request<{ code: string }>("GET", "/notes");
		expect(listNotes.status).toBe(401);
		expect(listNotes.body.code).toBe("UNAUTHORIZED");

		const createCategory = await request<{ code: string }>(
			"POST",
			"/categories",
			{
				name: "Unauthorized category",
			},
		);
		expect(createCategory.status).toBe(401);
		expect(createCategory.body.code).toBe("UNAUTHORIZED");

		const createNote = await request<{ code: string }>("POST", "/notes", {
			title: "Unauthorized note",
			content: "Should fail without token",
			categoryId: 1,
		});
		expect(createNote.status).toBe(401);
		expect(createNote.body.code).toBe("UNAUTHORIZED");
	});

	it("registers user and stores access token", async () => {
		const response = await request<{
			accessToken: string;
			refreshToken: string;
			user: { id: number; email: string };
		}>("POST", "/auth/register", {
			name: "Integration User",
			email: "integration@example.com",
			password: "password123",
		});

		expect(response.status).toBe(200);
		expect(typeof response.body.accessToken).toBe("string");
		expect(response.body.accessToken.length).toBeGreaterThan(20);
		expect(response.body.user.email).toBe("integration@example.com");

		accessToken = response.body.accessToken;
	});

	it("creates categories and lists them", async () => {
		const work = await request<{ id: number; name: string }>(
			"POST",
			"/categories",
			{
				name: "Work",
			},
			accessToken,
		);
		const personal = await request<{ id: number; name: string }>(
			"POST",
			"/categories",
			{
				name: "Personal",
			},
			accessToken,
		);

		expect(work.status).toBe(200);
		expect(personal.status).toBe(200);

		workCategoryId = work.body.id;
		personalCategoryId = personal.body.id;

		const listed = await request<Array<{ id: number; name: string }>>(
			"GET",
			"/categories",
			undefined,
			accessToken,
		);
		expect(listed.status).toBe(200);
		expect(listed.body.some((item) => item.id === workCategoryId)).toBe(
			true,
		);
		expect(listed.body.some((item) => item.id === personalCategoryId)).toBe(
			true,
		);
	});

	it("creates notes and filters by category via query param", async () => {
		const first = await request<{
			id: number;
			title: string;
			categoryId: number;
		}>("POST", "/notes", {
			title: "Sprint tasks",
			content: "Finalize integration tests",
			categoryId: workCategoryId,
		}, accessToken);

		const second = await request<{
			id: number;
			title: string;
			categoryId: number;
		}>("POST", "/notes", {
			title: "Home checklist",
			content: "Buy groceries",
			categoryId: personalCategoryId,
		}, accessToken);

		expect(first.status).toBe(200);
		expect(second.status).toBe(200);

		firstNoteId = first.body.id;

		const filtered = await request<
			Array<{ id: number; categoryId: number }>
		>("GET", `/notes?categoryId=${workCategoryId}`, undefined, accessToken);
		expect(filtered.status).toBe(200);
		expect(filtered.body.length).toBeGreaterThanOrEqual(1);
		expect(
			filtered.body.every((note) => note.categoryId === workCategoryId),
		).toBe(true);
	});

	it("updates note category and returns updated note", async () => {
		const updated = await request<{
			id: number;
			categoryId: number;
			title: string;
		}>("PATCH", `/notes/${firstNoteId}`, {
			categoryId: personalCategoryId,
			title: "Sprint tasks updated",
		}, accessToken);

		expect(updated.status).toBe(200);
		expect(updated.body.categoryId).toBe(personalCategoryId);
		expect(updated.body.title).toBe("Sprint tasks updated");

		const fetched = await request<{ id: number; categoryId: number }>(
			"GET",
			`/notes/${firstNoteId}`,
			undefined,
			accessToken,
		);
		expect(fetched.status).toBe(200);
		expect(fetched.body.categoryId).toBe(personalCategoryId);
	});

	it("deletes note", async () => {
		const deleted = await request<{ success: boolean }>(
			"DELETE",
			`/notes/${firstNoteId}`,
			undefined,
			accessToken,
		);
		expect(deleted.status).toBe(200);
		expect(deleted.body.success).toBe(true);

		const missing = await request<{ code: string }>(
			"GET",
			`/notes/${firstNoteId}`,
			undefined,
			accessToken,
		);
		expect(missing.status).toBe(404);
		expect(missing.body.code).toBe("NOTE_NOT_FOUND");
	});
});
