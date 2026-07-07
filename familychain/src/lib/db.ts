import type {
  Account,
  ApproxDate,
  Database,
  Family,
  Invite,
  LifeEvent,
  LifeEventType,
  Membership,
  Person,
  Relationship,
  RelationshipType,
  Role,
} from '../types';
import { compareApproxDate } from './date';
import { newId, newInviteCode } from './ids';
import {
  assignableRoles,
  canActOnMember,
  canDeleteFamily,
  canEditData,
  canInvite,
  canTransferOwnership,
} from './permissions';

export class PermissionError extends Error {
  constructor(message = 'You do not have permission to do that.') {
    super(message);
    this.name = 'PermissionError';
  }
}

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataError';
  }
}

const clone = (db: Database): Database => ({
  ...db,
  accounts: [...db.accounts],
  families: [...db.families],
  memberships: [...db.memberships],
  invites: [...db.invites],
  people: [...db.people],
  events: [...db.events],
  relationships: [...db.relationships],
});

const now = () => new Date().toISOString();

// ---- Accounts & session ----

export function createAccount(
  db: Database,
  displayName: string,
): { db: Database; account: Account } {
  const name = displayName.trim();
  if (name.length < 1) throw new DataError('Name is required.');
  const account: Account = { id: newId(), displayName: name, createdAt: now() };
  const next = clone(db);
  next.accounts.push(account);
  return { db: next, account };
}

// ---- Membership helpers ----

export function membershipFor(
  db: Database,
  familyId: string,
  accountId: string,
): Membership | undefined {
  return db.memberships.find(
    (m) => m.familyId === familyId && m.accountId === accountId,
  );
}

export function roleFor(
  db: Database,
  familyId: string,
  accountId: string,
): Role | undefined {
  return membershipFor(db, familyId, accountId)?.role;
}

function requireRole(db: Database, familyId: string, accountId: string): Role {
  const role = roleFor(db, familyId, accountId);
  if (!role) throw new PermissionError('You are not a member of this family.');
  return role;
}

