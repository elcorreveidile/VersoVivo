#!/usr/bin/env bash
# «Pruebas de las pruebas»: rompe la migración a propósito de varias formas y
# comprueba que la batería de tests FALLA en cada una. Si alguna mutación
# sobrevive (los tests pasan), falta una comprobación.
set -uo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
ORIGEN="$(ls "$AQUI"/../migrations/*.sql | sort | head -1)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# nombre|programa python que transforma el SQL (variable s)
MUTACIONES=(
 "admin por user_metadata|s=s.replace(\"auth.jwt() -> 'app_metadata'\",\"auth.jwt() -> 'user_metadata'\")"
 "suscripciones escribibles por el usuario|s+='\ngrant insert, update, delete on public.subscriptions to authenticated;\ncreate policy x on public.subscriptions for all to authenticated using (true) with check (true);\n'"
 "compras escribibles por el usuario|s+='\ngrant insert on public.purchases to authenticated;\ncreate policy x on public.purchases for insert to authenticated with check (true);\n'"
 "olvido de los REVOKE (privilegios por defecto de Supabase)|import re; s=re.sub(r'(?m)^(alter default privileges[^;]*revoke[^;]*|revoke all on all[^;]*);','',s)"
 "el acceso ignora la suscripción|s=s.replace(\"or (p.access = 'subscription' and public.has_active_subscription())\",\"or p.access = 'subscription'\")"
 "el acceso ignora la caducidad|s=s.replace('and s.expires_at > now()','')"
 "compra reembolsada sigue dando acceso|s=s.replace(\"and p.status = 'active'\",'')"
 "book_files legible por cualquiera|s=s.replace('using (public.can_access_book(book_id))','using (true)')"
 "poem_content legible por cualquiera|s=s.replace('using (public.can_access_poem(poem_id))','using (true)')"
 "borradores visibles para todos|s=s.replace(\"using (status = 'published' or public.is_admin())\",'using (true)')"
 "perfil: todas las columnas editables|s=s.replace('grant update (display_name, photo_url, preferences, last_login_at) on public.profiles','grant update on public.profiles')"
 "perfiles de otros visibles|s=s.replace('using (id = auth.uid() or public.is_admin())','using (true)')"
 "registro de actividad escribible|s+='\ngrant insert on public.activity_log to authenticated;\ncreate policy x on public.activity_log for insert to authenticated with check (true);\n'"
 "RLS apagada en favoritos|s=s.replace('alter table public.favorites      enable row level security;','')"
 "favoritos a nombre de otro|s=s.replace('user_id = auth.uid()\n    and exists (select 1 from public.poems p where p.id = poem_id)','true')"
 "actividad sin comprobar el derecho|s=s.replace('with check (user_id = auth.uid() and public.can_access_poem(poem_id))','with check (user_id = auth.uid())')"
 "función sin search_path|s=s.replace(\"security definer\nset search_path = ''\n\",'security definer\n',1)"
 "función interna ejecutable por anon|s+='\ngrant execute on function public.handle_new_user() to anon;\n'"
 "anon lee el contenido completo|s+='\ngrant select on public.poem_content to anon;\ncreate policy x on public.poem_content for select to anon using (true);\n'"
 "gratis sin exigir cuenta|s=s.replace(\"(p.access = 'free' and auth.uid() is not null)  -- gratis = con cuenta\",\"p.access = 'free'\")"
 "anon puede escribir poemas|s+='\ngrant insert on public.poems to anon;\n'"
 "administrador escribe suscripciones|s+='\ngrant insert on public.subscriptions to authenticated;\ncreate policy x on public.subscriptions for insert to authenticated with check (public.is_admin());\n'"
)

fallos=0
for m in "${MUTACIONES[@]}"; do
  nombre="${m%%|*}"; prog="${m#*|}"
  python3 - "$ORIGEN" "$TMP/m.sql" "$prog" <<'PY'
import sys
s=open(sys.argv[1]).read()
o=s
exec(sys.argv[3])
if s==o: sys.exit(3)   # la mutación no cambió nada: error del propio script
open(sys.argv[2],'w').write(s)
PY
  [ $? -eq 0 ] || { echo "ERROR: la mutación «$nombre» no se aplicó"; fallos=$((fallos+1)); continue; }
  if "$AQUI/run.sh" "$TMP/m.sql" >/dev/null 2>&1; then
    echo "SOBREVIVE  $nombre   <-- los tests no lo detectan"; fallos=$((fallos+1))
  else
    echo "detectada  $nombre"
  fi
done
[ "$fallos" -eq 0 ] && echo "Todas las mutaciones se detectan." || { echo "$fallos mutación(es) sin detectar"; exit 1; }
