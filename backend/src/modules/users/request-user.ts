import bcrypt from "bcryptjs";

import { AppDataSource } from "../../db/data-source";
import { User } from "../../entities/user.entity";

const FALLBACK_USER = {
	name: "Guest User",
	email: "guest@example.com",
	password: "guest123",
};

export const resolveRequestUserId = async (
	explicitUserId?: number,
): Promise<number> => {
	if (explicitUserId) {
		return explicitUserId;
	}

	const repo = AppDataSource.getRepository(User);

	const fallback = await repo.findOne({
		where: { email: FALLBACK_USER.email },
	});
	if (fallback) {
		return fallback.id;
	}

	const firstUser = await repo
		.createQueryBuilder("user")
		.orderBy("user.id", "ASC")
		.getOne();

	if (firstUser) {
		return firstUser.id;
	}

	const passwordHash = await bcrypt.hash(FALLBACK_USER.password, 10);
	const created = repo.create({
		name: FALLBACK_USER.name,
		email: FALLBACK_USER.email,
		passwordHash,
	});

	const saved = await repo.save(created);
	return saved.id;
};