export function listMyFamilies(db: Database, accountId: string): Family[] {
  const myFamilyIds = new Set(
    db.memberships.filter((m) => m.accountId === accountId).map((m) => m.familyId),
  );
  return db.families
    .filter((f) => myFamilyIds.has(f.id))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function listMembers(db: Database, familyId: string): Membership[] {
  const order: Record<Role, number> = { owner: 0, admin: 1, editor: 2, viewer: 3 };
  return db.memberships
    .filter((m) => m.familyId === familyId)
    .sort((a, b) => order[a.role] - order[b.role] || a.createdAt.localeCompare(b.createdAt));
}

// ---- Families ----

export function createFamily(
  db: Database,
  actorId: string,
  name: string,
): { db: Database; family: Family } {
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new DataError('Family name must be at least 2 characters.');
  const family: Family = { id: newId(), name: trimmed, createdAt: now() };
  const membership: Membership = {
    id: newId(),
    familyId: family.id,
    accountId: actorId,
    role: 'owner',
    createdAt: now(),
  };
  const next = clone(db);
  next.families.push(family);
  next.memberships.push(membership);
  return { db: next, family };
}

export function deleteFamily(db: Database, actorId: string, familyId: string): Database {
  const role = requireRole(db, familyId, actorId);
  if (!canDeleteFamily(role)) throw new PermissionError('Only the owner can delete a family.');
  const next = clone(db);
  next.families = next.families.filter((f) => f.id !== familyId);
  next.memberships = next.memberships.filter((m) => m.familyId !== familyId);
  next.invites = next.invites.filter((i) => i.familyId !== familyId);
  next.people = next.people.filter((p) => p.familyId !== familyId);
  next.events = next.events.filter((e) => e.familyId !== familyId);
  next.relationships = next.relationships.filter((r) => r.familyId !== familyId);
  return next;
}

// ---- Invites ----

export function createInvite(
  db: Database,
  actorId: string,
  familyId: string,
  role: Role,
  label: string,
): { db: Database; invite: Invite } {
  const actorRole = requireRole(db, familyId, actorId);
  if (!canInvite(actorRole)) throw new PermissionError('You cannot invite members.');
  if (!assignableRoles(actorRole).includes(role)) {
    throw new PermissionError(`You cannot invite someone as ${role}.`);
  }
  const invite: Invite = {
    id: newId(),
    familyId,
    code: newInviteCode(),
    role,
    label: label.trim() || 'Relative',
    createdByAccountId: actorId,
    createdAt: now(),
    status: 'pending',
  };
  const next = clone(db);
  next.invites.push(invite);
  return { db: next, invite };
}

export function revokeInvite(
  db: Database,
  actorId: string,
  familyId: string,
  inviteId: string,
): Database {
  const actorRole = requireRole(db, familyId, actorId);
  if (!canInvite(actorRole)) throw new PermissionError('You cannot manage invites.');
  const next = clone(db);
  next.invites = next.invites.map((i) =>
    i.id === inviteId && i.familyId === familyId && i.status === 'pending'
      ? { ...i, status: 'revoked' as const }
      : i,
  );
  return next;
}

export function findInviteByCode(db: Database, code: string): Invite | undefined {
  const normalized = code.trim().toUpperCase();
  return db.invites.find((i) => i.code.toUpperCase() === normalized);
}

export function acceptInvite(
  db: Database,
  accountId: string,
  code: string,
): { db: Database; familyId: string } {
  const invite = findInviteByCode(db, code);
  if (!invite) throw new DataError('That invite code was not found.');
  if (invite.status === 'revoked') throw new DataError('That invite has been revoked.');
  if (invite.status === 'accepted') throw new DataError('That invite has already been used.');
  if (membershipFor(db, invite.familyId, accountId)) {
    throw new DataError('You are already a member of this family.');
  }
  const next = clone(db);
  next.memberships.push({
    id: newId(),
    familyId: invite.familyId,
    accountId,
    role: invite.role,
    createdAt: now(),
  });
  next.invites = next.invites.map((i) =>
    i.id === invite.id
      ? { ...i, status: 'accepted' as const, acceptedByAccountId: accountId, acceptedAt: now() }
      : i,
  );
  return { db: next, familyId: invite.familyId };
}

// ---- Members ----

export function changeMemberRole(
  db: Database,
  actorId: string,
  familyId: string,
  membershipId: string,
  nextRole: Role,
): Database {
  const actorRole = requireRole(db, familyId, actorId);
  const target = db.memberships.find((m) => m.id === membershipId && m.familyId === familyId);
  if (!target) throw new DataError('Member not found.');
  if (!canActOnMember(actorRole, target.role, nextRole)) {
    throw new PermissionError('You cannot change this member to that role.');
  }
  const next = clone(db);
  next.memberships = next.memberships.map((m) =>
    m.id === membershipId ? { ...m, role: nextRole } : m,
  );
  return next;
}

export function removeMember(
  db: Database,
  actorId: string,
  familyId: string,
  membershipId: string,
): Database {
  const actorRole = requireRole(db, familyId, actorId);
  const target = db.memberships.find((m) => m.id === membershipId && m.familyId === familyId);
  if (!target) throw new DataError('Member not found.');
  if (!canActOnMember(actorRole, target.role)) {
    throw new PermissionError('You cannot remove this member.');
  }
  const next = clone(db);
  next.memberships = next.memberships.filter((m) => m.id !== membershipId);
  return next;
}

export function transferOwnership(
  db: Database,
  actorId: string,
  familyId: string,
  targetAccountId: string,
): Database {
  const actorRole = requireRole(db, familyId, actorId);
  if (!canTransferOwnership(actorRole)) throw new PermissionError('Only the owner can transfer ownership.');
  const target = membershipFor(db, familyId, targetAccountId);
  if (!target) throw new DataError('That member is not part of this family.');
  const actorMembership = membershipFor(db, familyId, actorId)!;
  const next = clone(db);
  next.memberships = next.memberships.map((m) => {
    if (m.id === target.id) return { ...m, role: 'owner' as const };
    if (m.id === actorMembership.id) return { ...m, role: 'admin' as const };
    return m;
  });
  return next;
}

// ---- People ----

export function listPeople(db: Database, familyId: string): Person[] {
  return db.people
    .filter((p) => p.familyId === familyId)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function requireEditor(db: Database, familyId: string, actorId: string): void {
  const role = requireRole(db, familyId, actorId);
  if (!canEditData(role)) throw new PermissionError('You have read-only access.');
}

export interface PersonInput {
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  isLiving?: boolean;
  visibility?: Person['visibility'];
  biography?: string;
}

export function createPerson(
  db: Database,
  actorId: string,
  familyId: string,
  input: PersonInput,
): { db: Database; person: Person } {
  requireEditor(db, familyId, actorId);
  const displayName = input.displayName.trim();
  if (!displayName) throw new DataError('A name is required.');
  const person: Person = {
    id: newId(),
    familyId,
    displayName,
    birthDate: input.birthDate || undefined,
    deathDate: input.deathDate || undefined,
    isLiving: input.isLiving ?? !input.deathDate,
    visibility: input.visibility ?? 'family',
    biography: input.biography || undefined,
    createdAt: now(),
  };
  const next = clone(db);
  next.people.push(person);
  return { db: next, person };
}

export function updatePerson(
  db: Database,
  actorId: string,
  familyId: string,
  personId: string,
  input: PersonInput,
): Database {
  requireEditor(db, familyId, actorId);
  const next = clone(db);
  next.people = next.people.map((p) =>
    p.id === personId && p.familyId === familyId
      ? {
          ...p,
          displayName: input.displayName.trim() || p.displayName,
          birthDate: input.birthDate || undefined,
          deathDate: input.deathDate || undefined,
          isLiving: input.isLiving ?? !input.deathDate,
          visibility: input.visibility ?? p.visibility,
          biography: input.biography || undefined,
        }
      : p,
  );
  return next;
}

export function deletePerson(
  db: Database,
  actorId: string,
  familyId: string,
  personId: string,
): Database {
  requireEditor(db, familyId, actorId);
  const next = clone(db);
  next.people = next.people.filter((p) => p.id !== personId);
  next.events = next.events.map((e) => ({
    ...e,
    personIds: e.personIds.filter((id) => id !== personId),
  }));
  next.relationships = next.relationships.filter(
    (r) => r.fromPersonId !== personId && r.toPersonId !== personId,
  );
  return next;
}

// ---- Life events ----

export interface EventInput {
  type: LifeEventType;
  title: string;
  date: ApproxDate;
  description?: string;
  location?: string;
  personIds: string[];
  photo?: string;
}

function validateEvent(input: EventInput): void {
  if (!input.title.trim()) throw new DataError('An event title is required.');
  if (!Number.isInteger(input.date.year) || input.date.year < 1 || input.date.year > 9999) {
    throw new DataError('A valid year is required.');
  }
}

export function listEvents(db: Database, familyId: string): LifeEvent[] {
  return db.events
    .filter((e) => e.familyId === familyId)
    .sort((a, b) => compareApproxDate(a.date, b.date) || a.createdAt.localeCompare(b.createdAt));
}

export function listEventsForPerson(
  db: Database,
  familyId: string,
  personId: string,
): LifeEvent[] {
  return listEvents(db, familyId).filter((e) => e.personIds.includes(personId));
}

export function createEvent(
  db: Database,
  actorId: string,
  familyId: string,
  input: EventInput,
): { db: Database; event: LifeEvent } {
  requireEditor(db, familyId, actorId);
  validateEvent(input);
  const event: LifeEvent = {
    id: newId(),
    familyId,
    type: input.type,
    title: input.title.trim(),
    date: input.date,
    description: input.description?.trim() || undefined,
    location: input.location?.trim() || undefined,
    personIds: input.personIds,
    photo: input.photo,
    createdAt: now(),
  };
  const next = clone(db);
  next.events.push(event);
  return { db: next, event };
}

export function updateEvent(
  db: Database,
  actorId: string,
  familyId: string,
  eventId: string,
  input: EventInput,
): Database {
  requireEditor(db, familyId, actorId);
  validateEvent(input);
  const next = clone(db);
  next.events = next.events.map((e) =>
    e.id === eventId && e.familyId === familyId
      ? {
          ...e,
          type: input.type,
          title: input.title.trim(),
          date: input.date,
          description: input.description?.trim() || undefined,
          location: input.location?.trim() || undefined,
          personIds: input.personIds,
          photo: input.photo,
        }
      : e,
  );
  return next;
}

export function deleteEvent(
  db: Database,
  actorId: string,
  familyId: string,
  eventId: string,
): Database {
  requireEditor(db, familyId, actorId);
  const next = clone(db);
  next.events = next.events.filter((e) => e.id !== eventId);
  return next;
}

// ---- Relationships ----

export interface RelationshipInput {
  type: RelationshipType;
  fromPersonId: string;
  toPersonId: string;
  startDate?: string;
  endDate?: string;
}

export function listRelationships(db: Database, familyId: string): Relationship[] {
  return db.relationships.filter((r) => r.familyId === familyId);
}

/** True if `ancestorId` is an ancestor of `personId` via parent edges. */
function isAncestor(
  relationships: Relationship[],
  ancestorId: string,
  personId: string,
): boolean {
  const parentsOf = (childId: string) =>
    relationships
      .filter((r) => r.type === 'parent' && r.toPersonId === childId)
      .map((r) => r.fromPersonId);
  const stack = [...parentsOf(personId)];
  const seen = new Set<string>();
  while (stack.length) {
    const current = stack.pop()!;
    if (current === ancestorId) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...parentsOf(current));
  }
  return false;
}

export function createRelationship(
  db: Database,
  actorId: string,
  familyId: string,
  input: RelationshipInput,
): { db: Database; relationship: Relationship } {
  requireEditor(db, familyId, actorId);
  if (input.fromPersonId === input.toPersonId) {
    throw new DataError('A person cannot be related to themselves.');
  }
  const familyRels = listRelationships(db, familyId);

  const isDuplicate = familyRels.some((r) => {
    if (r.type !== input.type) return false;
    if (input.type === 'parent') {
      return r.fromPersonId === input.fromPersonId && r.toPersonId === input.toPersonId;
    }
    // spouse/partner are undirected
    const a = new Set([r.fromPersonId, r.toPersonId]);
    return a.has(input.fromPersonId) && a.has(input.toPersonId);
  });
  if (isDuplicate) throw new DataError('That relationship already exists.');

  if (input.type === 'parent') {
    // parent = from, child = to. Prevent cycles.
    if (isAncestor(familyRels, input.toPersonId, input.fromPersonId)) {
      throw new DataError('That would create an impossible ancestry loop.');
    }
  }

  const relationship: Relationship = {
    id: newId(),
    familyId,
    type: input.type,
    fromPersonId: input.fromPersonId,
    toPersonId: input.toPersonId,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    createdAt: now(),
  };
  const next = clone(db);
  next.relationships.push(relationship);
  return { db: next, relationship };
}

export function deleteRelationship(
  db: Database,
  actorId: string,
  familyId: string,
  relationshipId: string,
): Database {
  requireEditor(db, familyId, actorId);
  const next = clone(db);
  next.relationships = next.relationships.filter((r) => r.id !== relationshipId);
  return next;
}
