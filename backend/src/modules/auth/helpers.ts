import type { Context } from "moleculer";

import type { AuthResponsePayload, PublicUser } from "./types";

export const buildAuthResponse = async (
	ctx: Context,
	user: PublicUser,
): Promise<AuthResponsePayload> => {
	const tokens = (await ctx.call("tokens.issuePair", {
		userId: user.id,
		email: user.email,
	})) as {
		accessToken: string;
		refreshToken: string;
	};

	return {
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
		user,
	};
};
