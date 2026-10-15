-- Pruebas de permisos del esquema. Se ejecutan con ON_ERROR_STOP=1; al final
-- el script falla si alguna comprobación no se cumple.

create schema t;
grant usage on schema t to public;

create function t.check(p_name text, p_cond boolean) returns void
language plpgsql as $$
begin
  if coalesce(p_cond, false) then
    raise notice 'ok    %', p_name;
  else
    raise notice 'FALLA %', p_name;
    perform set_config('t.fallos', (coalesce(nullif(current_setting('t.fallos', true), ''), '0')::int + 1)::text, false);
  end if;
end $$;

-- ¿cuántas filas devuelve esta consulta con el rol actual? (error de permisos -> -1)
create function t.n(p_sql text) returns int
language plpgsql as $$
declare v int;
begin
  execute 'select count(*) from (' || p_sql || ') q' into v;
  return v;
exception when insufficient_privilege then
  return -1;
end $$;

-- ¿esta sentencia es rechazada por permisos o por RLS (42501)?
create function t.denied(p_sql text) returns boolean
language plpgsql as $$
begin
  execute p_sql;
  return false;
exception when insufficient_privilege then
  return true;
end $$;

-- ¿esta sentencia falla por cualquier motivo (restricción, permisos…)?
create function t.errors(p_sql text) returns boolean
language plpgsql as $$
begin
  execute p_sql;
  return false;
exception when others then
  return true;
end $$;

-- filas afectadas por una sentencia (0 si RLS la deja sin efecto; -1 si da error de permisos)
create function t.rows(p_sql text) returns int
language plpgsql as $$
declare v int;
begin
  execute p_sql;
  get diagnostics v = row_count;
  return v;
exception when insufficient_privilege then
  return -1;
end $$;

-- Cambio de identidad (como hace PostgREST: rol de base de datos + claims del JWT)
create function t.owner() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '', false);
end $$;

create function t.anon() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', false);
  set role anon;
end $$;

create function t.user_(p_uid uuid, p_claims jsonb default '{}') returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims',
    (jsonb_build_object('sub', p_uid, 'role', 'authenticated', 'email', 'u@x.test') || p_claims)::text, false);
  set role authenticated;
end $$;

create function t.admin(p_uid uuid) returns void language plpgsql as $$
begin
  perform t.user_(p_uid, '{"app_metadata":{"role":"admin"}}');
end $$;

create function t.service() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '{"role":"service_role"}', false);
  set role service_role;
end $$;

-- ---------------------------------------------------------------------------
-- Datos de prueba (como propietario)
-- ---------------------------------------------------------------------------
select t.owner();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@x.test'),   -- A: suscripción vigente
  ('00000000-0000-0000-0000-00000000000b', 'b@x.test'),   -- B: ha comprado el libro
  ('00000000-0000-0000-0000-00000000000c', 'c@x.test'),   -- C: sin nada
  ('00000000-0000-0000-0000-00000000000d', 'd@x.test'),   -- D: suscripción caducada, compra reembolsada
  ('00000000-0000-0000-0000-0000000000ad', 'admin@x.test');

insert into public.books (id, title, author, access, status) values
  ('b0000000-0000-0000-0000-000000000001', 'Libro de pago', 'Autor', 'purchase', 'published'),
  ('b0000000-0000-0000-0000-000000000002', 'Libro en borrador', 'Autor', 'purchase', 'draft'),
  ('b0000000-0000-0000-0000-000000000003', 'Libro por suscripción', 'Autor', 'subscription', 'published');

insert into public.poems (id, title, author, access, status, book_id) values
  ('e0000000-0000-0000-0000-000000000001', 'Gratis', 'Autor', 'free', 'published', null),
  ('e0000000-0000-0000-0000-000000000002', 'Suscripción', 'Autor', 'subscription', 'published', null),
  ('e0000000-0000-0000-0000-000000000003', 'De pago', 'Autor', 'purchase', 'published', 'b0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000004', 'Borrador gratis', 'Autor', 'free', 'draft', null),
  ('e0000000-0000-0000-0000-000000000005', 'Archivado gratis', 'Autor', 'free', 'archived', null),
  ('e0000000-0000-0000-0000-000000000006', 'En libro, marcado gratis', 'Autor', 'free', 'published', 'b0000000-0000-0000-0000-000000000001');

