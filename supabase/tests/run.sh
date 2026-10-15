#!/usr/bin/env bash
# Ejecuta las pruebas del esquema contra un Postgres.
#
#  - En GitHub Actions: exporta PGHOST/PGUSER/PGPASSWORD (servicio postgres) y se usa tal cual.
#  - En local sin PGHOST: levanta un clúster temporal (si eres root, como usuario `postgres`).
#
# Uso: supabase/tests/run.sh [fichero_de_migracion.sql ...]   (por defecto, todas las de supabase/migrations)
set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
MIGRACIONES=("$@")
if [ ${#MIGRACIONES[@]} -eq 0 ]; then
  mapfile -t MIGRACIONES < <(ls "$RAIZ"/supabase/migrations/*.sql | sort)
fi

LIMPIAR=""
if [ -z "${PGHOST:-}" ]; then
  PGBIN="$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)"
  TMP="$(mktemp -d)"
  SOCK="$TMP/sock"; mkdir -p "$SOCK"
  if [ "$(id -u)" = "0" ]; then
    chown -R postgres "$TMP"; chmod 755 "$TMP"
    COMO=(runuser -u postgres --)
  else
    COMO=()
  fi
  "${COMO[@]}" "$PGBIN/initdb" -D "$TMP/data" -A trust -U postgres >/dev/null
  "${COMO[@]}" "$PGBIN/pg_ctl" -D "$TMP/data" -o "-c listen_addresses='' -c unix_socket_directories='$SOCK'" -l "$TMP/log" -w start >/dev/null
  LIMPIAR="$PGBIN/pg_ctl -D $TMP/data -m immediate stop >/dev/null 2>&1 || true; rm -rf $TMP"
  trap 'eval "$LIMPIAR"' EXIT
  export PGHOST="$SOCK" PGUSER=postgres
fi

BD="versovivo_test_$$"
psql -X -q -d postgres -v ON_ERROR_STOP=1 -c "create database $BD" >/dev/null
trap 'psql -X -q -d postgres -c "drop database if exists '"$BD"'" >/dev/null 2>&1 || true; '"${LIMPIAR:+eval \"\$LIMPIAR\"}" EXIT

psql -X -q -d "$BD" -v ON_ERROR_STOP=1 -f "$AQUI/00_shim.sql"
for m in "${MIGRACIONES[@]}"; do
  psql -X -q -d "$BD" -v ON_ERROR_STOP=1 -f "$m"
done
SALIDA="$(mktemp)"
if psql -X -d "$BD" -v ON_ERROR_STOP=1 -f "$AQUI/10_tests.sql" >"$SALIDA" 2>&1; then ESTADO=0; else ESTADO=$?; fi
sed -E 's/^psql:[^ ]+ (NOTICE|ERROR):  /\1 /' "$SALIDA" | grep -E '^(NOTICE|ERROR)' | sed 's/^NOTICE //'
rm -f "$SALIDA"
exit "$ESTADO"
