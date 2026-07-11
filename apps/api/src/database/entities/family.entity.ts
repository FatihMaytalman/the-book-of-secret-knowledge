import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserAccountEntity } from './user-account.entity';

export enum FamilyMembershipRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum FamilyMembershipStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  SUSPENDED = 'suspended',
}

@Entity({ name: 'family' })
export class FamilyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ name: 'retention_policy', type: 'text', default: 'standard' })
  retentionPolicy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'family_membership' })
@Unique(['familyId', 'userId'])
export class FamilyMembershipEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId!: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family!: FamilyEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserAccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserAccountEntity;

  @Column({ type: 'text', default: FamilyMembershipRole.VIEWER })
  role!: FamilyMembershipRole;

  @Column({ type: 'text', default: FamilyMembershipStatus.ACTIVE })
  status!: FamilyMembershipStatus;

  @Column({ type: 'text', default: 'self' })
  relationship!: string;
}