update public.poems set excerpt = 'Primeros versos de muestra' where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.poem_content (poem_id, text_content, video_path)
select id, 'texto de ' || title, 'video/' || id || '.mp4' from public.poems;

insert into public.book_files (book_id, pdf_path) values
  ('b0000000-0000-0000-0000-000000000001', 'pdf/pago.pdf'),
  ('b0000000-0000-0000-0000-000000000002', 'pdf/borrador.pdf'),
  ('b0000000-0000-0000-0000-000000000003', 'pdf/suscripcion.pdf');

insert into public.subscriptions (user_id, product_id, platform, status, expires_at) values
  ('00000000-0000-0000-0000-00000000000a', 'mensual', 'ios', 'active', now() + interval '10 days'),
  ('00000000-0000-0000-0000-00000000000d', 'mensual', 'ios', 'expired', now() - interval '1 day'),
  -- «activa» pero ya vencida (el webhook de renovación aún no ha llegado): la fecha manda
  ('00000000-0000-0000-0000-00000000000d', 'anual', 'ios', 'active', now() - interval '1 minute');

insert into public.purchases (user_id, book_id, platform, status) values
  ('00000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-000000000001', 'android', 'active'),
  ('00000000-0000-0000-0000-00000000000d', 'b0000000-0000-0000-0000-000000000001', 'android', 'refunded');

insert into public.favorites (user_id, poem_id) values
  ('00000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000001');

-- el registro de actividad se rellena solo: se vacía lo que generó la carga
truncate public.activity_log;

-- ---------------------------------------------------------------------------
-- 1. Perfil creado por trigger
-- ---------------------------------------------------------------------------
select t.check('el alta crea el perfil',
  (select count(*) from public.profiles) = 5);

insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-0000000000ee', 'e@x.test',
        jsonb_build_object('display_name', repeat('x', 500)));
select t.check('el nombre de perfil se recorta a 80',
  (select char_length(display_name) from public.profiles where id = '00000000-0000-0000-0000-0000000000ee') = 80);

-- ---------------------------------------------------------------------------
-- 2. Sin sesión (anon)
-- ---------------------------------------------------------------------------
select t.anon();
select t.check('anon: ve metadatos de los 4 poemas publicados',
  t.n('select 1 from public.poems') = 4);
select t.check('anon: no ve borradores ni archivados',
  t.n($$select 1 from public.poems where status <> 'published'$$) = 0);
select t.check('anon: ve solo libros publicados',
  t.n('select 1 from public.books') = 2);
select t.check('anon: lee la muestra (excerpt) de un poema publicado',
  t.n($$select 1 from public.poems where excerpt is not null$$) = 1);
select t.check('anon: NO accede al contenido completo de ningún poema, ni gratis',
  t.denied('select 1 from public.poem_content'));
select t.check('anon: no accede a book_files',
  t.denied('select 1 from public.book_files'));
select t.check('anon: no accede a profiles, favoritos, actividad, suscripciones, compras ni registro',
  t.denied('select 1 from public.profiles') and t.denied('select 1 from public.favorites')
  and t.denied('select 1 from public.poem_activity') and t.denied('select 1 from public.subscriptions')
  and t.denied('select 1 from public.purchases') and t.denied('select 1 from public.activity_log'));
select t.check('anon: no escribe en el catálogo',
  t.denied($$insert into public.poems (title, author) values ('x','y')$$)
  and t.denied($$update public.poems set title = 'x'$$)
  and t.denied('delete from public.poems'));
select t.check('anon: no puede llamar a las funciones internas',
  t.denied('select public.handle_new_user()') and t.denied('select public.log_admin_activity()'));

-- ---------------------------------------------------------------------------
-- 3. Usuario con suscripción vigente (A)
-- ---------------------------------------------------------------------------
select t.user_('00000000-0000-0000-0000-00000000000a');
select t.check('A (suscrita): lee gratis + suscripción',
  t.n($$select 1 from public.poem_content where poem_id in
        ('e0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002')$$) = 2);
