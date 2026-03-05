import type { Context, ServiceSchema } from "moleculer";

import { AppDataSource } from "../db";
import { RefreshSession } from "../entities";
import { buildTokenPair, hashRefreshToken } from "../modules/tokens";
import {
	pairInputSchema,
	refreshInputSchema,
	tokenInputSchema,
	type PairInput,
	type RefreshInput,
	type TokenInput,
} from "../modules/tokens";
import {
	createValidationError,
	invalidRefreshTokenError,
	invalidTokenError,
	verifyAccessToken,
	verifyRefreshToken,
	type AccessTokenPayload,
	type RefreshTokenPayload,
} from "../utils";

const TokensService: ServiceSchema = {
	name: "tokens",

	actions: {
		issuePair: {
			visibility: "protected",
			params: {
				userId: { type: "number", integer: true, positive: true },
				email: { type: "email" },
			},
			async handler(ctx: Context<PairInput>) {
				const parsed = pairInputSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const pair = buildTokenPair(parsed.data);
				const refreshSessionRepo =
					AppDataSource.getRepository(RefreshSession);
				const session = refreshSessionRepo.create({
					userId: parsed.data.userId,
					tokenHash: hashRefreshToken(pair.refreshToken),
					expiresAt: pair.refreshExpiresAt,
					revokedAt: null,
				});

				await refreshSessionRepo.save(session);

				return {
					accessToken: pair.accessToken,
					refreshToken: pair.refreshToken,
				};
			},
		},

		validateAccess: {
			visibility: "protected",
			params: {
				accessToken: { type: "string", min: 16, max: 4096, trim: true },
			},
			async handler(
				ctx: Context<TokenInput>,
			): Promise<AccessTokenPayload> {
				const parsed = tokenInputSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				try {
					return verifyAccessToken(parsed.data.accessToken);
				} catch {
					throw invalidTokenError();
				}
			},
		},

		validateRefresh: {
			visibility: "protected",
			params: {
				refreshToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
				},
			},
			async handler(
				ctx: Context<RefreshInput>,
			): Promise<RefreshTokenPayload & { refreshSessionId: number }> {
				const parsed = refreshInputSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				let payload: RefreshTokenPayload;
				try {
					payload = verifyRefreshToken(parsed.data.refreshToken);
				} catch {
					throw invalidRefreshTokenError();
				}

				const tokenHash = hashRefreshToken(parsed.data.refreshToken);
				const now = new Date().toISOString();
				const refreshSessionRepo =
					AppDataSource.getRepository(RefreshSession);

				const activeSession = await refreshSessionRepo
					.createQueryBuilder("session")
					.where("session.user_id = :userId", {
						userId: payload.userId,
					})
					.andWhere("session.token_hash = :tokenHash", { tokenHash })
					.andWhere("session.revoked_at IS NULL")
					.andWhere("session.expires_at > :now", { now })
					.getOne();

				if (!activeSession) {
					throw invalidRefreshTokenError();
				}

				return {
					...payload,
					refreshSessionId: activeSession.id,
				};
			},
		},

		rotatePair: {
			visibility: "protected",
			params: {
				refreshToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
				},
			},
			async handler(ctx: Context<RefreshInput>) {
				const parsed = refreshInputSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				let payload: RefreshTokenPayload;
				try {
					payload = verifyRefreshToken(parsed.data.refreshToken);
				} catch {
					throw invalidRefreshTokenError();
				}

				const currentHash = hashRefreshToken(parsed.data.refreshToken);
				const now = new Date();

				return AppDataSource.transaction(async (manager) => {
					const refreshSessionRepo =
						manager.getRepository(RefreshSession);

					const activeSession = await refreshSessionRepo
						.createQueryBuilder("session")
						.setLock("pessimistic_write")
						.where("session.user_id = :userId", {
							userId: payload.userId,
						})
						.andWhere("session.token_hash = :tokenHash", {
							tokenHash: currentHash,
						})
						.andWhere("session.revoked_at IS NULL")
						.andWhere("session.expires_at > :now", {
							now: now.toISOString(),
						})
						.getOne();

					if (!activeSession) {
						throw invalidRefreshTokenError();
					}

					activeSession.revokedAt = now;
					await refreshSessionRepo.save(activeSession);

					const nextPair = buildTokenPair({
						userId: payload.userId,
						email: payload.email,
					});

					const nextSession = refreshSessionRepo.create({
						userId: payload.userId,
						tokenHash: hashRefreshToken(nextPair.refreshToken),
						expiresAt: nextPair.refreshExpiresAt,
						revokedAt: null,
					});

					await refreshSessionRepo.save(nextSession);

					return {
						accessToken: nextPair.accessToken,
						refreshToken: nextPair.refreshToken,
						userId: payload.userId,
						email: payload.email,
					};
				});
			},
		},

		revokeRefresh: {
			visibility: "protected",
			params: {
				refreshToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
				},
			},
			async handler(ctx: Context<RefreshInput>) {
				const parsed = refreshInputSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				try {
					const payload = verifyRefreshToken(
						parsed.data.refreshToken,
					);
					const tokenHash = hashRefreshToken(
						parsed.data.refreshToken,
					);
					const refreshSessionRepo =
						AppDataSource.getRepository(RefreshSession);

					await refreshSessionRepo
						.createQueryBuilder()
						.update(RefreshSession)
						.set({ revokedAt: new Date() })
						.where("user_id = :userId", { userId: payload.userId })
						.andWhere("token_hash = :tokenHash", { tokenHash })
						.andWhere("revoked_at IS NULL")
						.execute();
				} catch {
					return { success: true };
				}

				return { success: true };
			},
		},
	},
};

export default TokensService;
