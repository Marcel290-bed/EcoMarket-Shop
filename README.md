# EcoMarket - Tienda Ecológica

Plataforma de comercio electrónico de productos ecológicos y sostenibles desarrollada con HTML, Bootstrap y JavaScript vanilla.

## 📍 Ubicación
Sincelejo, Colombia

## 💰 Moneda
Pesos Colombianos (COP)

## ✨ Características Principales

### Para Usuarios
- 🛒 **Carrito de Compras**: Cada usuario tiene su propio carrito aislado
- 🔍 **Búsqueda y Filtros**: Búsqueda por nombre, categoría y etiquetas ecológicas
- 📦 **Historial de Pedidos**: Visualización de compras realizadas con detalles completos
- 🏪 **Catálogo de Productos**: Vista de cuadrícula y lista con información detallada
- 💳 **Proceso de Compra**: Checkout con formulario de información de envío
- 📊 **Dashboard Personal**: Estadísticas de compras y gráficas de ventas de productos propios

### Para Administradores
- 📋 **Gestión de Productos**: Crear, editar y eliminar productos
- 🏷️ **Gestión de Categorías**: Administrar categorías de productos
- 👥 **Gestión de Usuarios**: Ver y administrar usuarios del sistema
- 📊 **Reportes**: Visualización de estadísticas de ventas y ganancias
- 📈 **Gráficas**: Análisis de ventas por días o meses con filtros personalizables
- 🛍️ **Gestión de Pedidos**: Visualización de todos los pedidos del sistema

## 🚀 Funcionalidades Implementadas

- **RF1**: Gestión de Categorías
- **RF2**: Gestión de Productos (sin estados, todos disponibles)
- **RF3**: Carrito de Compras (aislado por usuario)
- **RF4**: Búsqueda y Filtros Avanzados
- **RF5**: Consultas de Ganancias con Gráficas Interactivas
- **RF6**: Gestión de Usuarios
- **RF7**: Sistema de Autenticación y Sesiones
- **RF8**: Página Principal Responsive
- **RF9**: Sistema de Compras Completo
- **RF10**: Historial de Pedidos

## 🔧 Cómo Ejecutar

1. Clonar o descargar el repositorio
2. Abrir `index.html` en un navegador web moderno
3. No requiere instalación de dependencias ni servidor backend
4. Los datos se almacenan localmente en el navegador (LocalStorage)

## 🔑 Credenciales por Defecto

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

> **Nota**: Al inicializar por primera vez, el sistema solo crea el usuario administrador sin productos de ejemplo.

## 💾 Gestión de Datos

### Limpiar Base de Datos
Para resetear todos los datos a valores por defecto:
```javascript
// Abrir consola del navegador (F12) y ejecutar:
localStorage.clear();
sessionStorage.clear();
// Luego recargar la página (F5)
```

### Estructura de Datos
El sistema almacena la siguiente información en LocalStorage:
- `products`: Productos del catálogo
- `categories`: Categorías de productos  
- `users`: Usuarios del sistema
- `orders`: Pedidos realizados
- `sales`: Registro de ventas
- `wishlist`: Lista de deseos (futuro)

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Framework CSS**: Bootstrap 5.3.0
- **Iconos**: Bootstrap Icons
- **Gráficas**: Chart.js 3.9.1
- **Almacenamiento**: LocalStorage API & SessionStorage API
- **Formato de Precios**: Intl.NumberFormat (Pesos Colombianos)

## 📱 Características Técnicas

- ✅ Diseño 100% responsivo (móvil, tablet, desktop)
- ✅ Sistema de autenticación con sesiones
- ✅ Carrito aislado por usuario en SessionStorage
- ✅ Gráficas interactivas con filtros por fechas
- ✅ Sistema de notificaciones (toast)

## 📞 Contacto

- **Email**: info@ecomarket.com
- **Teléfono**: +57 300 123 4567
- **Ubicación**: Sincelejo, Colombia
- **Horario**: Lun - Vie: 9:00 - 18:00

## 📄 Licencia

© 2025 EcoMarket. Todos los derechos reservados.
