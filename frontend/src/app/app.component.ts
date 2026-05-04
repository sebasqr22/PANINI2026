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
  imports: [
    CommonModule,
    LoginComponent,
    HeaderComponent,
    AlbumComponent,
    ListsComponent,
    StickerModalComponent
  ],
  template: `
    @if (!isLoggedIn()) {
      <app-login />
    } @else {
      <div class="app-shell">
        <app-header
          [activeView]="activeView()"
          (viewChange)="activeView.set($event)"
        />
        <main class="main-content">
          @if (activeView() === 'album') {
            <app-album (stickerSelected)="openModal($event)" />
          }
          @if (activeView() === 'lists') {
            <app-lists (stickerSelected)="openModal($event)" />
          }
        </main>
        @if (selectedSticker()) {
          <app-sticker-modal
            [sticker]="selectedSticker()!"
            (close)="selectedSticker.set(null)"
          />
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .app-shell { min-height: 100vh; display: flex; flex-direction: column; background: #080810; }
    .main-content { flex: 1; }
  `]
})
export class AppComponent {
  activeView = signal('album');
  selectedSticker = signal<Sticker | null>(null);
  constructor(public svc: CollectionService) {}
  isLoggedIn = computed(() => !!this.svc.currentUser());
  openModal(sticker: Sticker) { this.selectedSticker.set(sticker); }
}
