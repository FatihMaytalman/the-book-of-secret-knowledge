import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listPeople } from '../lib/db';
import { canEditData } from '../lib/permissions';
import type { PersonVisibility } from '../types';
import { Button, Card, EmptyState, Field, Select } from '../components/ui';

export function PeoplePage() {
  const { familyId = '' } = useParams();
  const navigate = useNavigate();
  const { db, myRole, createPerson, deletePerson } = useApp();
  const role = myRole(familyId);
  const people = useMemo(() => listPeople(db, familyId), [db, familyId]);

  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [visibility, setVisibility] = useState<PersonVisibility>('family');

  if (!role) return null;
  const editable = canEditData(role);

  return (
    <div className="stack">
      {editable ? (
        <Card className="stack">
          <h3 style={{ margin: 0 }}>Add a person</h3>
          <form
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
            onSubmit={(e) => {
              e.preventDefault();
              const created = createPerson(familyId, {
                displayName,
                birthDate: birthDate || undefined,
                deathDate: deathDate || undefined,
                visibility,
              });
              if (created) {
                setDisplayName('');
                setBirthDate('');
                setDeathDate('');
                setVisibility('family');
              }
            }}
          >
            <Field label="Full name">
              <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Ada Lovelace" />
            </Field>
            <Field label="Birth date">
              <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </Field>
            <Field label="Death date">
              <input type="date" className="input" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} />
            </Field>
            <Field label="Visibility">
              <Select value={visibility} onChange={(e) => setVisibility(e.target.value as PersonVisibility)}>
                <option value="family">Family</option>
                <option value="restricted">Restricted</option>
                <option value="private">Private</option>
              </Select>
            </Field>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="submit" disabled={displayName.trim().length < 1}>Add person</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <p className="muted" style={{ margin: 0 }}>You have read-only access. Ask an editor or admin to add people.</p>
        </Card>
      )}

      {people.length === 0 ? (
        <EmptyState icon="🧑‍🤝‍🧑" title="No people yet" description="Add family members to start building profiles and the tree." />
      ) : (
        <div className="grid grid-2">
          {people.map((person) => (
            <Card
              key={person.id}
              interactive
              className="stack"
              style={{ gap: 6 }}
              onClick={() => navigate(`/family/${familyId}/people/${person.id}`)}
            >
              <div className="row between">
                <h3 style={{ margin: 0 }}>{person.displayName}</h3>
                {editable ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete ${person.displayName}?`)) deletePerson(familyId, person.id);
                    }}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {person.isLiving ? 'Living' : 'Deceased'}
                {person.birthDate ? ` · b. ${person.birthDate}` : ''}
                {person.deathDate ? ` · d. ${person.deathDate}` : ''}
              </span>
              <span className="eyebrow" style={{ color: 'var(--role-viewer)' }}>{person.visibility}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
