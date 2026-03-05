import type { User } from "../../entities";

export const sanitizeUser = (user: User) => ({
	id: user.id,
	name: user.name,
	email: user.email,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
});

export const serializeUserWithPassword = (user: User) => ({
	id: user.id,
	name: user.name,
	email: user.email,
	passwordHash: user.passwordHash,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
});
