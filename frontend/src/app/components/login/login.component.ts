import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-backdrop">
      <div class="login-wrap">
        <div class="login-logo">
          <div class="trophy">🏆</div>
          <h1>PANINI</h1>
          <p>Álbum FIFA World Cup 2026</p>
        </div>

        <div class="login-card">
          <h2>Ingresá tu nombre</h2>
          <input
            type="text"
            [(ngModel)]="username"
            placeholder="Ej: Juan, María..."
            (keyup.enter)="login()"
            maxlength="30"
            autofocus
          />
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button class="btn-enter" (click)="login()">Entrar al álbum →</button>

          @if (savedUsers().length > 0) {
            <div class="saved-users">
              <p class="saved-label">Coleccionistas guardados</p>
              <div class="chips">
                @for (u of savedUsers(); track u) {
                  <button class="chip" (click)="loginAs(u)">
                    <span class="chip-avatar">{{ u[0].toUpperCase() }}</span>
                    {{ u }}
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <p class="hint">980 postales + 14 Coca-Cola · 48 selecciones</p>
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
      background: radial-gradient(ellipse at 50% 0%, #1a2a4a 0%, #080810 70%);
    }
    .login-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: 100%; max-width: 420px; }
    .login-logo { text-align: center; }
    .trophy { font-size: 3rem; margin-bottom: 0.5rem; }
    .login-logo h1 { font-size: 2.5rem; font-weight: 900; color: #e8c84a; letter-spacing: 4px; margin: 0; }
    .login-logo p { color: #8888aa; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; margin: 0.25rem 0 0; }
    .login-card {
      width: 100%;
      background: #12121e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h2 { font-size: 1.1rem; font-weight: 600; color: #eee; text-align: center; margin: 0; }
    input {
      width: 100%;
      padding: 0.85rem 1rem;
      background: #0e0e1a;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      color: #f0f0f0;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #e8c84a; }
    .btn-enter {
      width: 100%;
      padding: 0.9rem;
      background: #e8c84a;
      color: #000;
      font-size: 1rem;
      font-weight: 800;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn-enter:hover { opacity: 0.9; }
    .btn-enter:active { transform: scale(0.98); }
    .error { color: #e74c3c; font-size: 0.85rem; text-align: center; margin: 0; }
    .saved-users { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; }
    .saved-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 0.75rem; }
    .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      color: #ccc;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chip:hover { border-color: #e8c84a; color: #e8c84a; }
    .chip-avatar {
      width: 20px; height: 20px; border-radius: 50%;
      background: #e8c84a; color: #000;
      font-size: 0.65rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .hint { color: #444; font-size: 0.78rem; text-align: center; }
  `]
})
export class LoginComponent {
  username = '';
  error = signal('');
  savedUsers = signal<string[]>([]);

  constructor(private svc: CollectionService) {
    this.savedUsers.set(svc.getSavedUsers());
  }

  login() {
    if (!this.username.trim()) { this.error.set('Por favor ingresá tu nombre'); return; }
    this.svc.login(this.username.trim());
  }

  loginAs(name: string) {
    this.svc.login(name);
  }
}
