import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { FamilySummary } from '@aomlegacy/shared';
import {
  FamilyEntity,
  FamilyMembershipEntity,
  FamilyMembershipRole,
  FamilyMembershipStatus,
  MediaAssetEntity,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { CreateFamilyDto } from './dto/create-family.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(FamilyEntity)
    private readonly familyRepository: Repository<FamilyEntity>,
    @InjectRepository(FamilyMembershipEntity)
    private readonly membershipRepository: Repository<FamilyMembershipEntity>,
    @InjectRepository(MediaAssetEntity)
    private readonly mediaAssetRepository: Repository<MediaAssetEntity>,
    private readonly auditService: AuditService,
  ) {}

  async listFamilies(userId: string): Promise<FamilySummary[]> {
    const memberships = await this.membershipRepository.find({
      where: { userId },
    });
    const familyIds = memberships.map((membership) => membership.familyId);

    if (familyIds.length === 0) {
      return [];
    }

    const families = await this.familyRepository.find({
      where: { id: In(familyIds) },
      order: { createdAt: 'ASC' },
    });

    return Promise.all(families.map((family) => this.toSummary(family)));
  }

  async getFamily(id: string): Promise<FamilySummary> {
    const family = await this.familyRepository.findOne({ where: { id } });

    if (!family) {
      throw new NotFoundException(`Family not found: ${id}`);
    }

    return this.toSummary(family);
  }

  async createFamily(
    dto: CreateFamilyDto,
    actorUserId: string,
  ): Promise<FamilySummary> {
    const slug = await this.resolveUniqueSlug(dto.slug ?? dto.name);

    const family = await this.familyRepository.save(
      this.familyRepository.create({ name: dto.name.trim(), slug }),
    );

    await this.membershipRepository.save(
      this.membershipRepository.create({
        familyId: family.id,
        userId: actorUserId,
        role: FamilyMembershipRole.OWNER,
        status: FamilyMembershipStatus.ACTIVE,
      }),
    );

    await this.auditService.record({
      familyId: family.id,
      actorUserId,
      action: 'family.created',
      resourceType: 'family',
      resourceId: family.id,
      metadata: { name: family.name, slug: family.slug },
    });

    return this.toSummary(family);
  }

  private async toSummary(family: FamilyEntity): Promise<FamilySummary> {
    const [memberCount, mediaAssetCount] = await Promise.all([
      this.membershipRepository.count({ where: { familyId: family.id } }),
      this.mediaAssetRepository.count({ where: { familyId: family.id } }),
    ]);

    return {
      id: family.id,
      name: family.name,
      slug: family.slug,
      memberCount,
      mediaAssetCount,
    };
  }

  private slugify(value: string): string {
    const base = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    return base.length > 0 ? base : 'family';
  }

  private async resolveUniqueSlug(source: string): Promise<string> {
    const base = this.slugify(source);
    let candidate = base;
    let counter = 2;

    while (await this.familyRepository.exists({ where: { slug: candidate } })) {
      const suffix = `-${counter}`;
      candidate = `${base.slice(0, 60 - suffix.length)}${suffix}`;
      counter += 1;
    }

    return candidate;
  }
}
