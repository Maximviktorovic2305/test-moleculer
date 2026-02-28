import { AppDataSource } from "../../db/data-source";
import { Category } from "../../entities/category.entity";
import type { Note } from "../../entities/note.entity";
import { notFoundError } from "../../utils/errors";

export const serializeNote = (note: Note) => ({
	id: note.id,
	title: note.title,
	content: note.content,
	categoryId: note.categoryId,
	category: note.category
		? {
				id: note.category.id,
				name: note.category.name,
			}
		: null,
	createdAt: note.createdAt.toISOString(),
	updatedAt: note.updatedAt.toISOString(),
});

export const ensureCategoryOwnership = async (
	categoryId: number,
	userId: number,
) => {
	const categoryRepo = AppDataSource.getRepository(Category);
	const category = await categoryRepo.findOne({
		where: { id: categoryId, userId },
	});

	if (!category) {
		throw notFoundError("Category not found", "CATEGORY_NOT_FOUND");
	}
};

export const normalizeCategoryId = (
	value: number | string | null | undefined,
) => {
	if (value === null || value === undefined) {
		return value;
	}

	return Number(value);
};
