import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui';

const tabs = [
  { to: '', label: 'Dashboard', end: true },
  { to: 'members', label: 'Members' },
  { to: 'people', label: 'People' },
  { to: 'timeline', label: 'Timeline' },
  { to: 'tree', label: 'Tree' },
];

export function FamilyLayout() {
  const { familyId = '' } = useParams();
  const { db, myRole } = useApp();

  const family = db.families.find((f) => f.id === familyId);
  const role = myRole(familyId);

  if (!family || !role) {
    return (
      <div className="container">
        <EmptyState
          icon="🔒"
          title="Family not available"
          description="This family doesn't exist on this device, or you're not a member of it."
        />
      </div>
    );
  }

  return (
    <div className="container stack">
      <div className="row between row-wrap">
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Family workspace</p>
          <h1 style={{ fontSize: '1.7rem', margin: '4px 0 0' }}>{family.name}</h1>
        </div>
      </div>

      <nav className="tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `tab ${isActive ? 'tab--active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ familyId, role }} />
    </div>
  );
}
