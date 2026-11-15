import { useEffect, useRef, useState } from 'react';
import { CATALOG, CatalogItem } from '../domain/catalog';
import { getPreset } from '../domain/materials';
import { createDemoProject } from '../domain/demo';
import { parseProject } from '../domain/project';
import { DND_MIME, Tool } from '../editor/types';
import { drawFurnitureSymbol } from '../view2d/symbols';
import { App, saveProject, useApp, useHistoryVersion, useModelVersion } from './appState';
import { Icon, IconName } from './Icon';
import { CollabPanel, HistoryPanel, ModelsPanel, PropertiesPanel, ScenePanel, useCollabTick } from './panels';
import { notify, selectTool, useUI } from './store';
import { Viewport } from './Viewport';

// ---- Left nav tab type -----------------------------------------------------------------------
type NavTab = 'build' | 'catalog' | 'scene' | 'collab' | 'history';

export function EditorScreen() {
  const [navTab, setNavTab] = useState<NavTab>('build');
  useHotkeys();

  return (
    <div className="rv-editor">
      {/* Top bar */}
      <TopBar />

      <div className="rv-body">
        {/* Icon nav rail */}
        <NavRail active={navTab} onChange={setNavTab} />

        {/* Left panel content */}
        <aside className="rv-left-panel">
          {navTab === 'build'   && <BuildPanel />}
          {navTab === 'catalog' && <CatalogPanel />}
          {navTab === 'scene'   && <ScenePanel />}
          {navTab === 'collab'  && <CollabPanel />}
          {navTab === 'history' && <HistoryPanel />}
        </aside>

        {/* Main workspace */}
        <main className="rv-workspace">
          <Viewport />
        </main>

        {/* Right properties sidebar */}
        <aside className="rv-right-panel">
          <PropertiesPanel />
          <ScenePanel compact />
          <ModelsPanel compact />
          <CollabPanel compact />
          <HistoryPanel compact />
        </aside>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Modals */}
      <ProjectDialog />
      <Toast />
    </div>
  );
}

// ---- hotkeys ----------------------------------------------------------------------------------

const TOOL_KEYS: Record<string, Tool> = {
  '1': 'select', '2': 'wall', '3': 'room', '4': 'door',
  '5': 'window', '6': 'measure', '7': 'delete',
};

