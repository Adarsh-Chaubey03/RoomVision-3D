# RoomVision 3D

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-WebGL2-black?logo=threedotjs&logoColor=white)

**Interactive 2D / 3D room designer that runs entirely in the browser.**  
Draw walls on a 2D plan, place furniture from the catalog, and see the same room in 3D — one data model drives both views, every change can be undone, and several people can edit together in real time.

---

## Features

- **2D editor** — walls, rooms, doors and windows with grid + corner snapping, live dimensions, measuring tool, rotate / resize handles
- **3D scene** — walls with real cut-out openings, floor materials, day / night lighting with shadows, dollhouse wall-lowering, orbit camera with move / rotate / scale gizmos
- **Furniture catalog** — drag items into the plan or straight into 3D; furniture snaps flush to a wall and turns its back to it
- **Undo / redo** — every action (including drags) is undoable; rapid edits of one field merge into a single step
- **Collaboration** — live sync over WebSocket or between browser tabs; built-in simulated teammate for demos
- **Performance** — shared geometry + materials, lazy wall rebuilds, hidden views pause rendering, live object / vertex / triangle / FPS counters
- **Saving** — autosave, named projects, JSON export / import
- **Tests** — 29 Jest tests covering geometry, model, history, wall snapping and two-client sync

---

## Run locally

**Requirements:** [Node.js](https://nodejs.org) 22 LTS and Git.

```bash
git clone https://github.com/Adarsh-Chaubey03/RoomVision-3D.git
cd RoomVision-3D
npm install
npm run dev          # → http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Run all Jest tests |
| `npm run typecheck` | TypeScript type-check only |
| `npm run build` | Type-check + production build into `dist/` |
| `npm run ws` | Optional WebSocket collaboration relay on `ws://localhost:8080` |

Open with `?debug` (e.g. `localhost:5173/?debug`) to expose `window.__rv` in the console.

---

## Architecture

**One model, two views.** The plan and the 3D scene never talk to each other. Both are projections of a single `SceneModel`; they subscribe to its change events and redraw.

```
React UI ──▶ Editor ──▶ Commands ──▶ SceneModel ◀── CollaborationService
                                         │  change events
                         ┌───────────────┼──────────────┐
                   Canvas2DView      ThreeView      ProjectStorage
```

```
src/
├── core/       EventBus · SceneModel · geometry helpers · ids
├── domain/     Entity → Wall · Furniture · Opening · Room · catalog · materials · demo
├── editor/     Editor facade · Command pattern · HistoryManager · SelectionManager · snapping
├── engine/     ThreeView · FurnitureFactory · ModelLibrary (GLB) · wall/room builders · materials · textures
├── view2d/     Canvas2DView · furniture symbols
├── services/   ProjectStorage · CollaborationService · transports (BroadcastChannel / WebSocket)
└── ui/         React components · Zustand store · landing page
```

**Key design decisions:**

- **Command pattern** — every mutation is a `Command` with `execute()` / `undo()`. Drags commit one command via a `Transaction`; rapid slider edits merge into one step.
- **Document vs UI state** — the scene lives in OOP classes with its own history and serialisation. Zustand only holds UI state (active tool, layout, lighting).
- **Origin tagging** — model changes carry `'local' | 'remote'`. Remote changes update both views but never re-broadcast and never enter the undo stack.
- **Collaboration** — local ops are coalesced (40 ms) into `upsert` / `remove` messages. Conflict policy: last-write-wins per entity. The oldest session hands its project to newcomers.

---

## Real 3D models (GLB)

Drop `sofa.glb`, `bed.glb`, `table.glb` … into `public/models/` and reload. Each model is normalised automatically (centred, standing on y = 0, scaled to catalog dimensions). The **3D models** panel in the editor shows what was loaded and lets you rotate a model 90° if its front faces the wrong way.

---

## Tests

```bash
npm test
```

29 tests across 4 suites: geometry, scene model (round-trip, events, import validation), undo/redo (drags, merged edits, cascading deletes), wall snapping, and two-client collaboration sync.

---

## License

[MIT](LICENSE) — © 2026 Adarsh Chaubey
