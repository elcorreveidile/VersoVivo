📚✨ VersoVivo es una aplicación móvil multiplataforma (iOS/Android) que ofrece una experiencia inmersiva de videopoemas. Cada poema incluye tres formatos: texto, video de recitación y versión musicada con IA.

> Una experiencia inmersiva de videopoemas que combina texto, recitación y música generada por IA.

![VersoVivo Logo](https://img.shields.io/badge/VersoVivo-Poetry%20App-blue)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Sobre el Proyecto

VersoVivo revoluciona la forma de consumir poesía en la era digital. Cada poema se presenta en tres formatos complementarios:

- **📖 Lectura Inmersiva**: Texto con tipografía elegante y animaciones sutiles
- **🎬 Recitación en Video**: Interpretación visual del poema por su autor
- **🎵 Versión Musicada**: Adaptación musical generada con inteligencia artificial

### ¿Por qué VersoVivo?

- 🌟 **Experiencia Multisensorial**: Combina lo mejor de la poesía tradicional con tecnología moderna
- 🤖 **Innovación con IA**: Música generada artificialmente que se adapta al tono de cada poema
- 📱 **Multiplataforma**: Disponible para iOS y Android
- 💫 **Diseño Minimalista**: Interfaz limpia que prioriza el contenido
- 🔄 **Contenido en Crecimiento**: Plan para expandir con más poetas y creadores

---

## ✨ Características Principales

### 📚 Catálogo de Poemas
- Explora poemas organizados por autor, tema y duración
- Búsqueda inteligente con filtros avanzados
- Vista previa rápida de cada poema

### 🎭 Tres Formatos de Experiencia
1. **Modo Lectura**
   - Tipografía personalizable
   - Modo claro/oscuro
   - Animaciones sutiles al desplazar

2. **Modo Video**
   - Reproducción en pantalla completa
   - Controles intuitivos
   - Subtítulos opcionales

3. **Modo Música**
   - Reproductor de audio con visualizaciones
   - Música generada por IA
   - Controles de reproducción avanzados

### 👤 Perfil de Usuario
- Registro opcional con email o redes sociales
- Guarda tus poemas favoritos
- Sigue tu progreso de lectura
- Comparte poemas en redes sociales

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Expo SDK** | 49.0.23 | Plataforma y tooling |
| **React Native** | 0.72.10 | Framework multiplataforma |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.3.x | Tipado estático para JavaScript |
| **Firebase** | 10.7.x | Backend como servicio (BaaS) |
| **Firestore** | - | Base de datos NoSQL |
| **Redux Toolkit** | 1.9.x | Gestión de estado |
| **React Navigation** | 6.1.x | Navegación entre pantallas |
| **Expo AV** | 13.4.x | Reproductor audio/video |

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js ^18.0.0
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/versovivo.git
   cd versovivo
   ```

2. **Instala dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication, Firestore y Storage
   - Descarga `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
   - Coloca los archivos en las carpetas correspondientes

4. **Configura variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus credenciales:
   ```
   FIREBASE_API_KEY=tu-api-key
   FIREBASE_AUTH_DOMAIN=tu-auth-domain
   FIREBASE_PROJECT_ID=tu-project-id
   ```

5. **Ejecuta la aplicación**
   ```bash
   # Para desarrollo
   npm run android
   npm run ios
   
   # Para producción
   npm run build:android
   npm run build:ios
   ```

---

## 📁 Estructura del Proyecto

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
│   ├── store/               # Gestión de estado (Redux)
│   ├── types/               # Definiciones de TypeScript
│   └── utils/               # Utilidades y helpers
├── assets/                  # Recursos estáticos
├── android/                 # Configuración Android
├── ios/                     # Configuración iOS
└── docs/                    # Documentación adicional
```

---
## 📚 Documentación

- [Technical Specification Document](docs/technical-specification.md)
- [Guía de configuración y builds estables](SETUP.md)
- [Guía rápida de ejecución](EJECUTAR_APP.md)

---

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run android        # Inicia app en Android
npm run ios           # Inicia app en iOS
npm run test          # Ejecuta tests
npm run lint          # Verifica código
npm run build:android # Compila para Android
npm run build:ios     # Compila para iOS
```

### Convenciones de Código
- Usar TypeScript para todo el código nuevo
- Seguir el estilo de código configurado en ESLint
- Escribir tests para componentes y servicios críticos
- Documentar funciones y componentes complejos

---

## ✅ Estabilidad de builds (punto 1)

Para evitar builds rotos o pantallas en blanco:

1. **Mantener `package.json` y `package-lock.json` siempre sincronizados.**
   - Si cambias dependencias: `npm install` y commitea ambos archivos.
   - En CI/EAS se usa `npm ci`; si hay desfase el build falla.
2. **No mezclar configuración nativa en `app.json` si existen `ios/` y `android/`.**
   - En este repo mantenemos config nativa en `ios/` y `android/`.
3. **Variables de entorno en EAS siempre completas.**
   - Firebase se inicializa al arrancar; si faltan env vars la app no abre.

---

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Haz un Fork del proyecto**
2. **Crea tu rama de feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Commitea tus cambios**
   ```bash
   git commit -m 'Add: nueva funcionalidad'
   ```
4. **Push a la rama**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Abre un Pull Request**
6. **Visita  [FEATURE_REQUEST.md](FEATURE_REQUEST.md)**

### Código de Conducta
Por favor lee nuestro [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) para entender nuestras normas de comportamiento.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - lee el archivo [LICENSE.md](LICENSE.md) para más detalles.

---

## 📞 Contacto

- **Autor**: Javier Benítez Láinez
- **Email**: [informa@blablaele.com]
- **Website**: [https://poedronomo.com](https://poedronomo.com)
- **Twitter**: [@jabelainez](https://twitter.com/jabelainez)

---

## 🙏 Agradecimientos

- A todos los poetas que han inspirado este proyecto
- Al equipo de React Native por su increíble framework
- A Firebase por proporcionar un backend robusto
- A Suno AI por su innovadora tecnología de generación musical

---

## 📈 Roadmap

- [x] MVP con libro de poemas del creador
- [ ] Integración con más poetas
- [ ] Sistema de suscripciones premium
- [ ] Comunidad de creadores
- [ ] Eventos en vivo y recitales virtuales
- [ ] Versión web (PWA)

---

**"La poesía es el lenguaje del alma, y VersoVivo es su voz en la era digital"** 🌟
```
