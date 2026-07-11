import type { PersonSummary } from '@aomlegacy/shared';

export type RelationshipType = 'parent' | 'spouse' | 'partner';

export interface TreeRelationship {
  id: string;
  familyId: string;
  type: RelationshipType;
  fromPersonId: string;
  toPersonId: string;
  startDate?: string;
}

export interface TreePerson {
  id: string;
  familyId: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  isLiving: boolean;
}

export function parentsOf(rels: TreeRelationship[], personId: string): string[] {
  return rels.filter((r) => r.type === 'parent' && r.toPersonId === personId).map((r) => r.fromPersonId);
}

export function childrenOf(rels: TreeRelationship[], personId: string): string[] {
  return rels.filter((r) => r.type === 'parent' && r.fromPersonId === personId).map((r) => r.toPersonId);
}

export function descendantsOf(rels: TreeRelationship[], personId: string): Set<string> {
  const result = new Set<string>();
  const stack = [...childrenOf(rels, personId)];
  while (stack.length) {
    const current = stack.pop()!;
    if (result.has(current)) continue;
    result.add(current);
    stack.push(...childrenOf(rels, current));
  }
  return result;
}

export function computeGenerations(
  people: TreePerson[],
  rels: TreeRelationship[],
): Map<string, number> {
  const level = new Map<string, number>();
  const visiting = new Set<string>();

  const resolve = (id: string): number => {
    if (level.has(id)) return level.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const parents = parentsOf(rels, id);
    const value = parents.length === 0 ? 0 : Math.max(...parents.map(resolve)) + 1;
    visiting.delete(id);
    level.set(id, value);
    return value;
  };

  for (const person of people) resolve(person.id);
  return level;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

const X_SPACING = 220;
const Y_SPACING = 150;

export function buildLayout(
  people: TreePerson[],
  rels: TreeRelationship[],
  collapsed: Set<string>,
): { nodes: LayoutNode[]; hidden: Set<string> } {
  const hidden = new Set<string>();
  for (const collapsedId of collapsed) {
    for (const descendant of descendantsOf(rels, collapsedId)) hidden.add(descendant);
  }

  const visible = people.filter((p) => !hidden.has(p.id));
  const generations = computeGenerations(people, rels);

  const byLevel = new Map<number, TreePerson[]>();
  for (const person of visible) {
    const lvl = generations.get(person.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(person);
  }

  const nodes: LayoutNode[] = [];
  const widest = Math.max(1, ...[...byLevel.values()].map((arr) => arr.length));
  for (const [lvl, group] of byLevel) {
    group.sort((a, b) => a.displayName.localeCompare(b.displayName));
    const rowWidth = group.length * X_SPACING;
    const offset = (widest * X_SPACING - rowWidth) / 2;
    group.forEach((person, index) => {
      nodes.push({ id: person.id, x: offset + index * X_SPACING, y: lvl * Y_SPACING });
    });
  }

  return { nodes, hidden };
}

export function toTreePeople(people: PersonSummary[]): TreePerson[] {
  return people.map((p) => {
    const person: TreePerson = {
      id: p.id,
      familyId: p.familyId,
      displayName: p.displayName,
      isLiving: p.isLiving,
    };
    if (p.birthDate !== undefined) person.birthDate = p.birthDate;
    if (p.deathDate !== undefined) person.deathDate = p.deathDate;
    return person;
  });
}
