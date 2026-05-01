#!/bin/bash
# ============================================================
# deploy.sh — Script deploy Catetin ke VPS (via Traefik)
# Usage: bash deploy.sh
# ============================================================
set -euo pipefail

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
CYAN='\033[1;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

# ── Pre-checks ─────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || err "Docker belum terinstall. Jalankan: sudo apt install -y docker.io docker-compose-plugin"
command -v git    >/dev/null 2>&1 || err "Git belum terinstall. Jalankan: sudo apt install -y git"

# ── Step 1: Check .env ─────────────────────────────────────
if [ ! -f .env ]; then
    warn "File .env belum ada!"
    if [ -f .env.example ]; then
        cp .env.example .env
        warn "Sudah di-copy dari .env.example → .env"
        warn "EDIT dulu .env dengan values production sebelum deploy!"
        info "Jalankan: nano .env"
        exit 1
    else
        err "File .env.example juga tidak ditemukan."
    fi
fi

# ── Step 2: Check Traefik network ─────────────────────────
TRAEFIK_NET="${TRAEFIK_NETWORK:-n8n_default}"
if ! docker network inspect "$TRAEFIK_NET" >/dev/null 2>&1; then
    warn "Network '$TRAEFIK_NET' belum ada."
    info "Pastikan n8n + Traefik sudah running dulu, atau buat manual:"
    info "  docker network create $TRAEFIK_NET"
    err "Traefik network tidak ditemukan."
fi
log "Traefik network '$TRAEFIK_NET' ditemukan."

# ── Step 3: Pull latest code ──────────────────────────────
info "Pulling latest code..."
git pull origin main || warn "Git pull gagal, lanjut dengan code lokal..."

# ── Step 4: Build & Deploy ─────────────────────────────────
info "Building & deploying containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

log "Container running!"
docker compose ps

echo ""
log "Deploy selesai! 🚀"
info "App di-route oleh Traefik (port 80/443)"
info "SSL otomatis via Traefik + Let's Encrypt"
info "Cek logs: docker compose logs -f app"
info "Cek status: docker compose ps"
