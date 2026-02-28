import type { Context, ServiceSchema } from "moleculer";

import { AppDataSource } from "../db/data-source";
import { Category } from "../entities/category.entity";
import { serializeCategory } from "../modules/categories/helpers";
import { categoryInputSchema } from "../modules/categories/schemas";
import { resolveRequestUserId } from "../modules/users/request-user";
import type { ServiceMeta } from "../types/service-meta";
import { notFoundError } from "../utils/errors";
import { assertNumberId, createValidationError } from "../utils/validation";

const CategoriesService: ServiceSchema = {
	name: "categories",

	actions: {
		list: {
			rest: "GET /categories",
			async handler(ctx: Context<undefined, ServiceMeta>) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const repo = AppDataSource.getRepository(Category);
				const categories = await repo.find({
					where: { userId },
					order: { name: "ASC" },
				});

				return categories.map(serializeCategory);
			},
		},

		create: {
			rest: "POST /categories",
			params: {
				name: { type: "string", min: 2, max: 120, trim: true },
			},
			async handler(ctx: Context<{ name: string }, ServiceMeta>) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const parsed = categoryInputSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const repo = AppDataSource.getRepository(Category);
				const category = repo.create({
					name: parsed.data.name,
					userId,
				});

				const saved = await repo.save(category);
				return serializeCategory(saved);
			},
		},

		update: {
			rest: "PATCH /categories/:id",
			params: {
				id: [
					{ type: "number", integer: true, positive: true },
					{ type: "string", pattern: "^[0-9]+$" },
				],
				name: { type: "string", min: 2, max: 120, trim: true },
			},
			async handler(
				ctx: Context<
					{ id: number | string; name: string },
					ServiceMeta
				>,
			) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const id = assertNumberId(ctx.params.id);
				const parsed = categoryInputSchema.safeParse({
					name: ctx.params.name,
				});
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const repo = AppDataSource.getRepository(Category);
				const category = await repo.findOne({ where: { id, userId } });

				if (!category) {
					throw notFoundError(
						"Category not found",
						"CATEGORY_NOT_FOUND",
					);
				}

				category.name = parsed.data.name;
				const saved = await repo.save(category);
				return serializeCategory(saved);
			},
		},

		remove: {
			rest: "DELETE /categories/:id",
			params: {
				id: [
					{ type: "number", integer: true, positive: true },
					{ type: "string", pattern: "^[0-9]+$" },
				],
			},
			async handler(ctx: Context<{ id: number | string }, ServiceMeta>) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				const id = assertNumberId(ctx.params.id);
				const repo = AppDataSource.getRepository(Category);
				const category = await repo.findOne({ where: { id, userId } });

				if (!category) {
					throw notFoundError(
						"Category not found",
						"CATEGORY_NOT_FOUND",
					);
				}

				await repo.remove(category);
				return { success: true };
			},
		},
	},
};

export default CategoriesService;
