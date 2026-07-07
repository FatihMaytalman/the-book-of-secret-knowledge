import type { LifeEventType } from '../types';

export const EVENT_TYPES: LifeEventType[] = [
  'birth',
  'marriage',
  'divorce',
  'graduation',
  'career',
  'relocation',
  'achievement',
  'death',
  'custom',
];

export const EVENT_META: Record<LifeEventType, { label: string; icon: string; color: string }> = {
  birth: { label: 'Birth', icon: '👶', color: '#10b981' },
  marriage: { label: 'Marriage', icon: '💍', color: '#ec4899' },
  divorce: { label: 'Divorce', icon: '💔', color: '#64748b' },
  graduation: { label: 'Graduation', icon: '🎓', color: '#8b5cf6' },
  career: { label: 'Career', icon: '💼', color: '#3b82f6' },
  relocation: { label: 'Relocation', icon: '📦', color: '#f59e0b' },
  achievement: { label: 'Achievement', icon: '🏆', color: '#eab308' },
  death: { label: 'Death', icon: '🕊️', color: '#6b7280' },
  custom: { label: 'Custom', icon: '⭐', color: '#6366f1' },
};