function useHotkeys(): void {
  const app = useApp();
  useEffect(() => {
    const { editor } = app;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (
        el.tagName === 'TEXTAREA' || el.isContentEditable ||
        (el.tagName === 'INPUT' && !['range', 'checkbox', 'button'].includes((el as HTMLInputElement).type))
      );
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === 'z' && !typing) { e.preventDefault(); if (e.shiftKey) editor.redo(); else editor.undo(); return; }
      if (mod && k === 'y' && !typing) { e.preventDefault(); editor.redo(); return; }
      if (mod && k === 's') { e.preventDefault(); saveProject(app); return; }
      if (mod && k === 'd' && !typing) { e.preventDefault(); editor.duplicateSelected(); return; }
      if (mod || typing) return;
      if (TOOL_KEYS[k]) return selectTool(TOOL_KEYS[k]);
      const step = e.shiftKey ? 0.5 : 0.05;
      switch (e.key) {
        case 'Delete': case 'Backspace': editor.deleteSelected(); break;
        case 'Escape': selectTool('select'); editor.selection.clear(); break;
        case 'ArrowLeft':  e.preventDefault(); editor.nudgeSelected(-step, 0); break;
        case 'ArrowRight': e.preventDefault(); editor.nudgeSelected(step, 0);  break;
        case 'ArrowUp':    e.preventDefault(); editor.nudgeSelected(0, -step); break;
        case 'ArrowDown':  e.preventDefault(); editor.nudgeSelected(0, step);  break;
        default: if (k === 'r') editor.rotateSelected(90); if (k === 'f') editor.fitViews();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [app]);
}

// ---- top bar ----------------------------------------------------------------------------------

function TopBar() {
  const app = useApp();
  const { editor, collab } = app;
  useModelVersion(); useCollabTick();
  const hv = useHistoryVersion(); void hv;
  const viewMode  = useUI((s) => s.viewMode);
  const lastSaved = useUI((s) => s.lastSaved);
  const time  = lastSaved ? new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const peers = collab.peerList;

  return (
    <header className="rv-topbar">
      {/* Brand */}
      <button className="rv-brand" onClick={() => useUI.setState({ screen: 'landing' })} title="Back to home">
        <span className="rv-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/>
          </svg>
        </span>
        <span className="rv-brand-name"><strong>Room</strong>Vision 3D</span>
      </button>

      {/* Project name + autosave indicator */}
      <div className="rv-project-info">
        <div className="rv-project-name-row">
          <input
            className="rv-project-name-input"
            value={editor.model.name}
            onChange={(e) => editor.renameProject(e.target.value)}
            spellCheck={false}
            aria-label="Project name"
          />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div className="rv-autosave">
          <span className="rv-autosave-dot" />
          <span>{time ? `Saved at ${time}` : 'Autosaves in this browser'}</span>
        </div>
      </div>

      {/* Undo / redo */}
      <div className="rv-topbar-group">
        <button className="rv-icon-btn" title="Undo (Ctrl+Z)" disabled={!editor.history.canUndo} onClick={() => editor.undo()}>
          <Icon name="undo" size={16} />
        </button>
        <button className="rv-icon-btn" title="Redo (Ctrl+Shift+Z)" disabled={!editor.history.canRedo} onClick={() => editor.redo()}>
          <Icon name="redo" size={16} />
        </button>
      </div>

      {/* View mode switcher */}
      <div className="rv-view-seg" role="group" aria-label="View mode">
        {(['2d', 'split', '3d'] as const).map((v) => (
          <button
            key={v}
            className={`rv-view-seg-btn${viewMode === v ? ' is-active' : ''}`}
            onClick={() => useUI.setState({ viewMode: v })}
          >
            {v === '2d' ? '2D' : v === 'split' ? 'Split' : '3D'}
          </button>
        ))}
      </div>

      <div className="rv-topbar-spacer" />

      {/* Collaborator avatars */}
      {(peers.length > 0 || collab.connected) && (
        <div className="rv-avatars" title={`${peers.length + 1} online`}>
          {[collab.me, ...peers].slice(0, 4).map((p) => (
            <span key={p.id} className="rv-avatar" style={{ background: p.color }}>
              {p.name.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>
      )}
      {!collab.connected && !peers.length && (
        <button className="rv-icon-btn" title="Collaborate" onClick={() => {}}>
          <Icon name="users" size={16} />
        </button>
      )}

      {/* Action buttons */}
      <button className="rv-btn rv-btn-ghost" onClick={() => saveProject(app)} title="Save (Ctrl+S)">
        <Icon name="save" size={15} /> Save
      </button>
      <button className="rv-btn rv-btn-ghost" onClick={() => useUI.setState({ dialog: 'project' })}>
        <Icon name="folder" size={15} /> Project
      </button>
      <button className="rv-btn rv-btn-share" onClick={() => useUI.setState({ dialog: 'project' })}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share
      </button>

      {/* Profile */}
      <button className="rv-avatar rv-avatar-btn" title="Profile" style={{ background: collab.me.color }}>
        {collab.me.name.slice(0, 1).toUpperCase()}
      </button>
    </header>
  );
}

// ---- nav rail ---------------------------------------------------------------------------------

const NAV_ITEMS: { tab: NavTab; label: string; icon: IconName }[] = [
  { tab: 'build',   label: 'Build',       icon: 'wall' },
  { tab: 'catalog', label: 'Catalog',     icon: 'layers' },
  { tab: 'scene',   label: 'Scene',       icon: 'sun' },
  { tab: 'collab',  label: 'Collaborate', icon: 'users' },
  { tab: 'history', label: 'History',     icon: 'undo' },
];

function NavRail({ active, onChange }: { active: NavTab; onChange: (t: NavTab) => void }) {
  return (
    <nav className="rv-nav-rail" aria-label="Editor sections">
      {NAV_ITEMS.map(({ tab, label, icon }) => (
        <button
          key={tab}
          className={`rv-nav-item${active === tab ? ' is-active' : ''}`}
          aria-pressed={active === tab}
          onClick={() => onChange(tab)}
          title={label}
        >
          <Icon name={icon} size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ---- build panel (toolbar) --------------------------------------------------------------------

const BUILD_TOOLS: { tool: Tool; label: string; icon: IconName; key: string }[] = [
  { tool: 'select',  label: 'Select',  icon: 'select',  key: '1' },
  { tool: 'wall',    label: 'Wall',    icon: 'wall',    key: '2' },
  { tool: 'room',    label: 'Room',    icon: 'room',    key: '3' },
  { tool: 'door',    label: 'Door',    icon: 'door',    key: '4' },
  { tool: 'window',  label: 'Window',  icon: 'window',  key: '5' },
  { tool: 'measure', label: 'Measure', icon: 'measure', key: '6' },
  { tool: 'delete',  label: 'Delete',  icon: 'trash',   key: '7' },
];

function BuildPanel() {
  const tool = useUI((s) => s.tool);
  return (
    <div className="rv-panel-content">
      <div className="rv-panel-heading">Build</div>
      <div className="rv-tool-grid">
        {BUILD_TOOLS.map((t) => (
          <button
            key={t.tool}
            className={`rv-tool-btn${tool === t.tool ? ' is-active' : ''}`}
            aria-pressed={tool === t.tool}
            title={`${t.label} (${t.key})`}
            onClick={() => selectTool(t.tool)}
          >
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- catalog panel ----------------------------------------------------------------------------

function CatalogPanel() {
  const app = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'All' | 'Furniture' | 'Decor'>('All');

  const items = CATALOG.filter((i) => {
    const matchCat = cat === 'All' || i.category === cat;
    const matchQ   = i.name.toLowerCase().includes(q.trim().toLowerCase());
    return matchCat && matchQ;
  });

  const place = (item: CatalogItem) => {
    const at = app.views.plan?.centerWorld() ?? { x: 4, y: 3 };
    const n  = app.editor.model.furniture.filter((f) => f.kind === item.kind).length;
    app.editor.addFurniture(item.kind, { x: at.x + (n % 4) * 0.4, y: at.y + (n % 4) * 0.4 });
    useUI.setState({ tool: 'select' });
    notify(`${item.name} added.`);
  };

  return (
    <div className="rv-panel-content">
      <div className="rv-panel-heading">Catalog</div>

      {/* Search */}
      <div className="rv-search-row">
        <div className="rv-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Search furniture..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search catalog"
          />
        </div>
        <button className="rv-icon-btn-sm" title="Filter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </button>
      </div>

      {/* Category tabs */}
      <div className="rv-cat-tabs">
        {(['All', 'Furniture', 'Decor'] as const).map((c) => (
          <button
            key={c}
            className={`rv-cat-tab${cat === c ? ' is-active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="rv-cat-grid">
        {items.map((item) => (
          <button
            key={item.kind}
            className="rv-cat-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DND_MIME, item.kind);
              e.dataTransfer.setData('text/plain', item.kind);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => place(item)}
            title={`${item.name}: drag or click to add`}
          >
            <CatalogIcon item={item} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      {items.length === 0 && <p className="rv-muted">Nothing matches.</p>}
    </div>
  );
}

function CatalogIcon({ item }: { item: CatalogItem }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current, ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const size = 60, dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const d = item.depth < 0.1 ? item.width * 0.5 : item.depth;
    const k = 44 / Math.max(item.width, d);
    ctx.translate(size / 2, size / 2);
    ctx.scale(k, k);
    drawFurnitureSymbol(ctx, item.kind, item.width, d, getPreset(item.defaultMaterial).color, 1.5 / k, 'rgba(30,34,41,0.7)');
  }, [item]);
  return <canvas ref={ref} width={60} height={60} style={{ width: 60, height: 60 }} aria-hidden="true" />;
}

// ---- status bar -------------------------------------------------------------------------------

const kfmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function StatusBar() {
  const { editor, views } = useApp();
  useModelVersion();
  const viewMode = useUI((s) => s.viewMode);
  const [stats, setStats] = useState({ fps: 0, vertices: 0, triangles: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const s = views.scene?.getStats();
      if (s) setStats({ fps: s.fps, vertices: s.vertices, triangles: s.triangles });
    }, 500);
    return () => clearInterval(id);
  }, [views]);

  const live = viewMode !== '2d' && !!views.scene;

  return (
    <footer className="rv-statusbar">
      <div className="rv-statusbar-stats">
        <span>Objects <strong>{editor.model.size}</strong></span>
        <span>Vertices <strong>{live || stats.vertices ? kfmt(stats.vertices) : '—'}</strong></span>
        <span>Triangles <strong>{live || stats.triangles ? kfmt(stats.triangles) : '—'}</strong></span>
        <span>FPS <strong className={stats.fps > 50 ? 'rv-fps-good' : stats.fps > 25 ? 'rv-fps-ok' : ''}>{live && stats.fps ? stats.fps : '—'}</strong></span>
      </div>
      <div className="rv-statusbar-hints">
        <span><kbd>Ctrl+Z</kbd> Undo</span>
        <span><kbd>Ctrl+S</kbd> Save</span>
        <span><kbd>R</kbd> Rotate</span>
        <span><kbd>F</kbd> Fit</span>
        <span><kbd>Del</kbd> Delete</span>
      </div>
    </footer>
  );
}

// ---- project dialog ---------------------------------------------------------------------------

function ProjectDialog() {
  const app = useApp();
  const open = useUI((s) => s.dialog === 'project');
  if (!open) return null;
  return <ProjectDialogBody app={app} />;
}

function ProjectDialogBody({ app }: { app: App }) {
  const { editor, storage } = app;
  const close = () => useUI.setState({ dialog: null });
  const [saved, setSaved] = useState(storage.list());
  const [text, setText]   = useState(() => JSON.stringify(editor.model.toJSON(), null, 2));
  const [error, setError] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const importText = () => {
    try { editor.loadProject(parseProject(JSON.parse(text))); notify('Project imported'); close(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not read this JSON'); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); notify('JSON copied to clipboard'); }
    catch { area.current?.select(); notify('Press Ctrl+C to copy'); }
  };
  const download = () => {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${editor.model.name.replace(/\W+/g, '-').toLowerCase() || 'project'}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Project"
      onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal__card">
        <header>
          <h2>Project</h2>
          <button className="icon-btn" aria-label="Close" onClick={close}><Icon name="close" /></button>
        </header>
        <div className="modal__cols">
          <section>
            <h3>Saved in this browser</h3>
            {saved.length === 0 && <p className="muted">Nothing saved yet.</p>}
            <ul className="saved">
              {saved.map((p) => (
                <li key={p.name}>
                  <div><b>{p.name}</b><small>{new Date(p.savedAt).toLocaleString()}</small></div>
                  <button className="btn" onClick={() => {
                    const d = storage.load(p.name);
                    if (d) { editor.loadProject(d); notify(`Opened "${p.name}"`); close(); }
                    else notify('That save is damaged');
                  }}>Open</button>
                  <button className="icon-btn" aria-label={`Delete ${p.name}`}
                    onClick={() => { storage.remove(p.name); setSaved(storage.list()); }}>
                    <Icon name="trash" size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="actions">
              <button className="btn" onClick={() => { editor.loadProject(createDemoProject()); close(); }}>Load demo apartment</button>
              <button className="btn" onClick={() => {
                editor.loadProject({ version: 1, name: 'Untitled', rooms: [], walls: [], furniture: [], doors: [], windows: [] });
                close();
              }}>New empty project</button>
            </div>
          </section>
          <section>
            <h3>JSON</h3>
            <textarea ref={area} value={text} spellCheck={false}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              aria-label="Project JSON" />
            {error && <p className="error">{error}</p>}
            <div className="actions">
              <button className="btn" onClick={copy}><Icon name="copy" size={15} /> Copy</button>
              <button className="btn" onClick={download}>Download .json</button>
              <button className="btn btn--primary" onClick={importText}>Import this JSON</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Toast() {
  const toast = useUI((s) => s.toast);
  return (
    <div className="toast-region" aria-live="polite">
      {toast && <div key={toast.id} className="toast">{toast.text}</div>}
    </div>
  );
}