select t.check('A (suscrita): NO lee el poema de pago de un libro que no compró',
  t.n($$select 1 from public.poem_content where poem_id = 'e0000000-0000-0000-0000-000000000003'$$) = 0);
select t.check('A (suscrita): lee el PDF del libro por suscripción, no el de pago',
  t.n($$select 1 from public.book_files where book_id = 'b0000000-0000-0000-0000-000000000003'$$) = 1
  and t.n($$select 1 from public.book_files where book_id = 'b0000000-0000-0000-0000-000000000001'$$) = 0);
select t.check('A: no lee el PDF de un libro en borrador',
  t.n($$select 1 from public.book_files where book_id = 'b0000000-0000-0000-0000-000000000002'$$) = 0);

-- ---------------------------------------------------------------------------
-- 4. Usuario que compró el libro (B)
-- ---------------------------------------------------------------------------
select t.user_('00000000-0000-0000-0000-00000000000b');
select t.check('B (compró): lee el poema de pago y el PDF',
  t.n($$select 1 from public.poem_content where poem_id = 'e0000000-0000-0000-0000-000000000003'$$) = 1
  and t.n($$select 1 from public.book_files where book_id = 'b0000000-0000-0000-0000-000000000001'$$) = 1);
select t.check('B (compró): NO lee contenido de suscripción sin suscripción',
  t.n($$select 1 from public.poem_content where poem_id = 'e0000000-0000-0000-0000-000000000002'$$) = 0);
select t.check('B: no lee el PDF del libro por suscripción',
  t.n($$select 1 from public.book_files where book_id = 'b0000000-0000-0000-0000-000000000003'$$) = 0);

-- ---------------------------------------------------------------------------
-- 5. Usuario sin derechos (C) y con derechos caducados/reembolsados (D)
-- ---------------------------------------------------------------------------
select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C (cuenta gratuita, sin compras): lee entero todo poema gratis publicado',
  t.n('select 1 from public.poem_content') = 2);   -- 001 y 006
select t.check('C: ningún PDF',
  t.n('select 1 from public.book_files') = 0);

select t.user_('00000000-0000-0000-0000-00000000000d');
select t.check('D: suscripción caducada, o «activa» pero vencida por fecha, no da acceso',
  t.n($$select 1 from public.poem_content where poem_id = 'e0000000-0000-0000-0000-000000000002'$$) = 0);
select t.check('D: compra reembolsada no da acceso',
  t.n($$select 1 from public.book_files where book_id = 'b0000000-0000-0000-0000-000000000001'$$) = 0
  and t.n($$select 1 from public.poem_content where poem_id = 'e0000000-0000-0000-0000-000000000003'$$) = 0);

-- ---------------------------------------------------------------------------
-- 6. Nadie se da derechos ni rol de administrador
-- ---------------------------------------------------------------------------
select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C: no escribe suscripciones ni compras (propias ni ajenas)',
  t.denied($$insert into public.subscriptions (user_id, product_id, platform, status, expires_at)
             values ('00000000-0000-0000-0000-00000000000c','x','ios','active', now() + interval '1 year')$$)
  and t.denied($$insert into public.purchases (user_id, book_id, platform)
             values ('00000000-0000-0000-0000-00000000000c','b0000000-0000-0000-0000-000000000001','ios')$$)
  and t.denied($$update public.subscriptions set expires_at = now() + interval '9 years'$$)
  and t.denied($$update public.purchases set status = 'active'$$)
  and t.denied('delete from public.subscriptions') and t.denied('delete from public.purchases'));
select t.check('C: no escribe en el catálogo',
  t.denied($$insert into public.poems (title, author) values ('x','y')$$)
  and t.denied($$insert into public.books (title, author) values ('x','y')$$)
  and t.denied($$insert into public.poem_content (poem_id, text_content) values ('e0000000-0000-0000-0000-000000000001','x')$$)
  and t.rows($$update public.poems set title = 'hack'$$) <= 0
  and t.rows('delete from public.poems') <= 0
  and t.rows($$update public.poem_content set text_content = 'hack'$$) <= 0
  and t.rows($$update public.book_files set pdf_path = 'hack'$$) <= 0);
