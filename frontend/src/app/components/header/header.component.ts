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
      <div class="header-main">
        <div class="logo">
          <span class="logo-urisco">URISCO</span>
          <span class="logo-sep">·</span>
          <span class="logo-panini">PANINI</span>
          <span class="logo-cup">🏆</span>
          <span class="logo-year">2026</span>
        </div>

        <nav class="nav">
          <button class="nav-btn" [class.active]="activeView === 'album'" (click)="viewChange.emit('album')">📋 Álbum</button>
          <button class="nav-btn" [class.active]="activeView === 'lists'" (click)="viewChange.emit('lists')">📊 Listas</button>
        </nav>

        <div class="header-right">
          <div class="user-pill">
            <div class="avatar">{{ (svc.currentUser() ?? 'U')[0].toUpperCase() }}</div>
            <span>{{ svc.currentUser() }}</span>
          </div>
          <button class="btn-icon-hdr" (click)="showPassModal.set(true)" title="Cambiar contraseña">🔑</button>
          <button class="btn-logout" (click)="svc.logout()" title="Cerrar sesión">⏎</button>
        </div>
      </div>

      <div class="stats-bar">
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
          <span class="stat-label">🥤 Coca-Cola</span>
          <span class="stat-val amber">{{ svc.cocaOwnedCount() }}/14</span>
        </div>
        <div class="stat-sep"></div>
        <div class="progress-wrap">
          <div class="progress-row">
            <span class="prog-label">Progreso álbum base</span>
            <span class="prog-pct">{{ svc.completionPct() }}%</span>
          </div>
          <div class="prog-bar">
            <div class="prog-fill" [style.width.%]="svc.completionPct()"></div>
          </div>
          <div class="prog-sub">{{ svc.ownedCount() }} / {{ svc.totalBase }} postales</div>
        </div>
        <div>
          <button class="btn-pdf" (click)="pdfSvc.exportAll()">📄 PDF Completo</button>
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
            <input [type]="showCurrent() ? 'text' : 'password'" [(ngModel)]="currentPass"
              placeholder="Tu contraseña actual" [disabled]="saving()" />
            <button class="eye" type="button" (click)="showCurrent.set(!showCurrent())">{{ showCurrent() ? '🙈' : '👁️' }}</button>
          </div>
          <div class="field-group">
            <label>Nueva contraseña</label>
            <input [type]="showNew() ? 'text' : 'password'" [(ngModel)]="newPass"
              placeholder="Mínimo 4 caracteres" [disabled]="saving()" />
            <button class="eye" type="button" (click)="showNew.set(!showNew())">{{ showNew() ? '🙈' : '👁️' }}</button>
          </div>
          <div class="field-group">
            <label>Confirmar nueva contraseña</label>
            <input [type]="showConfirm() ? 'text' : 'password'" [(ngModel)]="confirmPass"
              placeholder="Repetí la nueva contraseña" [disabled]="saving()" (keyup.enter)="changePassword()" />
            <button class="eye" type="button" (click)="showConfirm.set(!showConfirm())">{{ showConfirm() ? '🙈' : '👁️' }}</button>
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
    .header-main { display: flex; align-items: center; gap: 1rem; padding: 0 1.5rem; height: 58px; }
    .logo { display: flex; align-items: center; gap: .4rem; }
    .logo-urisco { font-size: 1.15rem; font-weight: 900; color: #ff8200; letter-spacing: 2px; }
    .logo-sep { color: #664400; }
    .logo-panini { font-size: 1rem; font-weight: 700; color: #aa5500; letter-spacing: 1px; }
    .logo-cup { font-size: 1rem; }
    .logo-year { font-size: .7rem; color: #664400; letter-spacing: 1px; }
    .nav { display: flex; gap: .25rem; background: #0f0800; border-radius: 8px; padding: 3px; margin-left: auto; }
    .nav-btn { padding: .4rem 1rem; border: none; background: transparent; color: #664400; border-radius: 6px; cursor: pointer; font-size: .82rem; font-weight: 600; transition: all .12s; white-space: nowrap; }
    .nav-btn.active { background: #ff8200; color: #000; font-weight: 800; }
    .header-right { display: flex; align-items: center; gap: .5rem; }
    .user-pill { display: flex; align-items: center; gap: .5rem; padding: .35rem .75rem .35rem .4rem; background: #0f0800; border: 1px solid rgba(255,130,0,.2); border-radius: 20px; font-size: .82rem; color: #cc7700; }
    .avatar { width: 24px; height: 24px; border-radius: 50%; background: #ff8200; color: #000; font-size: .65rem; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    .btn-icon-hdr { width: 32px; height: 32px; background: rgba(255,130,0,.05); border: 1px solid rgba(255,130,0,.15); border-radius: 8px; color: #aa6600; cursor: pointer; font-size: .9rem; transition: all .12s; }
    .btn-icon-hdr:hover { color: #ff8200; border-color: rgba(255,130,0,.4); }
    .btn-logout { width: 32px; height: 32px; background: rgba(255,130,0,.05); border: 1px solid rgba(255,130,0,.15); border-radius: 8px; color: #664400; cursor: pointer; font-size: .9rem; transition: all .12s; }
    .btn-logout:hover { color: #e74c3c; border-color: rgba(231,76,60,.3); }

    .stats-bar { display: flex; align-items: center; gap: .5rem 1.25rem; padding: .6rem 1.5rem; background: #070400; border-top: 1px solid rgba(255,130,0,.08); flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 1px; }
    .stat-label { font-size: .65rem; color: #aa8855; text-transform: uppercase; letter-spacing: .5px; white-space: nowrap; }
    .stat-val { font-size: 1.1rem; font-weight: 800; }
    .green { color: #2ecc71; } .red { color: #e74c3c; } .blue { color: #3498db; } .amber { color: #ff8200; }
    .stat-sep { width: 1px; height: 30px; background: rgba(255,130,0,.25); }
    .progress-wrap { flex: 1; min-width: 160px; }
    .progress-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .prog-label { font-size: .68rem; color: #aa8855; }
    .prog-pct { font-size: .68rem; font-weight: 700; color: #ff8200; }
    .prog-bar { height: 6px; background: rgba(255,130,0,.2); border-radius: 3px; overflow: hidden; }
    .prog-fill { height: 100%; background: linear-gradient(90deg, #cc5500, #ff8200); border-radius: 3px; transition: width .4s; }
    .prog-sub { font-size: .62rem; color: #997755; margin-top: 2px; }
    .btn-pdf { padding: .4rem .85rem; background: rgba(255,130,0,.08); border: 1px solid rgba(255,130,0,.2); border-radius: 7px; color: #aa6600; font-size: .78rem; cursor: pointer; white-space: nowrap; }
    .btn-pdf:hover { background: rgba(255,130,0,.15); color: #ff8200; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(2px); }
    .modal { background: #0f0800; border: 1px solid rgba(255,130,0,.25); border-radius: 18px; padding: 2rem; width: 100%; max-width: 380px; position: relative; }
    .close-btn { position: absolute; top: 1rem; right: 1rem; background: rgba(255,130,0,.08); border: 1px solid rgba(255,130,0,.15); color: #664400; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: .85rem; }
    .close-btn:hover { color: #ff8200; }
    h3 { font-size: 1.1rem; font-weight: 700; color: #ff8200; margin: 0 0 .25rem; }
    .modal-user { font-size: .82rem; color: #664400; margin: 0 0 1.25rem; }
    .modal-user strong { color: #cc7700; }
    .field-group { position: relative; margin-bottom: 1rem; }
    .field-group label { display: block; font-size: .72rem; text-transform: uppercase; letter-spacing: .8px; color: #664400; margin-bottom: .4rem; }
    .field-group input { width: 100%; padding: .75rem 2.5rem .75rem 1rem; background: #070400; border: 1px solid rgba(255,130,0,.2); border-radius: 10px; color: #f0e0cc; font-size: .9rem; outline: none; }
    .field-group input:focus { border-color: #ff8200; }
    .field-group input:disabled { opacity: .5; }
    .eye { position: absolute; right: .75rem; bottom: .7rem; background: none; border: none; cursor: pointer; font-size: .9rem; padding: 0; }
    .error-box { background: rgba(231,76,60,.1); border: 1px solid rgba(231,76,60,.3); border-radius: 8px; padding: .6rem 1rem; color: #e74c3c; font-size: .82rem; margin-bottom: 1rem; }
    .success-box { background: rgba(46,204,113,.1); border: 1px solid rgba(46,204,113,.3); border-radius: 8px; padding: .6rem 1rem; color: #2ecc71; font-size: .82rem; margin-bottom: 1rem; }
    .btn-save { width: 100%; padding: .85rem; background: #ff8200; color: #000; font-size: .95rem; font-weight: 800; border: none; border-radius: 10px; cursor: pointer; transition: opacity .15s; }
    .btn-save:hover:not(:disabled) { opacity: .9; }
    .btn-save:disabled { opacity: .5; cursor: not-allowed; }
    @media (max-width: 600px) { .logo-year { display: none; } .stat-sep { display: none; } }
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
    this.currentPass = '';
    this.newPass = '';
    this.confirmPass = '';
    this.passError.set('');
    this.passSuccess.set('');
  }

  async changePassword() {
    this.passError.set('');
    this.passSuccess.set('');
    if (!this.currentPass) { this.passError.set('Ingresá tu contraseña actual'); return; }
    if (!this.newPass || this.newPass.length < 4) { this.passError.set('La nueva contraseña debe tener al menos 4 caracteres'); return; }
    if (this.newPass !== this.confirmPass) { this.passError.set('Las contraseñas no coinciden'); return; }
    this.saving.set(true);
    try {
      await this.api.changePassword(this.currentPass, this.newPass);
      this.passSuccess.set('¡Contraseña cambiada exitosamente!');
      this.currentPass = '';
      this.newPass = '';
      this.confirmPass = '';
      setTimeout(() => this.closePassModal(), 2000);
    } catch (e: any) {
      this.passError.set(e.message ?? 'Error al cambiar la contraseña');
    } finally {
      this.saving.set(false);
    }
  }
}