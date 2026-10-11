import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';
import { Layout } from './components/Layout';
import { useApplyTheme } from './lib/theme';
import { useProgress } from './storage/progress';
import { vi } from './i18n/vi';
import { HomePage } from './pages/HomePage';
import { KegelPage } from './pages/KegelPage';
import { ProgressPage } from './pages/ProgressPage';
import { PullPage } from './pages/PullPage';
import { SettingsPage } from './pages/SettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector('.content')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="page">
      <p>{vi.common.notFound}</p>
      <Link to="/" className="btn">{vi.common.backHome}</Link>
    </div>
  );
}

export function App() {
  useApplyTheme(useProgress().prefs.theme);
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="kegel" element={<KegelPage />} />
          <Route path="xa-don" element={<PullPage />} />
          <Route path="tien-do" element={<ProgressPage />} />
          <Route path="cai-dat" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
