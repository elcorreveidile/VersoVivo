# Base de datos de VersoVivo (Supabase)

`migrations/` contiene el esquema. Se aplica **pegando el fichero en el editor SQL de
Supabase** (una vez, en orden de nombre). Aún no hay datos que migrar desde Firebase.

## Cómo decide la base de datos quién ve qué

| Tabla | Quién lee | Quién escribe |
|---|---|---|
| `poems`, `books` (metadatos públicos) | todos, solo lo `published` (el admin ve todo) | admin |
| `poem_content` (texto, rutas de vídeo/música/voz) | gratis → todos; suscripción → suscriptor vigente; compra → quien compró el libro; admin → todo | admin |
| `book_files` (PDF) | igual, según el `access` del libro | admin |
| `subscriptions`, `purchases` | el dueño (el admin ve todas) | **solo `service_role`** (webhook de RevenueCat) |
| `profiles` | el dueño (y admin) | el dueño: solo `display_name`, `photo_url`, `preferences`, `last_login_at` |
| `favorites`, `poem_activity` | el dueño | el dueño |
| `activity_log` | admin | **nadie**: lo rellenan triggers |

- **Admin** = `app_metadata.role = 'admin'` en el JWT (se pone desde el panel de Supabase o con
  `service_role`; el usuario no puede editarlo). `user_metadata` se ignora a propósito.
- Un libro comprado da acceso a todos sus poemas. Una suscripción da acceso mientras
  `expires_at` esté en el futuro (la fecha manda sobre el estado, por si el webhook se retrasa).
- Los archivos viven en R2: la base guarda **rutas** (`*_path`), no URLs. Un endpoint de servidor
  consulta con el JWT del usuario y, **solo si la fila es visible**, firma la URL.
- Dar a un usuario el rol de administrador (una vez): en el editor SQL,
  `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'tu@correo';`
  (el usuario debe cerrar sesión y volver a entrar para que el JWT lo incluya).

## Tests

```bash
supabase/tests/run.sh          # permisos (levanta un Postgres temporal si no hay PGHOST)
supabase/tests/mutaciones.sh   # rompe el esquema a propósito: los tests deben fallar
```

`tests/00_shim.sql` imita Supabase (roles `anon`/`authenticated`/`service_role`, `auth.uid()`,
`auth.jwt()` y **los privilegios por defecto**, para detectar REVOKEs olvidados).
CI: `.github/workflows/supabase.yml`.
