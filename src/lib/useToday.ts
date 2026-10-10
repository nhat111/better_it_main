import { useEffect, useState } from 'react';

/** Today's date, refreshed when the app comes back to the foreground (e.g. the next morning). */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState === 'visible') setToday(new Date());
    };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);
  return today;
}
