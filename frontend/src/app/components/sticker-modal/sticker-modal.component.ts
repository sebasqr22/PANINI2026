import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sticker } from '../../models/sticker.model';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-sticker-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close.emit()">✕</button>

        <!-- Preview -->
        <div class="preview" [class.owned-p]="total() > 0" [class.coca-p]="sticker.section === 'coca'">
          <span class="p-icon">
            @if (sticker.section === 'coca') { 🥤 }
            @else if (sticker.type === 'foil') { ✨ }
            @else if (sticker.type === 'history') { 🏅 }
            @else if (sticker.name.includes('Foto')) { 📸 }
            @else if (sticker.name.includes('Escudo')) { 🛡️ }
            @else { ⚽ }
          </span>
          <div>
            <div class="p-id">{{ sticker.id }}</div>
            <div class="p-name">{{ sticker.name }}</div>
            @if (sticker.teamName) { <div class="p-team">{{ sticker.teamName }}</div> }
            @if (sticker.section === 'coca') { <div class="p-team coca-label">Coca-Cola Exclusiva</div> }
            <div class="p-type">
              @if (sticker.type === 'foil') { <span class="badge badge-foil">✨ FOIL</span> }
              @else if (sticker.type === 'history') { <span class="badge badge-hist">🏅 Historia</span> }
              @else if (sticker.section === 'coca') { <span class="badge badge-coca">🥤 Coca-Cola</span> }
              @else { <span class="badge badge-norm">Normal</span> }
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="status-row">
          @if (total() === 0) {
            <span class="status missing">✕ No la tengo</span>
          } @else if (total() === 1) {
            <span class="status have">✓ La tengo</span>
          } @else {
            <span class="status have">✓ Tengo {{ total() }}  <span class="rep-info">({{ total() - 1 }} repetida{{ total() - 1 !== 1 ? 's' : '' }})</span></span>
          }
          @if (svc.syncing()) { <span class="syncing">⏳</span> }
        </div>

        <!-- Counter -->
        <div class="counter-wrap">
          <button class="counter-btn minus" (click)="decrement()" [disabled]="total() === 0 || svc.syncing()">−</button>
          <div class="counter-display">
            <span class="counter-num" [class.zero]="total() === 0">{{ total() }}</span>
            <span class="counter-label">
              @if (total() === 0) { sin marcar }
              @else if (total() === 1) { en el álbum }
              @else { + {{ total() - 1 }} extra{{ total() - 1 !== 1 ? 's' : '' }} }
            </span>
          </div>
          <button class="counter-btn plus" (click)="increment()" [disabled]="svc.syncing()">+</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(3px); }
    .modal { background: #0f0800; border: 1px solid rgba(255,130,0,.2); border-radius: 18px; padding: 1.75rem; width: 100%; max-width: 360px; position: relative; box-shadow: 0 0 40px rgba(255,130,0,.1); }
    .close-btn { position: absolute; top: 1rem; right: 1rem; background: rgba(255,130,0,.08); border: 1px solid rgba(255,130,0,.15); color: #664400; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: .85rem; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { color: #ff8200; }

    .preview { display: flex; align-items: center; gap: 1rem; background: #070400; border: 1px solid rgba(255,130,0,.1); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
    .preview.owned-p { border-color: rgba(255,130,0,.3); background: rgba(255,130,0,.05); }
    .preview.coca-p { border-color: rgba(208,2,27,.3); }
    .p-icon { font-size: 2.5rem; flex-shrink: 0; }
    .p-id { font-size: 1.1rem; font-weight: 900; color: #ff8200; letter-spacing: 1px; }
    .p-name { font-size: .9rem; font-weight: 600; color: #e0c090; margin-top: .2rem; }
    .p-team { font-size: .82rem; color: #664400; margin-top: .15rem; }
    .coca-label { color: #ff4444 !important; }
    .p-type { margin-top: .5rem; }
    .badge { display: inline-block; padding: .15rem .6rem; border-radius: 4px; font-size: .72rem; font-weight: 600; }
    .badge-foil { background: rgba(255,130,0,.15); color: #ff8200; }
    .badge-hist { background: rgba(192,132,252,.15); color: #c084fc; }
    .badge-coca { background: rgba(208,2,27,.15); color: #ff4444; }
    .badge-norm { background: rgba(255,255,255,.05); color: #664400; }

    .status-row { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.5rem; }
    .status { font-size: .88rem; font-weight: 700; padding: .3rem .85rem; border-radius: 6px; }
    .have { background: rgba(46,204,113,.12); color: #2ecc71; }
    .missing { background: rgba(255,130,0,.08); color: #664400; }
    .rep-info { font-weight: 400; font-size: .8rem; color: #3498db; }
    .syncing { font-size: .85rem; color: #ff8200; margin-left: auto; }

    /* Counter */
    .counter-wrap { display: flex; align-items: center; justify-content: center; gap: 1.25rem; padding: 1rem; background: #070400; border: 1px solid rgba(255,130,0,.1); border-radius: 14px; }
    .counter-btn {
      width: 52px; height: 52px;
      border-radius: 50%;
      border: none;
      font-size: 1.8rem;
      font-weight: 300;
      cursor: pointer;
      transition: all .12s;
      display: flex; align-items: center; justify-content: center;
      line-height: 1;
    }
    .counter-btn.plus { background: #ff8200; color: #000; box-shadow: 0 4px 15px rgba(255,130,0,.35); }
    .counter-btn.plus:hover:not(:disabled) { background: #ff9a33; transform: scale(1.05); }
    .counter-btn.minus { background: rgba(255,130,0,.1); color: #ff8200; border: 1px solid rgba(255,130,0,.25); }
    .counter-btn.minus:hover:not(:disabled) { background: rgba(255,130,0,.2); }
    .counter-btn:disabled { opacity: .3; cursor: not-allowed; transform: none !important; }

    .counter-display { text-align: center; min-width: 80px; }
    .counter-num { display: block; font-size: 3rem; font-weight: 900; color: #ff8200; line-height: 1; }
    .counter-num.zero { color: #2a1500; }
    .counter-label { display: block; font-size: .72rem; color: #442200; margin-top: .25rem; text-transform: uppercase; letter-spacing: .5px; }
  `]
})
export class StickerModalComponent implements OnInit {
  @Input({ required: true }) sticker!: Sticker;
  @Output() close = new EventEmitter<void>();

  // total = cantidad física de cartas que tengo
  // 0 = no tengo, 1 = tengo una (en álbum), 2+ = una en álbum + repetidas
  total = signal(0);

  constructor(public svc: CollectionService) {}

  ngOnInit() {
    const owned    = this.svc.isOwned(this.sticker.id);
    const repeated = this.svc.getRepeated(this.sticker.id);
    this.total.set(owned ? 1 + repeated : 0);
  }

  async increment() {
    const newTotal = this.total() + 1;
    this.total.set(newTotal);
    await this.sync(newTotal);
  }

  async decrement() {
    if (this.total() === 0) return;
    const newTotal = this.total() - 1;
    this.total.set(newTotal);
    await this.sync(newTotal);
  }

  private async sync(total: number) {
    if (total === 0) {
      await this.svc.setOwned(this.sticker.id, false);
    } else {
      await this.svc.setOwned(this.sticker.id, true);
      await this.svc.setRepeated(this.sticker.id, total - 1);
    }
  }
}