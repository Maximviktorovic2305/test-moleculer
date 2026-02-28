import { ServiceBroker, type ServiceSchema } from "moleculer";
import { DataType, newDb } from "pg-mem";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
	replaceAppDataSource,
	resetAppDataSource,
} from "../../src/db/data-source";
import { Category } from "../../src/entities/category.entity";
import { Note } from "../../src/entities/note.entity";
import { RefreshSession } from "../../src/entities/refresh-session.entity";
import { User } from "../../src/entities/user.entity";
import ApiService from "../../src/services/api.service";
import AuthService from "../../src/services/auth.service";
import CategoriesService from "../../src/services/categories.service";
import NotesService from "../../src/services/notes.service";
import RateLimiterService from "../../src/services/rate-limiter.service";
import TokensService from "../../src/services/tokens.service";
import UsersService from "../../src/services/users.service";

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
): Promise<JsonResponse<T>> => {
	const response = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
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

	it("creates categories and lists them", async () => {
		const work = await request<{ id: number; name: string }>(
			"POST",
			"/categories",
			{
				name: "Work",
			},
		);
		const personal = await request<{ id: number; name: string }>(
			"POST",
			"/categories",
			{
				name: "Personal",
			},
		);

		expect(work.status).toBe(200);
		expect(personal.status).toBe(200);

		workCategoryId = work.body.id;
		personalCategoryId = personal.body.id;

		const listed = await request<Array<{ id: number; name: string }>>(
			"GET",
			"/categories",
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
		});

		const second = await request<{
			id: number;
			title: string;
			categoryId: number;
		}>("POST", "/notes", {
			title: "Home checklist",
			content: "Buy groceries",
			categoryId: personalCategoryId,
		});

		expect(first.status).toBe(200);
		expect(second.status).toBe(200);

		firstNoteId = first.body.id;

		const filtered = await request<
			Array<{ id: number; categoryId: number }>
		>("GET", `/notes?categoryId=${workCategoryId}`);
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
		});

		expect(updated.status).toBe(200);
		expect(updated.body.categoryId).toBe(personalCategoryId);
		expect(updated.body.title).toBe("Sprint tasks updated");

		const fetched = await request<{ id: number; categoryId: number }>(
			"GET",
			`/notes/${firstNoteId}`,
		);
		expect(fetched.status).toBe(200);
		expect(fetched.body.categoryId).toBe(personalCategoryId);
	});

	it("deletes note", async () => {
		const deleted = await request<{ success: boolean }>(
			"DELETE",
			`/notes/${firstNoteId}`,
		);
		expect(deleted.status).toBe(200);
		expect(deleted.body.success).toBe(true);

		const missing = await request<{ code: string }>(
			"GET",
			`/notes/${firstNoteId}`,
		);
		expect(missing.status).toBe(404);
		expect(missing.body.code).toBe("NOTE_NOT_FOUND");
	});
});
