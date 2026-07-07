import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Modal, Field } from './ui';

export function AccountSwitcher() {
  const { db, currentAccount, switchAccount, createAccount, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  if (!currentAccount) return null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <span aria-hidden>👤</span> {currentAccount.displayName}
      </Button>

      {open ? (
        <Modal title="Switch account (this device)" onClose={() => setOpen(false)}>
          <div className="stack">
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              Accounts are local to this device — this is how you simulate different family
              members accepting invites.
            </p>
            <div className="stack" style={{ gap: 8 }}>
              {db.accounts.map((account) => (
                <div key={account.id} className="row between card" style={{ padding: 12 }}>
                  <span>
                    {account.displayName}
                    {account.id === currentAccount.id ? (
                      <span className="muted"> · current</span>
                    ) : null}
                  </span>
                  {account.id !== currentAccount.id ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        switchAccount(account.id);
                        setOpen(false);
                      }}
                    >
                      Switch
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>

            {adding ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) {
                    createAccount(name.trim());
                    setName('');
                    setAdding(false);
                    setOpen(false);
                  }
                }}
              >
                <Field label="New account name">
                  <input
                    className="input"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ada"
                  />
                </Field>
                <div className="row" style={{ marginTop: 12 }}>
                  <Button type="submit">Create</Button>
                  <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="row between">
                <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
                  + Add account
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
