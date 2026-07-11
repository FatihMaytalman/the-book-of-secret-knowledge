import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { In, IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  FamilyInviteEntity,
  FamilyMembershipEntity,
  FamilyMembershipRole,
  FamilyMembershipStatus,
  INVITE_RELATIONSHIPS,
  UserAccountEntity,
} from '../../database/entities';
import { FamilyAccessService } from '../family-access/family-access.service';

export class CreateInviteDto {
  @IsString()
  familyId!: string;

  @IsEmail()
  email!: string;

  @IsIn([...INVITE_RELATIONSHIPS])
  relationship!: string;
}

export interface InviteSummary {
  id: string;
  familyId: string;
  email: string;
  relationship: string;
  inviteToken: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface MemberSummary {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: string;
  relationship: string;
  joinedAt: string;
}

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(FamilyInviteEntity)
    private readonly inviteRepository: Repository<FamilyInviteEntity>,
    @InjectRepository(FamilyMembershipEntity)
    private readonly membershipRepository: Repository<FamilyMembershipEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly userRepository: Repository<UserAccountEntity>,
    private readonly familyAccess: FamilyAccessService,
  ) {}

  async listMembers(familyId: string, userId: string): Promise<MemberSummary[]> {
    await this.familyAccess.assertMembership(familyId, userId);

    const memberships = await this.membershipRepository.find({
      where: { familyId, status: FamilyMembershipStatus.ACTIVE },
      order: { id: 'ASC' },
    });

    const userIds = memberships.map((m) => m.userId);
    const users = userIds.length
      ? await this.userRepository.find({ where: { id: In(userIds) } })
      : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    return memberships.map((m) => {
      const user = userById.get(m.userId);
      return {
        id: m.id,
        userId: m.userId,
        displayName: user?.displayName ?? 'Member',
        email: user?.email ?? '',
        role: m.role,
        relationship: m.relationship,
        joinedAt: user?.createdAt.toISOString() ?? new Date().toISOString(),
      };
    });
  }

  async listInvites(familyId: string, userId: string): Promise<InviteSummary[]> {
    await this.familyAccess.assertMembership(familyId, userId);

    const invites = await this.inviteRepository.find({
      where: { familyId },
      order: { createdAt: 'DESC' },
    });

    return invites
      .filter((i) => !i.acceptedAt)
      .map((i) => this.toInviteSummary(i));
  }

  async createInvite(dto: CreateInviteDto, actorUserId: string): Promise<InviteSummary> {
    await this.familyAccess.assertMembership(dto.familyId, actorUserId);

    const email = dto.email.trim().toLowerCase();

    const existingMember = await this.membershipRepository
      .createQueryBuilder('m')
      .innerJoin(UserAccountEntity, 'u', 'u.id = m.user_id')
      .where('m.family_id = :familyId', { familyId: dto.familyId })
      .andWhere('LOWER(u.email) = :email', { email })
      .getOne();

    if (existingMember) {
      throw new ConflictException('This person is already a family member.');
    }

    const invite = await this.inviteRepository.save(
      this.inviteRepository.create({
        familyId: dto.familyId,
        email,
        invitedByUserId: actorUserId,
        relationship: dto.relationship,
        inviteToken: randomUUID(),
      }),
    );

    return this.toInviteSummary(invite);
  }

  async cancelInvite(inviteId: string, actorUserId: string): Promise<void> {
    const invite = await this.inviteRepository.findOne({ where: { id: inviteId } });
    if (!invite || invite.acceptedAt) {
      throw new NotFoundException('Invite not found.');
    }
    await this.familyAccess.assertMembership(invite.familyId, actorUserId);
    await this.inviteRepository.delete(inviteId);
  }

  async acceptInviteByToken(token: string, userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Account not found.');
    }

    const invite = await this.inviteRepository.findOne({
      where: { inviteToken: token },
    });

    if (!invite || invite.acceptedAt) {
      throw new NotFoundException('Invite not found or already accepted.');
    }

    if (invite.email !== user.email.toLowerCase()) {
      throw new BadRequestException('This invite was sent to a different email address.');
    }

    await this.joinFamilyFromInvite(invite, user);
    return invite.familyId;
  }

  async acceptPendingInvitesForUser(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return 0;

    const pending = await this.inviteRepository.find({
      where: { email: user.email.toLowerCase(), acceptedAt: IsNull() },
    });

    let count = 0;
    for (const invite of pending) {
      if (!invite.acceptedAt) {
        await this.joinFamilyFromInvite(invite, user);
        count += 1;
      }
    }
    return count;
  }

  private async joinFamilyFromInvite(
    invite: FamilyInviteEntity,
    user: UserAccountEntity,
  ): Promise<void> {
    const existing = await this.membershipRepository.findOne({
      where: { familyId: invite.familyId, userId: user.id },
    });

    if (!existing) {
      await this.membershipRepository.save(
        this.membershipRepository.create({
          familyId: invite.familyId,
          userId: user.id,
          role: FamilyMembershipRole.VIEWER,
          status: FamilyMembershipStatus.ACTIVE,
          relationship: invite.relationship,
        }),
      );
    }

    invite.acceptedAt = new Date();
    await this.inviteRepository.save(invite);
  }

  private toInviteSummary(invite: FamilyInviteEntity): InviteSummary {
    return {
      id: invite.id,
      familyId: invite.familyId,
      email: invite.email,
      relationship: invite.relationship,
      inviteToken: invite.inviteToken,
      createdAt: invite.createdAt.toISOString(),
      acceptedAt: invite.acceptedAt?.toISOString(),
    };
  }
}
