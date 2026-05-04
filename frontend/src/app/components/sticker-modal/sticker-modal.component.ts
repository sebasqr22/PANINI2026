import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sticker } from '../../models/sticker.model';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-sticker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="onBackdropClick($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <button class="close" (click)="close.emit()">✕</button>

        <div class="sticker-preview" [class.owned-preview]="owned()" [class.coca-preview]="sticker.section === 'coca'">
          <span class="preview-icon">
            @if (sticker.section === 'coca') { 🥤 }
            @else if (sticker.type === 'foil') { ✨ }
            @else if (sticker.type === 'history') { 🏅 }
            @else if (sticker.name.includes('Foto')) { 📸 }
            @else if (sticker.name.includes('Escudo')) { 🛡️ }
            @else { ⚽ }
          </span>
          <div>
            <div class="preview-id">{{ sticker.id }}</div>
            <div class="preview-name">{{ sticker.name }}</div>
            @if (sticker.teamName) {
              <div class="preview-team">{{ sticker.teamName }}</div>
            }
            @if (sticker.section === 'coca') {
              <div class="preview-team" style="color: #ff4444">Coca-Cola Exclusiva</div>
            }
            <div class="preview-type">
              @if (sticker.type === 'foil') { <span class="badge foil-badge">✨ FOIL</span> }
              @else if (sticker.type === 'history') { <span class="badge hist-badge">🏅 Historia</span> }
              @else if (sticker.section === 'coca') { <span class="badge coca-badge">🥤 Coca-Cola</span> }
              @else { <span class="badge normal-badge">Normal</span> }
            </div>
          </div>
        </div>

        <div class="status-row">
          <span class="status-label">Estado:</span>
          <span class="status-val" [class.have]="owned()" [class.missing]="!owned()">
            {{ owned() ? '✓ La tengo' : '✕ Me falta' }}
          </span>
        </div>

        <div class="actions">
          @if (!owned()) {
            <button class="btn-have" (click)="markOwned()">✓ La tengo</button>
          } @else {
            <button class="btn-remove" (click)="removeOwned()">✕ Quitar</button>
          }
        </div>

        @if (owned()) {
          <div class="repeated-section">
            <label>Repetidas (extras que tengo):</label>
            <div class="rep-row">
              <button class="rep-btn" (click)="decRep()">−</button>
              <span class="rep-count">{{ repeatedCount() }}</span>
              <button class="rep-btn" (click)="incRep()">+</button>
            </div>
            @if (repeatedCount() > 0) {
              <p class="rep-hint">Tenés {{ repeatedCount() }} {{ repeatedCount() === 1 ? 'repetida' : 'repetidas' }} para cambiar</p>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      backdrop-filter: blur(2px);
    }
    .modal {
      background: #14141e;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      padding: 1.75rem;
      width: 100%;
      max-width: 380px;
      position: relative;
    }
    .close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255,255,255,0.08);
      border: none;
      color: #aaa;
      width: 30px; height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center;
    }
    .close:hover { background: rgba(255,255,255,0.15); color: white; }

    .sticker-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #0e0e1a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
    }
    .sticker-preview.owned-preview { border-color: rgba(46,204,113,0.3); background: rgba(46,204,113,0.06); }
    .sticker-preview.coca-preview { border-color: rgba(208,2,27,0.3); }
    .preview-icon { font-size: 2.5rem; flex-shrink: 0; }
    .preview-id { font-size: 0.75rem; color: #888; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .preview-name { font-size: 1.05rem; font-weight: 700; color: #eee; margin: 0.2rem 0; }
    .preview-team { font-size: 0.82rem; color: #aaa; }
    .preview-type { margin-top: 0.5rem; }
    .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; }
    .foil-badge { background: rgba(232,200,74,0.15); color: #e8c84a; }
    .hist-badge { background: rgba(192,132,252,0.15); color: #c084fc; }
    .coca-badge { background: rgba(208,2,27,0.15); color: #ff4444; }
    .normal-badge { background: rgba(255,255,255,0.06); color: #aaa; }

    .status-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .status-label { font-size: 0.85rem; color: #888; }
    .status-val { font-weight: 700; font-size: 0.9rem; padding: 0.25rem 0.75rem; border-radius: 6px; }
    .have { background: rgba(46,204,113,0.15); color: #2ecc71; }
    .missing { background: rgba(231,76,60,0.15); color: #e74c3c; }

    .actions { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
    .btn-have {
      flex: 1; padding: 0.8rem;
      background: #2ecc71; color: #000;
      font-weight: 800; font-size: 0.95rem;
      border: none; border-radius: 10px; cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-have:hover { opacity: 0.85; }
    .btn-remove {
      flex: 1; padding: 0.8rem;
      background: rgba(231,76,60,0.15); color: #e74c3c;
      font-weight: 700; font-size: 0.9rem;
      border: 1px solid rgba(231,76,60,0.3); border-radius: 10px; cursor: pointer;
    }
    .btn-remove:hover { background: rgba(231,76,60,0.25); }

    .repeated-section {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 1rem;
    }
    label { display: block; font-size: 0.82rem; color: #888; margin-bottom: 0.75rem; }
    .rep-row { display: flex; align-items: center; gap: 1rem; }
    .rep-btn {
      width: 38px; height: 38px;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      transition: background 0.12s;
      display: flex; align-items: center; justify-content: center;
    }
    .rep-btn:hover { background: #252540; }
    .rep-count { font-size: 1.5rem; font-weight: 800; color: #3498db; min-width: 40px; text-align: center; }
    .rep-hint { font-size: 0.78rem; color: #3498db; margin-top: 0.75rem; margin-bottom: 0; }
  `]
})
export class StickerModalComponent implements OnInit {
  @Input({ required: true }) sticker!: Sticker;
  @Output() close = new EventEmitter<void>();

  owned = signal(false);
  repeatedCount = signal(0);

  constructor(private svc: CollectionService) {}

  ngOnInit() {
    this.owned.set(this.svc.isOwned(this.sticker.id));
    this.repeatedCount.set(this.svc.getRepeated(this.sticker.id));
  }

  markOwned() {
    this.svc.setOwned(this.sticker.id, true);
    this.owned.set(true);
  }

  removeOwned() {
    this.svc.setOwned(this.sticker.id, false);
    this.owned.set(false);
    this.repeatedCount.set(0);
  }

  incRep() {
    const val = this.repeatedCount() + 1;
    this.repeatedCount.set(val);
    this.svc.setRepeated(this.sticker.id, val);
  }

  decRep() {
    if (this.repeatedCount() <= 0) return;
    const val = this.repeatedCount() - 1;
    this.repeatedCount.set(val);
    this.svc.setRepeated(this.sticker.id, val);
  }

  onBackdropClick(e: Event) {
    this.close.emit();
  }
}
