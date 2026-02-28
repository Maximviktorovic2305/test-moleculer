import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { Note } from "./note.entity";
import { User } from "./user.entity";

@Entity({ name: "categories" })
export class Category {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 120 })
	name!: string;

	@Column({ type: "integer", name: "user_id" })
	userId!: number;

	@CreateDateColumn({ type: "timestamptz", name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
	updatedAt!: Date;

	@ManyToOne(() => User, (user) => user.categories, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user!: User;

	@OneToMany(() => Note, (note) => note.category)
	notes!: Note[];
}
