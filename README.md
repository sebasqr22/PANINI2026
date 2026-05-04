# 🏆 Álbum Panini — Mundial FIFA 2026

App full-stack para trackear tu colección Panini 2026.
**980 postales + 14 Coca-Cola · 48 selecciones · Multi-usuario · Datos en la nube**

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 19 (standalone, signals) |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL en **Supabase** (gratis, persistente) |
| Auth | JWT + bcrypt |
| Hosting | Render.com (free tier) |

---

## Deploy paso a paso

### Paso 1 — Base de datos en Supabase (gratis)

1. Ir a **https://supabase.com** → crear cuenta gratis
2. **New project** → nombre: `panini2026`, poné una contraseña, elegí región
3. Esperar ~2 min que se cree
4. Ir a **Settings** → **Database** → sección **Connection string** → tab **URI**
5. Copiar la URL (reemplazá `[YOUR-PASSWORD]` con tu contraseña):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
   ```
> Las tablas se crean solas cuando el backend arranca por primera vez.

---

### Paso 2 — Subir a GitHub (puede ser privado)

```bash
cd panini-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/panini2026.git
git push -u origin main
```

---

### Paso 3 — Backend en Render

1. **https://render.com** → conectar GitHub → **New Web Service**
2. Seleccionar tu repo y configurar:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
3. En **Environment Variables** agregar:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | Click **Generate** |
   | `DATABASE_URL` | Tu URL de Supabase del Paso 1 |

4. **Create Web Service** → esperar ~2 min
5. Verificar: abrir `https://TU-API.onrender.com/health` → debe decir `{"status":"ok","db":true}`
6. Copiar tu URL, ej: `https://panini2026-api.onrender.com`

---

### Paso 4 — Apuntar el frontend al backend

Editar `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://panini2026-api.onrender.com'  // ← tu URL
};
```

```bash
git add frontend/src/environments/environment.prod.ts
git commit -m "Set API URL"
git push
```

---

### Paso 5 — Frontend en Render

1. **New** → **Static Site** → mismo repo
2. Configurar:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build -- --configuration production`
   - **Publish Directory:** `dist/panini2026/browser`
3. En **Redirects/Rewrites** agregar regla:
   - Source `/*` → Destination `/index.html` → Action **Rewrite**
4. **Create Static Site** → esperar ~3 min → ¡listo! 🎉

---

## Desarrollo local

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
export SECRET_KEY="cualquier-clave-local"
uvicorn main:app --reload
# Swagger en http://localhost:8000/docs

# Frontend (otra terminal)
cd frontend
npm install && ng serve
# App en http://localhost:4200
```

---

## Notas del free tier

**Render backend:** se duerme tras 15 min inactivo → cold start de ~30 seg.
Solución gratuita: [UptimeRobot](https://uptimerobot.com) con ping a `/health` cada 5 min.

**Supabase:** 500 MB gratis, datos nunca se pierden. Podés ver todo en el Table Editor de Supabase.
