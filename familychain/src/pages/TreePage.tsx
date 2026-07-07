import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listPeople, listRelationships } from '../lib/db';
import { canEditData } from '../lib/permissions';
import type { RelationshipType } from '../types';
import { Button, Card, EmptyState, Field, Select } from '../components/ui';
import { FamilyTree } from '../components/FamilyTree';

const REL_LABEL: Record<RelationshipType, string> = {
  parent: 'Parent → Child',
  spouse: 'Spouse',
  partner: 'Partner',
  sibling: 'Sibling',
};

export function TreePage() {
  const { familyId = '' } = useParams();
  const { db, myRole, createRelationship, deleteRelationship } = useApp();
  const role = myRole(familyId);

  const people = useMemo(() => listPeople(db, familyId), [db, familyId]);
  const relationships = useMemo(() => listRelationships(db, familyId), [db, familyId]);

  const [type, setType] = useState<RelationshipType>('parent');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const nameOf = (id: string) => people.find((p) => p.id === id)?.displayName ?? 'Unknown';

  if (!role) return null;
  const editable = canEditData(role);
  const isParent = type === 'parent';

  return (
    <div className="stack">
      <div>
        <h2 style={{ margin: 0 }}>Family tree</h2>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          Pan and zoom the canvas, use +/− on a node to collapse a branch, and click a person to open their profile.
        </span>
      </div>

      {people.length >= 1 ? (
        <FamilyTree familyId={familyId} people={people} relationships={relationships} />
      ) : (
        <EmptyState icon="🌳" title="Add people first" description="Create people on the People tab to build the tree." />
      )}

      {editable ? (
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Add a relationship</h3>
          <form
            className="row row-wrap"
            style={{ alignItems: 'flex-end', gap: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!from || !to) return;
              const ok = createRelationship(familyId, {
                type,
                fromPersonId: from,
                toPersonId: to,
                startDate: !isParent ? startDate || undefined : undefined,
                endDate: !isParent ? endDate || undefined : undefined,
              });
              if (ok) { setFrom(''); setTo(''); setStartDate(''); setEndDate(''); }
            }}
          >
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value as RelationshipType)}>
                <option value="parent">Parent → Child</option>
                <option value="spouse">Spouse</option>
                <option value="partner">Partner</option>
              </Select>
            </Field>
            <Field label={isParent ? 'Parent' : 'Person A'}>
              <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">Select…</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
              </Select>
            </Field>
            <Field label={isParent ? 'Child' : 'Person B'}>
              <Select value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">Select…</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
              </Select>
            </Field>
            {!isParent ? (
              <>
                <Field label="From">
                  <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
                <Field label="Until">
                  <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Field>
              </>
            ) : null}
            <Button type="submit" disabled={!from || !to}>Add</Button>
          </form>
          <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
            Siblings are derived automatically from shared parents.
          </p>
        </Card>
      ) : null}

      {relationships.length > 0 ? (
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Relationships</h3>
          <div className="stack" style={{ gap: 8 }}>
            {relationships.map((r) => (
              <div key={r.id} className="row between card" style={{ padding: 12 }}>
                <span>
                  <strong>{nameOf(r.fromPersonId)}</strong>
                  <span className="muted"> — {REL_LABEL[r.type]} — </span>
                  <strong>{nameOf(r.toPersonId)}</strong>
                  {r.startDate ? <span className="muted"> ({r.startDate}{r.endDate ? ` → ${r.endDate}` : ''})</span> : null}
                </span>
                {editable ? (
                  <Button size="sm" variant="ghost" onClick={() => deleteRelationship(familyId, r.id)}>Remove</Button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
