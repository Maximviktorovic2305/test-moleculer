import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1730000000001 implements MigrationInterface {
	name = "CreateInitialSchema1730000000001";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);`,
		);
		await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_fts
      ON notes
      USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '')));
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP INDEX IF EXISTS idx_notes_fts;");
		await queryRunner.query("DROP INDEX IF EXISTS idx_notes_category_id;");
		await queryRunner.query("DROP INDEX IF EXISTS idx_notes_user_id;");
		await queryRunner.query("DROP INDEX IF EXISTS idx_categories_user_id;");
		await queryRunner.query("DROP TABLE IF EXISTS notes;");
		await queryRunner.query("DROP TABLE IF EXISTS categories;");
		await queryRunner.query("DROP TABLE IF EXISTS users;");
	}
}
