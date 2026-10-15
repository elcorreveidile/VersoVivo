-- VersoVivo · esquema inicial (Supabase / Postgres)
--
-- Principios:
--   1. La base de datos es la ÚNICA fuente de verdad del acceso. El servidor
--      firma la URL del archivo solo si la fila es visible con el JWT del usuario.
--   2. Mínimo privilegio: Supabase concede ALL en `public` a anon/authenticated
--      por defecto; aquí se revoca todo y se concede lo justo, columna a columna
--      donde hace falta. Encima, RLS en todas las tablas.
--   3. Administrador = claim `app_metadata.role = 'admin'` del JWT. NUNCA
--      `user_metadata`, que el propio usuario puede editar.
--   4. Suscripciones y compras las escribe SOLO el servidor (service_role),
--      desde el webhook de RevenueCat.
--
-- Se aplica pegando este fichero en el editor SQL de Supabase (una sola vez).

-- ---------------------------------------------------------------------------
-- 0. Privilegios por defecto: nada para anon/authenticated
-- ---------------------------------------------------------------------------
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
alter default privileges in schema public revoke all on functions from public;

revoke create on schema public from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. Tipos
-- ---------------------------------------------------------------------------
create type public.access_level   as enum ('free', 'subscription', 'purchase');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.activity_kind  as enum ('read', 'listened', 'watched');
create type public.subscription_status as enum ('active', 'cancelled', 'billing_issue', 'expired');
create type public.purchase_status     as enum ('active', 'refunded');
create type public.store_platform      as enum ('ios', 'android', 'web');

-- ---------------------------------------------------------------------------
-- 2. Funciones de apoyo
-- ---------------------------------------------------------------------------

-- ¿Es administrador? Solo cuenta app_metadata (lo escribe el servidor).
create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Marca de tiempo de última modificación.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- published_at se fija la primera vez que algo pasa a «published».
create function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Perfiles (uno por usuario de auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (display_name is null or char_length(display_name) <= 80),
  photo_url     text check (photo_url is null or (char_length(photo_url) <= 500 and photo_url ~ '^https://')),
  preferences   jsonb not null default '{}'::jsonb
                check (jsonb_typeof(preferences) = 'object' and pg_column_size(preferences) <= 4096),
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- Crea el perfil al registrarse. El nombre viene del usuario: se recorta.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 80), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. Catálogo: metadatos PÚBLICOS
-- ---------------------------------------------------------------------------
create table public.books (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  author           text not null check (char_length(author) between 1 and 200),
  description      text not null default '' check (char_length(description) <= 5000),
  cover_path       text check (cover_path is null or char_length(cover_path) <= 500),
  access           public.access_level not null default 'purchase',
  price_cents      integer check (price_cents is null or price_cents >= 0),
  currency         text not null default 'EUR' check (currency = 'EUR'),
  store_product_id text check (store_product_id is null or char_length(store_product_id) <= 200),
  status           public.content_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz
);

create table public.poems (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  author           text not null check (char_length(author) between 1 and 200),
  category         text not null default 'otros' check (char_length(category) between 1 and 60),
  tags             text[] not null default '{}' check (cardinality(tags) <= 20),
  cover_path       text check (cover_path is null or char_length(cover_path) <= 500),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  original_language text not null default 'es' check (char_length(original_language) between 2 and 8),
  access           public.access_level not null default 'free',
  status           public.content_status not null default 'draft',
  book_id          uuid references public.books (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz
);
create index poems_status_idx  on public.poems (status, published_at desc);
create index poems_book_idx    on public.poems (book_id);
create index poems_category_idx on public.poems (category);

create trigger books_touch before update on public.books
  for each row execute function public.touch_updated_at();
create trigger books_published before insert or update on public.books
  for each row execute function public.set_published_at();
create trigger poems_touch before update on public.poems
  for each row execute function public.touch_updated_at();
create trigger poems_published before insert or update on public.poems
  for each row execute function public.set_published_at();

-- ---------------------------------------------------------------------------
-- 5. Derechos de usuario (solo los escribe el servidor)
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  product_id           text not null,
  platform             public.store_platform not null,
  status               public.subscription_status not null,
  expires_at           timestamptz not null,
  store_transaction_id text,
  updated_at           timestamptz not null default now(),
  unique (user_id, product_id)
);
create index subscriptions_user_idx on public.subscriptions (user_id);

