import { ReactElement, useEffect, useRef, useState } from 'react';
import { ThreeView } from '../engine/ThreeView';
import { Canvas2DView } from '../view2d/Canvas2DView';
import { useApp } from './appState';
import { SITE } from './siteConfig';
import { TEXT } from './landingText';
import { useUI } from './store';

const start = () => useUI.setState({ screen: 'editor' });

/* ---- feature icon SVGs (inline, no dependency) ---- */
const FeatureIcon = ({ name }: { name: string }) => {
  const icons: Record<string, ReactElement> = {
    grid: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    cube: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    sofa: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2"/><path d="M2 11a2 2 0 012 2v5h16v-5a2 2 0 012-2V9a2 2 0 00-4 0v2H6V9a2 2 0 00-4 0v2z"/>
        <line x1="6" y1="18" x2="6" y2="21"/><line x1="18" y1="18" x2="18" y2="21"/>
      </svg>
    ),
    move: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>
      </svg>
    ),
    undo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>
      </svg>
    ),
    save: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
  };
  return <span className="lp-feat-icon">{icons[name] ?? icons.grid}</span>;
};

/* ---- step icons ---- */
const StepIcon = ({ step }: { step: number }) => {
  const icons = [
    // pencil
    <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    // sofa
    <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2"/><path d="M2 11a2 2 0 012 2v5h16v-5a2 2 0 012-2V9a2 2 0 00-4 0v2H6V9a2 2 0 00-4 0v2z"/></svg>,
    // cube
    <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  ];
  return <span className="lp-step-icon">{icons[step - 1]}</span>;
};

/* ---- Hero 3D preview ---- */
function HeroPreview() {
  const app = useApp();
  const scene3d = useRef<HTMLDivElement>(null);
  const scene2d = useRef<HTMLDivElement>(null);
  const [noGl, setNoGl] = useState(false);

  useEffect(() => {
    let three: ThreeView | undefined;
    if (ThreeView.isSupported()) {
      try {
        three = new ThreeView(scene3d.current as HTMLDivElement, app.editor, { interactive: false, autoRotate: true });
        three.setSettings({ daylight: 'day', wallMode: 'up' });
      } catch { setNoGl(true); }
    } else {
      setNoGl(true);
    }
    const flat = new Canvas2DView(scene2d.current as HTMLDivElement, app.editor, { interactive: false });
    return () => { three?.dispose(); flat.dispose(); };
  }, [app]);

  return (
    <div className="lp-hero-preview">
      {/* main 3D render */}
      <div className="lp-hero-3d" ref={scene3d}>
        {noGl && <p className="lp-hero-nogel">3D preview requires WebGL</p>}
      </div>
      {/* 2D plan overlay card */}
      <div className="lp-hero-plan-card">
        <div className="lp-hero-plan" ref={scene2d} />
      </div>
      {/* arrow — starts on 2D card side, tip lands on 3D scene side */}
      <svg className="lp-hero-arrow" viewBox="0 0 90 64" fill="none">
        <path d="M8 54 Q38 8 82 28" stroke="#f5c518" strokeWidth="3.5" strokeDasharray="7 4" strokeLinecap="round"/>
        <path d="M74 22 L84 30 L73 36" stroke="#f5c518" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  );
}

/* ---- Main landing component ---- */
export function Landing() {
  const lang = useUI((s) => s.lang);
  const t = TEXT[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  return (
    <div className="lp-root">

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/>
          </svg>
          <span>RoomVision 3D</span>
        </div>
        <ul className="lp-nav-links">
          <li><a href="#about">{t.nav.about}</a></li>
          <li><a href="#features">{t.nav.features}</a></li>
          <li><a href="#how">{t.nav.howItWorks}</a></li>
        </ul>
        <button className="lp-btn-primary" onClick={start}>
          {t.nav.open}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="about">
        <div className="lp-hero-copy">
          <h1>
            {t.hero.titleLine1}<br />
            {t.hero.titleLine2}<span className="lp-accent">{t.hero.titleAccent}</span>
          </h1>
          <p>{t.hero.lead}</p>
          <div className="lp-hero-cta">
            <button className="lp-btn-yellow" onClick={start}>{t.hero.start}</button>
            <button className="lp-btn-outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>{t.hero.explore}</button>
          </div>
        </div>
        <HeroPreview />
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features-section" id="features">
        <h2 className="lp-section-title">{t.features.title}</h2>
        <div className="lp-divider" />
        <div className="lp-features-grid">
          {t.features.items.map((f) => (
            <div className="lp-feat-card" key={f.title}>
              <FeatureIcon name={f.icon} />
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how-section" id="how">
        <h2 className="lp-section-title">{t.howItWorks.title}</h2>
        <div className="lp-divider" />
        <div className="lp-steps">
          {t.howItWorks.steps.map((s, i) => (
            <div className="lp-step" key={s.title}>
              <div className="lp-step-num">{i + 1}</div>
              <div className="lp-step-card">
                <StepIcon step={i + 1} />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
              {i < t.howItWorks.steps.length - 1 && <div className="lp-step-dash" />}
            </div>
          ))}
        </div>
        <div className="lp-how-cta">
          <button className="lp-btn-yellow lp-btn-lg" onClick={start}>
            {t.howItWorks.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/>
          </svg>
          <span>RoomVision 3D</span>
        </div>
        <span className="lp-footer-copy">{t.footer.copy}</span>
        <div className="lp-footer-links">
          {SITE.repoUrl && (
            <>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="lp-footer-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                {t.footer.linkedin}
              </a>
              <a href={SITE.repoUrl} target="_blank" rel="noreferrer" className="lp-footer-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                {t.footer.github}
              </a>
            </>
          )}
        </div>
      </footer>

    </div>
  );
}
