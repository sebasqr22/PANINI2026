import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team, Sticker } from '../../models/sticker.model';
import { CollectionService } from '../../services/collection.service';
import { StickerCardComponent } from '../sticker-modal/sticker-card.component';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../../models/album-data';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [CommonModule, FormsModule, StickerCardComponent],
  template: `
    <div class="album-wrap">
      <!-- FILTERS -->
      <div class="filters">
        <div class="filter-tabs">
          <button class="ftab" [class.active]="filter() === 'all'" (click)="filter.set('all')">Todas</button>
          <button class="ftab" [class.active]="filter() === 'missing'" (click)="filter.set('missing')">Faltan</button>
          <button class="ftab" [class.active]="filter() === 'owned'" (click)="filter.set('owned')">Tengo</button>
          <button class="ftab" [class.active]="filter() === 'repeated'" (click)="filter.set('repeated')">Repetidas</button>
        </div>
        <div class="search-wrap">
          <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar jugador o código..." />
        </div>
        <div class="group-select-wrap">
          <select [(ngModel)]="selectedGroup">
            <option value="">Todos los grupos</option>
            @for (g of groups; track g) {
              <option [value]="g">{{ g }}</option>
            }
          </select>
        </div>
      </div>

      <!-- FWC SECTION -->
      @if (!selectedGroup && matchesFwc()) {
        <div class="section">
          <div class="section-header" (click)="toggleSection('fwc')">
            <span class="section-icon">🌍</span>
            <span class="section-title">Sección FWC — Introducción e Historia</span>
            <span class="section-badge">{{ fwcOwnedCount() }}/20</span>
            <span class="section-arrow">{{ expandedSections['fwc'] ? '▼' : '▶' }}</span>
          </div>
          <div class="section-sub">
            <span class="sub-label intro">FWC 00–08: Introducción</span>
            <span class="sub-label history">FWC 09–19: Historia del Mundial</span>
          </div>
          @if (expandedSections['fwc']) {
            <div class="sticker-grid">
              @for (s of filteredFwc(); track s.id) {
                <app-sticker-card [sticker]="s" (selected)="stickerSelected.emit($event)" />
              }
            </div>
          }
        </div>
      }

      <!-- TEAMS -->
      @for (team of filteredTeams(); track team.code) {
        <div class="section">
          <div class="section-header" (click)="toggleSection(team.code)">
            <span class="team-flag">{{ team.flag }}</span>
            <span class="section-title">{{ team.name }}</span>
            <span class="group-tag">{{ team.group }}</span>
            <span class="section-badge">{{ teamOwnedCount(team) }}/20</span>
            <div class="mini-bar">
              <div class="mini-fill" [style.width.%]="teamPct(team)"></div>
            </div>
            <span class="section-arrow">{{ expandedSections[team.code] ? '▼' : '▶' }}</span>
          </div>
          @if (expandedSections[team.code]) {
            <div class="sticker-grid">
              @for (s of filteredTeamStickers(team); track s.id) {
                <app-sticker-card [sticker]="s" (selected)="stickerSelected.emit($event)" />
              }
            </div>
          }
        </div>
      }

      <!-- COCA-COLA SECTION -->
      @if (!selectedGroup && matchesCoca()) {
        <div class="section coca-section">
          <div class="section-header" (click)="toggleSection('coca')">
            <span class="section-icon">🥤</span>
            <span class="section-title" style="color: #ff6666">Coca-Cola — Exclusivas (14)</span>
            <span class="section-badge coca-badge">{{ cocaOwnedCount() }}/14</span>
            <span class="section-arrow">{{ expandedSections['coca'] ? '▼' : '▶' }}</span>
          </div>
          <div class="coca-hint">Encontrá estas postales dentro de las etiquetas de botellas Coca-Cola y Coca-Cola Zero Sugar</div>
          @if (expandedSections['coca']) {
            <div class="sticker-grid">
              @for (s of filteredCoca(); track s.id) {
                <app-sticker-card [sticker]="s" (selected)="stickerSelected.emit($event)" />
              }
            </div>
          }
        </div>
      }

      @if (filteredTeams().length === 0 && !matchesFwc() && !matchesCoca()) {
        <div class="empty">
          <span>🔍</span>
          <p>No se encontraron postales con ese criterio</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .album-wrap { padding: 1rem 1.5rem 3rem; }
    .filters {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
      position: sticky;
      top: 130px;
      z-index: 50;
      background: #080810;
      padding: 0.75rem 0;
    }
    .filter-tabs { display: flex; gap: 0.25rem; background: #12121e; border-radius: 8px; padding: 3px; }
    .ftab {
      padding: 0.4rem 0.9rem;
      border: none;
      background: transparent;
      color: #888;
      font-size: 0.82rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.12s;
      white-space: nowrap;
    }
    .ftab.active { background: #e8c84a; color: #000; font-weight: 700; }
    .search-wrap { flex: 1; min-width: 180px; max-width: 280px; }
    .search-wrap input {
      width: 100%;
      padding: 0.45rem 0.85rem;
      background: #12121e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #eee;
      font-size: 0.85rem;
      outline: none;
    }
    .search-wrap input:focus { border-color: #e8c84a; }
    .group-select-wrap select {
      padding: 0.45rem 0.75rem;
      background: #12121e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #eee;
      font-size: 0.82rem;
      cursor: pointer;
      outline: none;
    }

    .section { margin-bottom: 1rem; }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      background: #12121e;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.12s;
    }
    .section-header:hover { background: #1a1a2e; }
    .section-icon { font-size: 1.2rem; }
    .team-flag { font-size: 1.4rem; }
    .section-title { font-size: 0.92rem; font-weight: 600; color: #e0e0e0; flex: 1; }
    .group-tag {
      font-size: 0.7rem;
      background: rgba(255,255,255,0.06);
      color: #888;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .section-badge {
      font-size: 0.78rem;
      font-weight: 700;
      color: #e8c84a;
      background: rgba(232,200,74,0.1);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .coca-badge { color: #ff6666; background: rgba(208,2,27,0.12); }
    .mini-bar { width: 60px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
    .mini-fill { height: 100%; background: #2ecc71; border-radius: 2px; transition: width 0.3s; }
    .section-arrow { color: #555; font-size: 0.7rem; }

    .section-sub { display: flex; gap: 0.75rem; padding: 0.4rem 1rem; }
    .sub-label { font-size: 0.7rem; padding: 0.15rem 0.6rem; border-radius: 4px; }
    .intro { background: rgba(232,200,74,0.1); color: #e8c84a; }
    .history { background: rgba(192,132,252,0.1); color: #c084fc; }

    .sticker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
      gap: 0.4rem;
      padding: 0.75rem 0.5rem;
    }

    .coca-section .section-header { border-color: rgba(208,2,27,0.2); background: rgba(208,2,27,0.05); }
    .coca-section .section-header:hover { background: rgba(208,2,27,0.1); }
    .coca-hint { font-size: 0.75rem; color: #888; padding: 0.4rem 1rem; font-style: italic; }

    .empty { text-align: center; padding: 4rem 2rem; color: #555; }
    .empty span { font-size: 2.5rem; display: block; margin-bottom: 1rem; }
    .empty p { font-size: 0.95rem; }
  `]
})
export class AlbumComponent {
  @Output() stickerSelected = new EventEmitter<Sticker>();

