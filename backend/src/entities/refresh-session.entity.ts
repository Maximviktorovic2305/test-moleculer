import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { User } from "./user.entity";

@Entity({ name: "refresh_sessions" })
export class RefreshSession {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "integer", name: "user_id" })
	userId!: number;

	@ManyToOne(() => User, (user) => user.refreshSessions, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "user_id" })
	user!: User;

	@Column({ type: "varchar", length: 64, unique: true, name: "token_hash" })
	tokenHash!: string;

	@Column({ type: "timestamptz", name: "expires_at" })
	expiresAt!: Date;

	@Column({ type: "timestamptz", name: "revoked_at", nullable: true })
	revokedAt!: Date | null;

	@CreateDateColumn({ type: "timestamptz", name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
	updatedAt!: Date;
}
