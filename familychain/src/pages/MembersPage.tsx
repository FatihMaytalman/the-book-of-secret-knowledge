import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listMembers } from '../lib/db';
import {
  assignableRoles,
  canActOnMember,
  canInvite,
  canTransferOwnership,
  ROLE_LABEL,
} from '../lib/permissions';
import type { Role } from '../types';
import { Button, Card, EmptyState, Field, RoleBadge, Select } from '../components/ui';

export function MembersPage() {
  const { familyId = '' } = useParams();
  const {
    db,
    currentAccount,
    myRole,
    createInvite,
    revokeInvite,
    changeMemberRole,
    removeMember,
    transferOwnership,
  } = useApp();

  const role = myRole(familyId);
  const members = useMemo(() => listMembers(db, familyId), [db, familyId]);
  const pendingInvites = useMemo(
    () => db.invites.filter((i) => i.familyId === familyId && i.status === 'pending'),
    [db.invites, familyId],
  );

  const grantable = role ? assignableRoles(role) : [];
  const [inviteRole, setInviteRole] = useState<Role>(grantable[grantable.length - 1] ?? 'viewer');
  const [inviteLabel, setInviteLabel] = useState('');

  if (!role || !currentAccount) return null;

  const accountName = (accountId: string) =>
    db.accounts.find((a) => a.id === accountId)?.displayName ?? 'Unknown';

  return (
    <div className="stack">
      {canInvite(role) ? (
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Invite a relative</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            Generates a shareable code. On this device, switch to another account and paste the
            code on the Families screen to join.
          </p>
          <form
            className="row row-wrap"
            style={{ alignItems: 'flex-end' }}
            onSubmit={(e) => {
              e.preventDefault();
              createInvite(familyId, inviteRole, inviteLabel);
              setInviteLabel('');
            }}
          >
            <Field label="Who is this for?">
              <input
                className="input"
                placeholder="e.g. Cousin Kemal"
                value={inviteLabel}
                onChange={(e) => setInviteLabel(e.target.value)}
              />
            </Field>
            <Field label="Role">
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)}>
                {grantable.map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </Select>
            </Field>
            <Button type="submit">Generate invite</Button>
          </form>
        </Card>
      ) : null}

      {pendingInvites.length > 0 ? (
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Pending invites</h3>
          <div className="stack" style={{ gap: 8 }}>
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="row between row-wrap card" style={{ padding: 12 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="code-chip">{invite.code}</span>
                  <RoleBadge role={invite.role} />
                  <span className="muted">{invite.label}</span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void navigator.clipboard?.writeText(invite.code);
                    }}
                  >
                    Copy code
                  </Button>
                  {canInvite(role) ? (
                    <Button size="sm" variant="ghost" onClick={() => revokeInvite(familyId, invite.id)}>
                      Revoke
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="stack">
        <h3 style={{ margin: 0 }}>Members</h3>
        {members.length === 0 ? (
          <EmptyState icon="👥" title="No members yet" />
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {members.map((member) => {
              const isSelf = member.accountId === currentAccount.id;
              const canEditRole = canActOnMember(role, member.role);
              return (
                <div key={member.id} className="row between row-wrap card" style={{ padding: 12 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <strong>{accountName(member.accountId)}</strong>
                    {isSelf ? <span className="muted">(you)</span> : null}
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="row row-wrap" style={{ gap: 8 }}>
                    {canEditRole ? (
                      <Select
                        aria-label={`Change role for ${accountName(member.accountId)}`}
                        value={member.role}
                        onChange={(e) =>
                          changeMemberRole(familyId, member.id, e.target.value as Role)
                        }
                        style={{ width: 'auto' }}
                      >
                        {[member.role, ...assignableRoles(role)]
                          .filter((r, i, arr) => arr.indexOf(r) === i)
                          .map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                      </Select>
                    ) : null}
                    {canTransferOwnership(role) && !isSelf && member.role !== 'owner' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Transfer ownership to ${accountName(member.accountId)}? You will become an admin.`,
                            )
                          ) {
                            transferOwnership(familyId, member.accountId);
                          }
                        }}
                      >
                        Make owner
                      </Button>
                    ) : null}
                    {canEditRole ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Remove ${accountName(member.accountId)} from this family?`)) {
                            removeMember(familyId, member.id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
