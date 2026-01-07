# VersoVivo - Guía de Configuración Técnica

Esta guía proporciona instrucciones detalladas para configurar el proyecto VersoVivo desde cero.

## 📋 Requisitos del Sistema

### Software Requerido

- **Node.js**: >= 18.0.0 (recomendado: 18.x LTS)
- **npm**: >= 8.0.0 o **yarn**: >= 1.22.0
- **React Native CLI**: Instalado globalmente
- **Git**: Para control de versiones

### Para Desarrollo iOS

- **macOS**: Catalina (10.15) o superior
- **Xcode**: 12.0 o superior
- **CocoaPods**: Instalado vía gem o brew
- **iOS Simulator**: Incluido con Xcode

### Para Desarrollo Android

- **Android Studio**: Arctic Fox (2020.3.1) o superior
- **Android SDK**: API Level 21 o superior
- **Java Development Kit (JDK)**: 11 o superior
- **Android Emulator**: Configurado desde Android Studio

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/elcorreveidile/VersoVivo.git
cd VersoVivo
```

### 2. Instalar Dependencias

```bash
# Usando npm
npm install

# O usando yarn
yarn install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Firebase Configuration
FIREBASE_API_KEY=tu-api-key-aqui
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Suno AI Configuration
SUNO_AI_API_KEY=tu-suno-api-key
SUNO_AI_API_URL=https://api.suno.ai/v1

# Google Sign-In
GOOGLE_WEB_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com

# App Configuration
APP_ENV=development
API_TIMEOUT=30000
```

### 4. Configurar Firebase

#### 4.1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "VersoVivo"
3. Habilita Google Analytics (opcional)

#### 4.2. Configurar Authentication

1. En Firebase Console, ve a **Authentication** → **Sign-in method**
2. Habilita **Email/Password**
3. Habilita **Google** (opcional)
4. Para Google Sign-In, añade tu SHA-1 fingerprint (Android)

#### 4.3. Configurar Firestore Database

1. Ve a **Firestore Database** → **Create database**
2. Inicia en modo de prueba (cambiarás las reglas después)
3. Selecciona una ubicación cercana a tus usuarios

**Reglas de Seguridad Iniciales:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Poems collection
    match /poems/{poemId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo admin puede escribir
    }
  }
}
```

#### 4.4. Configurar Storage

1. Ve a **Storage** → **Get started**
2. Acepta las reglas por defecto

**Reglas de Storage:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Solo admin
    }

    match /music/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Solo admin
    }

    match /thumbnails/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Solo admin
    }
  }
}
```

#### 4.5. Descargar Archivos de Configuración

**Para iOS:**
1. En Configuración del proyecto → iOS app
2. Descarga `GoogleService-Info.plist`
3. Colócalo en `ios/VersoVivo/GoogleService-Info.plist`

**Para Android:**
1. En Configuración del proyecto → Android app
2. Descarga `google-services.json`
3. Colócalo en `android/app/google-services.json`

### 5. Configurar Google Sign-In

#### Para iOS:

1. Abre `ios/VersoVivo/Info.plist`
2. Añade tu REVERSED_CLIENT_ID (lo encuentras en GoogleService-Info.plist):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.TU-CLIENT-ID</string>
    </array>
  </dict>
</array>
```

3. Instala pods:

```bash
cd ios
pod install
cd ..
```

#### Para Android:

1. El archivo `google-services.json` ya contiene la configuración necesaria
2. Asegúrate de que tu `android/build.gradle` incluya:

```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
  }
}
```

3. En `android/app/build.gradle`, al final:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 6. Configurar Suno AI (Opcional)

1. Regístrate en [Suno AI](https://suno.ai) (nota: URL ficticia para este ejemplo)
2. Obtén tu API key desde el dashboard
3. Añade la API key a tu archivo `.env`

**Nota:** En el MVP, puedes usar música pregenerada y añadir esta funcionalidad después.

### 7. Ejecutar la Aplicación

#### iOS:

```bash
# Opción 1: Desde terminal
npm run ios

# Opción 2: Desde Xcode
# Abre ios/VersoVivo.xcworkspace en Xcode
# Selecciona un simulador y presiona Run
```

#### Android:

```bash
# Asegúrate de tener un emulador corriendo o un dispositivo conectado

# Opción 1: Desde terminal
npm run android

# Opción 2: Desde Android Studio
# Abre la carpeta android/ en Android Studio
# Presiona Run
```

## 🧪 Verificar la Instalación

### Ejecutar Tests

```bash
npm run test
```

### Verificar Linting

```bash
npm run lint
```

### Verificar TypeScript

```bash
npm run type-check
```

## 🔧 Solución de Problemas Comunes

### Error: "Unable to resolve module"

**Solución:**
```bash
# Limpia cache de Metro
npm start -- --reset-cache

# Reinstala dependencias
rm -rf node_modules
npm install
```

### Error de CocoaPods (iOS)

**Solución:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Error de Gradle (Android)

**Solución:**
```bash
cd android
./gradlew clean
cd ..
```

### Error: "Firebase not initialized"

**Solución:**
1. Verifica que los archivos `GoogleService-Info.plist` y `google-services.json` estén en las ubicaciones correctas
2. Revisa que las variables de entorno en `.env` sean correctas
3. Reinicia el bundler de Metro

### Error de Google Sign-In en Android

**Solución:**
1. Obtén tu SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
2. Añade el SHA-1 en Firebase Console → Configuración del proyecto → Tu app Android

## 📦 Estructura del Proyecto

```
VersoVivo/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── screens/         # Pantallas de la aplicación
│   ├── navigation/      # Navegación
│   ├── services/        # Servicios (Firebase, Suno AI)
│   ├── store/           # Redux store
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilidades
│   ├── theme/           # Tema (colores, tipografía)
│   ├── hooks/           # Custom hooks
│   └── App.tsx          # Componente principal
├── android/             # Código nativo Android
├── ios/                 # Código nativo iOS
├── .env.example         # Ejemplo de variables de entorno
├── package.json         # Dependencias
├── tsconfig.json        # Configuración TypeScript
└── README.md            # Documentación principal
```

## 🚢 Preparar para Producción

### 1. Actualizar Variables de Entorno

```bash
# Crea un archivo .env.production
cp .env .env.production

# Actualiza APP_ENV
APP_ENV=production
```

### 2. Actualizar Reglas de Firebase

Cambia las reglas de Firestore y Storage a producción (más restrictivas).

### 3. Build para iOS

```bash
npm run build:ios

# O desde Xcode:
# Product → Archive → Distribute App
```

### 4. Build para Android

```bash
npm run build:android

# El APK se generará en:
# android/app/build/outputs/apk/release/app-release.apk
```

## 📚 Recursos Adicionales

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas-comunes)
2. Busca en [Issues existentes](https://github.com/elcorreveidile/VersoVivo/issues)
3. Crea un nuevo issue con detalles completos
4. Contacta: informa@blablaele.com

---

¡Disfruta desarrollando VersoVivo! 📱✨