select t.check('C: no toca auth.users (ni su metadata)',
  t.denied($$update auth.users set raw_app_meta_data = '{"role":"admin"}'$$)
  and t.denied($$update auth.users set raw_user_meta_data = '{"role":"admin"}'$$)
  and t.denied('select 1 from auth.users'));
select t.check('C: no registra actividad de administrador',
  t.denied($$insert into public.activity_log (action, resource_type, resource_id) values ('create','poem', gen_random_uuid())$$)
  and t.n('select 1 from public.activity_log') = 0);

-- un JWT con role=admin en user_metadata (editable por el usuario) NO vale
select t.user_('00000000-0000-0000-0000-00000000000c',
  '{"user_metadata":{"role":"admin"},"role":"authenticated","admin":true}');
select t.check('user_metadata.role=admin no da poderes',
  not public.is_admin()
  and t.n($$select 1 from public.poems where status <> 'published'$$) = 0
  and t.denied($$insert into public.poems (title, author) values ('x','y')$$));

-- ---------------------------------------------------------------------------
-- 7. Perfiles
-- ---------------------------------------------------------------------------
select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C: ve solo su perfil',
  t.n('select 1 from public.profiles') = 1);
select t.check('C: edita su nombre, foto, preferencias y último acceso',
  t.rows($$update public.profiles set display_name = 'Ana', photo_url = 'https://x.test/a.png',
           preferences = '{"theme":"dark"}', last_login_at = now()
           where id = '00000000-0000-0000-0000-00000000000c'$$) = 1);
select t.check('C: no cambia id ni created_at',
  t.denied($$update public.profiles set id = gen_random_uuid()$$)
  and t.denied($$update public.profiles set created_at = now()$$));
select t.check('C: no edita el perfil de otro',
  t.rows($$update public.profiles set display_name = 'hack'
           where id = '00000000-0000-0000-0000-00000000000a'$$) = 0);
select t.check('C: no crea ni borra perfiles',
  t.denied($$insert into public.profiles (id) values (gen_random_uuid())$$)
  and t.denied('delete from public.profiles'));
select t.check('C: preferencias no admiten texto; foto solo https',
  t.errors($$update public.profiles set preferences = '"x"'$$)
  and t.errors($$update public.profiles set photo_url = 'javascript:alert(1)'$$));

-- ---------------------------------------------------------------------------
-- 8. Favoritos y actividad
-- ---------------------------------------------------------------------------
select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C: favorito de un poema publicado',
  t.rows($$insert into public.favorites (user_id, poem_id)
           values ('00000000-0000-0000-0000-00000000000c','e0000000-0000-0000-0000-000000000001')$$) = 1);
select t.check('C: no pone favoritos a nombre de otro',
  t.denied($$insert into public.favorites (user_id, poem_id)
             values ('00000000-0000-0000-0000-00000000000a','e0000000-0000-0000-0000-000000000002')$$));
select t.check('C: no marca como favorito un borrador',
  t.denied($$insert into public.favorites (user_id, poem_id)
             values ('00000000-0000-0000-0000-00000000000c','e0000000-0000-0000-0000-000000000004')$$));
select t.check('C: solo ve sus favoritos (no los de A)',
  t.n('select 1 from public.favorites') = 1);
select t.check('C: no borra favoritos ajenos',
  t.rows($$delete from public.favorites where user_id = '00000000-0000-0000-0000-00000000000a'$$) = 0);
select t.check('C: marca un poema accesible como leído',
  t.rows($$insert into public.poem_activity (user_id, poem_id, kind)
           values ('00000000-0000-0000-0000-00000000000c','e0000000-0000-0000-0000-000000000001','read')$$) = 1);
select t.check('C: no registra actividad de un poema que no puede ver',
  t.denied($$insert into public.poem_activity (user_id, poem_id, kind)
             values ('00000000-0000-0000-0000-00000000000c','e0000000-0000-0000-0000-000000000002','listened')$$));
