import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FamilyMembershipEntity,
  FamilyMembershipRole,
  FamilyMembershipStatus,
} from '../../database/entities';

@Injectable()
export class FamilyAccessService {
  constructor(
    @InjectRepository(FamilyMembershipEntity)
    private readonly membershipRepository: Repository<FamilyMembershipEntity>,
  ) {}

  async assertMembership(familyId: string, userId: string): Promise<FamilyMembershipEntity> {
    const membership = await this.membershipRepository.findOne({
      where: { familyId, userId, status: FamilyMembershipStatus.ACTIVE },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this family.');
    }
    return membership;
  }

  async getMembership(
    familyId: string,
    userId: string,
  ): Promise<FamilyMembershipEntity | null> {
    return this.membershipRepository.findOne({
      where: { familyId, userId, status: FamilyMembershipStatus.ACTIVE },
    });
  }

  async assertOwner(familyId: string, userId: string): Promise<FamilyMembershipEntity> {
    const membership = await this.assertMembership(familyId, userId);
    if (membership.role !== FamilyMembershipRole.OWNER) {
      throw new ForbiddenException('Owner access required.');
    }
    return membership;
  }

  async requireMembership(familyId: string, userId: string): Promise<FamilyMembershipEntity> {
    const membership = await this.getMembership(familyId, userId);
    if (!membership) {
      throw new NotFoundException('Family not found.');
    }
    return membership;
  }
}
