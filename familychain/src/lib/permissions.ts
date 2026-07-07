import type { Role } from '../types';

export const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner: 'Full control, including transferring ownership and deleting the family.',
  admin: 'Manage members below admin and edit all data.',
  editor: 'Add and edit people, events, and relationships.',
  viewer: 'Read-only access.',
};

/** Roles an inviter/assigner of `actorRole` is allowed to grant (strictly below their own rank). */
export function assignableRoles(actorRole: Role): Role[] {
  return (Object.keys(ROLE_RANK) as Role[]).filter(
    (role) => ROLE_RANK[role] < ROLE_RANK[actorRole],
  );
}

export const canViewData = (role: Role): boolean => ROLE_RANK[role] >= ROLE_RANK.viewer;

export const canEditData = (role: Role): boolean => ROLE_RANK[role] >= ROLE_RANK.editor;

export const canManageMembers = (role: Role): boolean => ROLE_RANK[role] >= ROLE_RANK.admin;

export const canInvite = (role: Role): boolean => ROLE_RANK[role] >= ROLE_RANK.admin;

/**
 * Whether an actor can act on (change role / remove) a target member.
 * You must be admin+, outrank the target's current role, and outrank the desired new role.
 * Owner is never a valid target (ownership is transferred explicitly).
 */
export function canActOnMember(
  actorRole: Role,
  targetRole: Role,
  nextRole?: Role,
): boolean {
  if (!canManageMembers(actorRole)) return false;
  if (targetRole === 'owner') return false;
  if (ROLE_RANK[actorRole] <= ROLE_RANK[targetRole]) return false;
  if (nextRole && ROLE_RANK[actorRole] <= ROLE_RANK[nextRole]) return false;
  return true;
}

export const canTransferOwnership = (role: Role): boolean => role === 'owner';
export const canDeleteFamily = (role: Role): boolean => role === 'owner';
