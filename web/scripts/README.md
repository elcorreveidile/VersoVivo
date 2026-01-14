# 🔐 Firebase Custom Claims - Sistema de Administración

## 📚 ¿Qué son los Custom Claims?

Los **Custom Claims** son atributos especiales en el token de autenticación de Firebase que permiten definir roles y permisos de forma escalable.

### Ventajas vs Email Hardcodeado:

| ❌ Email Hardcodeado | ✅ Custom Claims |
|---------------------|------------------|
| Solo 1 admin posible | Múltiples admins |
| Hay que actualizar reglas | No se tocan las reglas |
| No escala | Escala infinitamente |
| `informa@blablaele.com` | `request.auth.token.admin == true` |

---

## 🚀 CONFIGURACIÓN INICIAL

### Paso 1: Descargar Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **versovivo-ded94**
3. ⚙️ Configuración del proyecto → **Cuentas de servicio**
4. Haz clic en **"Generar nueva clave privada"**
5. Descarga el archivo JSON
6. Renombra el archivo a: `service-account-key.json`
7. Mueve el archivo a: `/Users/javierbenitez/Desktop/AI/VersoVivo/web/`

⚠️ **IMPORTANTE**: NUNCA commits este archivo a Git (ya está en `.gitignore`)

---

## 📋 USO DE LOS SCRIPTS

### 1. Asignar Admin a un Usuario

```bash
node scripts/set-admin-claims.js informa@blablaele.com
```

**Salida esperada:**
```
🔍 Buscando usuario: informa@blablaele.com
✅ Usuario encontrado:
   UID: abc123xyz...
   Email: informa@blablaele.com
   DisplayName: Javier Benítez

✅ Custom claim asignado correctamente
   admin: true

📋 NOTA IMPORTANTE:
   El usuario deberá cerrar y volver a iniciar sesión
   para que el nuevo token de autenticación incluya el claim.

🔍 Verificación del claim:
   Custom Claims: {
     "admin": true
   }

✅ ¡Proceso completado con éxito!
```

### 2. Verificar Claims de un Usuario

```bash
node scripts/check-admin-claims.js informa@blablaele.com
```

**Salida:**
```
🔍 Verificando usuario: informa@blablaele.com

📋 Información del usuario:
   UID: abc123xyz...
   Email: informa@blablaele.com
   DisplayName: Javier Benítez

🔐 Custom Claims:
   admin: true
   editor: false

✅ Verificación completada
```

### 3. Revocar Admin de un Usuario

```bash
node scripts/revoke-admin-claims.js informa@blablaele.com
```

**Salida:**
```
🔍 Revocando admin de: informa@blablaele.com

✅ Usuario encontrado: abc123xyz...
✅ Custom claims revocados correctamente

📋 NOTA: El usuario deberá cerrar y volver a iniciar sesión
```

---

## 🔄 ACTUALIZAR REGLAS DE FIRESTORE

Después de asignar el primer admin, actualiza las reglas en Firebase Console:

### Nueva función `isAdmin()`:

```javascript
function isAdmin() {
  // ✅ NUEVO: Usa Custom Claims (más escalable)
  return isSignedIn() && request.auth.token.admin == true;
}
```

### Pasos:

1. Ve a Firebase Console → Firestore Database → **Reglas**
2. Reemplaza la función `isAdmin()` con la de arriba
3. **Publica** las reglas

---

## 👥 GESTIONAR MÚLTIPLES ADMINS

### Añadir un segundo admin:

```bash
node scripts/set-admin-claims.js otro-admin@ejemplo.com
```

### Ver todos los admins:

```bash
# Ejecuta el check para cada usuario
node scripts/check-admin-claims.js admin1@verso vivo.com
node scripts/check-admin-claims.js admin2@verso vivo.com
```

### Revocar un admin:

```bash
node scripts/revoke-admin-claims.js admin1@verso vivo.com
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error: "No se encontró service-account-key.json"

**Causa:** El archivo de credenciales no está en su lugar.

**Solución:**
1. Verifica que descargaste el archivo JSON de Firebase Console
2. Verifica que está en: `/Users/javierbenitez/Desktop/AI/VersoVivo/web/`
3. Verifica que se llama exactamente: `service-account-key.json`

### Error: "User not found"

**Causa:** El email no corresponde a un usuario registrado.

**Solución:**
1. Verifica que el email sea correcto
2. Verifica que el usuario se haya registrado en la app
3. Usa el email exacto con el que se registró (incluyendo mayúsculas/minúsculas)

### El usuario no tiene permisos de admin después de asignar el claim

**Causa:** El usuario tiene un token viejo sin el claim.

**Solución:**
1. El usuario debe **cerrar sesión** en la app
2. **Volver a iniciar sesión**
3. Esto genera un nuevo token con el claim

---

## 📋 EJEMPLO DE FLUJO COMPLETO

### Escenario: Añadir un nuevo admin llamado "maria@ejemplo.com"

```bash
# Paso 1: Verificar que maria está registrada
node scripts/check-admin-claims.js maria@ejemplo.com
# Si dice "User not found", pídele a maria que se registre primero

# Paso 2: Asignar admin
node scripts/set-admin-claims.js maria@ejemplo.com
# Output: ✅ Custom claim asignado correctamente

# Paso 3: Verificar que se asignó
node scripts/check-admin-claims.js maria@ejemplo.com
# Output: admin: true

# Paso 4: Maria debe cerrar y volver a iniciar sesión

# Paso 5: Maria ya tiene acceso a /admin
```

---

## 🔒 SEGURIDAD

### ✅ Buenas Prácticas

- El archivo `service-account-key.json` está en `.gitignore`
- Solo los administradores deberían ejecutar estos scripts
- Guarda el archivo de credenciales en un lugar seguro
- Rota las credenciales periódicamente (cada 6 meses)

### ⚠️ Precauciones

- NUNCA commits `service-account-key.json` a Git
- NUNCA compartas el archivo por email o chat
- Si el archivo se compromete, revoca las credenciales inmediatamente en Firebase Console

---

## 📖 REFERENCIAS

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Descargado service-account-key.json
- [ ] Archivo colocado en `/Users/javierbenitez/Desktop/AI/VersoVivo/web/`
- [ ] Ejecutado: `node scripts/set-admin-claims.js informa@blablaele.com`
- [ ] Verificado: `node scripts/check-admin-claims.js informa@blablaele.com`
- [ ] Actualizada función `isAdmin()` en reglas de Firestore
- [ ] Publicadas reglas en Firebase Console
- [ ] Usuario cerró y volvió a iniciar sesión
- [ ] Usuario verificado que tiene acceso a /admin

---

**¿Listo para usar Custom Claims?** 🚀
