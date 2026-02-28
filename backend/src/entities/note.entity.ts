import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { Category } from "./category.entity";
import { User } from "./user.entity";

@Entity({ name: "notes" })
export class Note {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 255 })
	title!: string;

	@Column({ type: "text" })
	content!: string;

	@Column({ type: "integer", name: "user_id" })
	userId!: number;

	@Column({ type: "integer", name: "category_id", nullable: true })
	categoryId!: number | null;

	@CreateDateColumn({ type: "timestamptz", name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
	updatedAt!: Date;

	@ManyToOne(() => User, (user) => user.notes, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user!: User;

	@ManyToOne(() => Category, (category) => category.notes, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn({ name: "category_id" })
	category!: Category | null;
}
