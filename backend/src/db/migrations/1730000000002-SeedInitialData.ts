import bcrypt from "bcryptjs";
import type { MigrationInterface, QueryRunner } from "typeorm";

type DbRow = Record<string, unknown>;

export class SeedInitialData1730000000002 implements MigrationInterface {
	name = "SeedInitialData1730000000002";

	public async up(queryRunner: QueryRunner): Promise<void> {
		const demoUserResult = (await queryRunner.query(
			`SELECT id FROM users WHERE email = $1`,
			["demo@example.com"],
		)) as DbRow[];

		if (demoUserResult.length > 0) {
			return;
		}

		const demoHash = await bcrypt.hash("secret123", 10);
		const janeHash = await bcrypt.hash("secret123", 10);

		const insertedUsers = (await queryRunner.query(
			`
        INSERT INTO users(name, email, password_hash)
        VALUES
          ('Demo User', 'demo@example.com', $1),
          ('Jane Editor', 'jane@example.com', $2)
        RETURNING id, email;
      `,
			[demoHash, janeHash],
		)) as Array<{ id: number; email: string }>;

		const demo = insertedUsers.find(
			(user) => user.email === "demo@example.com",
		);
		const jane = insertedUsers.find(
			(user) => user.email === "jane@example.com",
		);

		if (!demo || !jane) {
			throw new Error("Failed to seed initial users");
		}

		const demoCategories = (await queryRunner.query(
			`
        INSERT INTO categories(name, user_id)
        VALUES ('Work', $1), ('Personal', $1), ('Ideas', $1)
        RETURNING id, name;
      `,
			[demo.id],
		)) as Array<{ id: number; name: string }>;

		await queryRunner.query(
			`
        INSERT INTO categories(name, user_id)
        VALUES ('Drafts', $1), ('Planning', $1);
      `,
			[jane.id],
		);

		const workCategory =
			demoCategories.find((category) => category.name === "Work")?.id ??
			null;
		const personalCategory =
			demoCategories.find((category) => category.name === "Personal")
				?.id ?? null;

		await queryRunner.query(
			`
        INSERT INTO notes(title, content, user_id, category_id)
        VALUES
          ('Welcome note', 'This project is ready. You can edit or delete these seeded notes.', $1, $2),
          ('Sprint checklist', '1. Finalize API contract\n2. Add tests\n3. Ship build', $1, $2),
          ('Weekend plans', 'Buy groceries and schedule a long run.', $1, $3),
          ('Research topic', 'Explore lightweight auth patterns for internal tools.', $1, NULL);
      `,
			[demo.id, workCategory, personalCategory],
		);

		await queryRunner.query(
			`
        INSERT INTO notes(title, content, user_id, category_id)
        VALUES ('Jane''s draft', 'This seeded note belongs to Jane.', $1, NULL);
      `,
			[jane.id],
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`DELETE FROM notes WHERE title IN ('Welcome note', 'Sprint checklist', 'Weekend plans', 'Research topic', 'Jane''s draft');`,
		);
		await queryRunner.query(
			`DELETE FROM categories WHERE name IN ('Work', 'Personal', 'Ideas', 'Drafts', 'Planning');`,
		);
		await queryRunner.query(
			`DELETE FROM users WHERE email IN ('demo@example.com', 'jane@example.com');`,
		);
	}
}
