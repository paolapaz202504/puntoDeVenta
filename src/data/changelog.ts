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

export const CURRENT_VERSION = "v1.2.2";

export const CHANGELOG_DATA: ReleaseVersion[] = [
  {
    version: "v1.2.2",
    date: "2026-11-04",
    title: "Sistema de Control de Cambios y Versionado Semántico",
    summary:
      "Incorporación del historial interactivo de cambios en la interfaz de usuario y formalización del protocolo de versionado en pmAgent para seguimiento de cada incremento funcional.",
    isLatest: true,
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
