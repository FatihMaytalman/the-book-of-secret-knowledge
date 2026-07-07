import type { LifeEvent, Person } from '../types';
import { EVENT_META } from '../lib/eventMeta';
import { formatApproxDate } from '../lib/date';
import { Button } from './ui';

interface TimelineProps {
  events: LifeEvent[];
  people: Person[];
  canEdit: boolean;
  onEdit?: (event: LifeEvent) => void;
  onDelete?: (event: LifeEvent) => void;
}

export function Timeline({ events, people, canEdit, onEdit, onDelete }: TimelineProps) {
  const nameOf = (id: string) => people.find((p) => p.id === id)?.displayName ?? 'Unknown';

  return (
    <div className="timeline">
      {events.map((event) => {
        const meta = EVENT_META[event.type];
        return (
          <div key={event.id} className="timeline__item" style={{ ['--evt' as string]: meta.color }}>
            <div className="timeline__dot" aria-hidden>{meta.icon}</div>
            <div className="timeline__card card">
              <div className="row between row-wrap" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="evt-badge">{meta.label}</span>
                  <strong>{event.title}</strong>
                </div>
                <span className="muted" style={{ fontSize: '0.82rem' }}>{formatApproxDate(event.date)}</span>
              </div>

              {event.location ? (
                <div className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>📍 {event.location}</div>
              ) : null}

              {event.description ? <p style={{ margin: '8px 0 0' }}>{event.description}</p> : null}

              {event.photo ? (
                <img src={event.photo} alt={event.title} className="timeline__photo" />
              ) : null}

              {event.personIds.length > 0 ? (
                <div className="row row-wrap" style={{ gap: 6, marginTop: 10 }}>
                  {event.personIds.map((id) => (
                    <span key={id} className="chip chip--static">{nameOf(id)}</span>
                  ))}
                </div>
              ) : null}

              {canEdit ? (
                <div className="row" style={{ gap: 8, marginTop: 10 }}>
                  <Button size="sm" variant="secondary" onClick={() => onEdit?.(event)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete?.(event)}>Delete</Button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
