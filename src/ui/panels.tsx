import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { Furniture } from '../domain/Furniture';
import { Opening } from '../domain/Opening';
import { Room } from '../domain/Room';
import { Wall } from '../domain/Wall';
import { add, mul } from '../core/geometry';
import { CATALOG, getCatalogItem } from '../domain/catalog';
import { modelLibrary } from '../engine/ModelLibrary';
import { FLOOR_MATERIALS, FURNITURE_MATERIALS, WALL_MATERIALS } from '../domain/materials';
import { BroadcastTransport, WebSocketTransport } from '../services/transports';
import { useApp, useHistoryVersion, useModelVersion, useSelectedEntity } from './appState';
import { Icon } from './Icon';
import { MaterialPicker, NumberField, Segmented, Toggle } from './fields';
import { notify, useUI } from './store';

function useModelsVersion(): number {
  return useSyncExternalStore(modelLibrary.subscribe, modelLibrary.getVersion);
}

// ---- Collapsible right-panel section ----------------------------------------------------------

function RvSection({
  title, icon, children, defaultOpen = true, badge,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rv-section">
      <button className="rv-section-header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="rv-section-toggle">{open ? '∨' : '›'}</span>
        {icon && <span className="rv-section-icon">{icon}</span>}
        <span className="rv-section-title">{title}</span>
        {badge && <span className="rv-section-badge">{badge}</span>}
      </button>
      {open && <div className="rv-section-body">{children}</div>}
    </div>
  );
}

// ---- Properties -------------------------------------------------------------------------------

export function PropertiesPanel({ compact: _compact }: { compact?: boolean } = {}) {
  const entity = useSelectedEntity();
  if (!entity) return <EmptyProperties />;
  switch (entity.type) {
    case 'furniture': return <FurnitureProps f={entity} />;
    case 'wall':      return <WallProps w={entity} />;
    case 'opening':   return <OpeningProps o={entity} />;
    case 'room':      return <RoomProps r={entity} />;
  }
}

function EmptyProperties() {
  const { editor } = useApp(); useModelVersion();
  const m = editor.model;
  return (
    <RvSection
      title="Properties"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"/></svg>}
    >
      <p className="rv-muted">Select an object to edit its properties.</p>
      <div className="rv-stats">
        <div><span>Rooms</span><strong>{m.rooms.length}</strong></div>
        <div><span>Walls</span><strong>{m.walls.length}</strong></div>
        <div><span>Furniture</span><strong>{m.furniture.length}</strong></div>
        <div><span>Openings</span><strong>{m.openings.length}</strong></div>
        <div><span>Floor area</span><strong>{m.rooms.reduce((s, r) => s + r.area, 0).toFixed(1)} m²</strong></div>
      </div>
    </RvSection>
  );
}

function PanelActions({ id, duplicate }: { id: string; duplicate?: boolean }) {
  const { editor } = useApp();
  return (
    <div className="rv-actions">
      {duplicate && (
        <button className="rv-btn-sm" onClick={() => editor.duplicateSelected()}>
          <Icon name="copy" size={13} /> Duplicate
        </button>
      )}
      <button className="rv-btn-sm rv-btn-danger" onClick={() => editor.deleteEntity(id)}>
        <Icon name="trash" size={13} /> Delete
      </button>
    </div>
  );
}

