# POS System - Sistema de Punto de Venta

Sistema completo de punto de venta para restaurantes y negocios de servicios, construido con tecnologías modernas.

## 🚀 Características

- **Dashboard** - Resumen de ventas, pedidos activos y métricas en tiempo real
- **Gestión de Mesas** - Mapa visual de mesas con estados y gestión de pedidos
- **Menú y Productos** - Administración de categorías y productos con disponibilidad
- **Pedidos** - Creación, seguimiento y gestión completa de pedidos
- **Facturación** - Generación de facturas con cálculo de impuestos (IVA 16%)
- **Inventario** - Control de stock con alertas de stock bajo
- **Reportes** - Análisis de ventas, productos más vendidos y rendimiento
- **Usuarios** - Gestión de usuarios con roles (Admin, Gerente, Mesero, Cocina, Cajero)

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework Node.js con TypeScript
- **Prisma ORM** - ORM con tipado seguro
- **SQLite** (desarrollo) / **PostgreSQL** (producción)
- **JWT** - Autenticación con tokens
- **Swagger** - Documentación de API

### Frontend
- **React 18** con TypeScript
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI modernos
- **Lucide Icons** - Iconos SVG
- **React Router** - Navegación SPA

## 📁 Estructura del Proyecto

```
pos-system/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación JWT
│   │   ├── products/       # Productos y categorías
│   │   ├── orders/         # Pedidos y pagos
│   │   ├── prisma/         # Servicio Prisma
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Schema de base de datos
│   └── .env                # Variables de entorno
│
├── frontend/               # App React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── contexts/       # Contextos React
│   │   ├── lib/            # Utilidades y tipos
│   │   ├── pages/          # Páginas de la app
│   │   └── App.tsx         # Router principal
│   └── .env                # Variables de entorno
│
└── README.md
```

## ⚡ Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar e instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configurar variables de entorno**

Backend (`backend/.env`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-clave-secreta-super-segura"
JWT_EXPIRATION="7d"
PORT=3001
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

3. **Inicializar base de datos**
```bash
cd backend
npx prisma migrate dev --name init
```

4. **Iniciar servidores**

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Crear usuario admin**
```bash
curl -X POST http://localhost:3001/auth/init
```

6. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- API Docs: http://localhost:3001/api

### Credenciales por defecto
- **Email:** admin@pos.com
- **Password:** admin123

## 📚 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Usuario actual
- `POST /auth/init` - Crear admin inicial

### Productos
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto
- `PATCH /products/:id/availability` - Cambiar disponibilidad

### Categorías
- `GET /products/categories` - Listar categorías
- `POST /products/categories` - Crear categoría
- `PUT /products/categories/:id` - Actualizar categoría

### Pedidos
- `GET /orders` - Listar pedidos
- `POST /orders` - Crear pedido
- `POST /orders/:id/items` - Agregar item
- `PATCH /orders/:id/status` - Actualizar estado
- `POST /orders/:id/payments` - Registrar pago
- `POST /orders/:id/invoice` - Generar factura
- `POST /orders/:id/request-bill` - Solicitar cuenta

### Reportes
- `GET /orders/daily-summary` - Resumen diario

## 🔐 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso total, gestión de usuarios |
| MANAGER | Reportes, inventario, configuración |
| WAITER | Mesas, pedidos, menú |
| KITCHEN | Ver pedidos, actualizar estado |
| CASHIER | Pagos, facturas |

## 🎨 Flujo de Pedido

1. **Mesero** selecciona mesa disponible
2. Crea pedido y agrega productos del menú
3. Envia a cocina (estado: IN_PROGRESS)
4. **Cocina** marca como listo (estado: READY)
5. **Mesero** sirve (estado: SERVED)
6. Cliente solicita cuenta (estado: BILL_REQUESTED)
7. **Cajero** procesa pago y genera factura
8. Pedido completado, mesa en limpieza

## 📊 Estados de Mesa

- 🟢 **Disponible** - Lista para nuevo cliente
- 🔴 **Ocupada** - Con clientes y pedido activo
- 🟡 **Reservada** - Reserva pendiente
- 🟣 **Cuenta** - Solicitaron la cuenta
- ⚪ **Limpieza** - En proceso de limpieza

## 🔧 Comandos Útiles

```bash
# Backend
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Build de producción
npm run test           # Ejecutar tests
npx prisma studio      # Visualizador de BD

# Frontend
npm run dev            # Servidor de desarrollo
npm run build          # Build de producción
npm run preview        # Preview de build
```

## 📝 Licencia

MIT License - Libre para uso personal y comercial.