  filter = signal<'all' | 'missing' | 'owned' | 'repeated'>('all');
  searchTerm = '';
  selectedGroup = '';
  expandedSections: Record<string, boolean> = {};

  teams = TEAMS;
  fwcStickers = FWC_STICKERS;
  cocaStickers = COCA_STICKERS;

  groups = [...new Set(TEAMS.map(t => t.group))];

  constructor(private svc: CollectionService) {}

  toggleSection(key: string) {
    this.expandedSections[key] = !this.expandedSections[key];
  }

  // ── Counts ──────────────────────────────────
  fwcOwnedCount = computed(() => this.fwcStickers.filter(s => this.svc.isOwned(s.id)).length);
  cocaOwnedCount = computed(() => this.cocaStickers.filter(s => this.svc.isOwned(s.id)).length);

  teamOwnedCount(team: Team): number {
    return team.stickers.filter(s => this.svc.isOwned(s.id)).length;
  }

  teamPct(team: Team): number {
    return (this.teamOwnedCount(team) / 20) * 100;
  }

  // ── Filtering ────────────────────────────────
  private matchesFilter(sticker: Sticker): boolean {
    const f = this.filter();
    if (f === 'owned') return this.svc.isOwned(sticker.id);
    if (f === 'missing') return !this.svc.isOwned(sticker.id);
    if (f === 'repeated') return this.svc.getRepeated(sticker.id) > 0;
    return true;
  }

  private matchesSearch(sticker: Sticker): boolean {
    if (!this.searchTerm.trim()) return true;
    const q = this.searchTerm.toLowerCase();
    return sticker.id.toLowerCase().includes(q) || sticker.name.toLowerCase().includes(q);
  }

  filteredFwc(): Sticker[] {
    return this.fwcStickers.filter(s => this.matchesFilter(s) && this.matchesSearch(s));
  }

  filteredCoca(): Sticker[] {
    return this.cocaStickers.filter(s => this.matchesFilter(s) && this.matchesSearch(s));
  }

  filteredTeams(): Team[] {
    return this.teams.filter(t => {
      if (this.selectedGroup && t.group !== this.selectedGroup) return false;
      const visible = t.stickers.filter(s => this.matchesFilter(s) && this.matchesSearch(s));
      return visible.length > 0;
    });
  }

  filteredTeamStickers(team: Team): Sticker[] {
    return team.stickers.filter(s => this.matchesFilter(s) && this.matchesSearch(s));
  }

  matchesFwc(): boolean {
    return this.filteredFwc().length > 0;
  }

  matchesCoca(): boolean {
    return this.filteredCoca().length > 0;
  }
}
