// Pruebas de firestore.rules. Se ejecutan con el emulador: `npm test` (en esta carpeta).
const { test, before, after, beforeEach } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, collection } = require('firebase/firestore');

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-versovivo',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/ana'), {
      uid: 'ana', email: 'ana@example.com', role: 'user', favoritePoems: [], readPoems: [],
    });
    await setDoc(doc(db, 'users/beto'), { uid: 'beto', email: 'beto@example.com', role: 'user' });
    await setDoc(doc(db, 'poems/p1'), { title: 'Poema', author: 'Autor' });
    await setDoc(doc(db, 'books/b1'), { title: 'Libro' });
    await setDoc(doc(db, 'purchases/c1'), { userId: 'ana', bookId: 'b1' });
    await setDoc(doc(db, 'subscriptions/s1'), { userId: 'ana', productId: 'mensual' });
    await setDoc(doc(db, 'activityLog/l1'), { adminId: 'root', action: 'create' });
  });
});

const as = (uid, claims) => env.authenticatedContext(uid, claims).firestore();
const anon = () => env.unauthenticatedContext().firestore();

// ---------- usuarios ----------

test('un usuario crea su propio perfil con rol user', async () => {
  const db = as('nuevo');
  await assertSucceeds(setDoc(doc(db, 'users/nuevo'), {
    uid: 'nuevo', email: 'n@example.com', displayName: 'N', favoritePoems: [], readPoems: [],
    createdAt: new Date().toISOString(),
  }));
  await assertSucceeds(setDoc(doc(as('nuevo2'), 'users/nuevo2'), { uid: 'nuevo2', email: 'n2@example.com', role: 'user' }));
});

test('nadie se crea con rol editor ni admin', async () => {
  await assertFails(setDoc(doc(as('x'), 'users/x'), { uid: 'x', email: 'x@example.com', role: 'editor' }));
  await assertFails(setDoc(doc(as('y'), 'users/y'), { uid: 'y', email: 'y@example.com', role: 'admin' }));
});

test('nadie se crea con suscripción, compras o campos desconocidos', async () => {
  await assertFails(setDoc(doc(as('x'), 'users/x'), {
    uid: 'x', email: 'x@example.com', subscription: { status: 'active', expiresAt: 9e12 },
  }));
  await assertFails(setDoc(doc(as('y'), 'users/y'), { uid: 'y', email: 'y@example.com', purchasedBooks: ['b1'] }));
  await assertFails(setDoc(doc(as('z'), 'users/z'), { uid: 'z', email: 'z@example.com', inventado: 1 }));
});

test('no se puede crear el perfil de otra persona', async () => {
  await assertFails(setDoc(doc(as('x'), 'users/otro'), { uid: 'otro', email: 'o@example.com' }));
  await assertFails(setDoc(doc(as('x'), 'users/x'), { uid: 'otro', email: 'o@example.com' }));
});

test('un usuario edita sus listas y su perfil', async () => {
  const db = as('ana');
  await assertSucceeds(updateDoc(doc(db, 'users/ana'), { favoritePoems: ['p1'], displayName: 'Ana' }));
  await assertSucceeds(updateDoc(doc(db, 'users/ana'), { lastLoginAt: new Date().toISOString() }));
});

test('un usuario no puede darse rol, suscripción ni compras', async () => {
  const db = as('ana');
  await assertFails(updateDoc(doc(db, 'users/ana'), { role: 'admin' }));
  await assertFails(updateDoc(doc(db, 'users/ana'), { role: 'editor' }));
  await assertFails(updateDoc(doc(db, 'users/ana'), { subscription: { status: 'active', expiresAt: 9e12 } }));
  await assertFails(updateDoc(doc(db, 'users/ana'), { purchasedBooks: ['b1'] }));
  await assertFails(updateDoc(doc(db, 'users/ana'), { active: true }));
});

test('un usuario no toca el perfil de otro y no lee el de otro', async () => {
  await assertFails(updateDoc(doc(as('ana'), 'users/beto'), { displayName: 'Hack' }));
  await assertFails(getDoc(doc(as('ana'), 'users/beto')));
  await assertFails(getDoc(doc(anon(), 'users/ana')));
  await assertSucceeds(getDoc(doc(as('ana'), 'users/ana')));
});

