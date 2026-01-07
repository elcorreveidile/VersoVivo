# Technical Specification Document: VersoVivo
*Versión 1.0 | Fecha: 2025-07-09*

---

## 1. Resumen Ejecutivo
VersoVivo es una aplicación móvil multiplataforma (iOS/Android) que ofrece una experiencia inmersiva de videopoemas. Cada poema incluye tres formatos: **texto**, **video de recitación** y **versión musicada con IA**. El MVP (Producto Mínimo Viable) se lanzará con un libro de poemas del creador, usando música generada por IA.

---

## 2. Requisitos Funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| FR-01 | **Catálogo de Poemas** | Lista de poemas con filtros por autor, tema y duración. |
| FR-02 | **Modo Lectura** | Visualización de texto con tipografía personalizable y modo claro/oscuro. |
| FR-03 | **Modo Video** | Reproducción de video en pantalla completa con controles estándar. |
| FR-04 | **Modo Música** | Reproductor de audio con visualizaciones animadas. |
| FR-05 | **Perfil de Usuario** | Registro opcional, guardado de favoritos y progreso. |
| FR-06 | **Compartir Poemas** | Enlace directo a redes sociales para cada poema. |

---

## 3. Requisitos No Funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| NFR-01 | **Rendimiento** | Carga de videos en <3 segundos (Wi-Fi) y <5 segundos (4G). |
| NFR-02 | **Seguridad** | Autenticación con Firebase Auth y encriptación de datos sensibles. |
| NFR-03 | **Escalabilidad** | Backend soporta hasta 10,000 usuarios concurrentes en el primer año. |
| NFR-04 | **Accesibilidad** | Soporte para Dynamic Type y VoiceOver. |

---

## 4. Stack Tecnológico Recomendado

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | React Native | Código compartido entre iOS y Android. |
| **Backend** | Firebase | Autenticación, base de datos y almacenamiento en tiempo real. |
| **Base de Datos** | Firestore | NoSQL, escalable y sincronización offline. |
| **IA para Música** | Suno AI API | Generación de música a partir de prompts textuales. |
| **Almacenamiento** | Firebase Storage | Alojamiento de videos y audios con CDN. |
| **Analytics** | Firebase Analytics | Seguimiento de interacciones y retención. |

---

## 5. Estructura de Base de Datos (Firestore)

```javascript
// Colección: poems
{
  id: "string", // UUID
  title: "string",
  author: "string", // Inicialmente solo el creador
  theme: "string", // Ej: "amor", "naturaleza"
  duration: "number", // Segundos
  textContent: "string", // Poema en texto plano
  videoUrl: "string", // URL de Firebase Storage
  musicUrl: "string", // URL de Firebase Storage
  createdAt: "timestamp"
}

// Colección: users (opcional)
{
  uid: "string", // Firebase Auth UID
  email: "string",
  favorites: ["string"], // Array de poem IDs
  readPoems: ["string"], // Array de poem IDs
  createdAt: "timestamp"
}
```

---

## 6. Integración de APIs

### Suno AI (Música Generada)
- **Endpoint**: `POST /generate-music`
- **Request Body**:
  ```json
  {
    "prompt": "string", // Ej: "Piano melancólico con lluvia de fondo"
    "duration": "number" // Segundos
  }
  ```
- **Response**:
  ```json
  {
    "musicUrl": "string", // URL del audio generado
    "status": "string" // "success" | "error"
  }
  ```

### Firebase Authentication
- **Métodos**: Email/Password, Google Sign-In.
- **Flujo**:
  1. Usuario se registra/inicia sesión.
  2. Firebase Auth retorna un `uid`.
  3. App guarda `uid` en Firestore para perfil personalizado.

---

## 7. Flujos de Usuario (Wireframes Básicos)

### Pantalla Principal (Home)
- Lista de poemas con imagen de portada, título y autor.
- Barra de búsqueda y filtros (tema, duración).

### Detalle de Poema
- Pestañas: **Texto**, **Video**, **Música**.
- Botón de “Favorito” y “Compartir”.

### Perfil de Usuario
- Poemas favoritos y leídos.
- Opciones de cuenta (cerrar sesión, borrar datos).

---

## 8. Criterios de Aceptación y Pruebas

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|--------------------|
| TC-01 | **Registro con Email** | Usuario puede crear cuenta y ver su perfil. |
| TC-02 | **Reproducción de Video** | Video se reproduce sin cortes en iOS y Android. |
| TC-03 | **Cambio de Tema (Claro/Oscuro)** | Interfaz se actualiza inmediatamente. |
| TC-04 | **Agregar a Favoritos** | Poema aparece en la lista de favoritos del perfil. |

---

## 9. Entregables

1. **Código fuente** en GitHub/GitLab con README detallado.
2. **APK (Android) e IPA (iOS)** para pruebas en dispositivo.
3. **Documentación de despliegue** en Firebase Hosting.
4. **Manual de usuario** para uso de la app.

---

## 10. Roadmap de Desarrollo

| Fase | Duración | Entregable |
|------|----------|------------|
| **Diseño UI/UX** | 2 semanas | Wireframes y mockups en Figma. |
| **Desarrollo MVP** | 8 semanas | App con FR-01 a FR-06. |
| **Pruebas y QA** | 2 semanas | Corrección de bugs. |
| **Lanzamiento** | 1 semana | Publicación en App Store y Google Play. |

---

## 11. Presupuesto Estimado

| Concepto | Costo |
|----------|-------|
| **Desarrollo MVP** | $6,000 USD |
| **Diseño UI/UX** | $1,500 USD |
| **Mantenimiento Anual** | $1,200 USD |

---

## 12. Conclusión
Este TSD proporciona una guía clara para construir **VersoVivo** desde cero. Con un enfoque en **MVP**, **escalabilidad** y **experiencia de usuario**, la app estará lista para lanzamiento en máximo **12 semanas**.
