import { useEffect, useRef, useState } from 'react';
import { Canvas2DView } from '../view2d/Canvas2DView';
import { ThreeView } from '../engine/ThreeView';
import { Tool } from '../editor/types';
import { useApp, useSelectedEntity } from './appState';
import { Icon } from './Icon';
import { Segmented } from './fields';
import { UIState, useUI } from './store';

const HINTS: Record<Tool, string> = {
  select:  'Drag to move objects · drag empty space to pan · scroll to zoom',
  wall:    'Click to place wall points · double-click or Esc to finish · Shift for straight lines',
  room:    'Drag a rectangle to create a room with four walls and a floor',
  door:    'Hover over a wall and click to place a door',
  window:  'Hover over a wall and click to place a window',
  measure: 'Click two points to measure the distance',
  delete:  'Click any object to delete it',
};

export function Viewport() {
  const viewMode = useUI((s) => s.viewMode);
  return (
    <div className={`rv-viewport rv-viewport--${viewMode}`}>
      <PlanPane />
      <ScenePane />
    </div>
  );
}

function PlanPane() {
  const app  = useApp();
  const ref  = useRef<HTMLDivElement>(null);
  const viewMode = useUI((s) => s.viewMode);
  const tool     = useUI((s) => s.tool);

  useEffect(() => {
    const view = new Canvas2DView(ref.current as HTMLDivElement, app.editor, { interactive: true });
    app.views.plan = view;
    const sync = (s: UIState) =>
      view.setSettings({ tool: s.tool, snapGrid: s.snapGrid, showDimensions: s.showDimensions });
    sync(useUI.getState());
    const off = useUI.subscribe(sync);
    return () => {
      off(); view.dispose();
      if (app.views.plan === view) app.views.plan = undefined;
    };
  }, [app]);

  useEffect(() => { app.views.plan?.setVisible(viewMode !== '3d'); }, [viewMode, app]);

  return (
    <section className="rv-pane" hidden={viewMode === '3d'} aria-label="2D plan">
      {/* canvas */}
      <div className="rv-pane-canvas" ref={ref} />

      {/* top-left label + icons */}
      <div className="rv-pane-header">
        <span className="rv-pane-tag">2D Plan</span>
        <div className="rv-pane-header-actions">
          <button className="rv-pane-icon-btn" title="Layers"><Icon name="layers" size={15} /></button>
          <button className="rv-pane-icon-btn" title="Fit view (F)" onClick={() => app.editor.fitViews()}><Icon name="fit" size={15} /></button>
          <button className="rv-pane-icon-btn" title="Fullscreen"><Icon name="plus" size={15} /></button>
        </div>
      </div>

      {/* zoom controls bottom-right */}
      <div className="rv-pane-tools-br">
        <button className="rv-pane-icon-btn" title="Zoom in"  onClick={() => app.views.plan?.zoomBy(1.25)}><Icon name="plus"  size={15} /></button>
        <button className="rv-pane-icon-btn" title="Zoom out" onClick={() => app.views.plan?.zoomBy(0.8)}> <Icon name="minus" size={15} /></button>
        <button className="rv-pane-icon-btn" title="Fit (F)"  onClick={() => app.editor.fitViews()}>       <Icon name="fit"   size={15} /></button>
      </div>

      {/* hint */}
      <div className="rv-pane-hint">{HINTS[tool]}</div>
    </section>
  );
}

function ScenePane() {
  const app      = useApp();
  const ref      = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const viewMode = useUI((s) => s.viewMode);
  const gizmo    = useUI((s) => s.gizmo);
  const wallMode = useUI((s) => s.wallMode);
  const selected = useSelectedEntity();

  useEffect(() => {
    if (!ThreeView.isSupported()) {
      setError('WebGL is not available — the 3D view is disabled. The 2D editor still works.');
      return;
    }
    let view: ThreeView;
    try {
      view = new ThreeView(ref.current as HTMLDivElement, app.editor, { interactive: true });
    } catch (e) {
      setError(`Could not start 3D renderer: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    app.views.scene = view;
    const sync = (s: UIState) =>
      view.setSettings({ daylight: s.daylight, wallMode: s.wallMode, shadows: s.shadows, gizmo: s.gizmo, snapGrid: s.snapGrid });
    sync(useUI.getState());
    view.setVisible(useUI.getState().viewMode !== '2d');
    const off = useUI.subscribe(sync);
    return () => {
      off(); view.dispose();
      if (app.views.scene === view) app.views.scene = undefined;
    };
  }, [app]);

  useEffect(() => { app.views.scene?.setVisible(viewMode !== '2d'); }, [viewMode, app]);

  return (
    <section className="rv-pane rv-pane-3d" hidden={viewMode === '2d'} aria-label="3D view">
      <div className="rv-pane-canvas" ref={ref} />
      {error && <div className="rv-pane-error">{error}</div>}

      {/* top-left label */}
      <div className="rv-pane-header">
        <span className="rv-pane-tag rv-pane-tag-3d">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          3D View
        </span>
        {!error && (
          <div className="rv-pane-header-actions">
            <button className="rv-pane-icon-btn" title="Fit view (F)" onClick={() => app.editor.fitViews()}>
              <Icon name="fit" size={15} />
            </button>
          </div>
        )}
      </div>

      {/* top-right controls */}
      {!error && (
        <div className="rv-pane-tools-tr">
          {/* Wall mode */}
          <div className="rv-seg-compact" role="group" aria-label="Wall mode">
            {(['auto', 'up', 'down'] as const).map((v) => (
              <button
                key={v}
                className={`rv-seg-btn${wallMode === v ? ' is-active' : ''}`}
                onClick={() => useUI.setState({ wallMode: v })}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Gizmo mode — only when furniture selected */}
          {selected?.type === 'furniture' && (
            <Segmented
              label="Transform"
              value={gizmo}
              onChange={(v) => useUI.setState({ gizmo: v })}
              options={[
                { value: 'translate', label: 'Move',   icon: 'move'   },
                { value: 'rotate',    label: 'Rotate', icon: 'rotate' },
                { value: 'scale',     label: 'Scale',  icon: 'scale'  },
              ]}
            />
          )}
        </div>
      )}

      {/* bottom 3D toolbar */}
      {!error && (
        <div className="rv-pane-tools-3d-bottom">
          <button className="rv-pane-3d-btn" title="Select"><Icon name="select" size={16} /></button>
          <button className="rv-pane-3d-btn" title="Pan"><Icon name="move" size={16} /></button>
          <button className="rv-pane-3d-btn" title="Orbit"><Icon name="rotate" size={16} /></button>
          <button className="rv-pane-3d-btn" title="Zoom out"><Icon name="minus" size={16} /></button>
          <button className="rv-pane-3d-btn" title="Fit view (F)" onClick={() => app.editor.fitViews()}><Icon name="fit" size={16} /></button>
        </div>
      )}
    </section>
  );
}
