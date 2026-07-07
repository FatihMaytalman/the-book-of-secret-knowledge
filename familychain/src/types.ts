export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export type PersonVisibility = 'family' | 'restricted' | 'private';

export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface Account {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  familyId: string;
  accountId: string;
  role: Role;
  createdAt: string;
}

export interface Invite {
  id: string;
  familyId: string;
  code: string;
  role: Role;
  label: string;
  createdByAccountId: string;
  createdAt: string;
  status: InviteStatus;
  acceptedByAccountId?: string;
  acceptedAt?: string;
}

export interface Person {
  id: string;
  familyId: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  isLiving: boolean;
  visibility: PersonVisibility;
  biography?: string;
  createdAt: string;
}

export type LifeEventType =
  | 'birth'
  | 'marriage'
  | 'divorce'
  | 'graduation'
  | 'career'
  | 'relocation'
  | 'achievement'
  | 'death'
  | 'custom';

/** Approximate date: year required, month/day optional (year-only allowed). */
export interface ApproxDate {
  year: number;
  month?: number;
  day?: number;
  approximate?: boolean;
}

export interface LifeEvent {
  id: string;
  familyId: string;
  type: LifeEventType;
  title: string;
  date: ApproxDate;
  description?: string;
  location?: string;
  personIds: string[];
  photo?: string; // base64 data URL
  createdAt: string;
}

export type RelationshipType = 'parent' | 'spouse' | 'partner' | 'sibling';

export interface Relationship {
  id: string;
  familyId: string;
  type: RelationshipType;
  // For parent: from = parent, to = child. For spouse/partner/sibling: undirected pair.
  fromPersonId: string;
  toPersonId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Database {
  version: number;
  accounts: Account[];
  families: Family[];
  memberships: Membership[];
  invites: Invite[];
  people: Person[];
  events: LifeEvent[];
  relationships: Relationship[];
}
