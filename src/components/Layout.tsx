import { NavLink, Outlet } from 'react-router';
import { vi } from '../i18n/vi';
import { BrandMark } from './BrandMark';
import { Icon, type IconName } from './Icon';
import { UpdateBanner } from './UpdateBanner';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: vi.nav.home, icon: 'home' },
  { to: '/kegel', label: vi.nav.kegel, icon: 'pulse' },
  { to: '/xa-don', label: vi.nav.pull, icon: 'bar' },
  { to: '/tien-do', label: vi.nav.progress, icon: 'chart' },
];

export function Layout() {
  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <BrandMark />
          <span>Man<b>Fit</b></span>
        </NavLink>
        <NavLink to="/cai-dat" className="icon-btn" aria-label={vi.nav.settings}>
          <Icon name="gear" />
        </NavLink>
      </header>
      <main className="content">
        <UpdateBanner />
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Điều hướng chính">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className="tab">
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
