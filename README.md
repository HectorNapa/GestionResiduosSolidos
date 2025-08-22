# Sistema de Gestión de Residuos Sólidos - EcoGestión

Una aplicación web completa para la gestión integral de residuos sólidos, desarrollada con HTML, JavaScript vanilla y Tailwind CSS.

## 🌟 Características Principales

### 📋 Gestión Completa del Proceso Operativo

1. **Solicitud del Servicio**
   - Registro de clientes y solicitudes
   - Captura de datos: nombre, dirección, tipo de residuos, volumen estimado, fecha solicitada
   - Portal de cliente para nuevas solicitudes

2. **Planificación y Organización de Rutas**
   - Definición de fechas y horarios de recolección
   - Asignación de vehículos y equipos de trabajo
   - Determinación de puntos de recolección y orden de rutas
   - Preparación de órdenes de trabajo y documentos

3. **Ejecución de la Recolección**
   - Registro de datos en campo con dispositivos móviles
   - Medición y estimación de cantidades y tipos de residuos
   - Documentación digital con firmas electrónicas
   - Evidencia fotográfica

4. **Generación de Manifiestos**
   - Documentos oficiales para el traslado de residuos
   - Incluye origen, destino, tipo y cantidad de residuos
   - Información de vehículo y conductor responsable

5. **Recepción y Manejo en Planta**
   - Descarga y clasificación de materiales
   - Registro de peso por categoría de residuo
   - Control de calidad y capacidad de planta

6. **Generación de Reportes**
   - Consolidación de información del proceso completo
   - Reportes por cliente, tipo de residuo, rutas, etc.
   - Exportación en múltiples formatos (PDF, Excel, CSV)

7. **Disposición Final**
   - Gestión de residuos no reutilizables o reciclables
   - Registro de métodos de disposición
   - Cumplimiento normativo y permisos ambientales

## 👥 Tipos de Usuario

### 🔧 Administradores
- Gestión completa del sistema
- Configuración de usuarios, rutas y vehículos
- Dashboard con indicadores clave
- Generación de reportes globales
- Configuración de tarifas y facturación

### 🚛 Personal Operativo
- Registro de recolecciones en campo
- Llenado digital de órdenes de trabajo
- Actualización de estado de recolecciones
- Acceso mediante dispositivos móviles

### 👤 Clientes
- Portal de autoservicio
- Solicitud de nuevos servicios
- Consulta de historial y manifiestos
- Descarga de facturas y comprobantes
- Seguimiento en tiempo real (opcional)

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, JavaScript ES6+, CSS3
- **Framework CSS**: Tailwind CSS
- **Gráficos**: Chart.js
- **Iconos**: Font Awesome
- **Diseño**: Responsive design con Grid y Flexbox

## 📁 Estructura del Proyecto

```
Proyecto residuos/
├── index.html              # Página principal
├── js/                     # Scripts JavaScript
│   ├── app.js              # Aplicación principal y navegación
│   ├── auth.js             # Sistema de autenticación
│   ├── dashboard.js        # Dashboards por tipo de usuario
│   ├── services.js         # Gestión de solicitudes
│   ├── routes.js           # Planificación de rutas
│   ├── collection.js       # Registro de recolecciones
│   ├── manifests.js        # Generación de manifiestos
│   ├── plant.js            # Recepción en planta
│   ├── reports.js          # Sistema de reportes
│   └── disposal.js         # Disposición final
└── README.md               # Documentación
```

## 🚀 Instalación y Uso

1. **Clonar o descargar** el proyecto en tu computadora

2. **Abrir** el archivo `index.html` en tu navegador web

3. **Credenciales de acceso**:
   - **Administrador**: usuario: `admin`, contraseña: `admin123`
   - **Técnico**: usuario: `tecnico1`, contraseña: `op123`
   - **Cliente**: usuario: `cliente1`, contraseña: `cl123`

## 🎯 Funcionalidades Principales

### Para Administradores
- **Dashboard ejecutivo** con métricas en tiempo real
- **Gestión de usuarios** y asignación de roles
- **Configuración de rutas** y optimización
- **Reportes avanzados** con múltiples filtros
- **Configuración del sistema** y parámetros operacionales

### Para Técnicos
- **Registro de recolecciones** con formularios optimizados
- **Firma digital** del cliente
- **Captura de evidencia** fotográfica
- **Generación de manifiestos** automática
- **Recepción en planta** con clasificación de residuos

### Para Clientes
- **Portal de autoservicio** intuitivo
- **Solicitud de servicios** con formularios guiados
- **Seguimiento en tiempo real** del estado del servicio
- **Historial completo** de servicios contratados
- **Descarga de documentos** y facturas

## 📊 Módulos del Sistema

### 1. Gestión de Solicitudes
- Formulario completo de solicitud de servicios
- Validación de datos en tiempo real
- Gestión de prioridades y programación
- Filtros avanzados para búsqueda

### 2. Planificación de Rutas
- Optimización automática de rutas
- Asignación de vehículos y conductores
- Seguimiento en tiempo real
- Métricas de rendimiento

### 3. Recolección en Campo
- Formularios digitales optimizados para móviles
- Registro de pesos y volúmenes reales
- Captura de firmas electrónicas
- Evidencia fotográfica con metadatos

### 4. Manifiestos y Documentación
- Generación automática de manifiestos
- Cumplimiento normativo
- Trazabilidad completa
- Exportación en múltiples formatos

### 5. Recepción en Planta
- Control de capacidad en tiempo real
- Clasificación automática de residuos
- Control de calidad
- Alertas de capacidad

### 6. Sistema de Reportes
- Reportes predefinidos por módulo
- Generador de reportes personalizados
- Exportación en PDF, Excel y CSV
- Programación de reportes automáticos

### 7. Disposición Final
- Registro de métodos de disposición
- Cumplimiento de normativas ambientales
- Certificados de disposición
- Control de costos

## 🔐 Seguridad

- Sistema de autenticación por roles
- Control de acceso granular
- Registro de actividades (logs)
- Validación de datos en frontend

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- **Desktop**: Experiencia completa con todas las funcionalidades
- **Tablet**: Interfaz adaptada para trabajo en campo
- **Mobile**: Formularios optimizados para técnicos

## 🌍 Cumplimiento Normativo

El sistema está diseñado para cumplir con:
- Normativas ambientales locales
- Requisitos de trazabilidad
- Documentación oficial requerida
- Reportes para autoridades ambientales

## 🔧 Personalización

El sistema permite personalizar:
- Tipos de residuos según la operación
- Métodos de disposición disponibles
- Formularios y campos requeridos
- Reportes y dashboards
- Flujos de trabajo específicos

## 📈 Métricas y KPIs

El sistema proporciona métricas clave como:
- Volumen total de residuos gestionados
- Eficiencia de rutas y vehículos
- Tasas de reciclaje por tipo de material
- Costos operacionales por servicio
- Cumplimiento de programación
- Impacto ambiental

## 🤝 Soporte

Para soporte técnico o consultas sobre implementación, consulta la documentación técnica incluida en cada módulo del sistema.

## 📄 Licencia

Este proyecto está desarrollado como una solución empresarial para la gestión de residuos sólidos. Consulta los términos de uso específicos para tu implementación.

---

**EcoGestión** - Sistema Integral de Gestión de Residuos Sólidos
*Tecnología al servicio del medio ambiente*