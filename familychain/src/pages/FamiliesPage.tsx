import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listMembers, listMyFamilies } from '../lib/db';
import { Button, Card, EmptyState, RoleBadge, Skeleton } from '../components/ui';

export function FamiliesPage() {
  const { db, currentAccount, createFamily, acceptInvite, myRole } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 280);
    return () => window.clearTimeout(id);
  }, []);

  const families = useMemo(
    () => (currentAccount ? listMyFamilies(db, currentAccount.id) : []),
    [db, currentAccount],
  );

  if (!currentAccount) return null;

  return (
    <div className="container stack">
      <div>
        <p className="eyebrow">Your workspaces</p>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Families</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Private family workspaces stored on this device. Create one, or join with an invite code.
        </p>
      </div>

      <div className="grid grid-2">
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Create a family</h3>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              const created = createFamily(name);
              if (created) {
                setName('');
                navigate(`/family/${created.id}`);
              }
            }}
          >
            <input
              className="input"
              placeholder="e.g. Lovelace Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={name.trim().length < 2}>Create</Button>
          </form>
        </Card>

        <Card className="stack">
          <h3 style={{ margin: 0 }}>Join with an invite code</h3>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              const familyId = acceptInvite(code);
              if (familyId) {
                setCode('');
                navigate(`/family/${familyId}`);
              }
            }}
          >
            <input
              className="input code-chip"
              placeholder="FAM-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ textTransform: 'uppercase' }}
            />
            <Button type="submit" variant="secondary" disabled={code.trim().length < 6}>Join</Button>
          </form>
        </Card>
      </div>

      {!ready ? (
        <div className="grid grid-2">
          <Skeleton />
          <Skeleton />
        </div>
      ) : families.length === 0 ? (
        <EmptyState
          icon="🌳"
          title="No families yet"
          description="Create your first family workspace above to start building your tree."
        />
      ) : (
        <div className="grid grid-2">
          {families.map((family) => {
            const members = listMembers(db, family.id).length;
            const role = myRole(family.id);
            return (
              <Card
                key={family.id}
                interactive
                onClick={() => navigate(`/family/${family.id}`)}
                className="stack"
              >
                <div className="row between">
                  <h3 style={{ margin: 0 }}>{family.name}</h3>
                  {role ? <RoleBadge role={role} /> : null}
                </div>
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  {members} member{members === 1 ? '' : 's'} ·{' '}
                  {db.people.filter((p) => p.familyId === family.id).length} people
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
