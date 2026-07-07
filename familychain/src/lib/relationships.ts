import type { Person, Relationship } from '../types';

export function parentsOf(rels: Relationship[], personId: string): string[] {
  return rels.filter((r) => r.type === 'parent' && r.toPersonId === personId).map((r) => r.fromPersonId);
}

export function childrenOf(rels: Relationship[], personId: string): string[] {
  return rels.filter((r) => r.type === 'parent' && r.fromPersonId === personId).map((r) => r.toPersonId);
}

export function partnersOf(rels: Relationship[], personId: string): string[] {
  return rels
    .filter((r) => (r.type === 'spouse' || r.type === 'partner') && (r.fromPersonId === personId || r.toPersonId === personId))
    .map((r) => (r.fromPersonId === personId ? r.toPersonId : r.fromPersonId));
}

/** Siblings are derived: people who share at least one parent. */
export function deriveSiblings(rels: Relationship[], personId: string): string[] {
  const myParents = new Set(parentsOf(rels, personId));
  if (myParents.size === 0) return [];
  const siblings = new Set<string>();
  for (const parent of myParents) {
    for (const child of childrenOf(rels, parent)) {
      if (child !== personId) siblings.add(child);
    }
  }
  return [...siblings];
}

/** Longest-parent-chain generation level for each person (roots at 0). */
export function computeGenerations(
  people: Person[],
  rels: Relationship[],
): Map<string, number> {
  const level = new Map<string, number>();
  const visiting = new Set<string>();

  const resolve = (id: string): number => {
    if (level.has(id)) return level.get(id)!;
    if (visiting.has(id)) return 0; // guard against any residual cycle
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

/** Ids of all descendants (via parent edges) of a person. */
export function descendantsOf(rels: Relationship[], personId: string): Set<string> {
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

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

export interface TreeLayout {
  nodes: LayoutNode[];
  hidden: Set<string>;
}

const X_SPACING = 220;
const Y_SPACING = 150;

export function buildLayout(
  people: Person[],
  rels: Relationship[],
  collapsed: Set<string>,
): TreeLayout {
  const hidden = new Set<string>();
  for (const collapsedId of collapsed) {
    for (const descendant of descendantsOf(rels, collapsedId)) hidden.add(descendant);
  }

  const visible = people.filter((p) => !hidden.has(p.id));
  const generations = computeGenerations(people, rels);

  const byLevel = new Map<number, Person[]>();
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
