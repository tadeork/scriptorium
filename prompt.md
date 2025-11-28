# Bookyman - Gestor de Biblioteca Personal

## Visión General
Crear una aplicación Angular para gestionar una biblioteca personal con un diseño neobrutalism, capacidad de búsqueda en múltiples APIs, seguimiento de progreso de lectura y persistencia local.

## Requisitos Funcionales

### 1. Interfaz de Usuario
- **Diseño Neobrutalism**: 
  - Paleta de colores: Verde oscuro (#2d5016), verde medio (#558b2f), verde claro (#7cb342), amarillo (#fbc02d)
  - Fuente: Courier New (monospace)
  - Bordes: 2-4px sólidos
  - Sombras: Desplazadas (6px 6px 0)
  - Mobile-first: 100% ancho en móvil, max-width 500-600px en desktop

- **Componente Principal (App)**:
  - Header con título "Bookyman - Tu biblioteca personal"
  - Botón "+" para agregar libros en la esquina del header
  - Área principal con lista de libros
  - Modal overlay para formulario de agregar/editar

### 2. Gestión de Libros (CRUD)
- **Crear**: Formulario con campos: Título, Autor, ISBN, Páginas, Descripción, Estado, Progreso
- **Leer**: Visualizar libros en cards con toda la información
- **Actualizar**: Editar libro existente (modal con misma estructura del formulario)
- **Eliminar**: Botón eliminar con confirmación

### 3. Estados del Libro
- Por leer
- Leyendo
- Leído
- Prestado
- No voy a leer

### 4. Seguimiento de Progreso
- Solo visible para libros en estado "Leyendo" o "Leído"
- Mostrar: porcentaje, páginas leídas / total de páginas
- Controles: botones +/- para incrementar/decrementar
- Incremento: exacto por página (100 / total_páginas)
- Display: barra de progreso visual

### 5. Búsqueda en Librería
- Búsqueda MANUAL (sin autocompletar)
  - Validar que título y autor estén completos
  - Buscar al hacer clic en botón "🔍 Buscar en librería"
- Spinner loader durante búsqueda
- Mostrar mensaje de error si no hay resultados
- Modal de resultados si hay coincidencias

### 6. Integración APIs
- **Google Books API** (prioritaria para portadas)
  - Endpoint: `https://www.googleapis.com/books/v1/volumes?q=query&key=AIzaSyD_-CajPeP4r25TZW5V5RYxaEfIq2SnWuI`
  - Mapeo: volumeInfo.title, authors[0], imageLinks.thumbnail, pageCount

- **OpenLibrary API** (fallback/complemento)
  - Endpoint: `https://openlibrary.org/search.json?q=query&limit=10`
  - Mapeo: title, author_name[0], isbn[0], number_of_pages, first_sentence, cover_i

- **Estrategia de Merge**:
  - Ejecutar ambas búsquedas en paralelo (forkJoin)
  - Deduplicar por título + autor
  - Calcular score de completitud (0-100%) basado en campos presentes
  - Priorizar resultados con coverImageUrl en el modal
  - Ordenar por completitud descendente

### 7. Persistencia
- localStorage con clave "bookyman_library"
- Estructura de datos: Array de libros con id único, timestamp de creación/actualización

## Arquitectura Técnica

### Stack
- **Framework**: Angular 20.3.0 (Standalone Components)
- **HTTP**: HttpClient nativo
- **State Management**: Angular Signals
- **Storage**: localStorage
- **Styling**: SCSS puro (sin frameworks)

### Estructura de Componentes (Reutilizables)

#### Componentes de Presentación
1. **ModalOverlayComponent** (`modal-overlay/`)
   - Genérico para cualquier modal
   - Inputs: `isOpen`, `title`, `size` ('small' | 'medium' | 'large')
   - Output: `close` event
   - Content projection con `<ng-content>`

2. **SearchButtonComponent** (`search-button/`)
   - Botón reutilizable con spinner
   - Inputs: `isLoading`, `isDisabled`, `text`, `icon`
   - Output: `clicked` event
   - Spinner integrado

3. **BookItemComponent** (`book-item/`)
   - Card compacta o full de libro
   - Inputs: `book`, `variant` ('compact' | 'full')
   - Output: `selected` event
   - Usado en modal de resultados y listas

4. **StatusSelectorComponent** (`status-selector/`)
   - Select dropdown de estado del libro
   - Inputs: `status`, `id`, `label`
   - Output: `statusChange` event
   - Reutilizable en form y card

5. **ProgressBarComponent** (`progress-bar/`)
   - Barra de progreso visual
   - Inputs: `progress`, `pages`, `variant` ('display' | 'editable')
   - Outputs: `increment`, `decrement` events
   - Muestra: %, páginas leídas/total
   - Variante editable: botones +/-

#### Componentes Complejos
6. **BookFormComponent** (`book-form/`)
   - Formulario de crear/editar libro
   - Integra: SearchButton, ModalOverlay, BookItem, StatusSelector, ProgressBar
   - Búsqueda manual con validación
   - Modal de resultados con priorización por imágenes

7. **BookCardComponent** (`book-card/`)
   - Visualización de libro en lista
   - Integra: StatusSelector, ProgressBar
   - Botones: editar, eliminar
   - Estilos por estado del libro

8. **BookListComponent** (`book-list/`)
   - Lista de libros con filtros
   - Integra: SearchFilterComponent, BookCardComponent
   - Filtro por estado + búsqueda por texto

9. **SearchFilterComponent** (`search-filter/`)
   - Barra de búsqueda + selector de estado
   - Inputs: `searchQuery`, `selectedStatus`
   - Outputs: `searchQueryChange`, `statusFilterChange`

### Servicios

1. **BookService** (`book.service.ts`)
   - CRUD de libros
   - Búsqueda client-side (título, autor, ISBN)
   - Actualización de progreso

2. **GoogleBooksService** (`google-books.service.ts`)
   - Búsqueda en Google Books API
   - Mapeo y normalización de resultados

3. **OpenLibraryService** (`open-library.service.ts`)
   - Búsqueda en OpenLibrary API
   - Mapeo y normalización de resultados

4. **CombinedSearchService** (`combined-search.service.ts`)
   - Orquesta búsquedas en ambas APIs
   - Merge inteligente de resultados
   - Cálculo de completitud
   - Deduplicación por título+autor

5. **LocalStorageService** (`local-storage.service.ts`)
   - Persistencia de libros
   - Save/Load operaciones

### Modelo de Datos

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  pages?: number;
  description?: string;
  coverImageUrl?: string;
  status: 'read' | 'reading' | 'to-read' | 'not-interested' | 'borrowed';
  readProgress?: number; // 0-100
  createdAt: number;
  updatedAt: number;
}

