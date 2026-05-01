#!/bin/bash
# ============================================================
# deploy.sh — Script deploy Catetin ke VPS Hostinger
# Usage: bash deploy.sh [--ssl YOUR_DOMAIN.com YOUR_EMAIL]
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

# ── Step 2: Pull latest code ──────────────────────────────
info "Pulling latest code..."
git pull origin main || warn "Git pull gagal, lanjut dengan code lokal..."

# ── Step 3: Build & Deploy ─────────────────────────────────
info "Building & deploying containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

log "Containers running!"
docker compose ps

# ── Step 4: SSL setup (optional) ───────────────────────────
if [ "${1:-}" = "--ssl" ]; then
    DOMAIN="${2:?Domain wajib diisi. Usage: deploy.sh --ssl example.com email@example.com}"
    EMAIL="${3:?Email wajib diisi. Usage: deploy.sh --ssl example.com email@example.com}"

    info "Setting up SSL untuk ${DOMAIN}..."

    # Buat directory certbot
    mkdir -p certbot/conf certbot/www

    # Request certificate
    docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.${DOMAIN}"

    if [ $? -eq 0 ]; then
        log "SSL certificate berhasil dibuat!"
        warn "Sekarang update nginx/conf.d/default.conf:"
        info "1. Ganti YOUR_DOMAIN.com dengan ${DOMAIN}"
        info "2. Uncomment block HTTPS"
        info "3. Comment block proxy di HTTP, uncomment redirect 301"
        info "4. Jalankan: docker compose restart nginx"
    else
        err "Gagal membuat SSL certificate."
    fi
fi

echo ""
log "Deploy selesai! 🚀"
info "App berjalan di port 80 (HTTP)"
info "Cek logs: docker compose logs -f app"
info "Cek status: docker compose ps"
