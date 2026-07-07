import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { EVENT_META, EVENT_TYPES } from '../lib/eventMeta';
import { dataUrlBytes, fileToResizedDataUrl } from '../lib/image';
import { estimateDbBytes, STORAGE_SOFT_LIMIT_BYTES } from '../lib/storage';
import type { ApproxDate, LifeEvent, LifeEventType, Person } from '../types';
import { Button, Field, Modal, Select } from './ui';

interface EventFormProps {
  familyId: string;
  people: Person[];
  event?: LifeEvent;
  presetPersonId?: string;
  onClose: () => void;
}

export function EventForm({ familyId, people, event, presetPersonId, onClose }: EventFormProps) {
  const { db, createEvent, updateEvent } = useApp();
  const { toast } = useToast();

  const [type, setType] = useState<LifeEventType>(event?.type ?? 'birth');
  const [title, setTitle] = useState(event?.title ?? '');
  const [year, setYear] = useState<string>(event ? String(event.date.year) : '');
  const [month, setMonth] = useState<string>(event?.date.month ? String(event.date.month) : '');
  const [day, setDay] = useState<string>(event?.date.day ? String(event.date.day) : '');
  const [approximate, setApproximate] = useState<boolean>(event?.date.approximate ?? false);
  const [description, setDescription] = useState(event?.description ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [personIds, setPersonIds] = useState<string[]>(
    event?.personIds ?? (presetPersonId ? [presetPersonId] : []),
  );
  const [photo, setPhoto] = useState<string | undefined>(event?.photo);
  const [photoBusy, setPhotoBusy] = useState(false);

  const usage = useMemo(() => {
    const bytes = estimateDbBytes(db);
    return { bytes, pct: Math.round((bytes / STORAGE_SOFT_LIMIT_BYTES) * 100) };
  }, [db]);

  function togglePerson(id: string) {
    setPersonIds((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    );
  }

  async function onPhotoChange(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const projected = usage.bytes + dataUrlBytes(dataUrl);
      if (projected > STORAGE_SOFT_LIMIT_BYTES) {
        toast('That photo would exceed the ~5MB local storage limit. Try a smaller image.', 'error');
        return;
      }
      if (projected > STORAGE_SOFT_LIMIT_BYTES * 0.8) {
        toast('Heads up: you are approaching the local storage limit.', 'info');
      }
      setPhoto(dataUrl);
    } catch (error) {
      toast((error as Error).message, 'error');
    } finally {
      setPhotoBusy(false);
    }
  }

  function submit() {
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < 1) {
      toast('Please enter a valid year.', 'error');
      return;
    }
    const date: ApproxDate = {
      year: yearNum,
      month: month ? Number(month) : undefined,
      day: month && day ? Number(day) : undefined,
      approximate,
    };
    const input = {
      type,
      title,
      date,
      description,
      location,
      personIds,
      photo,
    };
    const ok = event
      ? (updateEvent(familyId, event.id, input), true)
      : createEvent(familyId, input);
    if (ok) onClose();
  }

  return (
    <Modal title={event ? 'Edit event' : 'Add life event'} onClose={onClose}>
      <div className="stack">
        <div className="row row-wrap" style={{ gap: 12 }}>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as LifeEventType)}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{EVENT_META[t].icon} {EVENT_META[t].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Title">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Graduated university" />
          </Field>
        </div>

        <div className="row row-wrap" style={{ gap: 12, alignItems: 'flex-end' }}>
          <Field label="Year *">
            <input className="input" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1990" style={{ width: 90 }} />
          </Field>
          <Field label="Month">
            <Select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 110 }}>
              <option value="">—</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Select>
          </Field>
          <Field label="Day">
            <Select value={day} onChange={(e) => setDay(e.target.value)} disabled={!month} style={{ width: 90 }}>
              <option value="">—</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Select>
          </Field>
          <label className="row" style={{ gap: 6, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={approximate} onChange={(e) => setApproximate(e.target.checked)} />
            Approximate
          </label>
        </div>

        <Field label="Location">
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. London, UK" />
        </Field>

        <Field label="Description">
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <Field label="Linked people">
          {people.length === 0 ? (
            <span className="muted" style={{ fontSize: '0.82rem' }}>Add people first to link them.</span>
          ) : (
            <div className="row row-wrap" style={{ gap: 8 }}>
              {people.map((person) => (
                <label key={person.id} className={`chip ${personIds.includes(person.id) ? 'chip--on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={personIds.includes(person.id)}
                    onChange={() => togglePerson(person.id)}
                    style={{ display: 'none' }}
                  />
                  {person.displayName}
                </label>
              ))}
            </div>
          )}
        </Field>

        <Field label="Photo" hint={`Local storage in use: ~${usage.pct}% of ~5MB`}>
          {photo ? (
            <div className="row" style={{ gap: 12 }}>
              <img src={photo} alt="Event" style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 10 }} />
              <Button variant="ghost" size="sm" type="button" onClick={() => setPhoto(undefined)}>Remove photo</Button>
            </div>
          ) : (
            <input type="file" accept="image/*" disabled={photoBusy} onChange={(e) => onPhotoChange(e.target.files?.[0])} />
          )}
        </Field>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={photoBusy || title.trim().length < 1 || year.length < 1}>
            {event ? 'Save changes' : 'Add event'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
