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

### 4. Lista de Deseados (Wishlist)
- **Separación de Vistas**:
  - Vista "Biblioteca": Libros propios.
  - Vista "Lista de Deseados": Libros que se quieren adquirir.
- **Navegación**: Botones en el header para alternar entre vistas.
- **Características de Wishlist**:
  - Cards más compactas.
  - Sin selector de estado.
  - Muestra fecha de agregado ("Agregado el...").
  - No se muestra el filtro de búsqueda avanzado.

### 4. Seguimiento de Progreso
- Solo visible para libros en estado "Leyendo" o "Leído"
- Mostrar: porcentaje, páginas leídas / total de páginas
- Controles: botones +/- para incrementar/decrementar
- Incremento: exacto por página (100 / total_páginas)
- Display: barra de progreso visual
- **Cuando libro está "Leído"**:
  - Mostrar 100% automáticamente
  - Botones +/- deshabilitados (gris, cursor: not-allowed)
  - Display: "X / X páginas" (total/total)
  - Feedback visual: opacity reducida, botones inactivos

### 5. Búsqueda en Librería
- Búsqueda MANUAL (sin autocompletar)
  - Validar que título y autor estén completos
  - Buscar al hacer clic en botón "🔍 Buscar en librería"
- Spinner loader durante búsqueda
- Mostrar mensaje de error si no hay resultados
- Modal de resultados si hay coincidencias

### 6. Integración APIs
- **Google Books API** (prioritaria para portadas)
  - Endpoint: `https://www.googleapis.com/books/v1/volumes?q=query&key=${GOOGLE_BOOKS_API_KEY}`
  - Mapeo: volumeInfo.title, authors[0], imageLinks.thumbnail, pageCount

- **OpenLibrary API** (fallback/complemento)
  - Endpoint: `https://openlibrary.org/search.json?q=query&limit=10`
  - Mapeo: title, author_name[0], isbn[0], number_of_pages, first_sentence, cover_i

- **Estrategia de Búsqueda**:
  - **Secuencial**: Primero busca en Google Books.
  - **Fallback**: Si Google no devuelve resultados, busca en OpenLibrary.
  - **Resultados Inline**:
    - Los resultados se muestran directamente en el formulario (debajo del botón de búsqueda).
    - Lista con scroll vertical.
    - Botón para cerrar/limpiar resultados.
  - **UX**:
    - Feedback inmediato ("Buscando...").
    - Manejo de Race Conditions con `switchMap`.
    - Detección de cambios forzada para evitar lag en la UI.

### 7. Persistencia
- localStorage con clave "bookyman_library"
- Estructura de datos: Array de libros con id único, timestamp de creación/actualización

## Arquitectura Técnica

### Stack
- **Framework**: Angular 20.3.0 (Standalone Components, @if/@for control flow)
- **HTTP**: HttpClient nativo
- **State Management**: Angular Signals con computed properties
- **Storage**: localStorage
- **Styling**: SCSS puro (sin frameworks)
- **Layout**: CSS Grid responsivo + Flexbox

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
   - Inputs: `progress`, `pages`, `pagesRead`, `disabled`, `variant` ('display' | 'editable')
   - Outputs: `increment`, `decrement` events
   - Muestra: %, páginas leídas/total
   - Variante editable: botones +/- (deshabilitados cuando disabled=true)
   - Cuando disabled: muestra 100%, "X / X páginas", botones inactivos (gris, opacity 0.6)

#### Componentes Complejos
6. **BookFormComponent** (`book-form/`)
   - Formulario de crear/editar libro
   - Integra: SearchButton, ModalOverlay, BookItem, StatusSelector, ProgressBar
   - Búsqueda manual con validación
   - Modal de resultados con priorización por imágenes

7. **BookCardComponent** (`book-card/`)
   - Visualización de libro en lista (grid responsivo)
   - Layout: flex-direction: column, height: 100%, min-height: 450px
   - Actions al fondo: margin-top: auto
   - Integra: StatusSelector, ProgressBar
   - ProgressBar con [disabled]="isBookRead()" cuando status === 'read'
   - Botones: editar (✎), eliminar (🗑)
   - Estilos por estado: colores y gradients únicos por status

8. **BookListComponent** (`book-list/`)
   - Lista de libros con grid responsivo
   - Signals: books, selectedStatus, searchQuery, sortBy (newest/oldest/title/author)
   - Computed: filteredBooks (aplica filtros de estado, búsqueda y ordenamiento)
   - Integra: SearchFilterComponent, BookCardComponent
   - CSS Grid: 3-4 columns desktop, 2 tablet, 1 mobile
   - Gap: 1rem

9. **SearchFilterComponent** (`search-filter/`)
   - Barra de búsqueda + selector de estado
   - Selector de ordenamiento (newest, oldest, title, author)
   - Inputs: `searchQuery`, `selectedStatus`, `sortBy`
   - Outputs: `searchQueryChange`, `statusFilterChange`, `sortByChange`
   - Integra: StatusSelector reutilizable

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

### Diseño de Cards
- **Layout Flex**: Cards con display: flex, flex-direction: column, altura 100%
- **Altura Uniforme**: min-height: 450px para que todas las cards tengan el mismo tamaño
- **Acciones al Fondo**: Body con flex: 1 para llenar espacio disponible, actions con margin-top: auto
- **Estados Visuales**: Color de border y gradient según status del libro
- **Sombra Neobrutalism**: 3px 3px 0 en reposo, 5px 5px 0 en hover

### Grid Responsivo
- **Desktop** (1200px+): 3-4 columns con grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))
- **Tablet** (768px-1199px): 2-3 columns con minmax(280px, 1fr)
- **Mobile** (<768px): 1 column (100% ancho)
- Gap: 1rem entre cards

### Filtros y Ordenamiento
- **Filtro por Estado**: Dropdown con 5 opciones (todos, por leer, leyendo, leído, prestado, no voy a leer)
- **Búsqueda por Texto**: Input que filtra por título, autor, ISBN
- **Ordenamiento**: Sort por fecha (más nuevo/más antiguo), título A-Z, autor A-Z
- **Aplicación**: Se aplica al signal filteredBooks computed

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
- Estados disabled con visual feedback (opacity, cursor: not-allowed)
- Spinner durante carga
- Botones deshabilitados cuando libro está leído

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

## Variables de Entorno y Seguridad
- **Google Books API Key**:
  - Almacenada en archivo `.env` (no commiteado).
  - Inyectada en tiempo de build mediante script `scripts/set-env.js`.
  - Archivos `environment.ts` y `environment.prod.ts` generados dinámicamente e ignorados por git.
- **OpenLibrary**: API pública sin key.

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
- Angular 20.3.0 usa sintaxis nueva de control flow (@if, @for, sin *ngIf/*ngFor)
- No se usa CommonModule (Standalone components)
- Signals mejoran performance vs ChangeDetection manual
- Computed properties para estados derivados (filteredBooks)
- localStorage limita a ~5-10MB (suficiente para miles de libros)
- CORS: Google Books y OpenLibrary permiten requests desde navegador
- Spinner CSS puro: border + transform, no SVG ni img
- CSS Grid responsivo con auto-fill y minmax
- Flexbox para layout interno de cards
- ProgressBar desactiva eventos click en handlers cuando disabled=true

## Conclusión
Esta aplicación es un ejemplo completo de:
- Arquitectura modular Angular
- Componentes reutilizables standalone
- Integración multi-API
- Diseño mobile-first
- Persistencia local
- UX thoughtful con validación
- Estética neobrutalism consistente