function FurnitureProps({ f }: { f: Furniture }) {
  const { editor } = useApp();
  const item = getCatalogItem(f.kind);
  useModelsVersion();
  const edit = (patch: Record<string, unknown>) => editor.edit(f.id, patch);

  return (
    <RvSection
      title={f.name}
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2"/></svg>}
      badge={<span className="rv-badge">{item.category}</span>}
    >
      <div className="rv-prop-label">Position</div>
      <div className="rv-prop-row">
        <NumberField label="X" unit="m" value={f.position.x} onChange={(x) => edit({ position: { x, y: f.position.y } })} />
        <NumberField label="Y" unit="m" value={f.position.y} onChange={(y) => edit({ position: { x: f.position.x, y } })} />
        <NumberField label="Z" unit="m" value={f.elevation} onChange={(elevation) => edit({ elevation })} />
      </div>
      <div className="rv-prop-label">Rotation</div>
      <div className="rv-prop-rotation">
        <span className="rv-rotation-icon">↻</span>
        <input
          type="number" min={0} max={360} step={5}
          value={Math.round(f.rotation)}
          onChange={(e) => edit({ rotation: Number(e.target.value) % 360 })}
          className="rv-rotation-input"
          aria-label="Rotation degrees"
        />
        <span className="rv-rotation-unit">°</span>
      </div>
      <div className="rv-prop-label">Size</div>
      <div className="rv-prop-row">
        <NumberField label="W" unit="m" min={0.05} value={f.width}  onChange={(width)  => edit({ width })} />
        <NumberField label="D" unit="m" min={0.02} value={f.depth}  onChange={(depth)  => edit({ depth })} />
        <NumberField label="H" unit="m" min={0.02} value={f.height} onChange={(height) => edit({ height })} />
      </div>
      {item.paintable && !modelLibrary.has(f.kind) && (
        <>
          <div className="rv-prop-label">Material</div>
          <MaterialPicker ids={FURNITURE_MATERIALS} value={f.material} onPick={(material) => edit({ material })} />
        </>
      )}
      <PanelActions id={f.id} duplicate />
    </RvSection>
  );
}

function WallProps({ w }: { w: Wall }) {
  const { editor } = useApp();
  const edit = (patch: Record<string, unknown>) => editor.edit(w.id, patch);
  return (
    <RvSection
      title="Wall"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18M3 20V9h18v11"/><path d="M3 14.5h18M9 9v5.5M15 14.5V20M9 20v-5.5"/></svg>}
    >
      <div className="rv-prop-row">
        <NumberField label="Length" unit="m" min={0.2} value={w.length} onChange={(len) => edit({ b: add(w.a, mul(w.direction, len)) })} />
        <NumberField label="Thickness" unit="m" min={0.05} max={0.6} value={w.thickness} onChange={(thickness) => edit({ thickness })} />
        <NumberField label="Height" unit="m" min={1} max={6} value={w.height} onChange={(height) => edit({ height })} />
      </div>
      <div className="rv-prop-label">Colour</div>
      <MaterialPicker ids={WALL_MATERIALS} value={w.material} onPick={(material) => edit({ material })} />
      <PanelActions id={w.id} />
    </RvSection>
  );
}

function OpeningProps({ o }: { o: Opening }) {
  const { editor } = useApp();
  const edit = (patch: Record<string, unknown>) => editor.edit(o.id, patch);
  const wall = editor.model.get(o.wallId);
  const wallLength = wall?.type === 'wall' ? wall.length : 10;
  return (
    <RvSection title={o.kind === 'door' ? 'Door' : 'Window'}>
      <NumberField label="Offset" unit="m" min={0} max={wallLength} value={o.offset} onChange={(offset) => edit({ offset })} />
      <div className="rv-prop-row">
        <NumberField label="W" unit="m" min={0.4} max={4} value={o.width}  onChange={(width)  => edit({ width })} />
        <NumberField label="H" unit="m" min={0.4} max={3} value={o.height} onChange={(height) => edit({ height })} />
      </div>
      {o.kind === 'window' && (
        <NumberField label="Sill" unit="m" min={0} max={2} value={o.sill} onChange={(sill) => edit({ sill })} />
      )}
      <PanelActions id={o.id} />
    </RvSection>
  );
}

function RoomProps({ r }: { r: Room }) {
  const { editor } = useApp();
  const edit = (patch: Record<string, unknown>) => editor.edit(r.id, patch);
  return (
    <RvSection title="Room" badge={<span className="rv-badge">{r.area.toFixed(1)} m²</span>}>
      <label className="rv-name-field">
        <span>Name</span>
        <input type="text" value={r.name} onChange={(e) => edit({ name: e.target.value })} />
      </label>
      <div className="rv-prop-label">Floor</div>
      <MaterialPicker ids={FLOOR_MATERIALS} value={r.material} onPick={(material) => edit({ material })} />
      <PanelActions id={r.id} />
    </RvSection>
  );
}

// ---- Scene panel ------------------------------------------------------------------------------

