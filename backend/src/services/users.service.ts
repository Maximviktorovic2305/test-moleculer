import bcrypt from "bcryptjs";
import type { Context, ServiceSchema } from "moleculer";

import { AppDataSource } from "../db/data-source";
import { User } from "../entities/user.entity";
import {
	sanitizeUser,
	serializeUserWithPassword,
} from "../modules/users/helpers";
import {
	createUserSchema,
	type CreateUserParams,
} from "../modules/users/schemas";
import { conflictError, notFoundError } from "../utils/errors";
import { assertNumberId, createValidationError } from "../utils/validation";

const UsersService: ServiceSchema = {
	name: "users",

	actions: {
		create: {
			visibility: "protected",
			params: {
				name: { type: "string", min: 2, max: 120, trim: true },
				email: { type: "email" },
				password: { type: "string", min: 6, max: 128 },
			},
			async handler(ctx: Context<CreateUserParams>) {
				const parsed = createUserSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const params = parsed.data;
				const repo = AppDataSource.getRepository(User);
				const normalizedEmail = params.email.toLowerCase();

				const existing = await repo.findOne({
					where: { email: normalizedEmail },
				});
				if (existing) {
					throw conflictError(
						"User with this email already exists",
						"USER_EXISTS",
					);
				}

				const passwordHash = await bcrypt.hash(params.password, 10);

				const user = repo.create({
					name: params.name,
					email: normalizedEmail,
					passwordHash,
				});

				const saved = await repo.save(user);
				return sanitizeUser(saved);
			},
		},

		getById: {
			visibility: "protected",
			params: {
				id: [
					{ type: "number", integer: true, positive: true },
					{ type: "string", pattern: "^[0-9]+$" },
				],
			},
			async handler(ctx: Context<{ id: number | string }>) {
				const id = assertNumberId(ctx.params.id);
				const repo = AppDataSource.getRepository(User);

				const user = await repo.findOne({ where: { id } });
				if (!user) {
					throw notFoundError("User not found", "USER_NOT_FOUND");
				}

				return sanitizeUser(user);
			},
		},

		findByEmail: {
			visibility: "protected",
			params: {
				email: { type: "email" },
			},
			async handler(ctx: Context<{ email: string }>) {
				const repo = AppDataSource.getRepository(User);
				const user = await repo.findOne({
					where: { email: ctx.params.email.toLowerCase() },
				});
				if (!user) {
					return null;
				}

				return serializeUserWithPassword(user);
			},
		},
	},
};

export default UsersService;
