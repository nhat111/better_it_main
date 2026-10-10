import { dayKey, lastDays, type DayLog } from '../lib/date';

/** 4 × 7 grid of the last 28 days, shaded by sessions that day. */
export function DayGrid({ log, today }: { log: DayLog; today: Date }) {
  const days = lastDays(today, 28);
  return (
    <div className="daygrid">
      {days.map((d, i) => {
        const n = log[dayKey(d)] ?? 0;
        const cls = ['day', n === 1 ? 'd1' : n >= 2 ? 'd2' : '', i === days.length - 1 ? 'today' : ''].join(' ');
        return (
          <div key={dayKey(d)} className={cls} title={`${d.getDate()}/${d.getMonth() + 1}: ${n} buổi`}>
            {d.getDate()}
          </div>
        );
      })}
    </div>
  );
}
