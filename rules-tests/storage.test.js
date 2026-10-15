// Pruebas de storage.rules (emulador): lectura pública, escritura solo de administradores.
const { test, before, after } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { ref, uploadBytes, getBytes, deleteObject } = require('firebase/storage');

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-versovivo',
    storage: { rules: fs.readFileSync(path.join(__dirname, '..', 'storage.rules'), 'utf8') },
  });
  await env.withSecurityRulesDisabled(async ctx => {
    await uploadBytes(ref(ctx.storage(), 'poemas/uno.mp3'), new Uint8Array([1, 2, 3]), { contentType: 'audio/mpeg' });
  });
});

after(async () => {
  await env.cleanup();
});

const png = new Uint8Array([137, 80, 78, 71]);

test('cualquiera lee los archivos publicados', async () => {
  await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), 'poemas/uno.mp3')));
});

test('solo un administrador sube archivos', async () => {
  const admin = env.authenticatedContext('root', { admin: true }).storage();
  const user = env.authenticatedContext('ana').storage();
  const anon = env.unauthenticatedContext().storage();
  await assertSucceeds(uploadBytes(ref(admin, 'portadas/a.png'), png, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(user, 'portadas/b.png'), png, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(anon, 'portadas/c.png'), png, { contentType: 'image/png' }));
});

test('un administrador no puede subir tipos de archivo no permitidos', async () => {
  const admin = env.authenticatedContext('root', { admin: true }).storage();
  await assertFails(uploadBytes(ref(admin, 'x/script.html'), new Uint8Array([60]), { contentType: 'text/html' }));
  await assertFails(uploadBytes(ref(admin, 'x/app.apk'), new Uint8Array([1]), { contentType: 'application/vnd.android.package-archive' }));
});

test('solo un administrador borra archivos', async () => {
  await assertFails(deleteObject(ref(env.authenticatedContext('ana').storage(), 'poemas/uno.mp3')));
  await assertSucceeds(deleteObject(ref(env.authenticatedContext('root', { admin: true }).storage(), 'poemas/uno.mp3')));
});
