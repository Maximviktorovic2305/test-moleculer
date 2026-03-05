import bcrypt from "bcryptjs";

import type { Context, ServiceSchema } from "moleculer";

import {
	buildAuthResponse,
	loginSchema,
	refreshSchema,
	registerSchema,
	type LoginInput,
	type RefreshInput,
	type RegisterInput,
	type ValidateTokensInput,
	validateTokensSchema,
} from "../modules/auth";
import { resolveRequestUserId } from "../modules/users";
import type {
	PublicUser,
	PublicUserWithPassword,
} from "../modules/users";
import type { ServiceMeta } from "../types/service-meta";
import {
	createApiError,
	createValidationError,
	invalidCredentialsError,
} from "../utils";

const AuthService: ServiceSchema = {
	name: "auth",

	actions: {
		register: {
			rest: "POST /auth/register",
			auth: "optional",
			params: {
				name: { type: "string", min: 2, max: 120, trim: true },
				email: { type: "email" },
				password: { type: "string", min: 6, max: 128 },
			},
			async handler(ctx: Context<RegisterInput, ServiceMeta>) {
				const parsed = registerSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const createdUser = (await ctx.call(
					"users.create",
					parsed.data,
				)) as PublicUser;

				return buildAuthResponse(ctx, createdUser);
			},
		},

		login: {
			rest: "POST /auth/login",
			auth: "optional",
			params: {
				email: { type: "email" },
				password: { type: "string", min: 6, max: 128 },
			},
			async handler(ctx: Context<LoginInput, ServiceMeta>) {
				const parsed = loginSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const params = parsed.data;
				const user = (await ctx.call("users.findByEmail", {
					email: params.email.toLowerCase(),
				})) as PublicUserWithPassword | null;

				if (!user) {
					throw invalidCredentialsError();
				}

				const isValidPassword = await bcrypt.compare(
					params.password,
					user.passwordHash,
				);
				if (!isValidPassword) {
					throw invalidCredentialsError();
				}

				return buildAuthResponse(ctx, {
					id: user.id,
					name: user.name,
					email: user.email,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				});
			},
		},

		refresh: {
			rest: "POST /auth/refresh",
			auth: "refresh",
			params: {
				refreshToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
				},
			},
			async handler(ctx: Context<RefreshInput, ServiceMeta>) {
				const parsed = refreshSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				const issuedTokens = (await ctx.call("tokens.rotatePair", {
					refreshToken: parsed.data.refreshToken,
				})) as {
					accessToken: string;
					refreshToken: string;
					userId: number;
				};

				const freshUser = (await ctx.call("users.getById", {
					id: issuedTokens.userId,
				})) as PublicUser;

				return {
					accessToken: issuedTokens.accessToken,
					refreshToken: issuedTokens.refreshToken,
					user: freshUser,
				};
			},
		},

		logout: {
			rest: "POST /auth/logout",
			auth: "refresh",
			params: {
				refreshToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
				},
			},
			async handler(ctx: Context<RefreshInput, ServiceMeta>) {
				const parsed = refreshSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				await ctx.call("tokens.revokeRefresh", {
					refreshToken: parsed.data.refreshToken,
				});

				return { success: true };
			},
		},

		validate: {
			rest: "POST /auth/validate",
			auth: "refresh",
			params: {
				accessToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
					optional: true,
				},
				refreshToken: {
					type: "string",
					min: 16,
					max: 4096,
					trim: true,
					optional: true,
				},
			},
			async handler(ctx: Context<ValidateTokensInput, ServiceMeta>) {
				const parsed = validateTokensSchema.safeParse(ctx.params);
				if (!parsed.success) {
					throw createValidationError(parsed.error);
				}

				if (!parsed.data.accessToken && !parsed.data.refreshToken) {
					throw createApiError(
						"Provide at least one token",
						422,
						"VALIDATION_ERROR",
					);
				}

				const result: {
					accessTokenValid: boolean | null;
					refreshTokenValid: boolean | null;
				} = {
					accessTokenValid: null,
					refreshTokenValid: null,
				};

				if (parsed.data.accessToken) {
					try {
						await ctx.call("tokens.validateAccess", {
							accessToken: parsed.data.accessToken,
						});
						result.accessTokenValid = true;
					} catch {
						result.accessTokenValid = false;
					}
				}

				if (parsed.data.refreshToken) {
					try {
						await ctx.call("tokens.validateRefresh", {
							refreshToken: parsed.data.refreshToken,
						});
						result.refreshTokenValid = true;
					} catch {
						result.refreshTokenValid = false;
					}
				}

				return result;
			},
		},

		me: {
			rest: "GET /auth/me",
			auth: "required",
			async handler(ctx: Context<undefined, ServiceMeta>) {
				const userId = await resolveRequestUserId(ctx.meta.user?.id);

				return ctx.call("users.getById", {
					id: userId,
				});
			},
		},
	},
};

export default AuthService;
