# 📋 TODO — POS System: Integraciones y Pendientes

Documento generado tras análisis completo del proyecto.
Organizado por prioridad y área de trabajo.

---

## 🔴 BUGS CRÍTICOS (cosas rotas hoy mismo)

### Backend

- [x] **[ORDERS]** `findAll()` solo acepta un estado (`status?: string`) pero el frontend
      llama `/orders?status=PENDING,IN_PROGRESS,READY` (cadena múltiple separada por coma).
      ✅ **COMPLETADO** - Ahora acepta string, array o string separado por comas.

- [x] **[INVENTORY]** `findLowStock()` usa sintaxis Prisma inválida.
      ✅ **COMPLETADO** - Ahora trae todos los items y filtra en memoria.

- [x] **[ORDERS]** `findAll()` tiene `completedAt: null` hardcodeado en el `where`.
      ✅ **COMPLETADO** - Ahora es condicional basado en si se filtra por COMPLETED.

### Frontend

- [x] **[USERS]** `toggleUserActive()` en `UsersPage.tsx` llama a rutas que no existen.
      ✅ **COMPLETADO** - Ahora usa `PATCH /users/:id/active` con body correcto.

- [x] **[TABLES → ORDERS]** `TablesPage.tsx` navega a `/orders/new?tableId=...` y a
      `/orders/:id` pero esas rutas NO están registradas en `App.tsx`.
      ✅ **COMPLETADO** - Rutas agregadas y páginas completas creadas.

- [x] **[ORDERS]** El botón "Ver" en cada card de `OrdersPage.tsx` no navega a ningún lado.
      ✅ **COMPLETADO** - Ahora navega a `/orders/:id`.

---

## 🟠 PÁGINAS INCOMPLETAS (existen pero no están integradas con el backend)

- [x] **[REPORTS]** `ReportsPage.tsx` — ✅ **COMPLETADO**
      - ✅ Endpoints backend implementados (weekly, top-products, top-waiters, summary)
      - ✅ Frontend conectado a endpoints reales
      - ✅ Datos dinámicos en todas las secciones
      - [ ] Agregar selector de rango de fechas funcional
      - [ ] Implementar botón "Exportar" (CSV o PDF)

- [x] **[SETTINGS]** `SettingsPage.tsx` tiene campos con valores hardcodeados y el botón
      "Guardar Cambios" no hace nada. Necesita:
      - Endpoint backend: `GET /settings` (leer configuración)
      - Endpoint backend: `PUT /settings` (guardar configuración)
      - Conectar el formulario a la API
      - Cargar valores reales al montar el componente
      ✅ **COMPLETADO** - SettingsModule (GET/PUT /settings) creado y SettingsPage conectado a API.

---

## 🟡 FUNCIONALIDADES FALTANTES EN FRONTEND

### Rutas y páginas nuevas

- [x] **Crear página `/orders/new`** — ✅ **COMPLETADO** - Formulario completo de creación de pedido:
      - Seleccionar tipo (Dine-in / Para llevar / Delivery)
      - Listado de productos del menú por categoría
      - Agregar/quitar items con cantidades y notas
      - Cálculo de totales en tiempo real
      - Conectado a `POST /orders` y `POST /orders/:id/items`

- [x] **Crear página `/orders/:id`** — ✅ **COMPLETADO** - Detalle completo de pedido:
      - Todos los items del pedido con estado individual
      - Totales (subtotal, impuesto, total)
      - Botones de cambio de estado según flujo
      - Sección de pagos completa (ver, agregar, calcular saldo)
      - Sección de factura con formulario de datos del cliente
      - Todos los endpoints conectados (request-bill, payments, invoice, cancel)

### Modales de creación/edición (CRUD completo)

- [x] **[MENU]** Modal "Nuevo Producto" / "Editar Producto" — ✅ **COMPLETADO**
      - ✅ Componente `ProductFormDialog` creado
      - ✅ Campos: nombre, descripción, precio, categoría, tiempo de preparación, imagen
      - ✅ Preview de imagen en tiempo real
      - ✅ Toggle de activo/disponible con checkboxes
      - ✅ Conectado a `POST /products` y `PUT /products/:id`
      - ✅ Botón eliminar con confirmación integrado en MenuPage

- [x] **[MENU]** Modal "Nueva Categoría" / "Editar Categoría" — ✅ **COMPLETADO**
      - ✅ Componente `CategoryFormDialog` creado
      - ✅ Campos: nombre, descripción, imagen, orden
      - ✅ Conectado a `POST /products/categories` y `PUT /products/categories/:id`
      - ✅ Botón eliminar con confirmación integrado en MenuPage
      - ✅ Sistema de toasts para feedback de acciones

