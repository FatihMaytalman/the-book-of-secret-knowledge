import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { useEffect } from 'react';
import type { Role } from '../types';
import { ROLE_LABEL } from '../lib/permissions';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'primary',
  size,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm';
}) {
  const classes = [
    'btn',
    variant !== 'primary' ? `btn--${variant}` : '',
    size === 'sm' ? 'btn--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button className={classes} {...props} />;
}

export function Card({
  children,
  interactive,
  className = '',
  ...rest
}: {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card ${interactive ? 'card--interactive' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge badge--${role}`}>{ROLE_LABEL[role]}</span>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint ? <span className="muted" style={{ fontSize: '0.78rem' }}>{hint}</span> : null}
    </div>
  );
}

export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`select ${className}`} {...props} />;
}

export function EmptyState({
  icon = '✨',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden>{icon}</div>
      <h3 style={{ margin: '0 0 6px' }}>{title}</h3>
      {description ? <p className="muted" style={{ margin: '0 0 16px' }}>{description}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ height = 84, width = '100%' }: { height?: number; width?: number | string }) {
  return <div className="skeleton" style={{ height, width }} aria-hidden />;
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row between" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
