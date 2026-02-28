import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefreshSessions1730000000003 implements MigrationInterface {
	name = "CreateRefreshSessions1730000000003";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS refresh_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id ON refresh_sessions(user_id);`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_refresh_sessions_expires_at ON refresh_sessions(expires_at);`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"DROP INDEX IF EXISTS idx_refresh_sessions_expires_at;",
		);
		await queryRunner.query(
			"DROP INDEX IF EXISTS idx_refresh_sessions_user_id;",
		);
		await queryRunner.query("DROP TABLE IF EXISTS refresh_sessions;");
	}
}
