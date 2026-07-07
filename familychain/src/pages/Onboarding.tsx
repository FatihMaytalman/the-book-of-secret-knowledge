import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Card, Field } from '../components/ui';

export function Onboarding() {
  const { db, createAccount, switchAccount } = useApp();
  const [name, setName] = useState('');

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <p className="eyebrow">FamilyChain</p>
      <h1 style={{ fontSize: '2rem' }}>Your family's story, kept private on your device</h1>
      <p className="muted">
        FamilyChain is local-first: everything is stored in your browser, no account server, no
        cloud. Create a local profile to begin.
      </p>

      <Card className="stack" style={{ marginTop: 16 }}>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) createAccount(name.trim());
          }}
        >
          <Field label="Your name" hint="This identifies you as a family member on this device.">
            <input
              className="input"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ada Lovelace"
            />
          </Field>
          <Button type="submit" disabled={name.trim().length < 1}>
            Create my profile
          </Button>
        </form>

        {db.accounts.length > 0 ? (
          <div className="stack" style={{ gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <span className="muted" style={{ fontSize: '0.82rem' }}>Or continue as</span>
            {db.accounts.map((account) => (
              <Button
                key={account.id}
                variant="secondary"
                onClick={() => switchAccount(account.id)}
              >
                {account.displayName}
              </Button>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
