# VersoVivo - Descripción del Proyecto

## 📋 Información General

**Nombre:** VersoVivo  
**Tipo:** Aplicación móvil multiplataforma (iOS/Android)  
**Repositorio:** https://github.com/elcorreveidile/VersoVivo  
**Website:** https://poedronomo.com  
**Licencia:** MIT  

---

## 🎯 Descripción Corta

Aplicación móvil multiplataforma de videopoemas con experiencia inmersiva: texto, video de recitación y música generada por IA.

---

## 📖 Descripción Completa

VersoVivo es una aplicación móvil multiplataforma (iOS/Android) que revoluciona la forma de consumir poesía en la era digital. Ofrece una experiencia inmersiva de videopoemas donde cada poema se presenta en tres formatos complementarios:

1. **📖 Lectura Inmersiva**: Texto con tipografía elegante y animaciones sutiles
2. **🎬 Recitación en Video**: Interpretación visual del poema por su autor
3. **🎵 Versión Musicada**: Adaptación musical generada con inteligencia artificial

---

## ✨ Propuesta de Valor

### ¿Por qué VersoVivo?

- 🌟 **Experiencia Multisensorial**: Combina lo mejor de la poesía tradicional con tecnología moderna
- 🤖 **Innovación con IA**: Música generada artificialmente que se adapta al tono de cada poema
- 📱 **Multiplataforma**: Disponible para iOS y Android
- 💫 **Diseño Minimalista**: Interfaz limpia que prioriza el contenido
- 🔄 **Contenido en Crecimiento**: Plan para expandir con más poetas y creadores

---

## 🎭 Características Principales

### Catálogo de Poemas
- Explora poemas organizados por autor, tema y duración
- Búsqueda inteligente con filtros avanzados
- Vista previa rápida de cada poema

### Tres Formatos de Experiencia

#### 1. Modo Lectura
- Tipografía personalizable
- Modo claro/oscuro
- Animaciones sutiles al desplazar

#### 2. Modo Video
- Reproducción en pantalla completa
- Controles intuitivos
- Subtítulos opcionales

#### 3. Modo Música
- Reproductor de audio con visualizaciones
- Música generada por IA
- Controles de reproducción avanzados

### Perfil de Usuario
- Registro opcional con email o redes sociales
- Guarda tus poemas favoritos
- Sigue tu progreso de lectura
- Comparte poemas en redes sociales

---

## 🛠️ Stack Tecnológico

### Core Framework
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Expo SDK** | 49.0.23 | Plataforma y tooling |
| **React Native** | 0.72.10 | Framework multiplataforma |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.3.x | Tipado estático para JavaScript |

### Backend y Servicios
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Firebase** | 10.7.x | Backend como servicio (BaaS) |
| **Firestore** | - | Base de datos NoSQL |
| **Suno AI API** | - | Generación de música con IA |

### Estado y Navegación
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Redux Toolkit** | 1.9.x | Gestión de estado |
| **React Navigation** | 6.1.x | Navegación entre pantallas |

### Módulos Expo
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Expo AV** | 13.4.x | Reproductor audio/video |
| **Expo Constants** | 14.4.2 | Constantes del sistema |
| **Expo Font** | 11.4.0 | Carga de fuentes |
| **Expo Splash Screen** | 0.20.5 | Pantalla de inicio |
| **Expo Status Bar** | 1.6.0 | Control de status bar |

### Otras Dependencias
- **@expo/vector-icons**: 13.0.0 - Iconos vectoriales
- **react-native-gesture-handler**: 2.12.0 - Gestos táctiles
- **react-native-safe-area-context**: 4.6.3 - Áreas seguras
- **react-native-screens**: 3.22.0 - Navegación nativa
- **@react-native-async-storage/async-storage**: 1.18.2 - Almacenamiento local

---

## 🏗️ Arquitectura del Proyecto

```
versovivo/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── PoemCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── MusicPlayer.tsx
│   ├── screens/             # Pantallas principales
│   │   ├── HomeScreen.tsx
│   │   ├── PoemDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/          # Configuración de navegación
│   ├── services/            # Servicios y APIs
│   │   ├── firebaseService.ts
│   │   └── sunoAIService.ts
│   ├── store/               # Gestión de estado (Redux)
│   ├── types/               # Definiciones de TypeScript
│   └── utils/               # Utilidades y helpers
├── assets/                  # Recursos estáticos
├── android/                 # Configuración Android
├── ios/                     # Configuración iOS
└── docs/                    # Documentación adicional
```

---

## 📦 Requisitos del Sistema

### Prerrequisitos
- Node.js ^18.0.0
- npm >= 8.0.0 o yarn
- Cuenta de Firebase
- Acceso a Suno AI API

### Plataformas Soportadas
- **iOS**: 15.1+
- **Android**: API Level 21+ (Android 5.0+)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/elcorreveidile/VersoVivo.git
cd VersoVivo
```

### 2. Instalar dependencias
```bash
npm ci
```

### 3. Configurar Firebase
- Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
- Habilita Authentication, Firestore y Storage
- Descarga `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
- Coloca los archivos en las carpetas correspondientes

### 4. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
FIREBASE_API_KEY=tu-api-key
FIREBASE_AUTH_DOMAIN=tu-auth-domain
FIREBASE_PROJECT_ID=tu-project-id
SUNO_AI_API_KEY=tu-suno-api-key
```

### 5. Instalar pods de iOS
```bash
cd ios && pod install && cd ..
```

### 6. Limpiar build de Android
```bash
cd android && ./gradlew clean && cd ..
```

### 7. Ejecutar la aplicación
```bash
# Para desarrollo
npx expo start -c

# Android
npm run android

# iOS
npm run ios
```

---

## 📝 Scripts Disponibles

```bash
npm run android        # Inicia app en Android
npm run ios           # Inicia app en iOS
npm run web           # Inicia app en web
npm run test          # Ejecuta tests
npm run lint          # Verifica código
npm run lint:fix      # Corrige problemas de linting
npm run type-check    # Verifica tipos TypeScript
```

---

## 👥 Equipo

**Autor:** Javier Benítez Láinez  
**Email:** informa@blablaele.com  
**Twitter:** [@jabelainez](https://twitter.com/jabelainez)  

---

## 📈 Roadmap

- [x] MVP con libro de poemas del creador
- [ ] Integración con más poetas
- [ ] Sistema de suscripciones premium
- [ ] Comunidad de creadores
- [ ] Eventos en vivo y recitales virtuales
- [ ] Versión web (PWA)

---

## 🏷️ Etiquetas / Keywords

React Native, Expo, TypeScript, Firebase, Firestore, Redux Toolkit, React Navigation, AI Music Generation, Suno AI, iOS, Android, Poetry, Video, Audio Player, Mobile App, Cross-platform, Videopoemas, Poesía Digital, Inteligencia Artificial, Experiencia Inmersiva

---

## 📄 Documentación Adicional

- [Technical Specification Document](docs/technical-specification.md)
- [Guía de configuración y builds estables](SETUP.md)
- [Guía rápida de ejecución](EJECUTAR_APP.md)

---

## 🙏 Agradecimientos

- A todos los poetas que han inspirado este proyecto
- Al equipo de React Native por su increíble framework
- A Firebase por proporcionar un backend robusto
- A Suno AI por su innovadora tecnología de generación musical

---

*"La poesía es el lenguaje del alma, y VersoVivo es su voz en la era digital"* 🌟

---

**Última actualización:** Enero 2026  
**Versión del documento:** 1.0
