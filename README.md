# RoomVision 3D

**Design. Visualize. Experience.**

An interactive, browser-based 2D/3D room planner for creating floor plans, arranging furniture, and exploring interior layouts in 3D.

[Live Demo](https://roomvision.adarshchaubey.tech/) · [Source Code](https://github.com/Adarsh-Chaubey03/RoomVision-3D)

## Features

- **2D floor planner** — Draw rooms and walls, add doors and windows, measure spaces, and use grid and corner snapping.
- **3D visualization** — Explore the same design in a Three.js scene with materials, lighting, shadows, and an orbit camera.
- **Furniture catalog** — Place furniture and decor in the plan or 3D view; move, rotate, and resize objects.
- **Editing history** — Undo and redo design changes.
- **Save and restore** — Autosave in the browser, manage named projects, and import or export designs as JSON.
- **Collaboration** — Synchronize edits across browser tabs or through the optional WebSocket relay.
- **Performance tools** — View object, vertex, triangle, and FPS counters.

## Getting Started

### Requirements

- Node.js 22 LTS
- Git

### Install

```bash
git clone https://github.com/Adarsh-Chaubey03/RoomVision-3D.git
cd RoomVision-3D
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run the test suite |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run ws` | Start the optional WebSocket collaboration relay |

## Technology

React · TypeScript · Three.js · WebGL2 · Zustand · Canvas 2D · Vite

## License

This project is licensed under the [MIT License](LICENSE).

---

Developed by **Adarsh Chaubey**.