interface CombinedSearchResult {
  title?: string;
  author?: string;
  isbn?: string;
  pages?: number;
  description?: string;
  coverImageUrl?: string;
  source?: 'google' | 'openlibrary' | 'combined';
  completeness?: number; // Score 0-100
}
```

## Características de UX

### Mobile-First
- Formulario ocupa 100% ancho en móvil
- Modal sin border-radius en móvil
- Stack vertical de controles
- Botones grandes (tappable size)

### Desktop
- Breakpoint: 768px
- Formulario: max-width 600px, centered
- Grid layout para campos
- Estilos decorativos mejorados

### Interacciones
- Hover effects en botones y cards
- Transiciones suaves (0.3s)
- Confirmación antes de eliminar
- Estados disabled con visual feedback
- Spinner durante carga

### Validación
- Título y Autor requeridos
- Botón buscar deshabilitado si campos vacíos
- Mensaje de error en búsqueda fallida
- Priorización visual de resultados con imágenes

## Estilos Globales

### Paleta Neobrutalism
```scss
$primary-dark: #2d5016;
$primary-medium: #558b2f;
$primary-light: #7cb342;
$accent-yellow: #fbc02d;
$background: #f5f5f5;
$text-dark: #1b5e20;
$error: #d32f2f;
```

### Tipografía
- Font: Courier New, monospace (neobrutalism)
- Heading: 900 weight, uppercase
- Body: 400 weight
- Labels: 700 weight, uppercase, 0.05em letter-spacing

### Espaciado
- Mobile: 1rem
- Desktop: 2rem
- Gap entre elementos: 0.75rem - 1.5rem

### Animaciones
- Fade-in para modales
- Slide-in para modales
- Spin 360deg para spinner (0.8s)
- Transform translate para hover effects

## Flujo de Usuario

### Agregar Libro
1. Click botón "+" → abre modal formulario
2. Llenar título y autor
3. Click "Buscar en librería" → spinner + búsqueda
4. Modal con resultados (priorizados por imágenes)
5. Click en resultado → auto-completa form
6. Ajustar campos si es necesario
7. Click "Agregar libro" → guardado y cierre modal

### Editar Libro
1. Click botón ✎ en card → abre modal formulario con datos
2. Modificar campos
3. Click "Guardar cambios" → actualización

### Ver Progreso
1. Book.status = "leyendo" o "leído" → mostrar barra progreso
2. Click + incrementa página (round(100/pages))
3. Click - decrementa página
4. Mostrar: XX% y X / Y páginas

## Recomendaciones de Implementación

### Best Practices
1. **Componentes**: Pequeños, enfocados, reutilizables
2. **Servicios**: Lógica de negocio separada
3. **Signals**: Para estado reactivo en componentes
4. **Standalone**: Evitar NgModules
5. **Types**: Interfaces estrictas para datos
6. **Error Handling**: Try-catch en servicios HTTP
7. **Accessibility**: aria-labels en botones, labels en inputs

### Testing
- Unit tests para servicios (searchBothLibraries, calculateCompleteness)
- Component tests para BookFormComponent (validación, búsqueda)
- E2E tests para flujo completo (agregar → editar → eliminar)

### Performance
- Debounce en búsqueda (300ms)
- Lazy loading de imágenes
- OnPush change detection donde sea posible
- Unsubscribe de observables en ngOnDestroy

### SEO (si aplica)
- Meta tags en index.html
- Structured data para libros

## Instalación y Setup

```bash
# Crear proyecto
ng new bookyman --skip-git --style=scss --standalone

