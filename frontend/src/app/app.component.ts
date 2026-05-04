import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from './services/collection.service';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { AlbumComponent } from './components/album/album.component';
import { ListsComponent } from './components/lists/lists.component';
import { StickerModalComponent } from './components/sticker-modal/sticker-modal.component';
import { Sticker } from './models/sticker.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, HeaderComponent, AlbumComponent, ListsComponent, StickerModalComponent],
  template: `
    @if (!svc.isLoggedIn()) {
      <app-login />
    } @else if (svc.loading()) {
      <div class="loading-screen">
        <div class="loading-inner">
          <div class="loading-trophy">🏆</div>
          <p class="loading-brand">URISCO</p>
          <p class="loading-text">Cargando tu colección...</p>
        </div>
      </div>
    } @else {
      <div class="app-shell">
        <app-header [activeView]="activeView()" (viewChange)="activeView.set($event)" />
        <main>
          @if (activeView() === 'album') { <app-album (stickerSelected)="openModal($event)" /> }
          @if (activeView() === 'lists') { <app-lists (stickerSelected)="openModal($event)" /> }
        </main>
        @if (selectedSticker()) {
          <app-sticker-modal [sticker]="selectedSticker()!" (close)="selectedSticker.set(null)" />
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .app-shell { min-height: 100vh; display: flex; flex-direction: column; background: #070400; }
    main { flex: 1; }
    .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #070400; }
    .loading-inner { text-align: center; }
    .loading-trophy { font-size: 3rem; margin-bottom: .5rem; animation: pulse 1.5s ease-in-out infinite; }
    .loading-brand { font-size: 1.5rem; font-weight: 900; color: #ff8200; letter-spacing: 4px; margin-bottom: .5rem; }
    .loading-text { color: #442200; font-size: .85rem; letter-spacing: 1px; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
  `]
})
export class AppComponent {
  activeView      = signal('album');
  selectedSticker = signal<Sticker | null>(null);
  constructor(public svc: CollectionService) {}
  openModal(sticker: Sticker) { this.selectedSticker.set(sticker); }
}