select t.check('C: no registra actividad a nombre de otro',
  t.denied($$insert into public.poem_activity (user_id, poem_id, kind)
             values ('00000000-0000-0000-0000-00000000000a','e0000000-0000-0000-0000-000000000001','watched')$$));
select t.check('C: no modifica la actividad (solo alta y baja)',
  t.denied($$update public.poem_activity set created_at = now() - interval '5 years'$$));

-- ---------------------------------------------------------------------------
-- 9. Administrador
-- ---------------------------------------------------------------------------
select t.admin('00000000-0000-0000-0000-0000000000ad');
select t.check('admin: ve borradores y archivados',
  t.n('select 1 from public.poems') = 6 and t.n('select 1 from public.books') = 3);
select t.check('admin: lee todo el contenido y los PDF',
  t.n('select 1 from public.poem_content') = 6 and t.n('select 1 from public.book_files') = 3);
select t.check('admin: lee perfiles, suscripciones y compras de todos',
  t.n('select 1 from public.profiles') = 6 and t.n('select 1 from public.subscriptions') = 3
  and t.n('select 1 from public.purchases') = 2);
select t.check('admin: crea, publica y borra poemas',
  t.rows($$insert into public.poems (id, title, author, status) values ('e0000000-0000-0000-0000-0000000000f1','Nuevo','Autor','draft')$$) = 1
  and t.rows($$update public.poems set status = 'published' where id = 'e0000000-0000-0000-0000-0000000000f1'$$) = 1
  and t.rows($$update public.poems set title = 'Nuevo 2' where id = 'e0000000-0000-0000-0000-0000000000f1'$$) = 1
  and t.rows($$delete from public.poems where id = 'e0000000-0000-0000-0000-0000000000f1'$$) = 1);
select t.check('admin: el registro de actividad se rellena solo (crear, publicar, editar, borrar)',
  (select array_agg(action order by id) from public.activity_log) = array['create','publish','update','delete']);
select t.check('admin: el registro guarda quién lo hizo y qué campos cambió',
  (select admin_id::text from public.activity_log where action = 'update') = '00000000-0000-0000-0000-0000000000ad'
  and (select changes -> 'fields' from public.activity_log where action = 'update') = '["title"]'::jsonb);
select t.check('admin: published_at se fija al publicar',
  (select count(*) from public.poems where status = 'published' and published_at is null) = 0);
select t.check('admin: NO escribe el registro a mano ni lo altera',
  t.denied($$insert into public.activity_log (action, resource_type, resource_id) values ('create','poem', gen_random_uuid())$$)
  and t.denied($$update public.activity_log set action = 'delete'$$)
  and t.denied('delete from public.activity_log'));
select t.check('admin: NO escribe suscripciones ni compras desde el cliente',
  t.denied($$insert into public.subscriptions (user_id, product_id, platform, status, expires_at)
             values ('00000000-0000-0000-0000-00000000000c','x','ios','active', now() + interval '1 year')$$)
  and t.denied($$update public.purchases set status = 'refunded'$$)
  and t.denied('delete from public.subscriptions'));
select t.check('admin: no se hace administrador editando auth.users',
  t.denied($$update auth.users set raw_app_meta_data = '{"role":"admin"}'$$));

-- Un usuario normal no lee el registro
select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C: no lee el registro de actividad',
  t.n('select 1 from public.activity_log') = 0);

-- ---------------------------------------------------------------------------
-- 10. Servidor (service_role): el webhook de RevenueCat
-- ---------------------------------------------------------------------------
select t.service();
select t.check('service_role: escribe suscripciones y compras',
  t.rows($$insert into public.subscriptions (user_id, product_id, platform, status, expires_at)
           values ('00000000-0000-0000-0000-00000000000c','anual','android','active', now() + interval '1 year')$$) = 1
  and t.rows($$insert into public.purchases (user_id, book_id, platform)
           values ('00000000-0000-0000-0000-00000000000c','b0000000-0000-0000-0000-000000000001','android')$$) = 1);

