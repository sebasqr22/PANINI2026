import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../services/collection.service';
import { PdfService } from '../../services/pdf.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header>
      <!-- TOP BAR -->
      <div class="top-bar">
        <div class="logo">
          <span class="logo-urisco">URISCO</span>
          <span class="logo-sep">·</span>
          <span class="logo-panini">PANINI</span>
          <span class="logo-cup">🏆</span>
        </div>

        <nav class="nav">
          <button class="nav-btn" [class.active]="activeView === 'album'" (click)="viewChange.emit('album')">📋 Álbum</button>
          <button class="nav-btn" [class.active]="activeView === 'lists'" (click)="viewChange.emit('lists')">📊 Listas</button>
        </nav>

        <div class="header-right">
          <div class="avatar">{{ (svc.currentUser() ?? 'U')[0].toUpperCase() }}</div>
          <button class="btn-icon-hdr" (click)="showPassModal.set(true)" title="Cambiar contraseña">🔑</button>
          <button class="btn-logout" (click)="svc.logout()" title="Salir">⏎</button>
        </div>
      </div>

      <!-- STATS BAR -->
      <div class="stats-bar">
        <div class="stats-row">
          <div class="stat">
            <span class="stat-label">Tengo</span>
            <span class="stat-val green">{{ svc.ownedCount() }}</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-label">Faltan</span>
            <span class="stat-val red">{{ svc.missingCount() }}</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-label">Repetidas</span>
            <span class="stat-val blue">{{ svc.repeatedCount() }}</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-label">🥤 Coca</span>
            <span class="stat-val amber">{{ svc.cocaOwnedCount() }}/14</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-label">Equipos 🏆</span>
            <span class="stat-val gold">{{ svc.fullTeams() }}/48</span>
          </div>
        </div>
        <div class="progress-row-wrap">
          <div class="progress-wrap">
            <div class="prog-top">
              <span class="prog-label">Progreso álbum base</span>
              <span class="prog-pct">{{ svc.completionPct() }}%</span>
            </div>
            <div class="prog-bar">
              <div class="prog-fill" [style.width.%]="svc.completionPct()"></div>
            </div>
            <div class="prog-sub">{{ svc.ownedCount() }} / {{ svc.totalBase }} postales</div>
          </div>
          <button class="btn-pdf" (click)="pdfSvc.exportAll()">📄 PDF</button>
        </div>
      </div>
    </header>

    <!-- Change Password Modal -->
    @if (showPassModal()) {
      <div class="modal-backdrop" (click)="closePassModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closePassModal()">✕</button>
          <h3>🔑 Cambiar contraseña</h3>
          <p class="modal-user">Usuario: <strong>{{ svc.currentUser() }}</strong></p>
          <div class="field-group">
            <label>Contraseña actual</label>
            <div class="pass-wrap">
              <input [type]="showCurrent() ? 'text' : 'password'" [(ngModel)]="currentPass" placeholder="Tu contraseña actual" [disabled]="saving()" />
              <button class="eye" type="button" (click)="showCurrent.set(!showCurrent())">{{ showCurrent() ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <div class="field-group">
            <label>Nueva contraseña</label>
            <div class="pass-wrap">
              <input [type]="showNew() ? 'text' : 'password'" [(ngModel)]="newPass" placeholder="Mínimo 4 caracteres" [disabled]="saving()" />
              <button class="eye" type="button" (click)="showNew.set(!showNew())">{{ showNew() ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <div class="field-group">
            <label>Confirmar nueva contraseña</label>
            <div class="pass-wrap">
              <input [type]="showConfirm() ? 'text' : 'password'" [(ngModel)]="confirmPass" placeholder="Repetí la nueva contraseña" [disabled]="saving()" (keyup.enter)="changePassword()" />
              <button class="eye" type="button" (click)="showConfirm.set(!showConfirm())">{{ showConfirm() ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          @if (passError()) { <div class="error-box">{{ passError() }}</div> }
          @if (passSuccess()) { <div class="success-box">✓ {{ passSuccess() }}</div> }
          <button class="btn-save" (click)="changePassword()" [disabled]="saving()">
            {{ saving() ? '⏳ Guardando...' : 'Cambiar contraseña' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    header { position: sticky; top: 0; z-index: 200; background: #0a0600; border-bottom: 1px solid rgba(255,130,0,.15); }

    /* TOP BAR */
    .top-bar { display: flex; align-items: center; gap: .75rem; padding: 0 1rem; height: 52px; }
    .logo { display: flex; align-items: center; gap: .35rem; flex-shrink: 0; }
    .logo-urisco { font-size: 1.05rem; font-weight: 900; color: #ff8200; letter-spacing: 1px; }
    .logo-sep { color: #664400; font-size: .9rem; }
    .logo-panini { font-size: .9rem; font-weight: 700; color: #aa5500; }
    .logo-cup { font-size: .9rem; }

    .nav { display: flex; gap: .2rem; background: #0f0800; border-radius: 8px; padding: 3px; margin-left: auto; flex-shrink: 0; }
    .nav-btn { padding: .35rem .75rem; border: none; background: transparent; color: #664400; border-radius: 6px; cursor: pointer; font-size: .78rem; font-weight: 600; white-space: nowrap; transition: all .12s; }
    .nav-btn.active { background: #ff8200; color: #000; font-weight: 800; }

    .header-right { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }
    .avatar { width: 28px; height: 28px; border-radius: 50%; background: #ff8200; color: #000; font-size: .7rem; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .btn-icon-hdr { width: 28px; height: 28px; background: rgba(255,130,0,.05); border: 1px solid rgba(255,130,0,.15); border-radius: 7px; color: #aa6600; cursor: pointer; font-size: .8rem; display: flex; align-items: center; justify-content: center; }
    .btn-icon-hdr:hover { color: #ff8200; }
    .btn-logout { width: 28px; height: 28px; background: rgba(255,130,0,.05); border: 1px solid rgba(255,130,0,.15); border-radius: 7px; color: #664400; cursor: pointer; font-size: .8rem; display: flex; align-items: center; justify-content: center; }
    .btn-logout:hover { color: #e74c3c; }

    /* STATS BAR */
    .stats-bar { background: #070400; border-top: 1px solid rgba(255,130,0,.08); padding: .5rem 1rem; display: flex; flex-direction: column; gap: .5rem; }
    .stats-row { display: flex; align-items: center; gap: .75rem; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 1px; }
    .stat-label { font-size: .6rem; color: #aa8855; text-transform: uppercase; letter-spacing: .5px; white-space: nowrap; }
    .stat-val { font-size: 1rem; font-weight: 800; }
    .green { color: #2ecc71; } .red { color: #e74c3c; } .blue { color: #3498db; } .amber { color: #ff8200; } .gold { color: #f1c40f; }
    .stat-sep { width: 1px; height: 28px; background: rgba(255,130,0,.2); flex-shrink: 0; }

    .progress-row-wrap { display: flex; align-items: center; gap: .75rem; }
    .progress-wrap { flex: 1; }
    .prog-top { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .prog-label { font-size: .65rem; color: #aa8855; }
    .prog-pct { font-size: .65rem; font-weight: 700; color: #ff8200; }
    .prog-bar { height: 5px; background: rgba(255,130,0,.15); border-radius: 3px; overflow: hidden; }
    .prog-fill { height: 100%; background: linear-gradient(90deg, #cc5500, #ff8200); border-radius: 3px; transition: width .4s; }
    .prog-sub { font-size: .6rem; color: #997755; margin-top: 2px; }
    .btn-pdf { padding: .4rem .75rem; background: rgba(255,130,0,.1); border: 1px solid rgba(255,130,0,.2); border-radius: 7px; color: #cc7700; font-size: .75rem; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
    .btn-pdf:hover { color: #ff8200; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(2px); }
    .modal { background: #0f0800; border: 1px solid rgba(255,130,0,.25); border-radius: 18px; padding: 1.75rem; width: 100%; max-width: 380px; position: relative; }
    .close-btn { position: absolute; top: 1rem; right: 1rem; background: rgba(255,130,0,.08); border: 1px solid rgba(255,130,0,.15); color: #664400; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: .85rem; }
    h3 { font-size: 1.1rem; font-weight: 700; color: #ff8200; margin: 0 0 .25rem; }
    .modal-user { font-size: .82rem; color: #664400; margin: 0 0 1.25rem; }
    .modal-user strong { color: #cc7700; }
    .field-group { margin-bottom: 1rem; }
    .field-group label { display: block; font-size: .72rem; text-transform: uppercase; letter-spacing: .8px; color: #664400; margin-bottom: .4rem; }
    .pass-wrap { position: relative; }
    .pass-wrap input { width: 100%; padding: .75rem 2.5rem .75rem 1rem; background: #070400; border: 1px solid rgba(255,130,0,.2); border-radius: 10px; color: #f0e0cc; font-size: .9rem; outline: none; }
    .pass-wrap input:focus { border-color: #ff8200; }
    .pass-wrap input:disabled { opacity: .5; }
    .eye { position: absolute; right: .75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: .9rem; padding: 0; }
    .error-box { background: rgba(231,76,60,.1); border: 1px solid rgba(231,76,60,.3); border-radius: 8px; padding: .6rem 1rem; color: #e74c3c; font-size: .82rem; margin-bottom: 1rem; }
    .success-box { background: rgba(46,204,113,.1); border: 1px solid rgba(46,204,113,.3); border-radius: 8px; padding: .6rem 1rem; color: #2ecc71; font-size: .82rem; margin-bottom: 1rem; }
    .btn-save { width: 100%; padding: .85rem; background: #ff8200; color: #000; font-size: .95rem; font-weight: 800; border: none; border-radius: 10px; cursor: pointer; }
    .btn-save:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class HeaderComponent {
  @Input() activeView: string = 'album';
  @Output() viewChange = new EventEmitter<string>();

  showPassModal = signal(false);
  showCurrent   = signal(false);
  showNew       = signal(false);
  showConfirm   = signal(false);
  saving        = signal(false);
  passError     = signal('');
  passSuccess   = signal('');

  currentPass = '';
  newPass     = '';
  confirmPass = '';

  constructor(public svc: CollectionService, public pdfSvc: PdfService, private api: ApiService) {}

  closePassModal() {
    this.showPassModal.set(false);
    this.currentPass = this.newPass = this.confirmPass = '';
    this.passError.set(''); this.passSuccess.set('');
  }

  async changePassword() {
    this.passError.set(''); this.passSuccess.set('');
    if (!this.currentPass) { this.passError.set('Ingresá tu contraseña actual'); return; }
    if (!this.newPass || this.newPass.length < 4) { this.passError.set('La nueva contraseña debe tener al menos 4 caracteres'); return; }
    if (this.newPass !== this.confirmPass) { this.passError.set('Las contraseñas no coinciden'); return; }
    this.saving.set(true);
    try {
      await this.api.changePassword(this.currentPass, this.newPass);
      this.passSuccess.set('¡Contraseña cambiada exitosamente!');
      this.currentPass = this.newPass = this.confirmPass = '';
      setTimeout(() => this.closePassModal(), 2000);
    } catch (e: any) {
      this.passError.set(e.message ?? 'Error al cambiar la contraseña');
    } finally { this.saving.set(false); }
  }
}