- [x] **[TABLES]** Modal "Nueva Mesa" / "Editar Mesa" — ✅ **COMPLETADO**
      - ✅ Componente `TableFormDialog` creado
      - ✅ Campos: número, capacidad, forma (select: rectangle/circle)
      - ✅ Posición X/Y y tamaño (width/height) para mapa visual
      - ✅ Conectado a `POST /tables` y `PUT /tables/:id`
      - ✅ Integrado en TablesPage con botón Nueva Mesa funcional

- [x] **[USERS]** Modal "Nuevo Usuario" / "Editar Usuario" — ✅ **COMPLETADO**
      - ✅ Componente `UserFormDialog` creado
      - ✅ Campos: nombre, apellido, email, contraseña (opcional en edición), rol, teléfono
      - ✅ Select de roles con labels en español
      - ✅ Checkbox para activo/inactivo
      - ✅ Conectado a `POST /users` y `PUT /users/:id`
      - ✅ Botón eliminar con confirmación integrado en UsersPage
      - ✅ Validación de contraseña (mínimo 6 caracteres)

- [x] **[INVENTORY]** Modal "Nuevo Artículo" / "Editar Artículo" — ✅ **COMPLETADO**
      - ✅ Componente `InventoryItemFormDialog` creado
      - ✅ Campos: nombre, SKU, cantidad, unidad, cantidad mínima, costo, ubicación
      - ✅ Select de unidades (kg, litros, unidades, cajas, etc.)
      - ✅ Cálculo de valor total en inventario (cantidad × costo)
      - ✅ Conectado a `POST /inventory` y `PUT /inventory/:id`
      - ✅ Botones editar/eliminar integrados en InventoryPage

- [x] **[INVENTORY]** Modal "Registrar Movimiento" (Entrada / Salida / Ajuste):
      - Campos: cantidad, tipo (IN/OUT/ADJUSTMENT/RETURN), motivo, referencia
      - Botones "Entrada" y "Salida" en la página deben abrir este modal
      - Conectar a `POST /inventory/:id/movements`
      ✅ **COMPLETADO** - `InventoryMovementDialog` creado y botones Entrada/Salida conectados.

### Flujos de operación en mesas

- [x] **[TABLES]** Botón "Agregar Items" en mesa ocupada — ✅ **COMPLETADO**
      Navega al detalle del pedido activo.

- [x] **[TABLES]** Botón "Solicitar Cuenta" — ✅ **COMPLETADO**
      Llama a `POST /orders/:id/request-bill` y actualiza estado.

- [x] **[TABLES]** Botón "Procesar Pago" — ✅ **COMPLETADO**
      Navega a `/orders/:id` para gestionar pagos.

- [x] **[TABLES]** Botón "Reservar" — ✅ **COMPLETADO**
      Llama a `PATCH /tables/:id/reserve`.

### Vista de cocina

- [x] **Crear vista `/kitchen`** (o dashboard alternativo para rol KITCHEN):
      - Ver pedidos en estado `PENDING` e `IN_PROGRESS` en tiempo real
      - Ordenados por hora de creación (más antiguo primero)
      - Botón por pedido para cambiar a `IN_PROGRESS` → `READY`
      - Visualización clara de los items de cada pedido y sus notas
      - Auto-refresh cada X segundos (o WebSocket si se implementa)
      ✅ **COMPLETADO** - KitchenPage creada con auto-refresh y transiciones IN_PROGRESS→READY.

---

## 🟢 COMPONENTES UI FALTANTES

Los paquetes Radix están instalados en `package.json` pero no tienen
el componente wrapper creado en `frontend/src/components/ui/`.

- [x] **Crear `ui/dialog.tsx`** — ✅ **COMPLETADO**
      Wrappear `@radix-ui/react-dialog`.

- [x] **Crear `ui/select.tsx`** — ✅ **COMPLETADO**
      Para dropdowns en formularios (rol de usuario, tipo de pedido, método de pago, etc.).

- [x] **Crear `ui/toast.tsx`** + **`ui/use-toast.ts`** + **`ui/toaster.tsx`** — ✅ **COMPLETADO**
      Sistema de notificaciones completo integrado en App.tsx.

- [x] **Crear `ui/textarea.tsx`** — ✅ **COMPLETADO**
      Para campos de notas en pedidos, productos, etc.

