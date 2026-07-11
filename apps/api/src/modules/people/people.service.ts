import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PersonSummary, PersonVisibility } from '@aomlegacy/shared';
import {
  FamilyEntity,
  FamilyMembershipEntity,
  PersonEntity,
  PersonNameEntity,
  PersonVisibility as EntityVisibility,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { CreatePersonDto } from './dto/create-person.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(PersonNameEntity)
    private readonly personNameRepository: Repository<PersonNameEntity>,
    @InjectRepository(FamilyEntity)
    private readonly familyRepository: Repository<FamilyEntity>,
    @InjectRepository(FamilyMembershipEntity)
    private readonly membershipRepository: Repository<FamilyMembershipEntity>,
    private readonly auditService: AuditService,
  ) {}

  private async assertMembership(familyId: string, userId: string): Promise<void> {
    const isMember = await this.membershipRepository.exists({
      where: { familyId, userId },
    });
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this family.');
    }
  }

  async listPeople(familyId: string, userId: string): Promise<PersonSummary[]> {
    await this.assertMembership(familyId, userId);

    const people = await this.personRepository.find({
      where: { familyId },
      order: { createdAt: 'ASC' },
    });

    if (people.length === 0) {
      return [];
    }

    const primaryNames = await this.loadPrimaryNames(people.map((p) => p.id));

    return people.map((person) =>
      this.toSummary(person, primaryNames.get(person.id)),
    );
  }

  async getPerson(id: string, userId: string): Promise<PersonSummary> {
    const person = await this.personRepository.findOne({ where: { id } });

    if (!person) {
      throw new NotFoundException(`Person not found: ${id}`);
    }

    await this.assertMembership(person.familyId, userId);

    const primaryNames = await this.loadPrimaryNames([person.id]);

    return this.toSummary(person, primaryNames.get(person.id));
  }

  async createPerson(
    dto: CreatePersonDto,
    actorUserId: string,
  ): Promise<PersonSummary> {
    const familyExists = await this.familyRepository.exists({
      where: { id: dto.familyId },
    });

    if (!familyExists) {
      throw new NotFoundException(`Family not found: ${dto.familyId}`);
    }

    await this.assertMembership(dto.familyId, actorUserId);

    const displayName = dto.displayName.trim();

    const person = await this.personRepository.save(
      this.personRepository.create({
        familyId: dto.familyId,
        visibility: this.toEntityVisibility(dto.visibility),
        birthDate: dto.birthDate ?? null,
        deathDate: dto.deathDate ?? null,
        biography: dto.biography ?? null,
        isLiving: dto.isLiving ?? !dto.deathDate,
      }),
    );

    await this.personNameRepository.save(
      this.personNameRepository.create({
        personId: person.id,
        fullName: displayName,
        isPrimary: true,
      }),
    );

    await this.auditService.record({
      familyId: person.familyId,
      actorUserId,
      action: 'person.created',
      resourceType: 'person',
      resourceId: person.id,
      metadata: { displayName },
    });

    return this.getPerson(person.id, actorUserId);
  }

  private async loadPrimaryNames(
    personIds: string[],
  ): Promise<Map<string, string>> {
    const names = await this.personNameRepository.find({
      where: { personId: In(personIds), isPrimary: true },
    });

    return new Map(names.map((name) => [name.personId, name.fullName]));
  }

  private toSummary(person: PersonEntity, displayName?: string): PersonSummary {
    return {
      id: person.id,
      familyId: person.familyId,
      displayName: displayName ?? 'Unnamed person',
      birthDate: person.birthDate ?? undefined,
      deathDate: person.deathDate ?? undefined,
      isLiving: person.isLiving,
      visibility: this.toSharedVisibility(person.visibility),
    };
  }

  private toEntityVisibility(value?: PersonVisibility): EntityVisibility {
    switch (value) {
      case 'restricted':
        return EntityVisibility.DIRECT;
      case 'private':
        return EntityVisibility.PRIVATE;
      default:
        return EntityVisibility.FAMILY;
    }
  }

  private toSharedVisibility(value: EntityVisibility): PersonVisibility {
    switch (value) {
      case EntityVisibility.DIRECT:
        return 'restricted';
      case EntityVisibility.PRIVATE:
        return 'private';
      default:
        return 'family';
    }
  }
}
