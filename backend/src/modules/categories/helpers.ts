import type { Category } from "../../entities/category.entity";

export const serializeCategory = (category: Category) => ({
	id: category.id,
	name: category.name,
	createdAt: category.createdAt.toISOString(),
	updatedAt: category.updatedAt.toISOString(),
});
