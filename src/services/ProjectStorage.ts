import { ProjectData, parseProject } from '../domain/project';

export interface SavedProject { name: string; savedAt: number; }

const PREFIX   = 'roomvision3d:project:';
const AUTOSAVE = 'roomvision3d:autosave';

export class ProjectStorage {
  private read(key: string): { savedAt: number; data: unknown } | null {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as { savedAt: number; data: unknown }) : null; }
    catch { return null; }
  }

  private write(key: string, data: ProjectData): boolean {
    try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); return true; }
    catch { return false; }
  }

  saveAs(name: string, data: ProjectData): boolean { return this.write(PREFIX + name, data); }

  load(name: string): ProjectData | null {
    const rec = this.read(PREFIX + name);
    return rec ? this.safeParse(rec.data) : null;
  }

  remove(name: string): void { try { localStorage.removeItem(PREFIX + name); } catch { /* ignore */ } }

  list(): SavedProject[] {
    const out: SavedProject[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIX)) { const rec = this.read(key); if (rec) out.push({ name: key.slice(PREFIX.length), savedAt: rec.savedAt }); }
      }
    } catch { /* ignore */ }
    return out.sort((a, b) => b.savedAt - a.savedAt);
  }

  autosave(data: ProjectData): void { this.write(AUTOSAVE, data); }
  loadAutosave(): ProjectData | null { const rec = this.read(AUTOSAVE); return rec ? this.safeParse(rec.data) : null; }

  private safeParse(raw: unknown): ProjectData | null {
    try { return parseProject(raw); } catch { return null; }
  }
}
