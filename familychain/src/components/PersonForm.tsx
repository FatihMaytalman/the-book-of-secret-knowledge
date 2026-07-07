import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Person, PersonVisibility } from '../types';
import { Button, Field, Modal, Select } from './ui';

interface PersonFormProps {
  familyId: string;
  person: Person;
  onClose: () => void;
}

export function PersonForm({ familyId, person, onClose }: PersonFormProps) {
  const { updatePerson } = useApp();
  const [displayName, setDisplayName] = useState(person.displayName);
  const [birthDate, setBirthDate] = useState(person.birthDate ?? '');
  const [deathDate, setDeathDate] = useState(person.deathDate ?? '');
  const [visibility, setVisibility] = useState<PersonVisibility>(person.visibility);
  const [biography, setBiography] = useState(person.biography ?? '');

  return (
    <Modal title={`Edit ${person.displayName}`} onClose={onClose}>
      <div className="stack">
        <Field label="Full name">
          <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <div className="row row-wrap" style={{ gap: 12 }}>
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
        </div>
        <Field label="Biography">
          <textarea className="textarea" value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="A short life story…" />
        </Field>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={displayName.trim().length < 1}
            onClick={() => {
              updatePerson(familyId, person.id, {
                displayName,
                birthDate: birthDate || undefined,
                deathDate: deathDate || undefined,
                visibility,
                biography: biography || undefined,
              });
              onClose();
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
