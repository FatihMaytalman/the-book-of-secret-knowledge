import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PersonSummary, PersonVisibility } from '@aomlegacy/shared';
import {
  FamilyEntity,
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
    private readonly auditService: AuditService,
  ) {}

  async listPeople(familyId?: string): Promise<PersonSummary[]> {
    const people = await this.personRepository.find({
      where: familyId ? { familyId } : {},
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

  async getPerson(id: string): Promise<PersonSummary> {
    const person = await this.personRepository.findOne({ where: { id } });

    if (!person) {
      throw new NotFoundException(`Person not found: ${id}`);
    }

    const primaryNames = await this.loadPrimaryNames([person.id]);

    return this.toSummary(person, primaryNames.get(person.id));
  }

  async createPerson(dto: CreatePersonDto): Promise<PersonSummary> {
    const familyExists = await this.familyRepository.exists({
      where: { id: dto.familyId },
    });

    if (!familyExists) {
      throw new NotFoundException(`Family not found: ${dto.familyId}`);
    }

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
      action: 'person.created',
      resourceType: 'person',
      resourceId: person.id,
      metadata: { displayName },
    });

    return this.getPerson(person.id);
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
