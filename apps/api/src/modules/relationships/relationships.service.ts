import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Repository, In } from 'typeorm';
import {
  PersonEntity,
  PersonNameEntity,
  RelationshipEdgeEntity,
  RelationshipEdgeType,
} from '../../database/entities';
import { FamilyAccessService } from '../family-access/family-access.service';

export class CreateRelationshipDto {
  @IsUUID()
  familyId!: string;

  @IsEnum(RelationshipEdgeType)
  type!: RelationshipEdgeType;

  @IsUUID()
  fromPersonId!: string;

  @IsUUID()
  toPersonId!: string;

  @IsOptional()
  startDate?: string;
}

export interface RelationshipSummary {
  id: string;
  familyId: string;
  type: RelationshipEdgeType;
  fromPersonId: string;
  toPersonId: string;
  startDate?: string;
}

@Injectable()
export class RelationshipsService {
  constructor(
    @InjectRepository(RelationshipEdgeEntity)
    private readonly edgeRepository: Repository<RelationshipEdgeEntity>,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(PersonNameEntity)
    private readonly personNameRepository: Repository<PersonNameEntity>,
    private readonly familyAccess: FamilyAccessService,
  ) {}

  async listRelationships(
    familyId: string,
    userId: string,
  ): Promise<RelationshipSummary[]> {
    await this.familyAccess.assertMembership(familyId, userId);

    const edges = await this.edgeRepository.find({
      where: { familyId },
      order: { createdAt: 'ASC' },
    });

    return edges.map((e) => ({
      id: e.id,
      familyId: e.familyId,
      type: e.type,
      fromPersonId: e.fromPersonId,
      toPersonId: e.toPersonId,
      startDate: e.startDate ?? undefined,
    }));
  }

  async createRelationship(
    dto: CreateRelationshipDto,
    userId: string,
  ): Promise<RelationshipSummary> {
    await this.familyAccess.assertMembership(dto.familyId, userId);

    if (dto.fromPersonId === dto.toPersonId) {
      throw new BadRequestException('Cannot relate a person to themselves.');
    }

    const people = await this.personRepository.find({
      where: [
        { id: dto.fromPersonId, familyId: dto.familyId },
        { id: dto.toPersonId, familyId: dto.familyId },
      ],
    });

    if (people.length !== 2) {
      throw new NotFoundException('Both people must belong to this family.');
    }

    if (dto.type === RelationshipEdgeType.PARENT) {
      await this.assertNoAncestryCycle(dto.fromPersonId, dto.toPersonId, dto.familyId);
    }

    const edge = await this.edgeRepository.save(
      this.edgeRepository.create({
        familyId: dto.familyId,
        type: dto.type,
        fromPersonId: dto.fromPersonId,
        toPersonId: dto.toPersonId,
        startDate: dto.startDate ?? null,
      }),
    );

    return {
      id: edge.id,
      familyId: edge.familyId,
      type: edge.type,
      fromPersonId: edge.fromPersonId,
      toPersonId: edge.toPersonId,
      startDate: edge.startDate ?? undefined,
    };
  }

  async exportGedcom(familyId: string, userId: string): Promise<string> {
    await this.familyAccess.assertMembership(familyId, userId);

    const people = await this.personRepository.find({ where: { familyId } });
    const edges = await this.edgeRepository.find({ where: { familyId } });
    const names = await this.personNameRepository.find({
      where: { personId: In(people.map((p) => p.id)), isPrimary: true },
    });
    const nameByPerson = new Map(names.map((n) => [n.personId, n.fullName]));

    // Minimal GEDCOM 5.5.1 export (ported from FamilyChain logic)
    const indiXref = new Map<string, string>();
    people.forEach((p, i) => indiXref.set(p.id, `@I${i + 1}@`));

    const parentEdges = edges.filter((e) => e.type === RelationshipEdgeType.PARENT);
    const partnerEdges = edges.filter(
      (e) => e.type === RelationshipEdgeType.SPOUSE || e.type === RelationshipEdgeType.PARTNER,
    );

    const famGroups = new Map<string, { parents: string[]; children: string[]; marriageDate?: string }>();
    const famKey = (ids: string[]) => [...ids].sort().join('|');
    const ensureFam = (parentIds: string[]) => {
      const key = famKey(parentIds);
      if (!famGroups.has(key)) {
        famGroups.set(key, { parents: [...parentIds].sort(), children: [] });
      }
      return famGroups.get(key)!;
    };

    for (const person of people) {
      const parents = parentEdges
        .filter((e) => e.toPersonId === person.id)
        .map((e) => e.fromPersonId);
      if (parents.length > 0) {
        ensureFam(parents).children.push(person.id);
      }
    }

    for (const rel of partnerEdges) {
      const group = ensureFam([rel.fromPersonId, rel.toPersonId]);
      if (rel.startDate) group.marriageDate = rel.startDate;
    }

    const famList = [...famGroups.values()];
    const famXref = new Map<string, string>();
    famList.forEach((g, i) => famXref.set(famKey(g.parents), `@F${i + 1}@`));

    const lines: string[] = [
      '0 HEAD',
      '1 SOUR Bizimkiler',
      '1 GEDC',
      '2 VERS 5.5.1',
      '2 FORM LINEAGE-LINKED',
      '1 CHAR UTF-8',
    ];

    for (const person of people) {
      const xref = indiXref.get(person.id)!;
      const displayName = nameByPerson.get(person.id) ?? 'Unknown';
      lines.push(`0 ${xref} INDI`);
      lines.push(`1 NAME ${displayName} //`);
      if (person.birthDate) {
        lines.push('1 BIRT');
        lines.push(`2 DATE ${person.birthDate}`);
      }
      if (person.deathDate || !person.isLiving) {
        lines.push('1 DEAT');
        if (person.deathDate) lines.push(`2 DATE ${person.deathDate}`);
      }
    }

    for (const group of famList) {
      const xref = famXref.get(famKey(group.parents))!;
      lines.push(`0 ${xref} FAM`);
      const [husb, wife] = group.parents;
      if (husb) lines.push(`1 HUSB ${indiXref.get(husb)}`);
      if (wife) lines.push(`1 WIFE ${indiXref.get(wife)}`);
      for (const childId of group.children) {
        lines.push(`1 CHIL ${indiXref.get(childId)}`);
      }
      if (group.marriageDate) {
        lines.push(`1 MARR`);
        lines.push(`2 DATE ${group.marriageDate}`);
      }
    }

    lines.push('0 TRLR');
    return lines.join('\n');
  }

  private async assertNoAncestryCycle(
    parentId: string,
    childId: string,
    familyId: string,
  ): Promise<void> {
    const edges = await this.edgeRepository.find({
      where: { familyId, type: RelationshipEdgeType.PARENT },
    });

    const descendants = new Set<string>();
    const stack = [childId];
    while (stack.length) {
      const current = stack.pop()!;
      if (current === parentId) {
        throw new BadRequestException('This relationship would create an ancestry cycle.');
      }
      if (descendants.has(current)) continue;
      descendants.add(current);
      for (const edge of edges) {
        if (edge.fromPersonId === current) {
          stack.push(edge.toPersonId);
        }
      }
    }
  }
}
