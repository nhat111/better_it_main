import type { GuideItem } from '../content/guides';
import { vi } from '../i18n/vi';

export function Guide({ items }: { items: GuideItem[] }) {
  return (
    <section className="card" aria-labelledby="guide-h">
      <h2 id="guide-h" className="h2">
        {vi.common.guide}
      </h2>
      <div className="guide">
        {items.map((g, i) => (
          <details key={g.title} open={i === 0}>
            <summary>{g.title}</summary>
            {g.paragraphs?.map((p) => <p key={p}>{p}</p>)}
            {g.bullets && (
              <ul>
                {g.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
