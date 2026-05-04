import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
}

export interface CollectionData {
  owned: Record<string, boolean>;
  repeated: Record<string, number>;
}

const TOKEN_KEY = 'panini_token';
const USER_KEY  = 'panini_user';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  readonly token           = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly storedUsername  = signal<string | null>(localStorage.getItem(USER_KEY));

  async register(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? 'Error al registrarse'); }
    const data: AuthResponse = await res.json();
    this.saveSession(data);
    return data;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }).toString(),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? 'Usuario o contraseña incorrectos'); }
    const data: AuthResponse = await res.json();
    this.saveSession(data);
    return data;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.storedUsername.set(null);
  }

  async getCollection(): Promise<CollectionData> {
    const res = await this.authFetch('/collection');
    if (!res.ok) throw new Error('Error al cargar la colección');
    return res.json();
  }

  async updateSticker(stickerId: string, owned?: boolean, repeated?: number): Promise<void> {
    const body: Record<string, unknown> = { sticker_id: stickerId };
    if (owned !== undefined)    body['owned']    = owned;
    if (repeated !== undefined) body['repeated'] = repeated;
    const res = await this.authFetch('/collection/sticker', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Error al actualizar postal');
  }

  private authFetch(path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${this.token()}` },
    });
  }

  private saveSession(data: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, data.username);
    this.token.set(data.access_token);
    this.storedUsername.set(data.username);
  }
}