select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C: tras el webhook ya accede a suscripción, compra y PDF',
  t.n($$select 1 from public.poem_content where poem_id in
        ('e0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000003')$$) = 2
  and t.n($$select 1 from public.book_files where book_id in
        ('b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003')$$) = 2);
select t.check('C: ve sus suscripciones y compras, y solo las suyas',
  t.n('select 1 from public.subscriptions') = 1 and t.n('select 1 from public.purchases') = 1);

select t.service();
select t.check('service_role: la caducidad cierra el acceso',
  t.rows($$update public.subscriptions set status = 'expired', expires_at = now() - interval '1 minute'
           where user_id = '00000000-0000-0000-0000-00000000000c'$$) = 1);
select t.user_('00000000-0000-0000-0000-00000000000c');
select t.check('C: con la suscripción caducada vuelve a quedar fuera',
  t.n($$select 1 from public.poem_content where poem_id = 'e0000000-0000-0000-0000-000000000002'$$) = 0);

-- ---------------------------------------------------------------------------
-- 11. Auditoría de privilegios (detecta REVOKEs que falten)
-- ---------------------------------------------------------------------------
select t.owner();

select t.check('todas las tablas de public tienen RLS',
  not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
              where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity));

select t.check('anon: solo SELECT en poems y books; nada más en ninguna tabla',
  (select coalesce(string_agg(c.relname || ':' || p.priv, ',' order by c.relname, p.priv), '')
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
     cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) p(priv)
    where n.nspname = 'public' and c.relkind = 'r'
      and has_table_privilege('anon', c.oid, p.priv)
      and not (p.priv = 'SELECT' and c.relname in ('poems','books'))) = '');

select t.check('authenticated: sin TRUNCATE, REFERENCES ni TRIGGER en ninguna tabla',
  not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
              cross join (values ('TRUNCATE'),('REFERENCES'),('TRIGGER')) p(priv)
              where n.nspname = 'public' and c.relkind = 'r'
                and has_table_privilege('authenticated', c.oid, p.priv)));

select t.check('authenticated: ninguna escritura en subscriptions, purchases, activity_log ni profiles (salvo columnas)',
  not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
              cross join (values ('INSERT'),('UPDATE'),('DELETE')) p(priv)
              where n.nspname = 'public'
                and c.relname in ('subscriptions','purchases','activity_log','profiles')
                and has_table_privilege('authenticated', c.oid, p.priv)));

select t.check('profiles: solo 4 columnas editables por el usuario',
  (select array_agg(a.attname::text order by a.attname)
     from pg_attribute a
    where a.attrelid = 'public.profiles'::regclass and a.attnum > 0 and not a.attisdropped
      and has_column_privilege('authenticated', 'public.profiles', a.attname, 'UPDATE'))
  = array['display_name','last_login_at','photo_url','preferences']);

select t.check('anon/authenticated: ejecutan solo las funciones de derechos',
  (select coalesce(string_agg(distinct p.proname, ','), '')
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (has_function_privilege('anon', p.oid, 'EXECUTE') or has_function_privilege('authenticated', p.oid, 'EXECUTE'))
      and p.proname not in ('is_admin','has_active_subscription','owns_book','can_access_poem','can_access_book')) = '');

select t.check('anon: solo ejecuta is_admin (las demás exigen cuenta)',
  (select coalesce(string_agg(p.proname, ','), '')
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'EXECUTE')
      and p.proname <> 'is_admin') = '');

-- defensa en profundidad: sin identidad (uid nulo) lo «gratis» tampoco se concede
select t.service();
select t.check('can_access_poem sin identidad es falso incluso para un poema gratis',
  not public.can_access_poem('e0000000-0000-0000-0000-000000000001'));
select t.owner();

select t.check('las funciones security definer fijan search_path',
  not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.prosecdef
                and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')));

-- ---------------------------------------------------------------------------
-- Resultado
-- ---------------------------------------------------------------------------
do $$
declare f int := coalesce(nullif(current_setting('t.fallos', true), ''), '0')::int;
begin
  if f > 0 then
    raise exception '% comprobación(es) fallida(s)', f;
  end if;
  raise notice 'TODAS LAS COMPROBACIONES PASAN';
end $$;