export function ScenePanel({ compact }: { compact?: boolean } = {}) {
  const s = useUI();
  if (compact) {
    return (
      <RvSection
        title="Scene"
        defaultOpen={false}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>}
      >
        <SceneControls />
      </RvSection>
    );
  }
  return (
    <div className="rv-panel-content">
      <div className="rv-panel-heading">Scene</div>
      <SceneControls />
    </div>
  );

  function SceneControls() {
    return (
      <>
        <Segmented
          label="Lighting"
          value={s.daylight}
          onChange={(daylight) => useUI.setState({ daylight })}
          options={[{ value: 'day', label: 'Day', icon: 'sun' }, { value: 'night', label: 'Night', icon: 'moon' }]}
        />
        <div className="rv-toggles">
          <Toggle label="Shadows"           checked={s.shadows}        onChange={(shadows)        => useUI.setState({ shadows })} />
          <Toggle label="Snap to grid"      checked={s.snapGrid}       onChange={(snapGrid)       => useUI.setState({ snapGrid })} />
          <Toggle label="Snap to walls"     checked={s.snapWalls}      onChange={(snapWalls)      => useUI.setState({ snapWalls })} hint="Hold Alt to override" />
          <Toggle label="Wall dimensions"   checked={s.showDimensions} onChange={(showDimensions) => useUI.setState({ showDimensions })} />
        </div>
      </>
    );
  }
}

// ---- 3D Models panel --------------------------------------------------------------------------