test('un usuario no se borra a sí mismo desde el cliente', async () => {
  await assertFails(deleteDoc(doc(as('ana'), 'users/ana')));
});

test('un administrador (claim) puede leer y cambiar cualquier usuario', async () => {
  const db = as('root', { admin: true });
  await assertSucceeds(getDoc(doc(db, 'users/ana')));
  await assertSucceeds(updateDoc(doc(db, 'users/ana'), { role: 'editor' }));
});

test('el rol de un documento NO da permisos de administrador', async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), 'users/falso'), { uid: 'falso', email: 'f@example.com', role: 'admin' });
  });
  await assertFails(setDoc(doc(as('falso'), 'poems/nuevo'), { title: 'x' }));
});

// ---------- poemas y libros ----------

test('poemas y libros se leen sin sesión pero solo los escribe un administrador', async () => {
  await assertSucceeds(getDoc(doc(anon(), 'poems/p1')));
  await assertSucceeds(getDoc(doc(anon(), 'books/b1')));
  await assertFails(setDoc(doc(as('ana'), 'poems/p2'), { title: 'x' }));
  await assertFails(updateDoc(doc(as('ana'), 'poems/p1'), { title: 'x' }));
  await assertFails(deleteDoc(doc(as('ana'), 'books/b1')));
  await assertFails(setDoc(doc(anon(), 'books/b2'), { title: 'x' }));
  const admin = as('root', { admin: true });
  await assertSucceeds(setDoc(doc(admin, 'poems/p2'), { title: 'x' }));
  await assertSucceeds(updateDoc(doc(admin, 'books/b1'), { title: 'y' }));
});

// ---------- compras y suscripciones ----------

test('las compras y suscripciones las crea solo el servidor', async () => {
  const db = as('ana');
  await assertFails(addDoc(collection(db, 'subscriptions'), { userId: 'ana', productId: 'mensual' }));
  await assertFails(addDoc(collection(db, 'purchases'), { userId: 'ana', bookId: 'b1' }));
  await assertFails(updateDoc(doc(db, 'subscriptions/s1'), { productId: 'anual' }));
  await assertFails(deleteDoc(doc(db, 'purchases/c1')));
  await assertFails(addDoc(collection(as('root', { admin: true }), 'subscriptions'), { userId: 'ana' }));
});

test('cada usuario lee solo sus compras y suscripciones', async () => {
  await assertSucceeds(getDoc(doc(as('ana'), 'purchases/c1')));
  await assertSucceeds(getDoc(doc(as('ana'), 'subscriptions/s1')));
  await assertFails(getDoc(doc(as('beto'), 'purchases/c1')));
  await assertFails(getDoc(doc(as('beto'), 'subscriptions/s1')));
  await assertFails(getDoc(doc(anon(), 'purchases/c1')));
  await assertSucceeds(getDoc(doc(as('root', { admin: true }), 'purchases/c1')));
});

// ---------- registro de actividad ----------

test('el registro de actividad: el administrador lo lee y añade a su nombre, nadie lo cambia', async () => {
  const admin = as('root', { admin: true });
  await assertSucceeds(getDoc(doc(admin, 'activityLog/l1')));
  await assertSucceeds(addDoc(collection(admin, 'activityLog'), { adminId: 'root', action: 'update' }));
  await assertFails(addDoc(collection(admin, 'activityLog'), { adminId: 'otro', action: 'update' }));
  await assertFails(updateDoc(doc(admin, 'activityLog/l1'), { action: 'borrado' }));
  await assertFails(deleteDoc(doc(admin, 'activityLog/l1')));
  await assertFails(getDoc(doc(as('ana'), 'activityLog/l1')));
  await assertFails(addDoc(collection(as('ana'), 'activityLog'), { adminId: 'ana' }));
});

// ---------- lo demás ----------

test('cualquier otra colección está cerrada', async () => {
  await assertFails(getDoc(doc(as('ana'), 'cosas/c')));
  await assertFails(setDoc(doc(as('root', { admin: true }), 'cosas/c'), { a: 1 }));
});
