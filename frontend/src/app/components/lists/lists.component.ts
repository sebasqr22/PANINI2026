import { Component, computed, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sticker } from '../../models/sticker.model';
import { CollectionService } from '../../services/collection.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../../models/album-data';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lists-wrap">
      <div class="list-tabs">
        <button class="ltab" [class.active]="tab() === 'missing'" (click)="tab.set('missing')">
          Faltan ({{ missingTotal() }})
        </button>
        <button class="ltab" [class.active]="tab() === 'repeated'" (click)="tab.set('repeated')">
          Repetidas ({{ repeatedTotal() }})
        </button>
      </div>

      <!-- MISSING -->
      @if (tab() === 'missing') {
        <div class="list-actions">
          <button class="btn-pdf" (click)="exportMissing()">📄 Exportar PDF — Faltantes</button>
        </div>

        @if (missingTotal() === 0) {
          <div class="empty-state">
            <div class="empty-icon">🎉</div>
            <h3>¡Álbum completo!</h3>
            <p>¡Felicitaciones! Tenés todas las postales del álbum base.</p>
          </div>
        }

        <!-- FWC Missing -->
        @if (missingFwc().length > 0) {
          <div class="list-group">
            <div class="group-header">
              <span>🌍 Sección FWC</span>
              <span class="count-badge">{{ missingFwc().length }} faltantes</span>
            </div>
            <table class="sticker-table">
              <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th></tr></thead>
              <tbody>
                @for (s of missingFwc(); track s.id) {
                  <tr (click)="stickerSelected.emit(s)" class="clickable">
                    <td><span class="code-badge">{{ s.id }}</span></td>
                    <td>{{ s.name }}</td>
                    <td>
                      @if (s.type === 'foil') { <span class="type-foil">✨ FOIL</span> }
                      @else if (s.type === 'history') { <span class="type-hist">🏅 Historia</span> }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Teams Missing -->
        @for (team of teamsWithMissing(); track team.code) {
          <div class="list-group">
            <div class="group-header">
              <span>{{ team.flag }} {{ team.name }}</span>
              <span class="count-badge">{{ team.missing.length }} faltantes</span>
              <span class="group-tag">{{ team.group }}</span>
            </div>
            <table class="sticker-table">
              <thead><tr><th>Código</th><th>Jugador</th></tr></thead>
              <tbody>
                @for (s of team.missing; track s.id) {
                  <tr (click)="stickerSelected.emit(s)" class="clickable">
                    <td><span class="code-badge">{{ s.id }}</span></td>
                    <td>{{ s.name }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Coca Missing -->
        @if (missingCoca().length > 0) {
          <div class="list-group coca-group">
            <div class="group-header">
              <span>🥤 Coca-Cola Exclusivas</span>
              <span class="count-badge coca-count">{{ missingCoca().length }} faltantes</span>
            </div>
            <table class="sticker-table">
              <thead><tr><th>Código</th><th>Jugador</th></tr></thead>
              <tbody>
                @for (s of missingCoca(); track s.id) {
                  <tr (click)="stickerSelected.emit(s)" class="clickable">
                    <td><span class="code-badge coca-code">{{ s.id }}</span></td>
                    <td>{{ s.name }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- REPEATED -->
      @if (tab() === 'repeated') {
        <div class="list-actions">
          <button class="btn-pdf" (click)="exportRepeated()">📄 Exportar PDF — Repetidas</button>
        </div>

        @if (repeatedTotal() === 0) {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>Sin repetidas aún</h3>
            <p>Marcá una postal como repetida desde su detalle en el álbum.</p>
          </div>
        }

        @for (group of repeatedGroups(); track group.label) {
          <div class="list-group">
            <div class="group-header">
              <span>{{ group.label }}</span>
              <span class="count-badge">{{ group.totalCount }} repetidas</span>
            </div>
            <table class="sticker-table">
              <thead><tr><th>Código</th><th>Jugador</th><th>Repetidas</th></tr></thead>
              <tbody>
                @for (item of group.items; track item.sticker.id) {
                  <tr (click)="stickerSelected.emit(item.sticker)" class="clickable">
                    <td><span class="code-badge">{{ item.sticker.id }}</span></td>
                    <td>{{ item.sticker.name }}</td>
                    <td><span class="rep-num">×{{ item.count }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .lists-wrap { padding: 1.25rem 1.5rem 3rem; max-width: 860px; }
    .list-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
    .ltab {
      padding: 0.55rem 1.25rem;
      border: 1px solid rgba(255,255,255,0.1);
      background: #12121e;
      color: #888;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.88rem;
      transition: all 0.12s;
    }
    .ltab.active { background: #e8c84a; color: #000; font-weight: 700; border-color: #e8c84a; }

    .list-actions { margin-bottom: 1.25rem; }
    .btn-pdf {
      padding: 0.6rem 1.25rem;
      background: rgba(231,76,60,0.15);
      border: 1px solid rgba(231,76,60,0.3);
      color: #e74c3c;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.12s;
    }
    .btn-pdf:hover { background: rgba(231,76,60,0.25); }

    .list-group { margin-bottom: 1.25rem; }
    .group-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 1rem;
      background: #12121e;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 8px 8px 0 0;
      font-size: 0.88rem;
      font-weight: 600;
      color: #ddd;
    }
    .count-badge {
      font-size: 0.72rem;
      background: rgba(231,76,60,0.15);
      color: #e74c3c;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-weight: 700;
    }
    .coca-count { background: rgba(208,2,27,0.15); color: #ff4444; }
    .group-tag { font-size: 0.7rem; color: #666; background: rgba(255,255,255,0.05); padding: 0.15rem 0.5rem; border-radius: 4px; }

    .coca-group .group-header { border-color: rgba(208,2,27,0.2); background: rgba(208,2,27,0.06); }

    .sticker-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.83rem;
      background: #0e0e18;
      border: 1px solid rgba(255,255,255,0.06);
      border-top: none;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }
    .sticker-table th {
      text-align: left;
      padding: 0.5rem 0.85rem;
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #555;
      background: #111118;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .sticker-table td { padding: 0.5rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #ccc; }
    .sticker-table tr.clickable:hover td { background: rgba(255,255,255,0.04); cursor: pointer; }

    .code-badge {
      font-size: 0.72rem;
      font-weight: 800;
      background: rgba(255,255,255,0.07);
      color: #e8c84a;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .coca-code { color: #ff4444; background: rgba(208,2,27,0.12); }
    .type-foil { font-size: 0.72rem; color: #e8c84a; }
    .type-hist { font-size: 0.72rem; color: #c084fc; }
    .rep-num { font-size: 0.9rem; font-weight: 800; color: #3498db; }

    .empty-state { text-align: center; padding: 3rem 1rem; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 700; color: #eee; margin: 0 0 0.5rem; }
    .empty-state p { color: #666; font-size: 0.9rem; margin: 0; }
  `]
})
export class ListsComponent {
  @Output() stickerSelected = new EventEmitter<Sticker>();
  tab = signal<'missing' | 'repeated'>('missing');

  constructor(private svc: CollectionService, private pdf: PdfService) {}

  missingTotal = computed(() => this.svc.missingCount());
  repeatedTotal = computed(() => this.svc.repeatedCount());

  missingFwc = computed(() => FWC_STICKERS.filter(s => !this.svc.isOwned(s.id)));
  missingCoca = computed(() => COCA_STICKERS.filter(s => !this.svc.isOwned(s.id)));

  teamsWithMissing = computed(() =>
    TEAMS.map(t => ({
      ...t,
      missing: t.stickers.filter(s => !this.svc.isOwned(s.id))
    })).filter(t => t.missing.length > 0)
  );

  repeatedGroups = computed(() => {
    const repMap = this.svc.getRepeatedMap();
    const allById = new Map<string, Sticker>();
    FWC_STICKERS.forEach(s => allById.set(s.id, s));
    TEAMS.forEach(t => t.stickers.forEach(s => allById.set(s.id, s)));
    COCA_STICKERS.forEach(s => allById.set(s.id, s));

    const groups: { label: string; items: { sticker: Sticker; count: number }[]; totalCount: number }[] = [];

    // FWC
    const fwcRep = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ sticker: s, count: repMap[s.id] }));
    if (fwcRep.length) groups.push({ label: '🌍 Sección FWC', items: fwcRep, totalCount: fwcRep.reduce((a, x) => a + x.count, 0) });

    for (const team of TEAMS) {
      const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ sticker: s, count: repMap[s.id] }));
      if (tr.length) groups.push({ label: `${team.flag} ${team.name}`, items: tr, totalCount: tr.reduce((a, x) => a + x.count, 0) });
    }

    const cocaRep = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ sticker: s, count: repMap[s.id] }));
    if (cocaRep.length) groups.push({ label: '🥤 Coca-Cola', items: cocaRep, totalCount: cocaRep.reduce((a, x) => a + x.count, 0) });

    return groups;
  });

  exportMissing() { this.pdf.exportMissing(); }
  exportRepeated() { this.pdf.exportRepeated(); }
}
