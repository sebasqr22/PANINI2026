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
          ❌ Faltan ({{ missingTotal() }})
        </button>
        <button class="ltab" [class.active]="tab() === 'repeated'" (click)="tab.set('repeated')">
          🔄 Repetidas ({{ repeatedTotal() }})
        </button>
      </div>

      <!-- Action buttons -->
      <div class="actions-bar">
        @if (tab() === 'missing') {
          <button class="btn-action pdf" (click)="pdf.exportMissing()">📄 PDF Faltantes</button>
          <button class="btn-action copy" (click)="pdf.copyToClipboard('missing')">📋 Copiar para WhatsApp</button>
        } @else {
          <button class="btn-action pdf" (click)="pdf.exportRepeated()">📄 PDF Repetidas</button>
          <button class="btn-action copy" (click)="pdf.copyToClipboard('repeated')">📋 Copiar para WhatsApp</button>
        }
        <button class="btn-action pdf-all" (click)="pdf.exportAll()">📄 PDF Completo</button>
        <button class="btn-action copy-all" (click)="pdf.copyToClipboard('all')">📋 Copiar resumen</button>
      </div>

      <!-- MISSING -->
      @if (tab() === 'missing') {
        @if (missingTotal() === 0) {
          <div class="empty-state">
            <div class="empty-icon">🎉</div>
            <h3>¡Álbum completo!</h3>
            <p>Tenés todas las postales del álbum base.</p>
          </div>
        }

        @if (missingFwc().length > 0) {
          <div class="list-group">
            <div class="group-header">
              <span>🌍 Sección FWC</span>
              <span class="count-badge miss">{{ missingFwc().length }} faltantes</span>
            </div>
            <div class="id-grid">
              @for (s of missingFwc(); track s.id) {
                <span class="id-chip miss" (click)="stickerSelected.emit(s)">{{ s.id }}</span>
              }
            </div>
          </div>
        }

        @for (team of teamsWithMissing(); track team.code) {
          <div class="list-group">
            <div class="group-header">
              <span>{{ team.flag }} {{ team.name }}</span>
              <span class="group-tag">{{ team.group }}</span>
              <span class="count-badge miss">{{ team.missing.length }} faltantes</span>
            </div>
            <div class="id-grid">
              @for (s of team.missing; track s.id) {
                <span class="id-chip miss" (click)="stickerSelected.emit(s)">{{ s.id }}</span>
              }
            </div>
          </div>
        }

        @if (missingCoca().length > 0) {
          <div class="list-group coca-group">
            <div class="group-header">
              <span>🥤 Coca-Cola Exclusivas</span>
              <span class="count-badge coca">{{ missingCoca().length }} faltantes</span>
            </div>
            <div class="id-grid">
              @for (s of missingCoca(); track s.id) {
                <span class="id-chip coca" (click)="stickerSelected.emit(s)">{{ s.id }}</span>
              }
            </div>
          </div>
        }
      }

      <!-- REPEATED -->
      @if (tab() === 'repeated') {
        @if (repeatedTotal() === 0) {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>Sin repetidas aún</h3>
            <p>Cuando marcés más de 1 de una carta, aparecerá aquí.</p>
          </div>
        }

        @for (group of repeatedGroups(); track group.label) {
          <div class="list-group">
            <div class="group-header">
              <span>{{ group.label }}</span>
              <span class="count-badge rep">{{ group.totalCount }} repetidas</span>
            </div>
            <div class="id-grid">
              @for (item of group.items; track item.sticker.id) {
                <span class="id-chip rep" (click)="stickerSelected.emit(item.sticker)">
                  {{ item.sticker.id }}<span class="rep-x">×{{ item.count }}</span>
                </span>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .lists-wrap { padding: 1.25rem 1.5rem 3rem; max-width: 900px; }

    .list-tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
    .ltab { padding: .55rem 1.25rem; border: 1px solid rgba(255,130,0,.2); background: #0f0800; color: #664400; border-radius: 8px; cursor: pointer; font-size: .88rem; font-weight: 600; transition: all .12s; }
    .ltab.active { background: #ff8200; color: #000; font-weight: 800; border-color: #ff8200; }

    .actions-bar { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .btn-action { padding: .5rem 1rem; border-radius: 8px; cursor: pointer; font-size: .82rem; font-weight: 600; transition: all .12s; border: none; }
    .btn-action.pdf { background: rgba(231,76,60,.12); color: #e74c3c; border: 1px solid rgba(231,76,60,.25); }
    .btn-action.pdf:hover { background: rgba(231,76,60,.22); }
    .btn-action.copy { background: rgba(46,204,113,.12); color: #2ecc71; border: 1px solid rgba(46,204,113,.25); }
    .btn-action.copy:hover { background: rgba(46,204,113,.22); }
    .btn-action.pdf-all { background: rgba(255,130,0,.1); color: #ff8200; border: 1px solid rgba(255,130,0,.2); }
    .btn-action.pdf-all:hover { background: rgba(255,130,0,.2); }
    .btn-action.copy-all { background: rgba(52,152,219,.1); color: #3498db; border: 1px solid rgba(52,152,219,.2); }
    .btn-action.copy-all:hover { background: rgba(52,152,219,.2); }

    .list-group { margin-bottom: 1rem; border: 1px solid rgba(255,130,0,.1); border-radius: 10px; overflow: hidden; }
    .group-header { display: flex; align-items: center; gap: .6rem; padding: .6rem 1rem; background: #0f0800; font-size: .88rem; font-weight: 600; color: #cc7700; }
    .group-tag { font-size: .7rem; color: #442200; background: rgba(255,130,0,.08); padding: .15rem .5rem; border-radius: 4px; }
    .count-badge { font-size: .7rem; font-weight: 700; padding: .15rem .5rem; border-radius: 4px; margin-left: auto; }
    .count-badge.miss { background: rgba(231,76,60,.15); color: #e74c3c; }
    .count-badge.rep  { background: rgba(52,152,219,.15); color: #3498db; }
    .count-badge.coca { background: rgba(208,2,27,.15); color: #ff4444; }

    .coca-group .group-header { color: #ff4444; border-color: rgba(208,2,27,.2); }

    .id-grid { display: flex; flex-wrap: wrap; gap: .35rem; padding: .75rem 1rem; background: #070400; }
    .id-chip {
      padding: .3rem .6rem; border-radius: 5px; font-size: .75rem; font-weight: 700;
      cursor: pointer; transition: all .1s; letter-spacing: .3px;
    }
    .id-chip.miss { background: rgba(231,76,60,.1); color: #e74c3c; border: 1px solid rgba(231,76,60,.2); }
    .id-chip.miss:hover { background: rgba(231,76,60,.25); }
    .id-chip.rep  { background: rgba(52,152,219,.1); color: #3498db; border: 1px solid rgba(52,152,219,.2); }
    .id-chip.rep:hover { background: rgba(52,152,219,.25); }
    .id-chip.coca { background: rgba(208,2,27,.1); color: #ff4444; border: 1px solid rgba(208,2,27,.2); }
    .id-chip.coca:hover { background: rgba(208,2,27,.22); }
    .rep-x { font-size: .65rem; margin-left: 2px; opacity: .8; }

    .empty-state { text-align: center; padding: 3rem 1rem; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 700; color: #cc7700; margin: 0 0 .5rem; }
    .empty-state p { color: #442200; font-size: .9rem; margin: 0; }
  `]
})
export class ListsComponent {
  @Output() stickerSelected = new EventEmitter<Sticker>();
  tab = signal<'missing' | 'repeated'>('missing');

  constructor(private svc: CollectionService, public pdf: PdfService) {}

  missingTotal  = computed(() => this.svc.missingCount());
  repeatedTotal = computed(() => this.svc.repeatedCount());
  missingFwc    = computed(() => FWC_STICKERS.filter(s => !this.svc.isOwned(s.id)));
  missingCoca   = computed(() => COCA_STICKERS.filter(s => !this.svc.isOwned(s.id)));

  teamsWithMissing = computed(() =>
    TEAMS.map(t => ({ ...t, missing: t.stickers.filter(s => !this.svc.isOwned(s.id)) }))
         .filter(t => t.missing.length > 0)
  );

  repeatedGroups = computed(() => {
    const repMap = this.svc.getRepeatedMap();
    const groups: { label: string; items: { sticker: Sticker; count: number }[]; totalCount: number }[] = [];

    const fwcRep = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ sticker: s, count: repMap[s.id] }));
    if (fwcRep.length) groups.push({ label: '🌍 Sección FWC', items: fwcRep, totalCount: fwcRep.reduce((a,x) => a+x.count, 0) });

    for (const team of TEAMS) {
      const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ sticker: s, count: repMap[s.id] }));
      if (tr.length) groups.push({ label: `${team.flag} ${team.name}`, items: tr, totalCount: tr.reduce((a,x) => a+x.count, 0) });
    }

    const cocaRep = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0).map(s => ({ sticker: s, count: repMap[s.id] }));
    if (cocaRep.length) groups.push({ label: '🥤 Coca-Cola', items: cocaRep, totalCount: cocaRep.reduce((a,x) => a+x.count, 0) });

    return groups;
  });
}