create table public.purchases (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  book_id              uuid not null references public.books (id) on delete restrict,
  platform             public.store_platform not null,
  status               public.purchase_status not null default 'active',
  store_transaction_id text unique,
  price_cents          integer check (price_cents is null or price_cents >= 0),
  currency             text not null default 'EUR',
  purchased_at         timestamptz not null default now(),
  unique (user_id, book_id)
);
create index purchases_user_idx on public.purchases (user_id);

create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Decisión de acceso (única fuente de verdad)
-- ---------------------------------------------------------------------------

-- ¿El usuario del JWT tiene una suscripción vigente?
create function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid()
      and s.status in ('active', 'cancelled', 'billing_issue')
      and s.expires_at > now()
  );
$$;

-- ¿Ha comprado el libro (y no se ha reembolsado)?
create function public.owns_book(p_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.purchases p
    where p.user_id = auth.uid()
      and p.book_id = p_book_id
      and p.status = 'active'
  );
$$;

-- ¿Puede el usuario del JWT acceder al CONTENIDO de este poema?
-- Un libro comprado da acceso a todos sus poemas.
create function public.can_access_poem(p_poem_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1 from public.poems p
    where p.id = p_poem_id
      and p.status = 'published'
      and (
        p.access = 'free'
        or (p.access = 'subscription' and public.has_active_subscription())
        or (p.access = 'purchase' and p.book_id is not null and public.owns_book(p.book_id))
        or (p.book_id is not null and public.owns_book(p.book_id))
      )
  );
$$;

-- ¿Puede el usuario del JWT acceder al ARCHIVO (PDF) de este libro?
create function public.can_access_book(p_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1 from public.books b
    where b.id = p_book_id
      and b.status = 'published'
      and (
        b.access = 'free'
        or (b.access = 'subscription' and public.has_active_subscription())
        or (b.access = 'purchase' and public.owns_book(b.id))
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- 7. Contenido PRIVADO (texto, rutas de vídeo/música/voz y PDF)
-- ---------------------------------------------------------------------------
create table public.poem_content (
  poem_id      uuid primary key references public.poems (id) on delete cascade,
  text_content text not null check (char_length(text_content) <= 100000),
  text_spanish text check (text_spanish is null or char_length(text_spanish) <= 100000),
  video_path   text check (video_path is null or char_length(video_path) <= 500),
  music_path   text check (music_path is null or char_length(music_path) <= 500),
  voice_path   text check (voice_path is null or char_length(voice_path) <= 500),
  updated_at   timestamptz not null default now()
);
create trigger poem_content_touch before update on public.poem_content
  for each row execute function public.touch_updated_at();

create table public.book_files (
  book_id    uuid primary key references public.books (id) on delete cascade,
  pdf_path   text not null check (char_length(pdf_path) <= 500),
  updated_at timestamptz not null default now()
);
create trigger book_files_touch before update on public.book_files
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 8. Actividad del usuario
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id    uuid not null references auth.users (id) on delete cascade,
  poem_id    uuid not null references public.poems (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);

create table public.poem_activity (
  user_id    uuid not null references auth.users (id) on delete cascade,
  poem_id    uuid not null references public.poems (id) on delete cascade,
  kind       public.activity_kind not null,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id, kind)
);
create index poem_activity_poem_idx on public.poem_activity (poem_id, kind);

-- ---------------------------------------------------------------------------
-- 9. Registro de actividad del administrador (lo rellenan los triggers)
-- ---------------------------------------------------------------------------
create table public.activity_log (
  id             bigint generated always as identity primary key,
  admin_id       uuid references auth.users (id) on delete set null,
  admin_email    text,
  action         text not null check (action in ('create', 'update', 'delete', 'publish', 'unpublish')),
  resource_type  text not null check (resource_type in ('poem', 'book')),
  resource_id    uuid not null,
  resource_title text,
  changes        jsonb,
  created_at     timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);

create function public.log_admin_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type    text := case tg_table_name when 'poems' then 'poem' else 'book' end;
  v_action  text;
  v_changes jsonb := null;
  v_id      uuid;
  v_title   text;
begin
  if tg_op = 'INSERT' then
    v_action := 'create'; v_id := new.id; v_title := new.title;
  elsif tg_op = 'DELETE' then
    v_action := 'delete'; v_id := old.id; v_title := old.title;
  else
    v_id := new.id; v_title := new.title;
    if new.status = 'published' and old.status <> 'published' then
      v_action := 'publish';
    elsif old.status = 'published' and new.status <> 'published' then
      v_action := 'unpublish';
    else
      v_action := 'update';
    end if;
    select jsonb_build_object('fields', coalesce(jsonb_agg(n.key order by n.key), '[]'::jsonb))
      into v_changes
      from jsonb_each(to_jsonb(new)) n
      join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value
       and n.key <> 'updated_at';
  end if;

  insert into public.activity_log (admin_id, admin_email, action, resource_type, resource_id, resource_title, changes)
  values (auth.uid(), auth.jwt() ->> 'email', v_action, v_type, v_id, v_title, v_changes);

  return coalesce(new, old);
end;
$$;

create trigger poems_log after insert or update or delete on public.poems
  for each row execute function public.log_admin_activity();
create trigger books_log after insert or update or delete on public.books
  for each row execute function public.log_admin_activity();

-- ---------------------------------------------------------------------------
-- 10. RLS en TODAS las tablas
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.books          enable row level security;
alter table public.poems          enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.purchases      enable row level security;
alter table public.poem_content   enable row level security;
alter table public.book_files     enable row level security;
alter table public.favorites      enable row level security;
alter table public.poem_activity  enable row level security;
alter table public.activity_log   enable row level security;

-- profiles: cada uno ve y edita el suyo; el administrador los ve todos.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- catálogo: público lo publicado; el administrador ve y escribe todo.
create policy books_select on public.books for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy books_insert on public.books for insert to authenticated
  with check (public.is_admin());
create policy books_update on public.books for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy books_delete on public.books for delete to authenticated
  using (public.is_admin());

create policy poems_select on public.poems for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy poems_insert on public.poems for insert to authenticated
  with check (public.is_admin());
create policy poems_update on public.poems for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy poems_delete on public.poems for delete to authenticated
  using (public.is_admin());

-- contenido privado: solo con derecho (gratis, suscripción, compra) o admin.
create policy poem_content_select on public.poem_content for select to anon, authenticated
  using (public.can_access_poem(poem_id));
create policy poem_content_insert on public.poem_content for insert to authenticated
  with check (public.is_admin());
create policy poem_content_update on public.poem_content for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy poem_content_delete on public.poem_content for delete to authenticated
  using (public.is_admin());

create policy book_files_select on public.book_files for select to authenticated
  using (public.can_access_book(book_id));
create policy book_files_insert on public.book_files for insert to authenticated
  with check (public.is_admin());
create policy book_files_update on public.book_files for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy book_files_delete on public.book_files for delete to authenticated
  using (public.is_admin());

-- derechos: el usuario lee los suyos (el admin, todos). Nadie los escribe desde el cliente.
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy purchases_select on public.purchases for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- favoritos y actividad: solo los propios.
create policy favorites_select on public.favorites for select to authenticated
  using (user_id = auth.uid());
create policy favorites_insert on public.favorites for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.poems p where p.id = poem_id)  -- RLS: solo publicados
  );
