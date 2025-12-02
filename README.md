# Scriptorium 📚

**Gestor de biblioteca personal con diseño neobrutalism, búsqueda multi-API y seguimiento de progreso de lectura.**

Una aplicación Angular moderna y responsiva para gestionar tu colección de libros, rastrear tu progreso de lectura y descubrir nuevos títulos a través de Google Books y OpenLibrary.

## Características

### 📖 Gestión de Libros
- ✅ Crear, leer, actualizar y eliminar libros (CRUD completo)
- ✅ 5 estados: Por leer, Leyendo, Leído, Prestado, No voy a leer
- ✅ Seguimiento de progreso por páginas (no porcentaje)
- ✅ Portadas de libros desde APIs externas
- ✅ Almacenamiento local con localStorage
- ✅ **Nueva:** Lista de Deseados (Wishlist) separada de la biblioteca principal

### 🔍 Búsqueda Inteligente
- ✅ Búsqueda secuencial: Google Books (prioridad) -> OpenLibrary (fallback)
- ✅ Resultados inline integrados en el formulario
- ✅ Feedback inmediato y manejo de errores robusto
- ✅ Validación de campos requeridos (título + autor)
- ✅ Loading state con spinner CSS

### 📊 Seguimiento de Progreso
- ✅ Barra de progreso visual interactiva
- ✅ Incremento exacto por página (+/- botones)
- ✅ Display: "X / Y páginas" y porcentaje
- ✅ 100% automático cuando libro está "Leído"
- ✅ Botones deshabilitados para libros leídos

### 🎨 Interfaz Neobrutalism
- ✅ Paleta verde + amarillo con bordes sólidos
- ✅ Sombras desplazadas (3px 3px / 5px 5px)
- ✅ Tipografía Courier New monospace
- ✅ Mobile-first responsive design
- ✅ CSS Grid (3-4 cols desktop → 1 col mobile)

### 🔄 Filtros y Ordenamiento
- ✅ Filtro por estado del libro
- ✅ Búsqueda por texto (título, autor, ISBN)
- ✅ Ordenamiento: Más nuevo, Más antiguo, Título A-Z, Autor A-Z

## Stack Técnico

- **Framework**: Angular 20.3.0 (Standalone Components)
- **Control Flow**: @if / @for (sintaxis moderna Angular 20+)
- **State**: Signals + Computed Properties
- **HTTP**: HttpClient nativo
- **Storage**: localStorage
- **Styling**: SCSS puro
- **Layout**: CSS Grid responsivo + Flexbox

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd bookyman

# Instalar dependencias
npm install

# Configurar Variables de Entorno
1. Crear un archivo `.env` en la raíz del proyecto.
2. Agregar tu API Key de Google Books:
   `GOOGLE_BOOKS_API_KEY=tu_api_key_aqui`
   (El script `set-env.js` generará automáticamente los archivos de entorno al iniciar)

# Iniciar servidor de desarrollo
npm start
```

## Uso

### Agregar un Libro
1. Click en botón **"+"** en el header
2. Llenar título y autor
3. Click en **"🔍 Buscar en librería"**
4. Seleccionar resultado (auto-completa campos)
5. Click en **"Agregar libro"**

### Rastrear Progreso
1. Cambiar estado a "Leyendo"
2. Usar botones **+/-** para incrementar/decrementar páginas
3. Ver progreso en tiempo real (% y páginas)
4. Cambiar a "Leído" cuando termines (100% automático)

### Filtrar y Buscar
- **Filtro por estado**: Dropdown con 5 opciones
- **Búsqueda rápida**: Input que filtra por título/autor/ISBN
- **Ordenar**: Seleccionar orden (más nuevo/antiguo/título/autor)

## Estructura del Proyecto

```
src/app/
├── components/
│   ├── book-card/              # Card individual del libro (grid responsive)
│   ├── book-form/              # Formulario crear/editar
│   ├── book-list/              # Lista con filtros y ordenamiento
│   ├── modal-overlay/          # Modal genérico reutilizable
│   ├── progress-bar/           # Barra de progreso con controles
│   ├── search-button/          # Botón búsqueda con spinner
│   ├── search-filter/          # Filtros y búsqueda
│   ├── book-item/              # Card compacta para resultados
│   └── status-selector/        # Select de estados
├── services/
│   ├── book.service.ts         # CRUD de libros
│   ├── google-books.service.ts # Búsqueda Google Books
│   ├── open-library.service.ts # Búsqueda OpenLibrary
│   ├── combined-search.service.ts # Orquestación de búsqueda
│   └── local-storage.service.ts # Persistencia
├── models/
│   └── book.ts                 # Interface Book
└── environments/           # Generados dinámicamente
    ├── environment.ts
    └── environment.prod.ts
```

### Scripts
- `scripts/set-env.js`: Genera archivos de entorno desde `.env` antes del build/serve.

## Comandos Disponibles

```bash
# Desarrollo
npm start              # Inicia dev server (puerto 4200)
npm run build          # Build para producción
npm test              # Ejecutar unit tests
npm run lint          # Linting

# Utilidades
ng generate component nombre  # Crear componente
ng generate service nombre    # Crear servicio
```

## Configuración

### Google Books API
- Endpoint: `https://www.googleapis.com/books/v1/volumes`
- Key: Gestionada vía `.env` (seguridad mejorada)
- Límite: 40 requests/segundo

### OpenLibrary API
- Endpoint: `https://openlibrary.org/search.json`
- Pública (sin API key)
- Límite: Sin restricción conocida

## Características de UX

### Cards Uniformes
- Todas las cards tienen altura mínima de 450px
- Actions (botones) siempre al fondo
- Hover effects con transform y shadow mejorado

### Mobile-First
- 100% ancho en móvil
- Stack vertical de controles
- Botones tappable size (40x40px mínimo)

### Accessibilidad
- aria-labels en botones
- Labels en inputs
- Estados disabled con feedback visual
- Contraste de colores suficiente

## Mejoras Futuras

- [ ] Exportar/importar biblioteca (JSON/CSV)
- [ ] Estadísticas: libros leídos, páginas totales, velocidad de lectura
- [ ] Categorías/tags personalizados
- [ ] Sincronización cloud (Firebase)
- [ ] Integración Goodreads API
- [ ] Dark mode
- [ ] Recomendaciones basadas en libros leídos

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.

## Recursos

- [Angular CLI](https://github.com/angular/angular-cli)
- [Angular Documentation](https://angular.dev)
- [Google Books API](https://developers.google.com/books)
- [OpenLibrary API](https://openlibrary.org/developers/api)
