import { Injectable, signal, computed } from '@angular/core';
import { UserCollection } from '../models/sticker.model';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';

const STORAGE_KEY = 'panini2026_collections';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly allBaseIds: string[] = [
    ...FWC_STICKERS.map(s => s.id),
    ...TEAMS.flatMap(t => t.stickers.map(s => s.id)),
  ];
  private readonly allCocaIds: string[] = COCA_STICKERS.map(s => s.id);
  readonly allIds = [...this.allBaseIds, ...this.allCocaIds];
  readonly totalBase = this.allBaseIds.length;        // 980
  readonly totalCoca = this.allCocaIds.length;        // 14
  readonly totalAll = this.allIds.length;             // 994

  private _currentUser = signal<string | null>(null);
  private _collection = signal<UserCollection | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly collection = this._collection.asReadonly();

  readonly ownedCount = computed(() => {
    const col = this._collection();
    if (!col) return 0;
    return Object.keys(col.owned).filter(k => col.owned[k] && this.allBaseIds.includes(k)).length;
  });

  readonly cocaOwnedCount = computed(() => {
    const col = this._collection();
    if (!col) return 0;
    return Object.keys(col.owned).filter(k => col.owned[k] && this.allCocaIds.includes(k)).length;
  });

  readonly missingCount = computed(() => this.totalBase - this.ownedCount());

  readonly repeatedCount = computed(() => {
    const col = this._collection();
    if (!col) return 0;
    return Object.values(col.repeated).reduce((a, b) => a + b, 0);
  });

  readonly completionPct = computed(() =>
    Math.round((this.ownedCount() / this.totalBase) * 100)
  );

  // ── User management ─────────────────────────
  getSavedUsers(): string[] {
    const data = this.loadStorage();
    return Object.keys(data);
  }

  login(username: string): boolean {
    if (!username.trim()) return false;
    const name = username.trim();
    const data = this.loadStorage();
    if (!data[name]) {
      data[name] = this.emptyCollection(name);
      this.saveStorage(data);
    }
    this._currentUser.set(name);
    this._collection.set(data[name]);
    return true;
  }

  logout() {
    this._currentUser.set(null);
    this._collection.set(null);
  }

  // ── Sticker operations ───────────────────────
  toggleOwned(stickerId: string): void {
    this.mutate(col => {
      if (col.owned[stickerId]) {
        delete col.owned[stickerId];
        delete col.repeated[stickerId];
      } else {
        col.owned[stickerId] = true;
      }
    });
  }

  setOwned(stickerId: string, owned: boolean): void {
    this.mutate(col => {
      if (owned) col.owned[stickerId] = true;
      else { delete col.owned[stickerId]; delete col.repeated[stickerId]; }
    });
  }

  setRepeated(stickerId: string, count: number): void {
    this.mutate(col => {
      if (count > 0) {
        col.owned[stickerId] = true;
        col.repeated[stickerId] = count;
      } else {
        delete col.repeated[stickerId];
      }
    });
  }

  isOwned(stickerId: string): boolean {
    return !!this._collection()?.owned[stickerId];
  }

  getRepeated(stickerId: string): number {
    return this._collection()?.repeated[stickerId] ?? 0;
  }

  getMissingIds(): string[] {
    const col = this._collection();
    if (!col) return [];
    return this.allBaseIds.filter(id => !col.owned[id]);
  }

  getRepeatedMap(): Record<string, number> {
    return this._collection()?.repeated ?? {};
  }

  // ── Internals ────────────────────────────────
  private mutate(fn: (col: UserCollection) => void): void {
    const col = this._collection();
    const user = this._currentUser();
    if (!col || !user) return;
    const updated = { ...col, owned: { ...col.owned }, repeated: { ...col.repeated }, lastUpdated: new Date().toISOString() };
    fn(updated);
    this._collection.set(updated);
    const data = this.loadStorage();
    data[user] = updated;
    this.saveStorage(data);
  }

  private emptyCollection(username: string): UserCollection {
    return { username, owned: {}, repeated: {}, lastUpdated: new Date().toISOString() };
  }

  private loadStorage(): Record<string, UserCollection> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch { return {}; }
  }

  private saveStorage(data: Record<string, UserCollection>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
