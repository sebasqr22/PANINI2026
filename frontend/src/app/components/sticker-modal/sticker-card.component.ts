import { Component, Input, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sticker } from '../../models/sticker.model';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-sticker-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card"
      [class.owned]="owned()"
      [class.repeated]="repeated() > 0"
      [class.foil]="sticker.type === 'foil'"
      [class.history]="sticker.type === 'history'"
      [class.coca]="sticker.section === 'coca'"
      (click)="selected.emit(sticker)">
      @if (repeated() > 0) { <span class="rep-badge">+{{ repeated() }}</span> }
      <span class="sticker-icon">
        @if (sticker.section === 'coca') { 🥤 }
        @else if (sticker.type === 'foil') { ✨ }
        @else if (sticker.type === 'history') { 🏅 }
        @else if (sticker.name.includes('Foto')) { 📸 }
        @else if (sticker.name.includes('Escudo')) { 🛡️ }
        @else { ⚽ }
      </span>
      <span class="sticker-id">{{ sticker.id }}</span>
      @if (owned()) { <span class="checkmark">✓</span> }
    </div>
  `,
  styles: [`
    .card {
      border: 1.5px solid rgba(255,130,0,.1);
      border-radius: 8px;
      padding: .5rem .35rem;
      text-align: center;
      cursor: pointer;
      transition: all .12s;
      background: #0f0800;
      position: relative;
      user-select: none;
      min-height: 75px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .card:hover { border-color: rgba(255,130,0,.35); background: #160b00; transform: translateY(-1px); }
    .card:active { transform: scale(.96); }
    .card.owned { background: rgba(46,204,113,.08); border-color: rgba(46,204,113,.4); }
    .card.repeated { background: rgba(52,152,219,.08); border-color: rgba(52,152,219,.4); }
    .card.foil { border-color: rgba(255,130,0,.3); }
    .card.history { border-color: rgba(192,132,252,.25); }
    .card.coca { background: rgba(208,2,27,.07); border-color: rgba(208,2,27,.3); }
    .card.coca.owned { background: rgba(208,2,27,.15); }

    .sticker-icon { font-size: 1.3rem; line-height: 1; }

    .sticker-id {
      font-size: .72rem;
      font-weight: 800;
      color: rgba(255,130,0,.5);
      letter-spacing: .5px;
      text-transform: uppercase;
    }
    .card.owned .sticker-id { color: #2ecc71; }
    .card.repeated .sticker-id { color: #3498db; }
    .card.history .sticker-id { color: #c084fc; }
    .card.coca .sticker-id { color: #ff4444; }
    .card.coca.owned .sticker-id { color: #ff6666; }

    .rep-badge {
      position: absolute; top: 3px; right: 3px;
      background: #3498db; color: white;
      font-size: .55rem; font-weight: 800;
      padding: 1px 4px; border-radius: 4px;
    }
    .checkmark {
      position: absolute; bottom: 3px; right: 4px;
      color: #2ecc71; font-size: .7rem; font-weight: 900;
    }
  `]
})
export class StickerCardComponent {
  @Input({ required: true }) sticker!: Sticker;
  @Output() selected = new EventEmitter<Sticker>();
  constructor(private svc: CollectionService) {}
  owned    = computed(() => this.svc.isOwned(this.sticker.id));
  repeated = computed(() => this.svc.getRepeated(this.sticker.id));
}