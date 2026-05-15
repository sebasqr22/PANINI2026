import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly allBaseIds: string[] = [
    ...FWC_STICKERS.map((s: any) => s.id),
    ...TEAMS.flatMap((t: any) => t.stickers.map((s: any) => s.id)),
  ];
  private readonly allCocaIds: string[] = COCA_STICKERS.map((s: any) => s.id);

  readonly totalBase = this.allBaseIds.length;
  readonly totalCoca = this.allCocaIds.length;

  readonly currentUser = computed(() => this.api.storedUsername());
  readonly isLoggedIn  = computed(() => !!this.api.token());

  private _owned    = signal<Record<string, boolean>>({});
  private _repeated = signal<Record<string, number>>({});
  private _loading  = signal(false);
  private _syncing  = signal(false);

  readonly loading  = this._loading.asReadonly();
  readonly syncing  = this._syncing.asReadonly();

  readonly ownedCount = computed(() =>
    Object.keys(this._owned()).filter(k => (this._owned() as any)[k] && this.allBaseIds.includes(k)).length
  );
  readonly cocaOwnedCount = computed(() =>
    Object.keys(this._owned()).filter(k => (this._owned() as any)[k] && this.allCocaIds.includes(k)).length
  );
  readonly missingCount  = computed(() => this.totalBase - this.ownedCount());
  readonly repeatedCount = computed(() => Object.values(this._repeated()).reduce((a, b) => a + b, 0));
  readonly completionPct = computed(() => Math.round((this.ownedCount() / this.totalBase) * 100));
  readonly fullTeams     = computed(() => {
    const o = this._owned();
    return TEAMS.filter(t => t.stickers.every(s => (o as any)[s.id])).length;
  });

  constructor(private api: ApiService) {
    if (this.api.token()) this.loadCollection();
  }

  async register(username: string, password: string): Promise<void> {
    await this.api.register(username, password);
    await this.loadCollection();
  }

  async login(username: string, password: string): Promise<void> {
    await this.api.login(username, password);
    await this.loadCollection();
  }

  logout() {
    this.api.logout();
    this._owned.set({});
    this._repeated.set({});
  }

  async loadCollection(): Promise<void> {
    this._loading.set(true);
    try {
      const data = await this.api.getCollection();
      this._owned.set(data.owned ?? {});
      this._repeated.set(data.repeated ?? {});
    } catch (e) {
      console.error('Error loading collection', e);
    } finally {
      this._loading.set(false);
    }
  }

  isOwned(id: string): boolean { return !!(this._owned() as any)[id]; }
  getRepeated(id: string): number { return (this._repeated() as any)[id] ?? 0; }

  async setOwned(id: string, owned: boolean): Promise<void> {
    if (owned) {
      this._owned.update(o => ({ ...o, [id]: true }));
    } else {
      this._owned.update(o => { const n = { ...o }; delete (n as any)[id]; return n; });
      this._repeated.update(r => { const n = { ...r }; delete (n as any)[id]; return n; });
    }
    this._syncing.set(true);
    try { await this.api.updateSticker(id, owned); }
    catch (e) { console.error('Sync error', e); await this.loadCollection(); }
    finally { this._syncing.set(false); }
  }

  async setRepeated(id: string, count: number): Promise<void> {
    if (count > 0) {
      this._owned.update(o => ({ ...o, [id]: true }));
      this._repeated.update(r => ({ ...r, [id]: count }));
    } else {
      this._repeated.update(r => { const n = { ...r }; delete (n as any)[id]; return n; });
    }
    this._syncing.set(true);
    try { await this.api.updateSticker(id, undefined, count); }
    catch (e) { console.error('Sync error', e); await this.loadCollection(); }
    finally { this._syncing.set(false); }
  }

  getMissingIds(): string[] {
    const o = this._owned();
    return this.allBaseIds.filter(id => !(o as any)[id]);
  }

  getRepeatedMap(): Record<string, number> { return this._repeated(); }
}