import { HashRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import { AccountSwitcher } from './components/AccountSwitcher';
import { Onboarding } from './pages/Onboarding';
import { FamiliesPage } from './pages/FamiliesPage';
import { FamilyLayout } from './pages/FamilyLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { PeoplePage } from './pages/PeoplePage';
import { PersonPage } from './pages/PersonPage';
import { TimelinePage } from './pages/TimelinePage';
import { TreePage } from './pages/TreePage';

function RootLayout() {
  const { currentAccount } = useApp();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          Family<span>Chain</span>
        </Link>
        <div className="row">
          <AccountSwitcher />
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {currentAccount ? <Outlet /> : <Onboarding />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<FamiliesPage />} />
              <Route path="family/:familyId" element={<FamilyLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="members" element={<MembersPage />} />
              <Route path="people" element={<PeoplePage />} />
              <Route path="people/:personId" element={<PersonPage />} />
              <Route path="timeline" element={<TimelinePage />} />
                <Route path="tree" element={<TreePage />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  );
}
