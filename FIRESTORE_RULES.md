# Reglas de seguridad (Firestore y Storage)

Las reglas viven en el repositorio y son la **única barrera real**: lo que el cliente (app o web)
compruebe solo sirve para mostrar u ocultar botones.

- `firestore.rules` — base de datos
- `storage.rules` — archivos (portadas, vídeos, música, PDF)
- `rules-tests/` — pruebas automáticas contra el emulador de Firebase

## Principios

1. **Administrador = custom claim `admin: true` del token.** Se asigna con
   `web/scripts/set-admin-claims.js` (Admin SDK). Ningún campo de un documento que un usuario
   pueda escribir (por ejemplo `role`) concede permisos.
2. **El usuario solo escribe su perfil y sus listas** (`displayName`, `photoURL`, `favoritePoems`,
   `readPoems`, `listenedPoems`, `watchedPoems`, `preferences`, `lastLoginAt`). No puede darse
   `role`, `subscription`, `purchasedBooks` ni `active`.
3. **Compras y suscripciones las escribe solo el servidor**, tras verificar el recibo con Apple o
   Google (Cloud Functions). El cliente únicamente lee las suyas.
4. **Registro de actividad:** un administrador lo lee y añade entradas a su nombre; nadie las
   modifica ni las borra.
5. **Todo lo demás está cerrado** (`match /{document=**}` deniega).
6. **Storage:** lectura pública (de momento todo lo publicado es gratuito); escritura solo de
   administradores, solo imagen, audio, vídeo o PDF y menos de 1 GB.

> Pendiente (siguiente cambio): acceso por suscripción o venta. Hasta entonces, lo que se publica
> es gratuito y de lectura pública, y NO debe subirse a Firestore ni a Storage nada de pago.

## Probar las reglas

```bash
cd rules-tests
npm install
npm test        # arranca el emulador de Firestore y Storage y ejecuta las pruebas
```

Cada vez que se cambien las reglas hay que añadir o ajustar una prueba. Una prueba que nunca ha
fallado no demuestra nada: comprueba que falla con la regla antigua antes de darla por buena.

## Publicar las reglas

```bash
firebase deploy --only firestore:rules,storage
```

Hazlo después de que pasen las pruebas y antes de publicar una versión de la app.
