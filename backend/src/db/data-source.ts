import { DataSource } from "typeorm";

import { env } from "../config/env";
import { Category } from "../entities/category.entity";
import { Note } from "../entities/note.entity";
import { RefreshSession } from "../entities/refresh-session.entity";
import { User } from "../entities/user.entity";
import { CreateInitialSchema1730000000001 } from "./migrations/1730000000001-CreateInitialSchema";
import { SeedInitialData1730000000002 } from "./migrations/1730000000002-SeedInitialData";
import { CreateRefreshSessions1730000000003 } from "./migrations/1730000000003-CreateRefreshSessions";

const createPostgresDataSource = () =>
	new DataSource({
		type: "postgres",
		host: env.DB_HOST,
		port: env.DB_PORT,
		database: env.DB_NAME,
		username: env.DB_USER,
		password: env.DB_PASSWORD,
		entities: [User, Category, Note, RefreshSession],
		migrations: [
			CreateInitialSchema1730000000001,
			SeedInitialData1730000000002,
			CreateRefreshSessions1730000000003,
		],
		synchronize: env.DB_SYNC,
		logging: env.NODE_ENV === "development",
	});

export let AppDataSource = createPostgresDataSource();

export const replaceAppDataSource = (dataSource: DataSource) => {
	AppDataSource = dataSource;
};

export const resetAppDataSource = () => {
	AppDataSource = createPostgresDataSource();
};
