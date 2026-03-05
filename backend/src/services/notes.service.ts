import type { Context, ServiceSchema } from "moleculer";

import { AppDataSource } from "../db";
import { Note } from "../entities";
import {
	ensureCategoryOwnership,
	normalizeCategoryId,
	serializeNote,
} from "../modules/notes";
import {
	createNoteSchema,
	listNotesSchema,
	updateNoteSchema,
} from "../modules/notes";
import { resolveRequestUserId } from "../modules/users";
import type { ServiceMeta } from "../types/service-meta";
import {
	assertNumberId,
	createApiError,
	createValidationError,
	notFoundError,
} from "../utils";

const NotesService: ServiceSchema = {
	name: "notes",

	actions: {
		list: {
			rest: "GET /notes",
			auth: "required",
			params: {
				search: {
					type: "string",
					optional: true,
					min: 1,
					max: 200,
					trim: true,
				},
				categoryId: [
					{
						type: "number",
						integer: true,
						positive: true,
						optional: true,
					},
					{ type: "string", pattern: "^[0-9]+$", optional: true },
				],
			},
			async handler(
				ctx: Context<
					{ search?: string; categoryId?: number | string },
					ServiceMeta
				>,
			) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const parsed = listNotesSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const params = parsed.data;
				const repo = AppDataSource.getRepository(Note);

				const query = repo
					.createQueryBuilder("note")
					.leftJoinAndSelect("note.category", "category")
					.where("note.user_id = :userId", { userId })
					.orderBy("note.updated_at", "DESC");

				if (params.categoryId !== undefined) {
					query.andWhere("note.category_id = :categoryId", {
						categoryId: Number(params.categoryId),
					});
				}

				if (params.search) {
					const trimmedSearch = params.search.trim();
					query.andWhere(
						`(to_tsvector('simple', coalesce(note.title, '') || ' ' || coalesce(note.content, '')) @@ plainto_tsquery('simple', :search)
              OR note.title ILIKE :likeQuery
              OR note.content ILIKE :likeQuery)`,
						{
							search: trimmedSearch,
							likeQuery: `%${trimmedSearch}%`,
						},
					);
				}

				const notes = await query.getMany();
				return notes.map(serializeNote);
			},
		},

		get: {
			rest: "GET /notes/:id",
			auth: "required",
			params: {
				id: [
					{ type: "number", integer: true, positive: true },
					{ type: "string", pattern: "^[0-9]+$" },
				],
			},
			async handler(ctx: Context<{ id: number | string }, ServiceMeta>) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const id = assertNumberId(ctx.params.id);
				const repo = AppDataSource.getRepository(Note);

				const note = await repo.findOne({
					where: { id, userId },
					relations: { category: true },
				});

				if (!note) {
					throw notFoundError("Note not found", "NOTE_NOT_FOUND");
				}

				return serializeNote(note);
			},
		},

		create: {
			rest: "POST /notes",
			auth: "required",
			params: {
				title: { type: "string", min: 1, max: 255, trim: true },
				content: { type: "string", min: 1, max: 10000, trim: true },
				categoryId: {
					type: "number",
					integer: true,
					positive: true,
					optional: true,
					nullable: true,
					convert: true,
				},
			},
			async handler(
				ctx: Context<
					{
						title: string;
						content: string;
						categoryId?: number | string | null;
					},
					ServiceMeta
				>,
			) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const normalized = {
					title: ctx.params.title,
					content: ctx.params.content,
					categoryId: normalizeCategoryId(ctx.params.categoryId),
				};

				const parsed = createNoteSchema.safeParse(normalized);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const params = parsed.data;

				if (params.categoryId) {
					await ensureCategoryOwnership(params.categoryId, userId);
				}

				const repo = AppDataSource.getRepository(Note);
				const note = repo.create({
					title: params.title,
					content: params.content,
					userId,
					categoryId: params.categoryId ?? null,
				});

				const saved = await repo.save(note);
				const complete = await repo.findOneOrFail({
					where: { id: saved.id },
					relations: { category: true },
				});

				return serializeNote(complete);
			},
		},

		update: {
			rest: "PATCH /notes/:id",
			auth: "required",
			params: {
				id: [
					{ type: "number", integer: true, positive: true },
					{ type: "string", pattern: "^[0-9]+$" },
				],
				title: {
					type: "string",
					min: 1,
					max: 255,
					trim: true,
					optional: true,
				},
				content: {
					type: "string",
					min: 1,
					max: 10000,
					trim: true,
					optional: true,
				},
				categoryId: {
					type: "number",
					integer: true,
					positive: true,
					optional: true,
					nullable: true,
					convert: true,
				},
			},
			async handler(
				ctx: Context<
					{
						id: number | string;
						title?: string;
						content?: string;
						categoryId?: number | string | null;
					},
					ServiceMeta
				>,
			) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const noteId = assertNumberId(ctx.params.id);

				const normalized = {
					title: ctx.params.title,
					content: ctx.params.content,
					categoryId: normalizeCategoryId(ctx.params.categoryId),
				};

				const parsed = updateNoteSchema.safeParse(normalized);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				if (
					parsed.data.title === undefined &&
					parsed.data.content === undefined &&
					parsed.data.categoryId === undefined
				) {
					throw createApiError(
						"Provide at least one field to update",
						422,
						"VALIDATION_ERROR",
					);
				}

				if (parsed.data.categoryId) {
					await ensureCategoryOwnership(
						parsed.data.categoryId,
						userId,
					);
				}

				const repo = AppDataSource.getRepository(Note);
				const note = await repo.findOne({
					where: { id: noteId, userId },
				});

				if (!note) {
					throw notFoundError("Note not found", "NOTE_NOT_FOUND");
				}

				if (parsed.data.title !== undefined)
					note.title = parsed.data.title;
				if (parsed.data.content !== undefined)
					note.content = parsed.data.content;
				if (parsed.data.categoryId !== undefined)
					note.categoryId = parsed.data.categoryId ?? null;

				const saved = await repo.save(note);
				const complete = await repo.findOneOrFail({
					where: { id: saved.id, userId },
					relations: { category: true },
				});

				return serializeNote(complete);
			},
		},

		remove: {
			rest: "DELETE /notes/:id",
			auth: "required",
			params: {
				id: [
					{ type: "number", integer: true, positive: true },
					{ type: "string", pattern: "^[0-9]+$" },
				],
			},
			async handler(ctx: Context<{ id: number | string }, ServiceMeta>) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const id = assertNumberId(ctx.params.id);
				const repo = AppDataSource.getRepository(Note);
				const note = await repo.findOne({ where: { id, userId } });

				if (!note) {
					throw notFoundError("Note not found", "NOTE_NOT_FOUND");
				}

				await repo.remove(note);
				return { success: true };
			},
		},
	},
};

export default NotesService;
