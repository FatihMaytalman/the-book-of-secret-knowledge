import type { PersonSummary } from '@aomlegacy/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PeopleService {
  private readonly people: PersonSummary[] = [
    {
      id: 'person-founder',
      familyId: 'family-aom',
      displayName: 'Fatih Maytalman',
      isLiving: true,
      visibility: 'family',
    },
    {
      id: 'person-grandparent',
      familyId: 'family-aom',
      displayName: 'Grandparent Profile',
      isLiving: false,
      visibility: 'family',
    },
  ];

  listPeople(): PersonSummary[] {
    return this.people;
  }

  getPerson(id: string): PersonSummary | undefined {
    return this.people.find((person) => person.id === id);
  }
}
