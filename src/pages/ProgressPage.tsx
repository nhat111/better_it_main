import { useState } from 'react';
import { DayGrid } from '../components/DayGrid';
import { vi } from '../i18n/vi';
import { activeDays, dayKey, shortDate, streak, totalSessions } from '../lib/date';
import { update, useProgress } from '../storage/progress';
import { useToday } from '../lib/useToday';

export function ProgressPage() {
  const { kegel, pull } = useProgress();
  const today = useToday();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(input);
    if (input.trim() === '' || !Number.isInteger(v) || v < 0 || v > 100) {
      setError(true);
      return;
    }
    setError(false);
    setInput('');
    update((p) => ({ ...p, pull: { ...p.pull, maxTests: [...p.pull.maxTests, { date: dayKey(today), reps: v }] } }));
  };

  const tests = pull.maxTests.slice(-8);
  const best = Math.max(1, ...tests.map((t) => t.reps));

  return (
    <div className="page">
      <h1 className="h1">{vi.progress.title}</h1>

      <section className="card">
        <h2 className="h2">{vi.progress.kegelLog}</h2>
        <div className="stats3">
          <div><b>{streak(kegel.log, today)}</b><span>{vi.progress.streak}</span></div>
          <div><b>{totalSessions(kegel.log)}</b><span>{vi.progress.total}</span></div>
          <div><b>{kegel.level + 1}</b><span>{vi.progress.level}</span></div>
        </div>
        <DayGrid log={kegel.log} today={today} />
        <p className="muted small">{vi.progress.legend}</p>
      </section>

      <section className="card">
        <h2 className="h2">{vi.progress.pullLog}</h2>
        <div className="stats3">
          <div><b>{activeDays(pull.log, today, 7)}/3</b><span>{vi.progress.week}</span></div>
          <div><b>{totalSessions(pull.log)}</b><span>{vi.progress.total}</span></div>
          <div><b>{pull.stage + 1}</b><span>{vi.progress.stage}</span></div>
        </div>
        <DayGrid log={pull.log} today={today} />
      </section>

      <section className="card" aria-labelledby="max-h">
        <h2 id="max-h" className="h2">{vi.progress.maxTitle}</h2>
        <p className="muted small">{vi.progress.maxHelp}</p>
        <form className="row" onSubmit={save}>
          <input
            id="max-input"
            className="input"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="0"
            aria-label={vi.progress.maxLabel}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn" type="submit">{vi.progress.maxSave}</button>
        </form>
        {error && <p className="error small">{vi.progress.maxInvalid}</p>}
        {tests.length === 0 ? (
          <p className="muted small">{vi.progress.maxEmpty}</p>
        ) : (
          <div className="bars" role="list">
            {tests.map((t, i) => (
              <div key={`${t.date}-${i}`} className="bar-col" role="listitem" aria-label={`${shortDate(t.date)}: ${t.reps} ${vi.progress.reps}`}>
                <span className="bar-val">{t.reps}</span>
                <span className="bar-fill" style={{ height: `${Math.max(4, (t.reps / best) * 100)}%` }} />
                <span className="bar-label">{shortDate(t.date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
