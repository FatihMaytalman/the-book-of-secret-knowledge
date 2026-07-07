import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Account,
  Database,
  Family,
  LifeEvent,
  Person,
  Relationship,
  Role,
} from '../types';
import * as db from '../lib/db';
import {
  loadDb,
  loadSession,
  saveDb,
  saveSession,
} from '../lib/storage';
import { roleFor } from '../lib/db';
import { useToast } from './ToastContext';
import type { EventInput, PersonInput, RelationshipInput } from '../lib/db';

interface AppContextValue {
  db: Database;
  currentAccount: Account | null;
  // account/session
  createAccount: (displayName: string) => Account;
  switchAccount: (accountId: string) => void;
  signOut: () => void;
  // families
  createFamily: (name: string) => Family | null;
  deleteFamily: (familyId: string) => void;
  // invites
  createInvite: (familyId: string, role: Role, label: string) => void;
  revokeInvite: (familyId: string, inviteId: string) => void;
  acceptInvite: (code: string) => string | null;
  // members
  changeMemberRole: (familyId: string, membershipId: string, nextRole: Role) => void;
  removeMember: (familyId: string, membershipId: string) => void;
  transferOwnership: (familyId: string, targetAccountId: string) => void;
  // people
  createPerson: (familyId: string, input: PersonInput) => Person | null;
  updatePerson: (familyId: string, personId: string, input: PersonInput) => void;
  deletePerson: (familyId: string, personId: string) => void;
  // events
  createEvent: (familyId: string, input: EventInput) => LifeEvent | null;
  updateEvent: (familyId: string, eventId: string, input: EventInput) => void;
  deleteEvent: (familyId: string, eventId: string) => void;
  // relationships
  createRelationship: (familyId: string, input: RelationshipInput) => Relationship | null;
  deleteRelationship: (familyId: string, relationshipId: string) => void;
  // helpers
  myRole: (familyId: string) => Role | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [database, setDatabase] = useState<Database>(() => loadDb());
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(() => loadSession());

  useEffect(() => {
    try {
      saveDb(database);
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'QuotaExceededError'
          ? 'Local storage is full — remove some photos or data to save changes.'
          : 'Could not save to local storage.';
      toast(message, 'error');
    }
  }, [database, toast]);

  useEffect(() => {
    saveSession(currentAccountId);
  }, [currentAccountId]);

  const currentAccount = useMemo(
    () => database.accounts.find((a) => a.id === currentAccountId) ?? null,
    [database.accounts, currentAccountId],
  );

  const withError = useCallback(
    <T,>(fn: () => T, successMessage?: string): T | null => {
      try {
        const result = fn();
        if (successMessage) toast(successMessage, 'success');
        return result;
      } catch (error) {
        toast((error as Error).message, 'error');
        return null;
      }
    },
    [toast],
  );

  const requireAccount = useCallback((): string => {
    if (!currentAccountId) throw new db.DataError('You need to be signed in.');
    return currentAccountId;
  }, [currentAccountId]);

  const createAccount = useCallback(
    (displayName: string): Account => {
      const { db: next, account } = db.createAccount(database, displayName);
      setDatabase(next);
      setCurrentAccountId(account.id);
      toast(`Welcome, ${account.displayName}`, 'success');
      return account;
    },
    [database, toast],
  );

  const switchAccount = useCallback(
    (accountId: string) => {
      setCurrentAccountId(accountId);
      const account = database.accounts.find((a) => a.id === accountId);
      if (account) toast(`Switched to ${account.displayName}`, 'info');
    },
    [database.accounts, toast],
  );

  const signOut = useCallback(() => setCurrentAccountId(null), []);

  const createFamily = useCallback(
    (name: string): Family | null =>
      withError(() => {
        const actorId = requireAccount();
        const { db: next, family } = db.createFamily(database, actorId, name);
        setDatabase(next);
        return family;
      }, 'Family created'),
    [database, requireAccount, withError],
  );

  const deleteFamily = useCallback(
    (familyId: string) =>
      withError(() => {
        setDatabase(db.deleteFamily(database, requireAccount(), familyId));
      }, 'Family deleted'),
    [database, requireAccount, withError],
  );

  const createInvite = useCallback(
    (familyId: string, role: Role, label: string) =>
      withError(() => {
        const { db: next } = db.createInvite(database, requireAccount(), familyId, role, label);
        setDatabase(next);
      }, 'Invite created'),
    [database, requireAccount, withError],
  );

  const revokeInvite = useCallback(
    (familyId: string, inviteId: string) =>
      withError(() => {
        setDatabase(db.revokeInvite(database, requireAccount(), familyId, inviteId));
      }, 'Invite revoked'),
    [database, requireAccount, withError],
  );

