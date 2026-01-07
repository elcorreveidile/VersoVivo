# Guía de Contribución a VersoVivo

¡Gracias por tu interés en contribuir a VersoVivo! Esta guía te ayudará a entender cómo puedes participar en el proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Configuración del Entorno](#configuración-del-entorno)

## 🤝 Código de Conducta

Este proyecto se adhiere a un Código de Conducta. Al participar, se espera que mantengas este código. Por favor lee [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) para más detalles.

## 💡 ¿Cómo Puedo Contribuir?

### Reportar Bugs

Los bugs se rastrean como issues de GitHub. Antes de crear un issue:

1. **Verifica** que el bug no haya sido reportado anteriormente
2. **Incluye** pasos detallados para reproducir el problema
3. **Describe** el comportamiento esperado vs el comportamiento actual
4. **Añade** capturas de pantalla si es posible
5. **Menciona** tu versión del sistema operativo y del dispositivo

**Template de Bug Report:**

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '....'
3. Desplázate hasta '....'
4. Observa el error

**Comportamiento Esperado**
Qué esperabas que sucediera.

**Capturas de Pantalla**
Si es aplicable, añade capturas de pantalla.

**Entorno:**
 - Dispositivo: [e.g. iPhone 12, Samsung Galaxy S21]
 - OS: [e.g. iOS 15.0, Android 12]
 - Versión de la App: [e.g. 0.1.0]
```

### Sugerir Mejoras

Las sugerencias de mejoras también se rastrean como issues. Antes de crear una sugerencia:

1. **Verifica** que la funcionalidad no exista ya
2. **Explica** claramente el problema que resuelve
3. **Describe** la solución propuesta
4. **Considera** alternativas

### Pull Requests

1. **Fork** el repositorio
2. **Crea** una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Desarrolla** tu funcionalidad siguiendo las guías de estilo
4. **Escribe** o actualiza tests si es necesario
5. **Asegúrate** de que todos los tests pasen:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```
6. **Commitea** tus cambios con mensajes descriptivos:
   ```bash
   git commit -m "Add: nueva funcionalidad de filtrado por autor"
   ```
7. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
8. **Abre** un Pull Request con una descripción detallada

## 🔄 Proceso de Desarrollo

### Flujo de Git

- **main**: Rama principal, siempre estable
- **feature/***: Nuevas funcionalidades
- **fix/***: Corrección de bugs
- **docs/***: Cambios en documentación
- **refactor/***: Refactorizaciones de código

### Convenciones de Commits

Seguimos el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `Add`: Nueva funcionalidad
- `Fix`: Corrección de bug
- `Update`: Mejora de funcionalidad existente
- `Remove`: Eliminación de código o funcionalidad
- `Docs`: Cambios en documentación
- `Style`: Cambios de formato (no afectan el código)
- `Refactor`: Refactorización de código
- `Test`: Añadir o modificar tests
- `Chore`: Mantenimiento (actualización de dependencias, etc.)

**Ejemplos:**
```bash
Add: componente de reproductor de música
Fix: error al cargar videos en Android
Update: mejorar performance del listado de poemas
Docs: actualizar README con nuevas instrucciones
```

## 📝 Guías de Estilo

### TypeScript

- **Usar** TypeScript para todo el código nuevo
- **Definir** tipos explícitos para props y states
- **Evitar** el uso de `any`, usar `unknown` si es necesario
- **Usar** interfaces para objetos, types para unions y primitivos

```typescript
// ✅ Bueno
interface PoemCardProps {
  poem: Poem;
  onPress: () => void;
  isFavorite?: boolean;
}

// ❌ Evitar
const PoemCard = (props: any) => { ... }
```

### React Components

- **Usar** componentes funcionales con hooks
- **Nombrar** componentes con PascalCase
- **Nombrar** archivos igual que el componente
- **Extraer** lógica compleja a custom hooks

```typescript
// ✅ Bueno
const PoemCard: React.FC<PoemCardProps> = ({ poem, onPress }) => {
  return <View>...</View>;
};

export default PoemCard;
```

### Estilos

- **Usar** StyleSheet de React Native
- **Seguir** la paleta de colores del tema
- **Usar** constantes de spacing del tema
- **Nombrar** estilos descriptivamente

```typescript
// ✅ Bueno
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.dark,
    padding: spacing.lg,
  },
  title: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.xl,
  },
});
```

### Estructura de Archivos

```
src/
├── components/       # Componentes reutilizables
├── screens/         # Pantallas de la app
├── navigation/      # Configuración de navegación
├── services/        # Servicios y APIs
├── store/           # Redux store y slices
├── types/           # Definiciones de TypeScript
├── utils/           # Utilidades y helpers
├── theme/           # Tema (colores, tipografía, etc.)
└── hooks/           # Custom hooks
```

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js >= 18.0.0
- npm o yarn
- React Native CLI
- Xcode (para iOS) o Android Studio (para Android)

### Instalación

1. **Clona** el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/versovivo.git
   cd versovivo
   ```

2. **Instala** dependencias:
   ```bash
   npm install
   ```

3. **Configura** variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

4. **Ejecuta** la app:
   ```bash
   npm run android  # Para Android
   npm run ios      # Para iOS
   ```

### Tests

```bash
npm run test          # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Cobertura de tests
```

### Linting

```bash
npm run lint          # Verificar código
npm run lint:fix      # Corregir automáticamente
npm run type-check    # Verificar tipos de TypeScript
```

## 📚 Recursos Adicionales

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)

## ❓ ¿Preguntas?

Si tienes preguntas, puedes:

- Abrir un issue con la etiqueta "question"
- Contactar al equipo en informa@blablaele.com

---

¡Gracias por contribuir a VersoVivo! 🌟
