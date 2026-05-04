#!/usr/bin/env python3
"""
Backup script — exporta users y collections de Supabase a JSON.
Mantiene los últimos 14 backups y borra los más viejos.
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get("DATABASE_URL", "")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL no está configurado")
    sys.exit(1)

# ── Conectar ──────────────────────────────────────────────────
print("Conectando a Supabase...")
conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
cur  = conn.cursor()

# ── Exportar usuarios ─────────────────────────────────────────
cur.execute("SELECT id, username, created_at FROM users ORDER BY id")
users = [dict(r) for r in cur.fetchall()]
# Convertir datetime a string
for u in users:
    if u.get("created_at"):
        u["created_at"] = u["created_at"].isoformat()

# ── Exportar colecciones ──────────────────────────────────────
cur.execute("SELECT user_id, owned, repeated, updated_at FROM collections ORDER BY user_id")
collections = [dict(r) for r in cur.fetchall()]
for c in collections:
    if c.get("updated_at"):
        c["updated_at"] = c["updated_at"].isoformat()
    # JSONB viene como dict de psycopg2, aseguramos que sea serializable
    c["owned"]    = dict(c["owned"])
    c["repeated"] = dict(c["repeated"])

conn.close()

# ── Armar backup ──────────────────────────────────────────────
now = datetime.now(timezone.utc)
backup = {
    "generated_at": now.isoformat(),
    "total_users":  len(users),
    "total_collections": len(collections),
    "users":       users,
    "collections": collections,
}

print(f"Exportados: {len(users)} usuarios, {len(collections)} colecciones")

# ── Guardar archivo ───────────────────────────────────────────
backup_dir = Path("backups")
backup_dir.mkdir(exist_ok=True)

filename  = backup_dir / f"backup-{now.strftime('%Y-%m-%d_%H-%M')}.json"
with open(filename, "w", encoding="utf-8") as f:
    json.dump(backup, f, ensure_ascii=False, indent=2)

print(f"Backup guardado: {filename}")

# ── Limpiar backups viejos (mantener últimos 14) ──────────────
backups = sorted(backup_dir.glob("backup-*.json"))
MAX_BACKUPS = 14
if len(backups) > MAX_BACKUPS:
    to_delete = backups[:len(backups) - MAX_BACKUPS]
    for old in to_delete:
        old.unlink()
        print(f"Borrado backup viejo: {old.name}")

print(f"Total backups en repo: {min(len(backups), MAX_BACKUPS)}")
print("Backup completado exitosamente.")