- [x] **Crear `ui/badge.tsx`** — ✅ **COMPLETADO**
      Para etiquetas de estado reutilizables.

- [x] **Crear `ui/dropdown-menu.tsx`** — ✅ **COMPLETADO**
      Para menús contextuales (opciones del "⋮" en mesas, productos, usuarios).

- [x] **Crear `ui/tabs.tsx`** — ✅ **COMPLETADO**
      Para vistas tabuladas (ej. detalle de pedido: Items | Pagos | Factura).

- [x] **Crear `ui/separator.tsx`** — ✅ **COMPLETADO**
      Separadores visuales entre secciones.

- [x] **Crear `ui/alert.tsx`** — ✅ **COMPLETADO**
      Para alertas de stock bajo, errores de sistema.

---

## 🔵 MEJORAS DE BACKEND

### Seguridad y autorización

- [x] **Crear `RolesGuard`** — ✅ **COMPLETADO**
      Guard de roles implementado con decorador `@Roles()`:
      - ✅ Creado `src/auth/guards/roles.guard.ts`
      - ✅ Creado `src/auth/decorators/roles.decorator.ts`
      - ✅ Rutas protegidas: `/users` y `/inventory` (ADMIN/MANAGER)

### Endpoints de reportes

- [x] **`GET /orders/reports/weekly`** — ✅ **COMPLETADO**
      Ventas agrupadas por día de la última semana
      
- [x] **`GET /orders/reports/top-products`** — ✅ **COMPLETADO**
      Top N productos más vendidos por cantidad y revenue
      
- [x] **`GET /orders/reports/top-waiters`** — ✅ **COMPLETADO**
      Meseros con más pedidos y revenue generado
      
- [x] **`GET /orders/reports/summary`** — ✅ **COMPLETADO**
      Resumen general de ventas del período

### Validaciones y robustez

- [x] **Máquina de estados en pedidos** — Validar transiciones permitidas en
      `updateStatus()`. Ej: no se puede pasar de `COMPLETED` a `PENDING`,
      ni de `CANCELLED` a `IN_PROGRESS`. Rechazar con `BadRequestException`.
      ✅ **COMPLETADO** - Validación de transiciones implementada en `OrdersService.updateStatus()`.

- [x] **Paginación** — Agregar `page` y `limit` query params a los endpoints de listado:
      `/orders`, `/products`, `/users`, `/inventory`
      ✅ **COMPLETADO** - `page/limit` implementados con `skip/take` y defaults seguros.

- [x] **Endpoint de settings en backend** — Crear `SettingsModule` con:
      - `GET /settings` — Leer todos los settings
      - `PUT /settings` — Actualizar settings por clave
      ✅ **COMPLETADO** - SettingsModule integrado en AppModule.

### Filtros y búsqueda

- [ ] **[ORDERS]** Agregar filtro por fecha (`dateFrom`, `dateTo`) en `GET /orders`
- [ ] **[ORDERS]** Agregar filtro por mesero (`waiterId`) en `GET /orders`
- [ ] **[PRODUCTS]** Agregar búsqueda por nombre en `GET /products`
- [ ] **[USERS]** El filtro `completedAt: null` en `findAll` de órdenes debe ser opcional

---

## ⚙️ CONFIGURACIÓN Y ENTORNO

- [ ] **Crear `.env.example`** en `backend/` con todas las variables documentadas:
      ```
      DATABASE_URL="file:./dev.db"
      JWT_SECRET="cambiar-en-produccion"
      JWT_EXPIRATION="7d"
      PORT=3001
      ```

- [ ] **Crear `.env.example`** en `frontend/`:
      ```
      VITE_API_URL=http://localhost:3001
      ```

- [ ] **Corregir README.md** — El README principal dice que la DB es PostgreSQL pero
      `schema.prisma` usa SQLite. Actualizar para reflejar la realidad del proyecto
      o añadir sección de migración opcional a PostgreSQL.

- [ ] **Evaluar Vite beta** — El frontend usa `vite: ^8.0.0-beta.13`. Considerar
      bajar a la versión estable más reciente de Vite 5/6 para evitar bugs en build.

- [ ] **Agregar `.gitignore` en la raíz** del monorepo que ignore `*.db`, `dist/`,
      `node_modules/`, `.env`.

---

## 🔄 MEJORAS DE UX / CALIDAD

- [ ] **Feedback visual en acciones** — Ninguna acción muestra toast/notificación
      de éxito o error. Implementar usando el componente `ui/toast.tsx` una vez creado.
      Aplicar a: crear pedido, agregar item, cambiar estado, procesar pago, etc.

