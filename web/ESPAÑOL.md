# Guía de Estilo - VersoVivo Web

## Capitalización en Español

⚠️ **IMPORTANTE:** El español NO usa el mismo formato de capitalización que el inglés.

### Regla General

**Español:** Solo la primera letra de la primera palabra va en mayúscula
```
✅ Correcto:  "Lectura inmersiva"
✅ Correcto:  "Poema musicado"
✅ Correcto:  "Versión recitada"
```

**Inglés (Title Case):** Cada palabra importante va en mayúscula
```
❌ Incorrecto: "Lectura Inmersiva"
❌ Incorrecto: "Poema Musicado"
❌ Incorrecto: "Versión Recitada"
```

### Ejemplos Comunes

| Incorrecto (Inglés) | Correcto (Español) |
|---------------------|-------------------|
| Libros Publicados | Libros publicados |
| Mis Favoritos | Mis favoritos |
| Mi Perfil | Mi perfil |
| Información Personal | Información personal |
| Tres Formatos de Experiencia | Tres formatos de experiencia |
| Explorar Todos los Libros | Explorar todos los libros |
| Editar Perfil | Editar perfil |
| Guardar Cambios | Guardar cambios |
| Crear Cuenta | Crear cuenta |
| Cerrar Sesión | Cerrar sesión |
| Panel de Administración | Panel de administración |
| Ver Detalles | Ver detalles |

### Excepciones

Solo se usan mayúsculas adicionales para:
- **Nombres propios:** "Federico García Lorca", "España"
- **Acrónimos:** "PDF", "AI" (Inteligencia Artificial)
- **Primera letra después de dos puntos:** "Formatos: texto, video, música"

### En Código

```tsx
// ❌ INCORRECTO
<h1>Libros Publicados</h1>
<Button>Guardar Cambios</Button>
<CardTitle>Información Personal</CardTitle>

// ✅ CORRECTO
<h1>Libros publicados</h1>
<Button>Guardar cambios</Button>
<CardTitle>Información personal</CardTitle>
```

### Verificación

Antes de hacer commit de nuevos textos, verifica:
1. ¿Solo la primera letra está en mayúscula?
2. ¿El resto del texto está en minúsculas?
3. ¿No estoy usando Title Case de inglés?

Si tienes dudas, consulta: https://www.fundeu.es/
