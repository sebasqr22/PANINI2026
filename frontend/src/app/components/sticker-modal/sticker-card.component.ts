import { Component, Input, Output, EventEmitter, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sticker } from '../../models/sticker.model';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-sticker-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class.owned]="owned()"
      [class.repeated]="repeated() > 0"
      [class.foil]="sticker.type === 'foil'"
      [class.history]="sticker.type === 'history'"
      [class.coca]="sticker.section === 'coca'"
      (click)="onClick()"
    >
      @if (repeated() > 0) {
        <span class="rep-badge">+{{ repeated() }}</span>
      }
      <span class="sticker-id">{{ sticker.id }}</span>
      <span class="sticker-icon">
        @if (sticker.section === 'coca') { 🥤 }
        @else if (sticker.type === 'foil') { ✨ }
        @else if (sticker.type === 'history') { 🏅 }
        @else if (sticker.name.includes('Foto')) { 📸 }
        @else if (sticker.name.includes('Escudo')) { 🛡️ }
        @else { ⚽ }
      </span>
      <span class="sticker-name">{{ sticker.name }}</span>
      @if (owned()) {
        <span class="checkmark">✓</span>
      }
    </div>
  `,
  styles: [`
    .card {
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 8px;
      padding: 0.45rem 0.35rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.12s;
      background: #12121e;
      position: relative;
      user-select: none;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }
    .card:hover { border-color: rgba(255,255,255,0.2); background: #1a1a2e; transform: translateY(-1px); }
    .card:active { transform: scale(0.96); }

    .card.owned {
      background: rgba(46,204,113,0.1);
      border-color: rgba(46,204,113,0.45);
    }
    .card.owned .sticker-id { color: #2ecc71; }
    .card.repeated {
      background: rgba(52,152,219,0.1);
      border-color: rgba(52,152,219,0.45);
    }
    .card.foil { border-color: rgba(232,200,74,0.25); }
    .card.foil .sticker-id { color: #e8c84a; }
    .card.history .sticker-id { color: #c084fc; }
    .card.coca { background: rgba(208,2,27,0.07); border-color: rgba(208,2,27,0.3); }
    .card.coca .sticker-id { color: #ff4444; }
    .card.coca.owned { background: rgba(208,2,27,0.18); border-color: rgba(208,2,27,0.6); }

    .sticker-id {
      font-size: 0.6rem;
      font-weight: 800;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .sticker-icon { font-size: 1.1rem; line-height: 1; }
    .sticker-name {
      font-size: 0.58rem;
      color: rgba(255,255,255,0.5);
      line-height: 1.25;
      word-break: break-word;
    }
    .card.owned .sticker-name { color: rgba(255,255,255,0.7); }

    .rep-badge {
      position: absolute;
      top: 3px;
      right: 3px;
      background: #3498db;
      color: white;
      font-size: 0.55rem;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 4px;
    }
    .checkmark {
      position: absolute;
      bottom: 3px;
      right: 4px;
      color: #2ecc71;
      font-size: 0.7rem;
      font-weight: 900;
    }
  `]
})
export class StickerCardComponent {
  @Input({ required: true }) sticker!: Sticker;
  @Output() selected = new EventEmitter<Sticker>();

  constructor(private svc: CollectionService) {}

  owned = computed(() => this.svc.isOwned(this.sticker.id));
  repeated = computed(() => this.svc.getRepeated(this.sticker.id));

  onClick() {
    this.selected.emit(this.sticker);
  }
}
