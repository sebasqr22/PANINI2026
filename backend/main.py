import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("SECRET_KEY", "panini2026-dev-secret-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72
DB_PATH = os.environ.get("DB_PATH", "panini.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="Álbum Panini 2026 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    UNIQUE NOT NULL,
            password    TEXT    NOT NULL,
            created_at  TEXT    NOT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS collections (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER NOT NULL REFERENCES users(id),
            owned        TEXT    NOT NULL DEFAULT '{}',
            repeated     TEXT    NOT NULL DEFAULT '{}',
            updated_at   TEXT    NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ─────────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class CollectionData(BaseModel):
    owned: dict[str, bool]
    repeated: dict[str, int]

class StickerUpdate(BaseModel):
    sticker_id: str
    owned: Optional[bool] = None
    repeated: Optional[int] = None

# ─────────────────────────────────────────────────────────────
# AUTH HELPERS
# ─────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if user is None:
        raise credentials_exception
    return user

def get_or_create_collection(user_id: int, db) -> dict:
    row = db.execute("SELECT * FROM collections WHERE user_id = ?", (user_id,)).fetchone()
    if row is None:
        now = datetime.utcnow().isoformat()
        db.execute(
            "INSERT INTO collections (user_id, owned, repeated, updated_at) VALUES (?, '{}', '{}', ?)",
            (user_id, now)
        )
        db.commit()
        return {"owned": {}, "repeated": {}}
    return {"owned": json.loads(row["owned"]), "repeated": json.loads(row["repeated"])}

# ─────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────
@app.post("/auth/register", response_model=Token, status_code=201)
def register(data: UserRegister, db=Depends(get_db)):
    if len(data.username.strip()) < 2:
        raise HTTPException(400, "El nombre debe tener al menos 2 caracteres")
    if len(data.password) < 4:
        raise HTTPException(400, "La contraseña debe tener al menos 4 caracteres")

    existing = db.execute("SELECT id FROM users WHERE username = ?", (data.username.strip(),)).fetchone()
    if existing:
        raise HTTPException(400, "Ese nombre de usuario ya está en uso")

    hashed = hash_password(data.password)
    now = datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)",
        (data.username.strip(), hashed, now)
    )
    db.commit()

    token = create_access_token({"sub": data.username.strip()})
    return {"access_token": token, "token_type": "bearer", "username": data.username.strip()}


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    user = db.execute("SELECT * FROM users WHERE username = ?", (form_data.username,)).fetchone()
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer", "username": user["username"]}


@app.get("/auth/me")
def me(current_user=Depends(get_current_user)):
    return {"id": current_user["id"], "username": current_user["username"], "created_at": current_user["created_at"]}

# ─────────────────────────────────────────────────────────────
# COLLECTION ROUTES
# ─────────────────────────────────────────────────────────────
@app.get("/collection")
def get_collection(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get the full collection for the current user."""
    data = get_or_create_collection(current_user["id"], db)
    return data


@app.put("/collection")
def replace_collection(data: CollectionData, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Replace the entire collection (bulk sync)."""
    now = datetime.utcnow().isoformat()
    existing = db.execute("SELECT id FROM collections WHERE user_id = ?", (current_user["id"],)).fetchone()
    if existing:
        db.execute(
            "UPDATE collections SET owned = ?, repeated = ?, updated_at = ? WHERE user_id = ?",
            (json.dumps(data.owned), json.dumps(data.repeated), now, current_user["id"])
        )
    else:
        db.execute(
            "INSERT INTO collections (user_id, owned, repeated, updated_at) VALUES (?, ?, ?, ?)",
            (current_user["id"], json.dumps(data.owned), json.dumps(data.repeated), now)
        )
    db.commit()
    return {"ok": True, "updated_at": now}


@app.patch("/collection/sticker")
def update_sticker(update: StickerUpdate, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Update a single sticker's owned/repeated status (efficient incremental update)."""
    col = get_or_create_collection(current_user["id"], db)
    owned = col["owned"]
    repeated = col["repeated"]

    sid = update.sticker_id

    if update.owned is not None:
        if update.owned:
            owned[sid] = True
        else:
            owned.pop(sid, None)
            repeated.pop(sid, None)

    if update.repeated is not None:
        if update.repeated > 0:
            owned[sid] = True
            repeated[sid] = update.repeated
        else:
            repeated.pop(sid, None)

    now = datetime.utcnow().isoformat()
    existing = db.execute("SELECT id FROM collections WHERE user_id = ?", (current_user["id"],)).fetchone()
    if existing:
        db.execute(
            "UPDATE collections SET owned = ?, repeated = ?, updated_at = ? WHERE user_id = ?",
            (json.dumps(owned), json.dumps(repeated), now, current_user["id"])
        )
    else:
        db.execute(
            "INSERT INTO collections (user_id, owned, repeated, updated_at) VALUES (?, ?, ?, ?)",
            (current_user["id"], json.dumps(owned), json.dumps(repeated), now)
        )
    db.commit()
    return {"ok": True, "sticker_id": sid, "owned": owned.get(sid, False), "repeated": repeated.get(sid, 0)}


@app.get("/collection/stats")
def get_stats(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Quick stats without sending the full collection."""
    col = get_or_create_collection(current_user["id"], db)
    owned_base = {k: v for k, v in col["owned"].items() if not k.startswith("CC")}
    owned_coca = {k: v for k, v in col["owned"].items() if k.startswith("CC")}
    total_repeated = sum(col["repeated"].values())
    return {
        "owned_base": len(owned_base),
        "owned_coca": len(owned_coca),
        "total_repeated": total_repeated,
    }


# ─────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "panini2026-api"}