# Instalar dependencias
npm install

# Servir
ng serve --port 4201

# Build
ng build
```

## Variables de Entorno
- Google Books API Key: `AIzaSyD_-CajPeP4r25TZW5V5RYxaEfIq2SnWuI`
- OpenLibrary: API pública sin key

## Posibles Mejoras Futuras
1. Exportar/importar biblioteca (JSON/CSV)
2. Sort por: fecha, alfabético, estado
3. Estadísticas: libros leídos, páginas totales, promedio
4. Categorías/tags personalizados
5. Sincronización cloud
6. Modo offline mejorado
7. Dark mode
8. Integración Goodreads API
9. Recomendaciones basadas en libros leídos
10. Social: compartir reseñas

## Notas Técnicas
- Angular 20.3.0 usa sintaxis nueva de control flow (@if, @for)
- Signals mejoran performance vs ChangeDetection manual
- localStorage limita a ~5-10MB (suficiente para miles de libros)
- CORS: Google Books y OpenLibrary permiten requests desde navegador
- Spinner CSS puro: border + transform, no SVG ni img

## Conclusión
Esta aplicación es un ejemplo completo de:
- Arquitectura modular Angular
- Componentes reutilizables standalone
- Integración multi-API
- Diseño mobile-first
- Persistencia local
- UX thoughtful con validación
- Estética neobrutalism consistente
