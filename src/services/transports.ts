import { EntityType } from '../domain/Entity';
import { EntityData } from '../domain/factory';
import { ProjectData } from '../domain/project';

export interface PeerBasic { id: string; name: string; color: string; }

export type Op =
  | { k: 'upsert'; type: EntityType; data: EntityData }
  | { k: 'remove'; id: string }
  | { k: 'reset';  project: ProjectData };

export type Message =
  | { t: 'hello';    from: PeerBasic; joinedAt: number }
  | { t: 'presence'; from: PeerBasic; editing: boolean }
  | { t: 'op';       from: PeerBasic; ops: Op[] }
  | { t: 'snapshot'; from: PeerBasic; to: string; project: ProjectData }
  | { t: 'bye';      from: PeerBasic };

export interface Transport {
  send(msg: Message): void;
  onMessage(cb: (msg: Message) => void): void;
  close(): void;
}

export class BroadcastTransport implements Transport {
  private readonly channel = new BroadcastChannel('roomvision3d-collab');
  send(msg: Message): void { this.channel.postMessage(msg); }
  onMessage(cb: (msg: Message) => void): void { this.channel.onmessage = (e: MessageEvent<Message>) => cb(e.data); }
  close(): void { this.channel.close(); }
}

export class WebSocketTransport implements Transport {
  private readonly ws: WebSocket;
  private readonly queue: string[] = [];
  private handler: ((msg: Message) => void) | null = null;

  constructor(url: string, onStatus: (status: 'open' | 'closed' | 'error') => void) {
    this.ws = new WebSocket(url);
    this.ws.onopen    = () => { this.queue.splice(0).forEach((m) => this.ws.send(m)); onStatus('open'); };
    this.ws.onerror   = () => onStatus('error');
    this.ws.onclose   = () => onStatus('closed');
    this.ws.onmessage = (e) => { try { this.handler?.(JSON.parse(String(e.data)) as Message); } catch { /* ignore */ } };
  }
  send(msg: Message): void {
    const raw = JSON.stringify(msg);
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(raw);
    else if (this.ws.readyState === WebSocket.CONNECTING) this.queue.push(raw);
  }
  onMessage(cb: (msg: Message) => void): void { this.handler = cb; }
  close(): void { this.ws.close(); }
}
