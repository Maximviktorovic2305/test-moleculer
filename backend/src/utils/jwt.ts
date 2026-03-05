import jwt from "jsonwebtoken";

import { env } from "../config";

export type BaseTokenPayload = {
	userId: number;
	email: string;
	tokenType: "access" | "refresh";
};

export type AccessTokenPayload = Omit<BaseTokenPayload, "tokenType"> & {
	tokenType: "access";
};

export type RefreshTokenPayload = Omit<BaseTokenPayload, "tokenType"> & {
	tokenType: "refresh";
};

const getTokenExpiryDate = (token: string) => {
	const decoded = jwt.decode(token) as jwt.JwtPayload | null;
	if (!decoded?.exp) {
		throw new Error("Token has no expiration claim");
	}

	return new Date(decoded.exp * 1000);
};

export const signAccessToken = (
	payload: Omit<AccessTokenPayload, "tokenType">,
) => {
	return jwt.sign(
		{
			...payload,
			tokenType: "access",
		},
		env.JWT_SECRET,
		{
			subject: String(payload.userId),
			issuer: "notes-backend",
			audience: "notes-frontend",
			expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
		},
	);
};

export const signRefreshToken = (
	payload: Omit<RefreshTokenPayload, "tokenType">,
) => {
	const token = jwt.sign(
		{
			...payload,
			tokenType: "refresh",
		},
		env.REFRESH_TOKEN_SECRET,
		{
			subject: String(payload.userId),
			issuer: "notes-backend",
			audience: "notes-frontend",
			expiresIn:
				env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
		},
	);

	return {
		token,
		expiresAt: getTokenExpiryDate(token),
	};
};

const parseVerifiedToken = (token: string, secret: string) => {
	return jwt.verify(token, secret, {
		issuer: "notes-backend",
		audience: "notes-frontend",
	}) as jwt.JwtPayload;
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
	const payload = parseVerifiedToken(token, env.JWT_SECRET);
	if (!payload.userId || !payload.email) {
		throw new Error("Invalid access token payload");
	}

	if (payload.tokenType !== "access") {
		throw new Error("Invalid access token type");
	}

	return {
		userId: Number(payload.userId),
		email: String(payload.email),
		tokenType: "access",
	};
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
	const payload = parseVerifiedToken(token, env.REFRESH_TOKEN_SECRET);
	if (!payload.userId || !payload.email) {
		throw new Error("Invalid refresh token payload");
	}

	if (payload.tokenType !== "refresh") {
		throw new Error("Invalid refresh token type");
	}

	return {
		userId: Number(payload.userId),
		email: String(payload.email),
		tokenType: "refresh",
	};
};
