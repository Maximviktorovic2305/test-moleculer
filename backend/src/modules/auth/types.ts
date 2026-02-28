export type PublicUser = {
	id: number;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
};

export type UserWithPassword = PublicUser & {
	passwordHash: string;
};

export type AuthResponsePayload = {
	accessToken: string;
	refreshToken: string;
	user: PublicUser;
};
