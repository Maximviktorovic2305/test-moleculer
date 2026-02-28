import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { Category } from "./category.entity";
import { Note } from "./note.entity";
import { RefreshSession } from "./refresh-session.entity";

@Entity({ name: "users" })
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 120 })
	name!: string;

	@Column({ type: "varchar", length: 180, unique: true })
	email!: string;

	@Column({ type: "varchar", length: 255, name: "password_hash" })
	passwordHash!: string;

	@CreateDateColumn({ type: "timestamptz", name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
	updatedAt!: Date;

	@OneToMany(() => Category, (category) => category.user)
	categories!: Category[];

	@OneToMany(() => Note, (note) => note.user)
	notes!: Note[];

	@OneToMany(() => RefreshSession, (session) => session.user)
	refreshSessions!: RefreshSession[];
}
