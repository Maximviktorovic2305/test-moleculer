import { createHash } from "node:crypto";

import { signAccessToken, signRefreshToken } from "../../utils";
import type { PairInput } from "./schemas";

export const hashRefreshToken = (token: string) => {
	return createHash("sha256").update(token).digest("hex");
};

export const buildTokenPair = (payload: PairInput) => {
	const accessToken = signAccessToken({
		userId: payload.userId,
		email: payload.email,
	});
	const refresh = signRefreshToken({
		userId: payload.userId,
		email: payload.email,
	});

	return {
		accessToken,
		refreshToken: refresh.token,
		refreshExpiresAt: refresh.expiresAt,
	};
};