  const acceptInvite = useCallback(
    (code: string): string | null =>
      withError(() => {
        const { db: next, familyId } = db.acceptInvite(database, requireAccount(), code);
        setDatabase(next);
        return familyId;
      }, 'Invite accepted — you have joined the family'),
    [database, requireAccount, withError],
  );

  const changeMemberRole = useCallback(
    (familyId: string, membershipId: string, nextRole: Role) =>
      withError(() => {
        setDatabase(db.changeMemberRole(database, requireAccount(), familyId, membershipId, nextRole));
      }, 'Role updated'),
    [database, requireAccount, withError],
  );

  const removeMember = useCallback(
    (familyId: string, membershipId: string) =>
      withError(() => {
        setDatabase(db.removeMember(database, requireAccount(), familyId, membershipId));
      }, 'Member removed'),
    [database, requireAccount, withError],
  );

  const transferOwnership = useCallback(
    (familyId: string, targetAccountId: string) =>
      withError(() => {
        setDatabase(db.transferOwnership(database, requireAccount(), familyId, targetAccountId));
      }, 'Ownership transferred'),
    [database, requireAccount, withError],
  );

  const createPerson = useCallback(
    (familyId: string, input: PersonInput): Person | null =>
      withError(() => {
        const { db: next, person } = db.createPerson(database, requireAccount(), familyId, input);
        setDatabase(next);
        return person;
      }, 'Person added'),
    [database, requireAccount, withError],
  );

  const updatePerson = useCallback(
    (familyId: string, personId: string, input: PersonInput) =>
      withError(() => {
        setDatabase(db.updatePerson(database, requireAccount(), familyId, personId, input));
      }, 'Person updated'),
    [database, requireAccount, withError],
  );

  const deletePerson = useCallback(
    (familyId: string, personId: string) =>
      withError(() => {
        setDatabase(db.deletePerson(database, requireAccount(), familyId, personId));
      }, 'Person deleted'),
    [database, requireAccount, withError],
  );

  const createEvent = useCallback(
    (familyId: string, input: EventInput): LifeEvent | null =>
      withError(() => {
        const { db: next, event } = db.createEvent(database, requireAccount(), familyId, input);
        setDatabase(next);
        return event;
      }, 'Event added'),
    [database, requireAccount, withError],
  );

  const updateEvent = useCallback(
    (familyId: string, eventId: string, input: EventInput) =>
      withError(() => {
        setDatabase(db.updateEvent(database, requireAccount(), familyId, eventId, input));
      }, 'Event updated'),
    [database, requireAccount, withError],
  );

  const deleteEvent = useCallback(
    (familyId: string, eventId: string) =>
      withError(() => {
        setDatabase(db.deleteEvent(database, requireAccount(), familyId, eventId));
      }, 'Event deleted'),
    [database, requireAccount, withError],
  );

  const createRelationship = useCallback(
    (familyId: string, input: RelationshipInput): Relationship | null =>
      withError(() => {
        const { db: next, relationship } = db.createRelationship(
          database,
          requireAccount(),
          familyId,
          input,
        );
        setDatabase(next);
        return relationship;
      }, 'Relationship added'),
    [database, requireAccount, withError],
  );

  const deleteRelationship = useCallback(
    (familyId: string, relationshipId: string) =>
      withError(() => {
        setDatabase(db.deleteRelationship(database, requireAccount(), familyId, relationshipId));
      }, 'Relationship removed'),
    [database, requireAccount, withError],
  );

  const myRole = useCallback(
    (familyId: string): Role | undefined =>
      currentAccountId ? roleFor(database, familyId, currentAccountId) : undefined,
    [database, currentAccountId],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      db: database,
      currentAccount,
      createAccount,
      switchAccount,
      signOut,
      createFamily,
      deleteFamily,
      createInvite,
      revokeInvite,
      acceptInvite,
      changeMemberRole,
      removeMember,
      transferOwnership,
      createPerson,
      updatePerson,
      deletePerson,
      createEvent,
      updateEvent,
      deleteEvent,
      createRelationship,
      deleteRelationship,
      myRole,
    }),
    [
      database,
      currentAccount,
      createAccount,
      switchAccount,
      signOut,
      createFamily,
      deleteFamily,
      createInvite,
      revokeInvite,
      acceptInvite,
      changeMemberRole,
      removeMember,
      transferOwnership,
      createPerson,
      updatePerson,
      deletePerson,
      createEvent,
      updateEvent,
      deleteEvent,
      createRelationship,
      deleteRelationship,
      myRole,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
