import type { Database } from '../types';
import { listPeople, listRelationships } from './db';
import { parentsOf } from './relationships';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function gedcomName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return `${full.trim()} //`;
  const surname = parts.pop() as string;
  return `${parts.join(' ')} /${surname}/`;
}

/** ISO YYYY-MM-DD -> GEDCOM "10 DEC 1815"; falls back to the raw string. */
function gedcomDate(iso?: string): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

interface FamilyGroup {
  key: string;
  parents: string[]; // 1 or 2 person ids
  children: string[];
  marriageDate?: string;
}

function familyKey(parentIds: string[]): string {
  return [...parentIds].sort().join('|');
}

/**
 * Export one family's people + relationships as a GEDCOM 5.5.1 document.
 * Pure function (no DOM) so it can be unit-tested directly.
 */
export function exportGedcom(db: Database, familyId: string): string {
  const people = listPeople(db, familyId);
  const rels = listRelationships(db, familyId);

  // Group into GEDCOM families keyed by the set of parents.
  const groups = new Map<string, FamilyGroup>();
  const ensureGroup = (parentIds: string[]): FamilyGroup => {
    const key = familyKey(parentIds);
    let group = groups.get(key);
    if (!group) {
      group = { key, parents: [...parentIds].sort(), children: [] };
      groups.set(key, group);
    }
    return group;
  };

  // Children grouped by their full parent set.
  for (const person of people) {
    const parents = parentsOf(rels, person.id);
    if (parents.length > 0) {
      ensureGroup(parents).children.push(person.id);
    }
  }

  // Childless couples still deserve a FAM (records the marriage/partnership).
  for (const rel of rels) {
    if (rel.type === 'spouse' || rel.type === 'partner') {
      const group = ensureGroup([rel.fromPersonId, rel.toPersonId]);
      if (rel.startDate) group.marriageDate = rel.startDate;
    }
  }

  const indiXref = new Map<string, string>();
  people.forEach((p, i) => indiXref.set(p.id, `@I${i + 1}@`));

  const famList = [...groups.values()];
  const famXref = new Map<string, string>();
  famList.forEach((g, i) => famXref.set(g.key, `@F${i + 1}@`));

  // FAMS (spouse/parent) and FAMC (child) pointers per person.
  const fams = new Map<string, string[]>();
  const famc = new Map<string, string>();
  for (const group of famList) {
    const xref = famXref.get(group.key)!;
    for (const parentId of group.parents) {
      if (!fams.has(parentId)) fams.set(parentId, []);
      fams.get(parentId)!.push(xref);
    }
    for (const childId of group.children) famc.set(childId, xref);
  }

  const lines: string[] = [
    '0 HEAD',
    '1 SOUR FamilyChain',
    '1 GEDC',
    '2 VERS 5.5.1',
    '2 FORM LINEAGE-LINKED',
    '1 CHAR UTF-8',
  ];

  for (const person of people) {
    lines.push(`0 ${indiXref.get(person.id)} INDI`);
    lines.push(`1 NAME ${gedcomName(person.displayName)}`);
    const birth = gedcomDate(person.birthDate);
    if (birth) {
      lines.push('1 BIRT');
      lines.push(`2 DATE ${birth}`);
    }
    const death = gedcomDate(person.deathDate);
    if (death || !person.isLiving) {
      lines.push('1 DEAT');
      if (death) lines.push(`2 DATE ${death}`);
    }
    for (const famXrefId of fams.get(person.id) ?? []) lines.push(`1 FAMS ${famXrefId}`);
    const childXref = famc.get(person.id);
    if (childXref) lines.push(`1 FAMC ${childXref}`);
  }

  for (const group of famList) {
    lines.push(`0 ${famXref.get(group.key)} FAM`);
    const [husb, wife] = group.parents;
    if (husb && indiXref.has(husb)) lines.push(`1 HUSB ${indiXref.get(husb)}`);
    if (wife && indiXref.has(wife)) lines.push(`1 WIFE ${indiXref.get(wife)}`);
    for (const childId of group.children) {
      if (indiXref.has(childId)) lines.push(`1 CHIL ${indiXref.get(childId)}`);
    }
    const marr = gedcomDate(group.marriageDate);
    if (marr) {
      lines.push('1 MARR');
      lines.push(`2 DATE ${marr}`);
    }
  }

  lines.push('0 TRLR');
  return lines.join('\n') + '\n';
}
