# 🏆 Álbum Panini — Mundial FIFA 2026

Aplicación full-stack para trackear tu colección Panini 2026.  
**980 postales base + 14 exclusivas Coca-Cola · 48 selecciones · Multi-usuario**

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 19 (standalone, signals) |
| Backend | Python 3.11 + FastAPI |
| Base de datos | SQLite (en Render con disco persistente) |
| Auth | JWT + bcrypt |
| Hosting | Render.com (free tier) |

---

## Estructura del repo

```
panini-app/
├── backend/
│   ├── main.py           # API FastAPI completa
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── app/
│           ├── models/   # Sticker, Team, datos del álbum
│           ├── services/ # ApiService, CollectionService, PdfService
│           └── components/
├── render.yaml           # Deploy automático en Render
└── README.md
```

---

## Cómo hacer deploy en Render (gratis)

### Paso 1 — Subir a GitHub

```bash
cd panini-app
git init
git add .
git commit -m "Initial commit — Panini 2026"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/panini2026.git
git push -u origin main
```

### Paso 2 — Crear cuenta en Render

1. Ir a **https://render.com** y registrarse (es gratis)
2. Conectar tu cuenta de GitHub

### Paso 3 — Deploy del Backend

1. En Render → **New** → **Web Service**
2. Conectar el repo de GitHub
3. Configurar:
   - **Name:** `panini2026-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. En **Environment Variables**, agregar:
   - `SECRET_KEY` → click en "Generate" para generar una clave segura
5. En **Disks** (para persistir la base de datos):
   - **Name:** `db-storage`
   - **Mount Path:** `/opt/render/project/src`
   - **Size:** 1 GB
6. Click **Create Web Service**
7. Esperar que el deploy termine (~2 min)
8. **Copiar la URL del backend**, por ejemplo: `https://panini2026-api.onrender.com`

### Paso 4 — Configurar la URL del backend en el frontend

Editar `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://panini2026-api.onrender.com'  // ← tu URL de Render
};
```

Hacer commit y push.

### Paso 5 — Deploy del Frontend

**Opción A: Render Static Site (recomendado)**

1. En Render → **New** → **Static Site**
2. Conectar el mismo repo
3. Configurar:
   - **Name:** `panini2026-app`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build -- --configuration production`
   - **Publish Directory:** `dist/panini2026/browser`
4. En **Redirects/Rewrites**, agregar regla:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite
5. Click **Create Static Site**

**Opción B: GitHub Pages / Netlify / Vercel** (también funcionan igual)

---

## Desarrollo local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# API corriendo en http://localhost:8000
# Docs en http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
ng serve
# App en http://localhost:4200
```

El frontend en dev ya apunta a `http://localhost:8000` (ver `environment.ts`).

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesión (retorna JWT) |
| GET | `/auth/me` | Info del usuario actual |
| GET | `/collection` | Obtener colección completa |
| PUT | `/collection` | Reemplazar colección completa |
| PATCH | `/collection/sticker` | Actualizar una postal |
| GET | `/collection/stats` | Estadísticas rápidas |
| GET | `/health` | Health check |

Documentación interactiva disponible en `/docs` (Swagger UI).

---

## Notas sobre el free tier de Render

- El servicio **se duerme** después de 15 minutos sin tráfico
- El primer request después de inactivo tarda ~30 segundos (cold start)
- La base de datos SQLite persiste en el disco de 1 GB
- Para evitar cold starts podés usar [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping cada 5 minutos

---

## Funcionalidades

- ✅ Login / Registro con contraseña
- ✅ Datos guardados en servidor (no en el navegador)
- ✅ Multi-usuario — cada uno ve solo su colección
- ✅ Sección FWC: postales 00–08 (intro) y 09–19 (historia)
- ✅ 48 selecciones × 20 postales
- ✅ 14 postales Coca-Cola exclusivas
- ✅ Marcar postales como "tengo" o "me falta"
- ✅ Contador de repetidas por postal
- ✅ Filtros: todas, faltan, tengo, repetidas
- ✅ Búsqueda por nombre o código
- ✅ Filtro por grupo del mundial
- ✅ Exportar PDF: faltantes / repetidas / colección completa
- ✅ Sincronización optimista (UI instantánea + guardado en background)
