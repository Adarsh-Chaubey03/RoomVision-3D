import { Vec2, add, dot, mul, normalizeAngle, perp, radToDeg, snapVec, sub } from '../core/geometry';
import { Wall } from '../domain/Wall';

export interface SnapOptions {
  grid: number | null;
  walls: boolean;
  distance: number;
}
export interface SnapTarget {
  width: number;
  depth: number;
  wallSnap: boolean;
}
export interface SnapResult {
  position: Vec2;
  rotation?: number;
  wallId?: string;
}

export function snapFurniture(
  position: Vec2,
  target: SnapTarget,
  walls: readonly Wall[],
  opts: SnapOptions,
): SnapResult {
  if (opts.walls && target.wallSnap) {
    let best: { gap: number; result: SnapResult } | null = null;
    for (const wall of walls) {
      if (wall.length < 0.3) continue;
      const dir = wall.direction;
      const n = perp(dir);
      const rel = sub(position, wall.a);
      const along = dot(rel, dir);
      const across = dot(rel, n);
      if (along < -0.1 || along > wall.length + 0.1) continue;
      const normal = mul(n, across >= 0 ? 1 : -1);
      const flush = wall.thickness / 2 + target.depth / 2;
      const gap = Math.abs(Math.abs(across) - flush);
      if (gap > opts.distance) continue;
      if (!best || gap < best.gap) {
        best = {
          gap,
          result: {
            position: add(add(wall.a, mul(dir, along)), mul(normal, flush)),
            rotation: normalizeAngle(radToDeg(Math.atan2(-normal.x, normal.y)) + 0),
            wallId: wall.id,
          },
        };
      }
    }
    if (best) return best.result;
  }
  return { position: opts.grid ? snapVec(position, opts.grid) : { ...position } };
}
