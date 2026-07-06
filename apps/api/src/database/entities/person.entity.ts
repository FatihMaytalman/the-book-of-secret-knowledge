import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FamilyEntity } from './family.entity';

export enum PersonVisibility {
  FAMILY = 'family',
  DIRECT = 'direct',
  PRIVATE = 'private',
}

@Entity({ name: 'person' })
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'family_id', type: 'uuid' })
  familyId!: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family!: FamilyEntity;

  @Column({ type: 'text', default: PersonVisibility.FAMILY })
  visibility!: PersonVisibility;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate!: string | null;

  @Column({ name: 'death_date', type: 'date', nullable: true })
  deathDate!: string | null;

  @Column({ type: 'text', nullable: true })
  biography!: string | null;

  @Column({ name: 'is_living', type: 'boolean', default: true })
  isLiving!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'person_name' })
export class PersonNameEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'person_id', type: 'uuid' })
  personId!: string;

  @ManyToOne(() => PersonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;

  @Column({ name: 'given_name', type: 'text', nullable: true })
  givenName!: string | null;

  @Column({ name: 'family_name', type: 'text', nullable: true })
  familyName!: string | null;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: true })
  isPrimary!: boolean;
}
