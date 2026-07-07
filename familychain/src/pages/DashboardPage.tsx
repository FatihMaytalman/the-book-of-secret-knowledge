import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listMembers } from '../lib/db';
import { canDeleteFamily, ROLE_DESCRIPTION } from '../lib/permissions';
import { Button, Card, RoleBadge } from '../components/ui';

function Stat({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <Card className="stack" style={{ gap: 4 }}>
      <span style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</span>
      <strong>{label}</strong>
      <span className="eyebrow" style={{ color: 'var(--role-editor)' }}>{hint}</span>
    </Card>
  );
}

export function DashboardPage() {
  const { familyId = '' } = useParams();
  const { db, myRole, deleteFamily } = useApp();
  const navigate = useNavigate();
  const role = myRole(familyId);

  const stats = useMemo(
    () => ({
      members: listMembers(db, familyId).length,
      people: db.people.filter((p) => p.familyId === familyId).length,
      events: db.events.filter((e) => e.familyId === familyId).length,
    }),
    [db, familyId],
  );

  if (!role) return null;

  return (
    <div className="stack">
      <Card className="stack" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--surface)), var(--surface))' }}>
        <div className="row between row-wrap">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Your access</p>
            <div className="row" style={{ marginTop: 6 }}>
              <RoleBadge role={role} />
            </div>
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>{ROLE_DESCRIPTION[role]}</p>
      </Card>

      <div className="grid grid-2">
        <Stat label="Members" value={stats.members} hint="People with access" />
        <Stat label="People" value={stats.people} hint="Profiles in the tree" />
        <Stat label="Life events" value={stats.events} hint="On the timeline" />
      </div>

      {canDeleteFamily(role) ? (
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Danger zone</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            Deleting a family permanently removes its members, people, events, and relationships.
          </p>
          <div>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm('Delete this family and all of its data? This cannot be undone.')) {
                  deleteFamily(familyId);
                  navigate('/');
                }
              }}
            >
              Delete family
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
