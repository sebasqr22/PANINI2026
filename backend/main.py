import json
import os
import bcrypt
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional, Dict

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────
SECRET_KEY   = os.environ.get("SECRET_KEY", "panini2026-dev-secret-change-in-prod")
ALGORITHM    = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72
DATABASE_URL = os.environ.get("DATABASE_URL", "")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="Álbum Panini 2026 API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://panini2026-app.onrender.com", "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ──────────────────────────────────────────────────
@contextmanager
def get_db():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL no está configurado")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def get_db_dep():
    with get_db() as conn:
        yield conn

def init_db():
    if not DATABASE_URL:
        print("WARNING: DATABASE_URL no configurado", flush=True)
        return
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         SERIAL PRIMARY KEY,
                username   TEXT UNIQUE NOT NULL,
                password   TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS collections (
                id         SERIAL PRIMARY KEY,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                owned      JSONB NOT NULL DEFAULT '{}',
                repeated   JSONB NOT NULL DEFAULT '{}',
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(user_id)
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_col_user ON collections(user_id)")

try:
    init_db()
    print("✅ Base de datos lista", flush=True)
except Exception as e:
    print(f"⚠️  DB init: {e}", flush=True)

# ── Schemas ───────────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class CollectionData(BaseModel):
    owned:    Dict[str, bool]
    repeated: Dict[str, int]

class StickerUpdate(BaseModel):
    sticker_id: str
    owned:    Optional[bool] = None
    repeated: Optional[int]  = None

# ── Auth helpers ──────────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(username: str) -> str:
    payload = {"sub": username, "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db_dep)):
    exc = HTTPException(status_code=401, detail="Token inválido o expirado",
                        headers={"WWW-Authenticate": "Bearer"})
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username: raise exc
    except JWTError:
        raise exc
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    if not user: raise exc
    return user

def upsert_collection(user_id: int, owned: dict, repeated: dict, db):
    db.cursor().execute("""
        INSERT INTO collections (user_id, owned, repeated, updated_at)
        VALUES (%s, %s, %s, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET owned = EXCLUDED.owned, repeated = EXCLUDED.repeated, updated_at = NOW()
    """, (user_id, json.dumps(owned), json.dumps(repeated)))

def fetch_collection(user_id: int, db) -> dict:
    cur = db.cursor()
    cur.execute("SELECT owned, repeated FROM collections WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    if not row:
        upsert_collection(user_id, {}, {}, db)
        return {"owned": {}, "repeated": {}}
    return {"owned": dict(row["owned"]), "repeated": dict(row["repeated"])}

# ── Auth routes ───────────────────────────────────────────────
@app.post("/auth/register", response_model=Token, status_code=201)
def register(data: UserRegister, db=Depends(get_db_dep)):
    if len(data.username.strip()) < 2:
        raise HTTPException(400, "El nombre debe tener al menos 2 caracteres")
    if len(data.password) < 4:
        raise HTTPException(400, "La contraseña debe tener al menos 4 caracteres")
    cur = db.cursor()
    cur.execute("SELECT id FROM users WHERE username = %s", (data.username.strip(),))
    if cur.fetchone():
        raise HTTPException(400, "Ese nombre de usuario ya está en uso")
    cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)",
                (data.username.strip(), hash_password(data.password)))
    return {"access_token": create_token(data.username.strip()),
            "token_type": "bearer", "username": data.username.strip()}

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db_dep)):
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (form_data.username,))
    user = cur.fetchone()
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos",
                            headers={"WWW-Authenticate": "Bearer"})
    return {"access_token": create_token(user["username"]),
            "token_type": "bearer", "username": user["username"]}

@app.get("/auth/me")
def me(u=Depends(get_current_user)):
    return {"id": u["id"], "username": u["username"], "created_at": str(u["created_at"])}

# ── Collection routes ─────────────────────────────────────────
@app.get("/collection")
def get_collection(u=Depends(get_current_user), db=Depends(get_db_dep)):
    return fetch_collection(u["id"], db)

@app.put("/collection")
def replace_collection(data: CollectionData, u=Depends(get_current_user), db=Depends(get_db_dep)):
    upsert_collection(u["id"], data.owned, data.repeated, db)
    return {"ok": True}

@app.patch("/collection/sticker")
def update_sticker(upd: StickerUpdate, u=Depends(get_current_user), db=Depends(get_db_dep)):
    col      = fetch_collection(u["id"], db)
    owned    = col["owned"]
    repeated = col["repeated"]
    sid      = upd.sticker_id
    if upd.owned is not None:
        if upd.owned:
            owned[sid] = True
        else:
            owned.pop(sid, None)
            repeated.pop(sid, None)
    if upd.repeated is not None:
        if upd.repeated > 0:
            owned[sid]    = True
            repeated[sid] = upd.repeated
        else:
            repeated.pop(sid, None)
    upsert_collection(u["id"], owned, repeated, db)
    return {"ok": True, "sticker_id": sid,
            "owned": owned.get(sid, False), "repeated": repeated.get(sid, 0)}

@app.get("/collection/stats")
def get_stats(u=Depends(get_current_user), db=Depends(get_db_dep)):
    col = fetch_collection(u["id"], db)
    return {
        "owned_base":     len([k for k in col["owned"] if not k.startswith("CC")]),
        "owned_coca":     len([k for k in col["owned"] if k.startswith("CC")]),
        "total_repeated": sum(col["repeated"].values()),
    }

@app.get("/health")
def health():
    try:
        with get_db() as conn:
            conn.cursor().execute("SELECT 1")
        return {"status": "ok", "db": True}
    except Exception as e:
        return {"status": "error", "db": False, "detail": str(e)}

@app.head("/health")
def health_head():
    from fastapi import Response
    return Response(status_code=200)
