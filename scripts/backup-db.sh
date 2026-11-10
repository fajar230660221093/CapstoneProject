#!/usr/bin/env bash
set -euo pipefail

# Skrip ini dijalankan oleh GitHub Actions untuk mencadangkan database Supabase.
# Membutuhkan rahasia: SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DB_NAME,
# SUPABASE_DB_PASSWORD, SUPABASE_SERVICE_ROLE_KEY, BACKUP_SUPABASE_URL,
# BACKUP_SUPABASE_SERVICE_ROLE_KEY, BACKUP_BUCKET_NAME.

DATE="$(date +%Y-%m-%d_%H-%M-%S)"
FILENAME="sim-tagog-backup-${DATE}.sql.gz"
TMP="/tmp/${FILENAME}"

echo "Menjalankan pg_dump..."
PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
  --host="${SUPABASE_DB_HOST}" \
  --port="${SUPABASE_DB_PORT}" \
  --username="postgres" \
  --dbname="${SUPABASE_DB_NAME}" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip -9 > "${TMP}"

echo "Ukuran cadangan: $(du -h "${TMP}" | cut -f1)"

# Unggah ke bucket cadangan di project Supabase kedua.
echo "Mengunggah ke bucket cadangan..."
curl -s -X POST \
  "${BACKUP_SUPABASE_URL}/storage/v1/object/${BACKUP_BUCKET_NAME}/${FILENAME}" \
  -H "Authorization: Bearer ${BACKUP_SUPABASE_SERVICE_ROLE_KEY}" \
  -H "x-upsert: true" \
  --data-binary "@${TMP}"

echo "Cadangan selesai: ${FILENAME}"
rm -f "${TMP}"
