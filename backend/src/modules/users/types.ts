export type PublicUser = {
	id: number;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
};

export type PublicUserWithPassword = PublicUser & {
	passwordHash: string;
};
