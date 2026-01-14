# Reglas de Seguridad de Firestore para VersoVivo

## Instrucciones para aplicar las reglas

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Reglas** (Rules)
4. Copia y pega las reglas de abajo
5. Haz clic en **Publicar** (Publish)

---

## Reglas Completas Actualizadas (Integradas)

Estas reglas integran tu configuración existente + la nueva regla para `activityLog`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user is owner
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isEditor() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'editor';
    }

    function isAdminOrEditor() {
      return isAdmin() || isEditor();
    }

    function isAdminEmail() {
      return isSignedIn() &&
        request.auth.token.email != null &&
        request.auth.token.email == 'informa@blablaele.com';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) &&
        (
          !('role' in request.resource.data) ||
          request.resource.data.role == 'user' ||
          (request.resource.data.role == 'admin' && isAdminEmail())
        );
      allow update: if isOwner(userId) &&
        request.resource.data.role == resource.data.role &&
        request.resource.data.diff(resource.data).changedKeys().hasOnly([
          'displayName',
          'photoURL',
          'favorites',
          'readPoems',
          'listenedPoems',
          'watchedPoems',
          'subscription',
          'preferences',
          'lastLoginAt'
        ]);
      allow delete: if isAdmin();
      allow write: if isAdmin();

      // User's poems subcollection
      match /poems/{poemId} {
        allow read: if isOwner(userId) || isAdmin();
        allow write: if isOwner(userId) || isAdmin();
      }
    }

    // Public poems collection
    match /poems/{poemId} {
      allow read: if true;
      allow create, update, delete: if isAdminOrEditor();
    }

    // Books collection
    match /books/{bookId} {
      allow read: if true;
      allow create, update, delete: if isAdminOrEditor();
    }

    // Purchases collection
    match /purchases/{purchaseId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if false;
      allow update, delete: if isAdmin();
    }

    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // ============================================
    // NUEVA: Activity Log collection
    // ============================================
    match /activityLog/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Solo el servidor puede escribir (Admin SDK)
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Cambios realizados

### ✅ Mantenido
- Todas tus reglas existentes sin modificaciones
- Todas tus funciones helper (`isSignedIn`, `isAdmin`, `isEditor`, etc.)
- Lógica de permisos para `users`, `poems`, `books`, `purchases`, `subscriptions`

### ✨ Nuevo
- **Regla para `activityLog`** añadida antes del "default deny"
- Usa tu función existente `isAdmin()` para verificar permisos
- `allow read: if isAdmin()` - Solo admins pueden leer el registro
- `allow write: if false` - Nadie puede escribir directamente (solo el servidor)

---

## Explicación

### ¿Por qué funciona?
El "default deny" (`match /{document=**}`) solo aplica a colecciones SIN una regla explícita. Al agregar la regla específica para `activityLog` ANTES del default deny, esa colección usa su propia regla.

### Seguridad implementada
- ✅ Solo admins pueden ver el registro de actividad
- ✅ Nadie puede escribir en `activityLog` desde el cliente
- ✅ El servidor (Admin SDK) puede escribir libremente (bypass reglas)
- ✅ Todas tus reglas existentes siguen funcionando igual

---

## Verificación

Después de publicar las reglas:

1. Ve a `/admin/activity` en tu aplicación (http://localhost:3000/admin/activity)
2. El error "Missing or insufficient permissions" debería desaparecer
3. Deberías ver el registro de actividad de los administradores

---

## Prueba antes de publicar

Usa el **Simulador** en la consola de Firebase:

1. Haz clic en "Simular" (Simulate) arriba del editor
2. Configura:
   - **Operación**: get
   - **Colección**: activityLog
   - **ID del documento**: (cualquiera)
   - **Autenticado**: ✅ (con tu email de admin)
3. Haz clic en "Ejecutar"
4. Debería decir "✅ Permitido"

---

## Notas importantes

- Estas reglas asumen que los documentos en `users` tienen un campo `role` ('user', 'admin', o 'editor')
- El email de admin hardcodeado (`informa@blablaele.com`) sigue funcionando como antes
- Para producción, considera usar Firebase Authentication custom claims para admin verification