- [ ] **Confirmación antes de eliminar** — Los botones de eliminar en menú, usuarios e
      inventario no piden confirmación. Agregar `Dialog` de confirmación antes de
      llamar al endpoint `DELETE`.

- [ ] **Auto-refresh en páginas operativas** — Dashboard, Pedidos y Mesas deberían
      refrescarse automáticamente cada 30–60 segundos para reflejar cambios en tiempo
      real sin recargar la página.

- [ ] **Estado de carga por acción (no solo al montar)** — Los spinners solo aparecen
      en la carga inicial. Deshabilitar botones y mostrar loading en acciones como
      "Cambiar estado", "Registrar pago", etc.

- [ ] **Manejo de errores global** — Agregar un interceptor en `api.ts` que, si recibe
      un `401`, haga logout automático y redirija al login.

- [ ] **Sidebar activo en ruta raíz** — El ítem "Dashboard" usa `to="/"` con NavLink,
      lo que hace que siempre aparezca como activo. Usar `end` prop en el NavLink.

- [ ] **Mesas — mapa visual real** — Las mesas tienen `positionX`, `positionY`, `width`,
      `height` y `shape` en el schema pero el frontend los ignora y muestra un grid
      simple. Implementar un canvas o mapa drag-and-drop con las posiciones reales.

- [ ] **Responsive en móvil** — El sidebar se oculta en mobile pero la lógica de
      `sidebarOpen` por defecto es `false` y no hay botón visible en header para
      abrirlo de forma clara. Revisar UX en pantallas pequeñas.

---

## 🧪 TESTING

- [ ] **Tests unitarios backend** — Los archivos `.spec.ts` existen pero están vacíos
      (generados por NestJS CLI). Escribir tests para:
      - `AuthService` (login, validateToken, createAdminUser)
      - `OrdersService` (create, addItem, recalculateTotals, completeOrder)
      - `InventoryService` (addMovement con todos los tipos)

- [ ] **Tests de integración (e2e)** — Agregar tests e2e para el flujo completo:
      login → crear orden → agregar items → procesar pago → verificar mesa limpieza

---

## 📊 RESUMEN DE PRIORIDADES

| Prioridad | Área | Tarea |
|-----------|------|-------|
| ✅ P0 | Bug | Fix filtro multi-estado en pedidos — **COMPLETADO** |
| ✅ P0 | Bug | Fix findLowStock en inventario — **COMPLETADO** |
| ✅ P0 | Bug | Fix endpoints activate/deactivate de usuarios — **COMPLETADO** |
| ✅ P0 | Bug | Registrar rutas `/orders/new` y `/orders/:id` — **COMPLETADO** |
| ✅ P1 | UI | Crear componente `ui/dialog.tsx` — **COMPLETADO** |
| ✅ P1 | UI | Crear página `/orders/new` con formulario completo — **COMPLETADO** |
| ✅ P1 | UI | Crear página `/orders/:id` con detalle, pago y factura — **COMPLETADO** |
| ✅ P1 | Backend | Crear `RolesGuard` y proteger rutas por rol — **COMPLETADO** |
| ✅ P2 | Backend | Endpoints de reportes (weekly, top-products, top-waiters, summary) — **COMPLETADO** |
| ✅ P2 | UI | Conectar ReportsPage a endpoints reales — **COMPLETADO** |
| ✅ P2 | UI | Componentes ui completos (dialog, select, toast, badge, textarea, tabs, dropdown, separator, alert) — **COMPLETADO** |
| ✅ P2 | UI | Modal CRUD de categorías — **COMPLETADO** |
| ✅ P2 | UI | Modales de CRUD completos (categorías, productos, mesas, usuarios, inventario) — **COMPLETADO** |
| ✅ P3 | Backend | Paginación en endpoints de listado — **COMPLETADO** |
| ✅ P3 | UI | Vista de cocina `/kitchen` — **COMPLETADO** |
| ✅ P3 | Backend | Endpoint de settings en backend — **COMPLETADO** |
| ✅ P3 | Backend | Modal CRUD de movimientos de inventario — **COMPLETADO** |
| ✅ P3 | Backend | Máquina de estados en pedidos — **COMPLETADO** |
| 🟢 P3 | UX | Auto-refresh en Dashboard, Mesas y Pedidos |
| 🟢 P3 | UX | Toasts de feedback en todas las acciones |
| 🔵 P4 | Config | Archivos `.env.example` y corrección del README |
| 🔵 P4 | Testing | Tests unitarios y e2e |