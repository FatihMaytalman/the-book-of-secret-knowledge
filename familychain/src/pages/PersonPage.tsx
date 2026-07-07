import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listEventsForPerson, listPeople } from '../lib/db';
import { canEditData } from '../lib/permissions';
import type { LifeEvent } from '../types';
import { Button, Card, EmptyState } from '../components/ui';
import { EventForm } from '../components/EventForm';
import { PersonForm } from '../components/PersonForm';
import { Timeline } from '../components/Timeline';

export function PersonPage() {
  const { familyId = '', personId = '' } = useParams();
  const { db, myRole, deleteEvent } = useApp();
  const role = myRole(familyId);

  const people = useMemo(() => listPeople(db, familyId), [db, familyId]);
  const person = people.find((p) => p.id === personId);
  const events = useMemo(
    () => listEventsForPerson(db, familyId, personId),
    [db, familyId, personId],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LifeEvent | undefined>(undefined);
  const [editingPerson, setEditingPerson] = useState(false);

  if (!role) return null;
  if (!person) {
    return <EmptyState icon="🫥" title="Person not found" />;
  }
  const editable = canEditData(role);

  const facts = [
    { label: 'Status', value: person.isLiving ? 'Living' : 'Deceased' },
    { label: 'Born', value: person.birthDate ?? '—' },
    { label: 'Died', value: person.deathDate ?? '—' },
    { label: 'Visibility', value: person.visibility },
  ];

  return (
    <div className="stack">
      <div className="row between row-wrap">
        <div>
          <Link to={`/family/${familyId}/people`} className="eyebrow">← People</Link>
          <h2 style={{ margin: '6px 0 0' }}>{person.displayName}</h2>
        </div>
        {editable ? (
          <Button variant="secondary" onClick={() => setEditingPerson(true)}>Edit profile</Button>
        ) : null}
      </div>

      <Card>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          {facts.map((fact) => (
            <div key={fact.label}>
              <div className="eyebrow" style={{ color: 'var(--role-editor)' }}>{fact.label}</div>
              <div>{fact.value}</div>
            </div>
          ))}
        </div>
        {person.biography ? <p style={{ marginBottom: 0 }}>{person.biography}</p> : null}
      </Card>

      <div className="row between row-wrap">
        <h3 style={{ margin: 0 }}>Life timeline</h3>
        {editable ? (
          <Button onClick={() => { setEditing(undefined); setShowForm(true); }}>+ Add event</Button>
        ) : null}
      </div>

      {events.length === 0 ? (
        <EmptyState icon="🗓️" title={`No events for ${person.displayName} yet`} />
      ) : (
        <Timeline
          events={events}
          people={people}
          canEdit={editable}
          onEdit={(event) => { setEditing(event); setShowForm(true); }}
          onDelete={(event) => {
            if (window.confirm(`Delete "${event.title}"?`)) deleteEvent(familyId, event.id);
          }}
        />
      )}

      {showForm ? (
        <EventForm
          familyId={familyId}
          people={people}
          event={editing}
          presetPersonId={person.id}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      ) : null}

      {editingPerson ? (
        <PersonForm familyId={familyId} person={person} onClose={() => setEditingPerson(false)} />
      ) : null}
    </div>
  );
}
