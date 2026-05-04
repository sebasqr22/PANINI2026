import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../services/collection.service';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-backdrop">
      <div class="login-wrap">
        <div class="login-logo">
          <div class="trophy">🏆</div>
          <h1>URISCO</h1>
          <p class="subtitle">PANINI · FIFA WORLD CUP 2026</p>
        </div>

        <div class="login-card">
          <div class="mode-tabs">
            <button class="mtab" [class.active]="mode() === 'login'" (click)="setMode('login')">Iniciar sesión</button>
            <button class="mtab" [class.active]="mode() === 'register'" (click)="setMode('register')">Crear cuenta</button>
          </div>

          <div class="fields">
            <div class="field-group">
              <label>Usuario</label>
              <input type="text" [(ngModel)]="username" placeholder="Tu nombre..."
                maxlength="30" [disabled]="loading()" (keyup.enter)="submit()" />
            </div>
            <div class="field-group">
              <label>Contraseña</label>
              <div class="pass-wrap">
                <input [type]="showPass() ? 'text' : 'password'" [(ngModel)]="password"
                  placeholder="Contraseña..." [disabled]="loading()" (keyup.enter)="submit()" />
                <button class="pass-eye" type="button" (click)="showPass.set(!showPass())">
                  {{ showPass() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
          </div>

          @if (error()) {
            <div class="error-box">{{ error() }}</div>
          }

          <button class="btn-submit" (click)="submit()" [disabled]="loading()">
            @if (loading()) { ⏳ Cargando... }
            @else if (mode() === 'login') { Entrar al álbum → }
            @else { Crear mi cuenta → }
          </button>

          <p class="hint-text">
            @if (mode() === 'login') {
              ¿No tenés cuenta? <button class="link-btn" (click)="setMode('register')">Creala gratis</button>
            } @else {
              ¿Ya tenés? <button class="link-btn" (click)="setMode('login')">Iniciá sesión</button>
            }
          </p>
        </div>

        <p class="footer-hint">980 postales + 14 Coca-Cola · 48 selecciones · ☁️ Datos en la nube</p>
      </div>
    </div>
  `,
  styles: [`
    .login-backdrop {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: radial-gradient(ellipse at 50% 0%, #1a1200 0%, #0a0800 70%);
    }
    .login-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: 100%; max-width: 400px; }

    .login-logo { text-align: center; }
    .trophy { font-size: 3.5rem; margin-bottom: .5rem; filter: drop-shadow(0 0 20px #ff820066); }
    .login-logo h1 {
      font-size: 3rem; font-weight: 900; color: #ff8200;
      letter-spacing: 6px; margin: 0;
      text-shadow: 0 0 30px #ff820055;
    }
    .subtitle { color: #aa6600; font-size: .75rem; letter-spacing: 3px; text-transform: uppercase; margin: .35rem 0 0; }

    .login-card {
      width: 100%;
      background: #0f0900;
      border: 1px solid rgba(255,130,0,.2);
      border-radius: 18px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 0 40px rgba(255,130,0,.08);
    }

    .mode-tabs { display: flex; background: #080500; border-radius: 10px; padding: 3px; gap: 3px; }
    .mtab { flex: 1; padding: .55rem; border: none; background: transparent; color: #664400; border-radius: 8px; cursor: pointer; font-size: .85rem; font-weight: 600; transition: all .15s; }
    .mtab.active { background: #ff8200; color: #000; font-weight: 800; }

    .fields { display: flex; flex-direction: column; gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: .4rem; }
    label { font-size: .72rem; text-transform: uppercase; letter-spacing: .8px; color: #664400; }

    input {
      width: 100%;
      padding: .8rem 1rem;
      background: #080500;
      border: 1px solid rgba(255,130,0,.2);
      border-radius: 10px;
      color: #f0e0cc;
      font-size: .95rem;
      outline: none;
      transition: border-color .2s;
    }
    input:focus { border-color: #ff8200; box-shadow: 0 0 0 3px rgba(255,130,0,.1); }
    input:disabled { opacity: .5; }
    input::placeholder { color: #442200; }

    .pass-wrap { position: relative; }
    .pass-wrap input { padding-right: 3rem; }
    .pass-eye { position: absolute; right: .75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0; }

    .error-box {
      background: rgba(231,76,60,.1);
      border: 1px solid rgba(231,76,60,.3);
      border-radius: 8px;
      padding: .65rem 1rem;
      color: #e74c3c;
      font-size: .85rem;
    }

    .btn-submit {
      width: 100%;
      padding: .9rem;
      background: #ff8200;
      color: #000;
      font-size: 1rem;
      font-weight: 800;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all .15s;
      letter-spacing: .5px;
      box-shadow: 0 4px 20px rgba(255,130,0,.3);
    }
    .btn-submit:hover:not(:disabled) { background: #ff9a33; box-shadow: 0 4px 25px rgba(255,130,0,.5); }
    .btn-submit:active:not(:disabled) { transform: scale(.98); }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

    .hint-text { font-size: .82rem; color: #442200; text-align: center; margin: 0; }
    .link-btn { background: none; border: none; color: #ff8200; cursor: pointer; font-size: .82rem; text-decoration: underline; padding: 0; }

    .footer-hint { color: #2a1500; font-size: .75rem; text-align: center; }
  `]
})
export class LoginComponent {
  mode     = signal<Mode>('login');
  loading  = signal(false);
  error    = signal('');
  showPass = signal(false);
  username = '';
  password = '';

  constructor(private svc: CollectionService) {}

  setMode(m: Mode) { this.mode.set(m); this.error.set(''); }

  async submit() {
    this.error.set('');
    if (!this.username.trim()) { this.error.set('Ingresá tu nombre de usuario'); return; }
    if (!this.password)        { this.error.set('Ingresá tu contraseña'); return; }
    if (this.mode() === 'register' && this.password.length < 4) {
      this.error.set('La contraseña debe tener al menos 4 caracteres'); return;
    }
    this.loading.set(true);
    try {
      if (this.mode() === 'login') await this.svc.login(this.username.trim(), this.password);
      else                         await this.svc.register(this.username.trim(), this.password);
    } catch (e: any) {
      this.error.set(e.message ?? 'Ocurrió un error, intentá de nuevo');
    } finally {
      this.loading.set(false);
    }
  }
}