export function ModelsPanel({ compact }: { compact?: boolean } = {}) {
  useModelsVersion();
  const glbCount = CATALOG.filter((i) => modelLibrary.has(i.kind)).length;

  const copy = async () => {
    try { await navigator.clipboard.writeText(modelLibrary.exportOverrides()); notify('models.json copied'); }
    catch { notify('Could not access clipboard'); }
  };

  const inner = (
    <>
      <p className="rv-muted">Drop <code>.glb</code> files into <code>public/models/</code> and reload.</p>
      <ul className="rv-models-list">
        {CATALOG.map((item) => {
          const st = modelLibrary.getStatus(item.kind);
          return (
            <li key={item.kind}>
              <span className={`rv-status-dot${st.state === 'glb' ? ' on' : st.state === 'error' ? ' err' : ''}`} />
              <span className="rv-models-name">
                {item.name}
                <small>
                  {st.state === 'glb'        && `${st.file}, ${st.triangles.toLocaleString()} tri`}
                  {st.state === 'procedural' && 'procedural'}
                  {st.state === 'error'      && st.message}
                  {st.state === 'loading'    && 'loading…'}
                </small>
              </span>
              {st.state === 'glb' && (
                <button className="rv-btn-sm" onClick={() => modelLibrary.rotate(item.kind, 90)}>
                  <Icon name="rotate" size={12} /> {modelLibrary.getRotation(item.kind)}°
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {glbCount > 0 && (
        <button className="rv-btn-sm" onClick={copy}><Icon name="copy" size={13} /> Copy models.json</button>
      )}
    </>
  );

  if (compact) {
    return (
      <RvSection
        title="3D Models"
        defaultOpen={false}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
        badge={<span className="rv-badge">{glbCount}/{CATALOG.length} GLB</span>}
      >
        {inner}
      </RvSection>
    );
  }
  return (
    <div className="rv-panel-content">
      <div className="rv-panel-heading">3D Models <span className="rv-badge">{glbCount}/{CATALOG.length}</span></div>
      {inner}
    </div>
  );
}

// ---- Collaboration panel ----------------------------------------------------------------------

export function useCollabTick(): void {
  const { collab } = useApp();
  const [, set] = useState(0);
  useEffect(() => {
    const bump = () => set((n) => n + 1);
    const offs = [
      collab.bus.on('peers', bump),
      collab.bus.on('activity', bump),
      collab.bus.on('status', bump),
    ];
    return () => offs.forEach((o) => o());
  }, [collab]);
}

export function CollabPanel({ compact }: { compact?: boolean } = {}) {
  const { collab } = useApp();
  useCollabTick();
  const [url, setUrl] = useState('ws://localhost:8080');
  const hasBC = typeof BroadcastChannel !== 'undefined';
  const peers = collab.peerList;

  const connectTabs = () => collab.connect(new BroadcastTransport(), 'Syncing with other tabs');
  const connectWs   = () => {
    try {
      const t = new WebSocketTransport(url, (st) => {
        if (st === 'error') notify('WebSocket connection failed.');
        if (st === 'closed' && collab.connected) collab.disconnect();
      });
      collab.connect(t, `Connected to ${url}`);
    } catch (e) { notify(`Cannot open WebSocket: ${e instanceof Error ? e.message : String(e)}`); }
  };

  const statusDot = <span className={`rv-status-dot${collab.connected || collab.simulating ? ' on' : ''}`} style={{ display: 'inline-block' }} />;

  const inner = (
    <>
      <label className="rv-name-field">
        <span>Your name</span>
        <input type="text" defaultValue={collab.me.name}
          onBlur={(e) => collab.setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
      </label>
      <div className="rv-actions">
        {collab.connected
          ? <button className="rv-btn-sm" onClick={() => collab.disconnect()}>Disconnect</button>
          : <button className="rv-btn-sm rv-btn-primary" disabled={!hasBC} onClick={connectTabs}>
              <Icon name="users" size={13} /> Sync tabs
            </button>
        }
        <button className={`rv-btn-sm${collab.simulating ? ' rv-btn-on' : ''}`}
          onClick={() => collab.setSimulated(!collab.simulating)}>
          {collab.simulating ? 'Stop Alex' : 'Simulate Alex'}
        </button>
      </div>
      {collab.connected && <p className="rv-muted">{collab.label}</p>}
      <div className="rv-ws-row">
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          aria-label="WebSocket URL" spellCheck={false} />
        <button className="rv-btn-sm" onClick={connectWs} disabled={collab.connected}>Connect</button>
      </div>
      <div className="rv-prop-label">Online</div>
      <ul className="rv-peers">
        <li>
          <span className="rv-peer-dot" style={{ background: collab.me.color }} />
          {collab.me.name} <em>you</em>
        </li>
        {peers.map((p) => (
          <li key={p.id}>
            <span className="rv-peer-dot" style={{ background: p.color }} />
            {p.name} <em>{p.status}</em>
          </li>
        ))}
        {peers.length === 0 && <li className="rv-muted">Nobody else here yet.</li>}
      </ul>
      {collab.activity.length > 0 && (
        <>
          <div className="rv-prop-label">Activity</div>
          <ul className="rv-activity">
            {collab.activity.slice(0, 5).map((a) => (
              <li key={a.id}>
                <span className="rv-peer-dot" style={{ background: a.color }} />
                <strong>{a.user}</strong> {a.text}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );

  if (compact) {
    return (
      <RvSection
        title="Collaboration"
        defaultOpen={false}
        icon={<Icon name="users" size={14} />}
        badge={statusDot}
      >
        {inner}
      </RvSection>
    );
  }
  return (
    <div className="rv-panel-content">
      <div className="rv-panel-heading">Collaboration {statusDot}</div>
      {inner}
    </div>
  );
}

// ---- History panel ----------------------------------------------------------------------------

export function HistoryPanel({ compact }: { compact?: boolean } = {}) {
  const { editor } = useApp();
  useHistoryVersion();
  const entries = editor.history.entries;
  const shown   = entries.slice(-40);

  const controls = (
    <div className="rv-hist-controls">
      <button className="rv-icon-btn-sm" title="Undo" disabled={!editor.history.canUndo}
        onClick={() => editor.undo()}><Icon name="undo" size={14} /></button>
      <button className="rv-icon-btn-sm" title="Redo" disabled={!editor.history.canRedo}
        onClick={() => editor.redo()}><Icon name="redo" size={14} /></button>
    </div>
  );

  const inner = (
    <>
      {controls}
      {shown.length === 0
        ? <p className="rv-muted">No history yet.</p>
        : (
          <ol className="rv-history">
            {shown.map((h, i) => (
              <li key={i} className={h.state === 'undone' ? 'is-undone' : ''}>{h.label}</li>
            ))}
          </ol>
        )
      }
    </>
  );

  if (compact) {
    return (
      <RvSection
        title="History"
        defaultOpen={false}
        icon={<Icon name="undo" size={14} />}
      >
        {inner}
      </RvSection>
    );
  }
  return (
    <div className="rv-panel-content">
      <div className="rv-panel-heading">History</div>
      {inner}
    </div>
  );
}