create policy favorites_delete on public.favorites for delete to authenticated
  using (user_id = auth.uid());

create policy poem_activity_select on public.poem_activity for select to authenticated
  using (user_id = auth.uid());
create policy poem_activity_insert on public.poem_activity for insert to authenticated
  with check (user_id = auth.uid() and public.can_access_poem(poem_id));
create policy poem_activity_delete on public.poem_activity for delete to authenticated
  using (user_id = auth.uid());

-- registro de actividad: solo lo lee el administrador.
create policy activity_log_select on public.activity_log for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 11. Privilegios (lo mínimo; RLS decide después las filas)
-- ---------------------------------------------------------------------------
revoke all on all tables    in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- funciones que las políticas necesitan evaluar con los privilegios del que consulta
grant execute on function public.is_admin()                  to anon, authenticated;
grant execute on function public.has_active_subscription()   to anon, authenticated;
grant execute on function public.owns_book(uuid)             to anon, authenticated;
grant execute on function public.can_access_poem(uuid)       to anon, authenticated;
grant execute on function public.can_access_book(uuid)       to anon, authenticated;

-- lectura del catálogo: también sin sesión (todo lo publicado hoy es gratis)
grant select on public.poems, public.books, public.poem_content to anon;

grant select on public.poems, public.books, public.poem_content, public.book_files to authenticated;
grant insert, update, delete on public.poems, public.books, public.poem_content, public.book_files to authenticated; -- solo admin, por RLS

grant select on public.profiles to authenticated;
grant update (display_name, photo_url, preferences, last_login_at) on public.profiles to authenticated;

grant select on public.subscriptions, public.purchases to authenticated;

grant select, insert, delete on public.favorites, public.poem_activity to authenticated;

grant select on public.activity_log to authenticated;
