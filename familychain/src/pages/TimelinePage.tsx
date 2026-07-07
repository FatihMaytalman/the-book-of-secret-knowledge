import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listEvents, listPeople } from '../lib/db';
import { canEditData } from '../lib/permissions';
import { EVENT_META, EVENT_TYPES } from '../lib/eventMeta';
import type { LifeEvent, LifeEventType } from '../types';
import { Button, Card, EmptyState, Field, Select } from '../components/ui';
import { EventForm } from '../components/EventForm';
import { Timeline } from '../components/Timeline';

export function TimelinePage() {
  const { familyId = '' } = useParams();
  const { db, myRole, deleteEvent } = useApp();
  const role = myRole(familyId);

  const people = useMemo(() => listPeople(db, familyId), [db, familyId]);
  const events = useMemo(() => listEvents(db, familyId), [db, familyId]);

  const [typeFilter, setTypeFilter] = useState<LifeEventType | 'all'>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LifeEvent | undefined>(undefined);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (personFilter !== 'all' && !e.personIds.includes(personFilter)) return false;
      if (fromYear && e.date.year < Number(fromYear)) return false;
      if (toYear && e.date.year > Number(toYear)) return false;
      return true;
    });
  }, [events, typeFilter, personFilter, fromYear, toYear]);

  if (!role) return null;
  const editable = canEditData(role);

  return (
    <div className="stack">
      <div className="row between row-wrap">
        <div>
          <h2 style={{ margin: 0 }}>Family timeline</h2>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {filtered.length} of {events.length} event{events.length === 1 ? '' : 's'}
          </span>
        </div>
        {editable ? (
          <Button onClick={() => { setEditing(undefined); setShowForm(true); }}>+ Add event</Button>
        ) : null}
      </div>

      <Card>
        <div className="row row-wrap" style={{ gap: 12, alignItems: 'flex-end' }}>
          <Field label="Type">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as LifeEventType | 'all')}>
              <option value="all">All types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{EVENT_META[t].icon} {EVENT_META[t].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Person">
            <Select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
              <option value="all">Everyone</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </Select>
          </Field>
          <Field label="From year">
            <input className="input" inputMode="numeric" value={fromYear} placeholder="1900" style={{ width: 90 }} onChange={(e) => setFromYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          </Field>
          <Field label="To year">
            <input className="input" inputMode="numeric" value={toYear} placeholder="2026" style={{ width: 90 }} onChange={(e) => setToYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          </Field>
          {(typeFilter !== 'all' || personFilter !== 'all' || fromYear || toYear) ? (
            <Button variant="ghost" size="sm" onClick={() => { setTypeFilter('all'); setPersonFilter('all'); setFromYear(''); setToYear(''); }}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </Card>

      {events.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="No life events yet"
          description={editable ? 'Add births, marriages, milestones and more to build the family story.' : 'An editor can add life events here.'}
          action={editable ? <Button onClick={() => { setEditing(undefined); setShowForm(true); }}>+ Add the first event</Button> : undefined}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No events match those filters" />
      ) : (
        <Timeline
          events={filtered}
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
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      ) : null}
    </div>
  );
}
