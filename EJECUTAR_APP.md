# 🚀 Cómo Ejecutar VersoVivo con Expo

## ✅ Estado Actual

- ✅ Dependencias instaladas
- ✅ Firebase configurado
- ✅ Código adaptado a Expo
- ✅ Listo para ejecutar

---

## 📱 Opción 1: Probar en tu Teléfono (RECOMENDADO)

### 1. Instala Expo Go en tu móvil

**Android:** [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
**iOS:** [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

### 2. Inicia el servidor de desarrollo

```bash
npm start
```

### 3. Escanea el código QR

- **Android**: Abre Expo Go y escanea el QR desde la app
- **iOS**: Abre la cámara y escanea el QR

¡Tu app se cargará en tu teléfono en unos segundos!

---

## 💻 Opción 2: Ejecutar en Emulador/Simulador

### Para Android:

```bash
# Asegúrate de tener un emulador Android corriendo
npm run android
```

### Para iOS (solo macOS):

```bash
npm run ios
```

---

## 🐛 Solución de Problemas

### Error: "Unable to resolve module"

```bash
# Limpia cache y reinicia
rm -rf node_modules
npm install
npm start -- --clear
```

### Error: "npm ci can only install packages..."

Significa que `package.json` y `package-lock.json` no están sincronizados.

```bash
npm install
```

Luego vuelve a intentar el build.

### Error: "Firebase not initialized"

Verifica que tu archivo `.env` tenga las credenciales correctas:

```bash
cat .env | grep FIREBASE
```

### La app no carga

1. Asegúrate de que tu computadora y teléfono estén en la **misma red WiFi**
2. Reinicia el servidor: `npm start -- --clear`
3. Cierra y vuelve a abrir Expo Go

---

## 🎯 Próximos Pasos

### 1. Crea tu primer usuario

Cuando la app cargue:
1. Haz clic en **"Regístrate"**
2. Ingresa:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: mínimo 6 caracteres
3. ¡Listo! Ya puedes usar la app

### 2. Agrega poemas de prueba a Firebase

Ve a Firebase Console → Firestore Database y agrega un documento de prueba:

**Colección**: `poems`
**Documento ID**: Auto-generado
**Campos**:
```json
{
  "title": "Mi Primer Poema",
  "author": "Tu Nombre",
  "theme": "amor",
  "duration": 120,
  "textContent": "Este es un poema de prueba...",
  "videoUrl": "",
  "musicUrl": "",
  "createdAt": (timestamp actual)
}
```

---

## 📝 Notas Importantes

### Características Disponibles:
- ✅ Registro e inicio de sesión con email/password
- ✅ Visualización de catálogo de poemas
- ✅ Lectura de poemas en modo texto
- ✅ Sistema de favoritos
- ✅ Perfil de usuario
- ✅ Búsqueda y filtros

### Características No Disponibles en Expo Go:
- ❌ Google Sign-In (requiere build personalizado)
- ❌ Reproducción de video nativo (se puede usar URL externa)
- ❌ Reproductor de música avanzado (requiere build personalizado)

**Solución**: Estas características funcionarán cuando hagas un build nativo más adelante.

### Builds estables (punto 1)

- No cambies dependencias sin regenerar el lockfile.
- EAS usa `npm ci`; un lockfile desalineado rompe el build.

---

## 🔄 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Limpiar cache y reiniciar
npm start -- --clear

# Ver logs en tiempo real
npm start -- --devClient

# Detener el servidor
Ctrl + C
```

---

## 🆘 ¿Problemas?

Si algo no funciona:

1. Verifica que `.env` esté configurado correctamente
2. Revisa que Firebase esté activo en [Firebase Console](https://console.firebase.google.com/)
3. Asegúrate de que tienes conexión a internet
4. Prueba reiniciar con `npm start -- --clear`

---

## 🎉 ¡Listo!

Ejecuta `npm start` y prueba tu app en el teléfono con Expo Go.

**La poesía cobra vida en VersoVivo** 📱✨
