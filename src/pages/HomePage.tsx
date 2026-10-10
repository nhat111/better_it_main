import { Link } from 'react-router';
import { Icon } from '../components/Icon';
import { InstallHint } from '../components/InstallHint';
import { vi } from '../i18n/vi';
import { activeDays, dayKey, streak } from '../lib/date';
import { KEGEL_LEVELS, kegelMinutes } from '../programs/kegel';
import { STAGES, stageMinutes } from '../programs/pullup';
import { useProgress } from '../storage/progress';
import { useToday } from '../lib/useToday';

export function HomePage() {
  const { kegel, pull } = useProgress();
  const today = useToday();
  const key = dayKey(today);
  const level = KEGEL_LEVELS[kegel.level];
  const stage = STAGES[pull.stage];
  const kegelToday = kegel.log[key] ?? 0;
  const pullWeek = activeDays(pull.log, today, 7);
  const kStreak = streak(kegel.log, today);

  return (
    <div className="page">
      <div className="hero">
        <div className="eyebrow">{vi.app.tagline}</div>
        <h1 className="h1">{vi.home.title}</h1>
        {kStreak > 0 && <div className="chip warm">{vi.home.streak(kStreak)}</div>}
      </div>

      <Link to="/kegel" className="card program">
        <div className="program-head">
          <span className="program-icon"><Icon name="pulse" /></span>
          <div className="grow">
            <div className="eyebrow">{vi.nav.kegel} · {vi.home.minutes(kegelMinutes(level))}</div>
            <h2 className="h2">{vi.kegel.level(kegel.level + 1, level.name)}</h2>
          </div>
          <span className="dots" aria-label={`${kegelToday}/3`}>
            {[0, 1, 2].map((i) => <i key={i} className={i < kegelToday ? 'on' : ''} />)}
          </span>
        </div>
        <p className="muted">{vi.home.kegelToday(kegelToday)}</p>
        <span className="program-cta">{vi.home.kegelCta} <Icon name="arrow" size={18} /></span>
      </Link>

      <Link to="/xa-don" className="card program">
        <div className="program-head">
          <span className="program-icon"><Icon name="bar" /></span>
          <div className="grow">
            <div className="eyebrow">{vi.nav.pull} · {vi.home.minutes(stageMinutes(stage))}</div>
            <h2 className="h2">{vi.pull.stage(pull.stage + 1, stage.name)}</h2>
          </div>
          <span className="dots" aria-label={`${pullWeek}/3`}>
            {[0, 1, 2].map((i) => <i key={i} className={i < pullWeek ? 'on' : ''} />)}
          </span>
        </div>
        <p className="muted">{vi.home.pullToday(Boolean(pull.log[key]), pullWeek)}</p>
        <span className="program-cta">{vi.home.pullCta} <Icon name="arrow" size={18} /></span>
      </Link>

      <InstallHint />

      <p className="muted small disclaimer">{vi.home.disclaimer}</p>
    </div>
  );
}
