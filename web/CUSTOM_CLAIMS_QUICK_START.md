# 🚀 GUÍA RÁPIDA - TAREA 2: Custom Claims

## ✅ QUÉ HEMOS CREADO:

1. ✅ **Scripts de administración** en `/scripts/`:
   - `set-admin-claims.js` - Asigna admin a un usuario
   - `check-admin-claims.js` - Verifica los claims de un usuario
   - `revoke-admin-claims.js` - Revoca admin de un usuario

2. ✅ **README completo** en `/scripts/README.md`

3. ✅ **firebase-admin** instalado

4. ✅ **.gitignore** actualizado (protege service-account-key.json)

5. ✅ **FIRESTORE_RULES.md** actualizado con función `isAdmin()` mejorada

---

## 📋 PASOS PARA COMPLETAR LA TAREA 2:

### PASO 1: Descargar Service Account Key

1. Ve a: https://console.firebase.google.com/
2. Proyecto: **versovivo-ded94**
3. ⚙️ Configuración → **Cuentas de servicio**
4. **"Generar nueva clave privada"** → Descarga JSON
5. Renombra a: `service-account-key.json`
6. Mueve a: `/Users/javierbenitez/Desktop/AI/VersoVivo/web/`

### PASO 2: Asignar Admin a tu Usuario

```bash
cd /Users/javierbenitez/Desktop/AI/VersoVivo/web
node scripts/set-admin-claims.js informa@blablaele.com
```

### PASO 3: Verificar que Funcionó

```bash
node scripts/check-admin-claims.js informa@blablaele.com
```

Debería ver:
```
🔐 Custom Claims:
   admin: true ✅
```

### PASO 4: Actualizar Reglas de Firestore

1. Ve a Firebase Console → Firestore → **Reglas**
2. Reemplaza la función `isAdmin()` con esta:

```javascript
function isAdmin() {
  // ✅ NUEVO: Usa Custom Claims (más escalable)
  return isSignedIn() && request.auth.token.admin == true;
}
```

3. **Publica** las reglas

### PASO 5: Probar

1. **Cierra sesión** en la app (localhost:3000)
2. **Vuelve a iniciar sesión**
3. Ve a `/admin`
4. ✅ Debería funcionar sin problemas

---

## 🎯 BENEFICIOS:

Ahora puedes:

- ✅ **Añadir múltiples admins**: `node scripts/set-admin-claims.js otro@email.com`
- ✅ **Verificar admins**: `node scripts/check-admin-claims.js email@ejemplo.com`
- ✅ **Revocar admins**: `node scripts/revoke-admin-claims.js email@ejemplo.com`
- ✅ **No tocas más las reglas** de Firestore para añadir admins

---

## ⚠️ IMPORTANTE:

- El archivo `service-account-key.json` es confidencial
- **NUNCA** lo commites a Git (ya está protegido en .gitignore)
- Si se compromete, revócalo en Firebase Console

---

**¿Todo listo? Sigue los 5 pasos y dime si tienes alguna pregunta.** 🚀
