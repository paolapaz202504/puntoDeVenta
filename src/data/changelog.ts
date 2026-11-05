export interface ChangeItem {
  type: "feature" | "improvement" | "security" | "cloud" | "fix";
  description: string;
}

export interface ReleaseVersion {
  version: string;
  date: string;
  title: string;
  summary: string;
  isLatest?: boolean;
  changes: ChangeItem[];
}

export const CURRENT_VERSION = "v1.6.0";

export const CHANGELOG_DATA: ReleaseVersion[] = [
  {
    version: "v1.6.0",
    date: "2026-11-05",
    title: "Módulo Financiero, Punto de Venta (POS), Dashboard Administrativo y Rutas por Rol",
    summary:
      "Gran actualización con el lanzamiento del Módulo Financiero (Gastos Operativos, Egresos Unificados y Flujo de Caja), Sistema de Punto de Venta (POS) ágil con control estricto de existencias, Tablero Administrativo con gráficos y métricas para Administradores, navegación y páginas de inicio configurables por rol con restricción exclusiva para Cajero, y desacoplamiento total de proveedores en el catálogo de productos.",
    isLatest: true,
    changes: [
      {
        type: "feature",
        description:
          "Módulo Financiero Completo: Registro y gestión de Gastos Operativos (Personal/Planilla, Energía Eléctrica, Agua, Gas Propano, Impuestos SAT, Alquiler, Mantenimiento y Desechables) con comprobantes bancarios y observaciones.",
      },
      {
        type: "feature",
        description:
          "Pantalla de Egresos de Dinero: Vista unificada que consolida todas las salidas monetarias del negocio por concepto de compras de mercadería (pagos contado y abonos a crédito) y gastos de operación.",
      },
      {
        type: "feature",
        description:
          "Flujo de Caja y Rendimiento: Balance financiero en tiempo real comparando ingresos por ventas vs salidas por compras y gastos, con desglose porcentual por método de pago y categoría de gasto.",
      },
      {
        type: "feature",
        description:
          "Módulo de Ventas y Punto de Venta (POS): Pantalla ágil y táctil (/pos) para despacho de productos autorizados para venta directa, comanda con modificadores de cantidad, cálculo instantáneo de cambio en efectivo y actualización automática de existencias.",
      },
      {
        type: "feature",
        description:
          "Historial de Ventas y Comandas: Registro con filtros por tipo, fecha y método de pago, modal de inspección de consumos y anulación de ventas con restitución automática de inventario.",
      },
      {
        type: "feature",
        description:
          "Tablero Administrativo (Dashboard General): Pantalla de inicio para el Administrador con KPIs de ventas y egresos de hoy y del mes, gráfico comparativo de 7 días, alertas de inventario crítico y ranking de productos más vendidos.",
      },
      {
        type: "feature",
        description:
          "Página de Inicio por Rol y Restricción de Cajero: Campo 'default_path' configurable en el catálogo de roles. El rol Cajero accede directamente al POS y queda restringido de acceder al listado de ventas o al dashboard administrativo.",
      },
      {
        type: "improvement",
        description:
          "Desacoplamiento Proveedor-Producto: Eliminación definitiva de 'Proveedor Principal' en Catálogo de Productos para permitir compras dinámicas desde múltiples proveedores.",
      },
    ],
  },
  {
    version: "v1.5.1",
    date: "2026-11-05",
    title: "Paginación en Artículos, Formato Fecha/Hora y Control Preciso de Abonos",
    summary:
      "Optimizaciones en el módulo de compras: paginación automática en la lista de mercadería recibida al superar 10 artículos, ampliación de ancho en el modal a 'max-w-5xl', visualización estricta de fecha y hora en formato 'dd/mm/yyyy hh:mm', activación de filtros en listado exclusivamente mediante el botón 'Actualizar Lista', y corrección de abonos parciales en PaymentModal.",
    isLatest: false,
    changes: [
      {
        type: "improvement",
        description:
          "Paginación en Mercadería Recibida (StockEntryModal): Incorporación de navegación por páginas (10 artículos por página) con indicadores y controles Anterior/Siguiente para entradas con múltiples productos.",
      },
      {
        type: "improvement",
        description:
          "Ampliación de Ancho de Modal a 'max-w-5xl': Mayor holgura visual horizontal para el formulario de entradas de almacén y compras.",
      },
      {
        type: "improvement",
        description:
          "Formato de Fecha y Hora 'dd/mm/yyyy hh:mm': Estandarización de la columna de fecha en el listado de compras con visualización clara de hora y minutos.",
      },
      {
        type: "improvement",
        description:
          "Filtros Manuales con Botón 'Actualizar Lista': Desacoplamiento de filtros en EntriesList para que la consulta se ejecute exclusivamente cuando el usuario pulse 'Actualizar Lista' o presione Enter.",
      },
      {
        type: "fix",
        description:
          "Blindaje de Abonos Parciales (PaymentModal): Reinicio reactivo del formulario al abrir, eliminación del pre-llenado accidental del saldo total, proyección de saldo restante en tiempo real y regularización de compra CMP-2026-0005 a estado PARCIAL.",
      },
    ],
  },
  {
    version: "v1.5.0",
    date: "2026-11-05",
    title: "Módulo Integral de Compras, Entradas de Almacén y Gestión de Pagos",
    summary:
      "Lanzamiento del módulo operativo de entradas de mercadería y compras a proveedores. Incorpora creación rápida de proveedores 'al vuelo', categorización de entradas (Compra, Donación, Ajuste), selección de presentaciones con factor de conversión, recálculo automático de Costo Promedio Ponderado, pagos al contado y a crédito con captura bancaria, y control de Cuentas por Pagar con abonos parciales y liquidación total.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        description:
          "Formulario Integral de Entradas y Compras (StockEntryModal): Registro completo de recepciones con selección de proveedor, fecha, factura, detalle dinámico de productos, cálculo de totales y condición de pago.",
      },
      {
        type: "feature",
        description:
          "Creación Rápida de Proveedores (QuickSupplierModal): Registro exprés de proveedores directamente desde el formulario de compras solicitando únicamente el nombre obligatorio sin recargar la página ni perder ítems agregados.",
      },
      {
        type: "feature",
        description:
          "Tipos de Entrada Diferenciados: Soporte para 'Compra' (genera compromiso financiero y ajuste de costos), 'Donación' (ingreso de stock sin deuda financiera) y 'Ajuste / Otro' (sobrantes, mermas inversas o traslados).",
      },
      {
        type: "feature",
        description:
          "Gestión Financiera de Pagos (Contado vs Crédito): Registro de pagos al contado en Efectivo o Cheque/Depósito/Transferencia con banco, fecha y número de comprobante; o registro a crédito en estado PENDIENTE con fecha de vencimiento.",
      },
      {
        type: "feature",
        description:
          "Control de Cuentas por Pagar y Abonos (PaymentModal): Acción para registrar abonos parciales o liquidación total con 1 solo clic en compras a crédito, con desglose bancario y actualización reactiva de saldos.",
      },
      {
        type: "improvement",
        description:
          "Recálculo Automático de Costo Promedio Ponderado (CPP): Actualización transparente y atómica del costo unitario del producto en base al stock anterior y el nuevo lote recibido.",
      },
      {
        type: "improvement",
        description:
          "Modal de Detalle Completo (StockEntryDetailModal): Visualización estructurada de productos recibidos, factores de conversión aplicados e historial cronológico de pagos y abonos bancarios.",
      },
      {
        type: "cloud",
        description:
          "Sincronización Dual de Persistencia: Creación y migración de tablas 'stock_entries', 'stock_entry_items' y 'purchase_payments' con campos de auditoría en los clústeres TiDB Cloud de desarrollo ('refresqueriadbdev') y producción ('refresqueriadbprod').",
      },
    ],
  },
  {
    version: "v1.4.4",
    date: "2026-11-05",
    title: "Contenedores Oficiales de Refrescos y Costeo por Vaso/Copa (12 oz)",
    summary:
      "Calibración precisa de los tres tamaños oficiales de contenedores para refrescos naturales (Pequeña 5.25 L = 15 vasos, Mediana 8.05 L = 23 vasos, Grande 12.60 L = 36 vasos de 12 oz / 350 ml). Mantenimiento de recetas base por litro con cálculo en tiempo real del costo por vaso o copa servido.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        description:
          "Tarjetas de Contenedores Oficiales en ProductionModal: Selección en 1 clic entre Pequeña (5.25 L / 15 vasos), Mediana (8.05 L / 23 vasos) y Grande (12.60 L / 36 vasos), con opción para volúmenes personalizados.",
      },
      {
        type: "improvement",
        description:
          "Cálculo de Costo Unitario por Vaso/Copa: Visualización automática del costo de preparación del contenedor y desglose estimado por porción de 12 oz (350 ml) servida al cliente.",
      },
      {
        type: "improvement",
        description:
          "Escalado Exacto de Recetas Base por Litro: Preservación de la formulación estándar por 1 Litro (1,000 ml) con factores automáticos x5.25, x8.05 y x12.60 para descontar insumos e incrementar el stock en mililitros.",
      },
      {
        type: "improvement",
        description:
          "Diseño Anti-desbordamiento y Ampliación de Ancho en ProductionModal: Ampliación a 'max-w-4xl' con contención vertical estricta ('max-h-[90vh]'), cabecera y footer fijos, y scroll independiente en la lista de insumos para evitar desbordes al preparar recetas con múltiples ingredientes.",
      },
    ],
  },
  {
    version: "v1.4.3",
    date: "2026-11-05",
    title: "Enrutamiento Estricto DEV/PROD y Depuración de Bases de Datos Test",
    summary:
      "Aislamiento y enrutamiento formal de bases de datos: DEV apunta estrictamente a 'refresqueriadbdev' y PROD a 'refresqueriadbprod'. Eliminación segura de las bases de datos temporales 'test' en ambos clústeres TiDB Cloud sin pérdida de datos, y migración integral garantizando 83 productos y 29 recetas sincronizadas.",
    isLatest: false,
    changes: [
      {
        type: "cloud",
        description:
          "Enrutamiento estricto en backend (env.ts y db.ts): Sanitización e inyección explícita de URL de base de datos para garantizar que producción use 'refresqueriadbprod' y desarrollo 'refresqueriadbdev', previniendo conexiones accidentales.",
      },
      {
        type: "security",
        description:
          "Depuración de esquemas en TiDB Cloud: Eliminación definitiva de las bases de datos por defecto 'test' en DEV y PROD tras verificar paridad total (83 productos, 29 recetas, 5 proveedores).",
      },
      {
        type: "improvement",
        description:
          "Persistencia y paridad garantizada: Migración completa de todas las recetas, materias primas, insumos y productos terminados con integridad transaccional.",
      },
    ],
  },
  {
    version: "v1.4.2",
    date: "2026-11-05",
    title: "Renovación Automática de Sesión y Sesión Deslizante (Silent Refresh)",
    summary:
      "Implementación de la arquitectura de sesión deslizante y auto-refresco transparente: eliminación de expulsiones por inactividad mediante renovación en segundo plano cada 15 minutos, refresco al reenfocar la pestaña del navegador y reintento automático de peticiones con re-emisión de token bajo ventana de gracia.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        description:
          "Nuevo endpoint de renovación `/api/auth/refresh`: Valida la firma del token con ventana de gracia de 7 días, confirma la actividad del usuario en base de datos y emite un token JWT actualizado con roles y permisos vigentes.",
      },
      {
        type: "improvement",
        description:
          "Monitor proactivo en Frontend (App.tsx): Verificación periódica cada 15 minutos y oyentes automáticos de 'visibilitychange' y 'focus' para refrescar el token silenciosamente antes de que caduque al volver a la aplicación.",
      },
      {
        type: "fix",
        description:
          "Reintento silencioso en Axios (api.ts): Intercepción reactiva de respuestas 401 para pausar la petición, renovar el token automáticamente y reintentar la operación original de forma 100% transparente sin interrumpir al usuario.",
      },
    ],
  },
  {
    version: "v1.4.1",
    date: "2026-11-04",
    title: "Corrección de Carga de Productos y Estabilidad de Sesión en Recetas",
    summary:
      "Resolución del error 400 y expulsión de sesión al editar recetas: ampliación del límite de paginación en el esquema de productos, blindaje de authMiddleware para no forzar logout ante errores transitorios de base de datos, y opciones de respaldo instantáneas en los selectores de RecipeModal.",
    isLatest: false,
    changes: [
      {
        type: "fix",
        description:
          "Corrección de validación Zod en productos: Ampliación del parámetro 'limit' a un máximo de 500 ítems en backend y ajuste a 100 ítems en RecipeModal para prevenir errores 400 Bad Request.",
      },
      {
        type: "security",
        description:
          "Blindaje de autenticación (authMiddleware): Separación de errores de token JWT de los errores de base de datos para evitar que caídas o demoras de conexión retornen 401 y expulsen al usuario del sistema.",
      },
      {
        type: "improvement",
        description:
          "Carga resiliente en RecipeModal: Inclusión de opciones de respaldo en los selectores de producto final e ingredientes para garantizar la visualización inmediata de datos al editar.",
      },
    ],
  },
  {
    version: "v1.4.0",
    date: "2026-11-04",
    title: "CRUD Completo, Paginación y Ordenamiento en Recetas y Fórmulas Base",
    summary:
      "Transformación del submódulo de Recetas en un catálogo interactivo completo: listado tabular con paginación, ordenamiento por columnas, búsqueda dinámica por nombre de receta o producto, y operaciones CRUD (Crear, Actualizar y Eliminar) con validación estricta de protección referencial contra registros de producción o elaboración asociados.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        description:
          "Listado de Recetas con Paginación y Ordenamiento: Vista tabular con paginación (10 recetas por página), ordenamiento ascendente/descendente por nombre, tipo, rendimiento y fecha de creación, y buscador predictivo por nombre.",
      },
      {
        type: "feature",
        description:
          "Modal de Creación y Edición de Recetas (RecipeModal): Formulario paramétrico con selector de producto final, tipo de receta, rendimiento base, desglose dinámico de ingredientes e insumos con cálculo en tiempo real del costo de la tanda.",
      },
      {
        type: "security",
        description:
          "Protección de Integridad Referencial en Eliminación: Bloqueo transaccional en backend y frontend que impide eliminar recetas que ya cuenten con registros de producción o elaboración en cocina.",
      },
    ],
  },
  {
    version: "v1.3.2",
    date: "2026-11-04",
    title: "Optimización de Diseño y Ancho Fijo en Catálogo de Productos",
    summary:
      "Mejora ergonómica en el listado de productos: eliminación de la barra de pestañas superior, preservación de los filtros avanzados de búsqueda/categoría/marca/presentación, y eliminación del scroll horizontal en computadoras con soporte multilínea para nombres extensos.",
    isLatest: false,
    changes: [
      {
        type: "improvement",
        description:
          "Retiro del filtro superior por pestañas de familias, dejando una interfaz más limpia y directa en el inventario.",
      },
      {
        type: "improvement",
        description:
          "Preservación y protagonismo de la barra de filtros rápidos: Búsqueda por código/nombre, Categorías, Marcas/Empresas y Presentaciones de compra.",
      },
      {
        type: "improvement",
        description:
          "Ancho fijo sin scroll horizontal (table-fixed): La tabla ocupa exactamente el 100% de la resolución del monitor, permitiendo que nombres largos de productos se muestren en dos, tres o más líneas sin desbordamiento.",
      },
    ],
  },
  {
    version: "v1.3.1",
    date: "2026-11-04",
    title: "Optimización de Menú Principal y Módulo de Entradas",
    summary:
      "Rediseño ergonómico de la barra de navegación superior: retiro del tag 'POS Restaurante', simplificación del perfil de usuario con icono y nombre, traslado del botón 'Cerrar Sesión' al modal de perfil, y creación del menú independiente 'Entradas' con recepción de compras y catálogo de proveedores.",
    isLatest: false,
    changes: [
      {
        type: "improvement",
        description:
          "Limpieza visual del encabezado: Eliminación del badge estático 'POS Restaurante' junto al logotipo para un aspecto más sobrio y profesional.",
      },
      {
        type: "improvement",
        description:
          "Identificador de usuario simplificado: Reemplazo del bloque extenso de usuario y roles por un acceso directo con icono de usuario y nombre en un solo clic.",
      },
      {
        type: "security",
        description:
          "Cierre de sesión seguro: Reubicación del botón 'Cerrar Sesión' dentro del panel modal 'Mi Perfil' para evitar pulsaciones accidentales en la barra superior.",
      },
      {
        type: "feature",
        description:
          "Nuevo Menú 'Entradas': Creación del menú principal desplegable 'Entradas' con la nueva vista de gestión de entradas/compras y el traslado del Catálogo de Proveedores desde Inventario.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-11-04",
    title: "Módulo de Productos Preparados, Recetas Ágiles y Proveedores",
    summary:
      "Lanzamiento de la arquitectura de productos preparados: 9 refrescos naturales en cubetas variables de 1 a 10L, 6 licuados al momento, 10 alimentos con sub-ensambles por libra, catálogo de proveedores y botón de elaboración en cocina en 1 solo clic.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        description:
          "Catálogo de Proveedores: Registro y gestión de distribuidores de frutas, carnes, panadería, lácteos y abarrotes con conteo de insumos suministrados.",
      },
      {
        type: "feature",
        description:
          "Catálogo de Recetas y Fórmulas Base: 29 recetas configuradas (refrescos escalables, sub-ensambles por libra de cocina y ensambles directos de mostrador).",
      },
      {
        type: "feature",
        description:
          "Elaboración Ágil en Cocina / Barra (1 Clic): Modal interactivo para preparar cubetas de 1 a 10 Litros y tandas de rellenos por libra con deducción atómica de materias primas y cálculo de costo real.",
      },
      {
        type: "feature",
        description:
          "Monitoreo y Alerta Temprana de Stock Crítico: Alertas automáticas para refrescos (< 1 Litro / 1000 ML) y rellenos de cocina (< 1 Libra) con badges visuales en inventario.",
      },
      {
        type: "improvement",
        description:
          "Filtros avanzados por naturaleza de producto (Refrescos, Licuados y Alimentos, Rellenos, Materias Primas, Venta Directa) en el catálogo de productos.",
      },
      {
        type: "cloud",
        description:
          "Sincronización de esquemas relacionales (suppliers, recipes, recipe_items, production_batches, production_batch_items) en TiDB Cloud Serverless (refresqueriadbdev).",
      },
    ],
  },
  {
    version: "v1.2.2",
    date: "2026-11-04",
    title: "Sistema de Control de Cambios y Versionado Semántico",
    summary:
      "Incorporación del historial interactivo de cambios en la interfaz de usuario y formalización del protocolo de versionado en pmAgent para seguimiento de cada incremento funcional.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        description:
          "Indicador de versión interactivo y discreto en la barra de navegación superior (Navbar).",
      },
      {
        type: "feature",
        description:
          "Modal interactivo de Historial de Versiones (Changelog) con categorización visual por tipo de cambio e insignias semánticas.",
      },
      {
        type: "improvement",
        description:
          "Documento centralizado informes/CHANGELOG.md con la trazabilidad histórica de todos los incrementos funcionales.",
      },
      {
        type: "security",
        description:
          "Actualización de las reglas de gobierno de pmAgent en DevTeam para exigir el registro obligatorio de cambios en todos los proyectos.",
      },
    ],
  },
  {
    version: "v1.2.1",
    date: "2026-11-03",
    title: "Infraestructura Cloud, Multi-Ambiente & Despliegue Continuo",
    summary:
      "Aislamiento de bases de datos para desarrollo y producción en TiDB Cloud, almacenamiento en Google Cloud Storage y automatización CI/CD con monitoreo keep-alive.",
    changes: [
      {
        type: "cloud",
        description:
          "Aprovisionamiento y sincronización de dos bases de datos TiDB Cloud Serverless: refresqueriadbdev (dev) y refresqueriadbprod (prod).",
      },
      {
        type: "cloud",
        description:
          "Integración de Google Cloud Storage (Bucket punto_de_venta) con separación por carpetas dev/ y prod/ para archivos y fotografías.",
      },
      {
        type: "improvement",
        description:
          "Consumo directo de URLs públicas de Google Cloud Storage desde el frontend, acelerando la carga de imágenes en GitHub Pages.",
      },
      {
        type: "cloud",
        description:
          "Pipeline CI/CD automatizado en Render.com mediante Webhook y Deploy Hook en la rama master, y en GitHub Pages vía GitHub Actions.",
      },
      {
        type: "feature",
        description:
          "Endpoint de diagnóstico /api/health con telemetría en vivo y soporte para método HEAD para monitoreo keep-alive 24/7 sin cold-starts.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-11-03",
    title: "Módulo de Inventario, Bebidas Embotelladas & Marcas Relacionales",
    summary:
      "Gestión completa de productos con presentaciones de compra, factores de conversión, cálculo de costo ponderado, imágenes packshot y filtros reactivos.",
    changes: [
      {
        type: "feature",
        description:
          "Catálogo de Productos y Presentaciones de Compra con factores de conversión (Cajas 24x, Charolas 20x, Paquetes 6x, Fardos 24x).",
      },
      {
        type: "feature",
        description:
          "Catálogo relacional de Marcas estandarizadas (The Coca-Cola Company, PepsiCo, Cervecería Centro Americana, Grupo AJE, Kern's, Campbell's, Tampico).",
      },
      {
        type: "feature",
        description:
          "Catálogo de Unidades de Medida base (UND, VASO, ML, G, LB) y Categorías de productos con validación referencial.",
      },
      {
        type: "improvement",
        description:
          "Carga de 27 productos reales con fotografías packshot en fondo blanco, cálculo de costo unitario y alertas de stock mínimo.",
      },
      {
        type: "feature",
        description:
          "Modal ampliado de fotografía de producto con visualización en alta resolución e información detallada de marca y categoría.",
      },
      {
        type: "improvement",
        description:
          "Filtros reactivos combinables por búsqueda textual, categoría, marca y tipo de presentación de compra.",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-11-03",
    title: "Módulo de Restaurante, Áreas y Mesas",
    summary:
      "Organización física del establecimiento mediante salones/áreas y gestión de mesas o espacios de atención al comensal.",
    changes: [
      {
        type: "feature",
        description:
          "Catálogo de Áreas / Salones con descripción, capacidad y estado operativo.",
      },
      {
        type: "feature",
        description:
          "Catálogo de Mesas / Espacios con capacidad de personas, estado (Disponible, Ocupada, Reservada) y asignación a área.",
      },
      {
        type: "security",
        description:
          "Validación de integridad referencial para prevenir la eliminación de áreas con mesas o espacios activos.",
      },
      {
        type: "improvement",
        description:
          "Menú desplegable Restaurante en Navbar con diseño ergonómico de 28rem de ancho.",
      },
    ],
  },
  {
    version: "v1.0.1",
    date: "2026-11-03",
    title: "Panel de Configuración, Backups y Bitácoras de Seguridad",
    summary:
      "Herramientas administrativas para personalización de empresa, generación de copias de seguridad SQL y auditoría de restauraciones.",
    changes: [
      {
        type: "feature",
        description:
          "Panel de Configuración de Empresa: nombre comercial, NIT, dirección, teléfono y subida de logotipo institucional.",
      },
      {
        type: "feature",
        description:
          "Módulo de Copias de Seguridad con generación de archivos .sql consistentes y selector nativo de directorio.",
      },
      {
        type: "feature",
        description:
          "Módulo de Restauración de Base de Datos con validación estricta de estructura previa a la ejecución.",
      },
      {
        type: "security",
        description:
          "Bitácoras auditadas de respaldos y restauraciones con filtros por usuario responsable y rango de fechas.",
      },
      {
        type: "improvement",
        description:
          "Retiro definitivo de credenciales por defecto de la vista de inicio de sesión para entornos productivos.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-11-03",
    title: "Lanzamiento Inicial: Arquitectura Base & Seguridad RBAC",
    summary:
      "Fundamentos del sistema puntoV con autenticación JWT, control de acceso basado en roles N:M y auditoría transversal en base de datos.",
    changes: [
      {
        type: "security",
        description:
          "Autenticación segura con tokens JWT y hashing criptográfico de contraseñas.",
      },
      {
        type: "security",
        description:
          "Modelo de Control de Acceso Basado en Roles (RBAC N:M): 5 Roles base y 32 Permisos granulares organizados por módulos.",
      },
      {
        type: "feature",
        description:
          "Matriz de asignación de permisos por rol (RolePermissionsModal) y asignación múltiple de roles por usuario.",
      },
      {
        type: "security",
        description:
          "Regla obligatoria de auditoría transversal en todas las tablas relacionales (created_at, updated_at, created_by, updated_by).",
      },
      {
        type: "improvement",
        description:
          "Diseño visual ergonómico con fondo claro, textos oscuros y alto contraste según directrices UI/UX.",
      },
    ],
  },
];
