import React, { useState, useEffect, useCallback } from "react";
import { api, getFileUrl } from "../services/api";
import { toast } from "sonner";
import {
  Settings,
  Building2,
  Database,
  RotateCcw,
  Upload,
  Download,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Folder,
  FolderOpen,
  History,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { SystemSetting, BackupLog, RestoreLog, User } from "../types";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"info" | "backup" | "restore">("info");

  // --- Subpanel 1: Información de Empresa ---
  const [, setSettings] = useState<SystemSetting | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // --- Subpanel 2: Copia de Seguridad ---
  const [customDestination, setCustomDestination] = useState("");
  const [pathError, setPathError] = useState<string | null>(null);
  const [generatingBackup, setGeneratingBackup] = useState(false);
  const [lastGeneratedFile, setLastGeneratedFile] = useState<string | null>(null);
  const [showBackupHistory, setShowBackupHistory] = useState(false);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backupStartDate, setBackupStartDate] = useState("");
  const [backupEndDate, setBackupEndDate] = useState("");
  const [backupUserFilter, setBackupUserFilter] = useState("");

  // --- Subpanel 3: Restaurar Copia ---
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [showRestoreHistory, setShowRestoreHistory] = useState(false);
  const [restoreLogs, setRestoreLogs] = useState<RestoreLog[]>([]);
  const [loadingRestores, setLoadingRestores] = useState(false);
  const [restoreStartDate, setRestoreStartDate] = useState("");
  const [restoreEndDate, setRestoreEndDate] = useState("");
  const [restoreUserFilter, setRestoreUserFilter] = useState("");

  // Lista de usuarios para filtros
  const [usersList, setUsersList] = useState<User[]>([]);

  // 1. Cargar Configuración Inicial y Usuarios
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [settingsRes, usersRes] = await Promise.all([
          api.get("/settings"),
          api.get("/users", { params: { limit: 100 } }),
        ]);

        const s = settingsRes.data.data;
        setSettings(s);
        setCompanyName(s.company_name || "");
        setTaxId(s.tax_id || "");
        setPhone(s.phone || "");
        setEmail(s.email || "");
        setAddress(s.address || "");
        setCurrencySymbol(s.currency_symbol || "$");
        if (s.logo_url) setLogoPreview(s.logo_url);

        setUsersList(usersRes.data.items || []);
      } catch (error: any) {
        toast.error("Error al cargar la configuración");
      }
    };

    fetchInitialData();
  }, []);

  // 2. Guardar Información de Empresa
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await api.put("/settings", {
        company_name: companyName.trim(),
        tax_id: taxId.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        currency_symbol: currencySymbol.trim() || "$",
      });
      setSettings(res.data.data);
      toast.success("Información de la empresa guardada exitosamente");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar información");
    } finally {
      setSavingInfo(false);
    }
  };

  // 3. Subir Logotipo
  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error("Seleccione una imagen para el logotipo");
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      const res = await api.post("/settings/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings(res.data.data);
      setLogoPreview(res.data.data.logo_url);
      setLogoFile(null);
      toast.success("Logotipo guardado exitosamente en files/config");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al subir logotipo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Validación de ruta y nombre de archivo para respaldo
  const validateBackupDestination = (destination: string): { isValid: boolean; message?: string } => {
    const trimmed = destination.trim();
    if (!trimmed) {
      // Es opcional; si está vacío se usa la ruta predeterminada copia_de_seguridad
      return { isValid: true };
    }

    // Caracteres prohibidos en rutas y nombres de archivo en Windows/Unix
    if (/[<>"|?*]/.test(trimmed)) {
      return {
        isValid: false,
        message: 'La ruta o nombre contiene caracteres no permitidos (< > " | ? *)',
      };
    }

    // Dos puntos (:) solo permitidos en letra de unidad Windows (ej. C:\ o D:\)
    const colonCount = (trimmed.match(/:/g) || []).length;
    if (colonCount > 1 || (colonCount === 1 && !/^[a-zA-Z]:[\\/]/.test(trimmed))) {
      return {
        isValid: false,
        message: "Dos puntos (:) solo se permiten en la letra de unidad (ej. C:\\ o D:\\)",
      };
    }

    // Debe terminar en .sql
    if (!trimmed.toLowerCase().endsWith(".sql")) {
      return {
        isValid: false,
        message: "El nombre del archivo debe terminar con la extensión .sql (ej: C:\\Respaldos\\respaldo.sql)",
      };
    }

    // Extraer y validar el nombre del archivo
    const sep = trimmed.includes("\\") ? "\\" : "/";
    const parts = trimmed.split(sep);
    const fileName = parts[parts.length - 1];

    if (!fileName || fileName.trim() === "" || fileName.toLowerCase() === ".sql") {
      return {
        isValid: false,
        message: "Debe especificar un nombre de archivo válido antes de .sql (ej: mi_respaldo.sql)",
      };
    }

    // El nombre del archivo no debe contener barras
    if (/[\\/]/.test(fileName)) {
      return {
        isValid: false,
        message: "El nombre de archivo no puede contener barras",
      };
    }

    return { isValid: true };
  };

  // Selector mediante explorador de archivos nativo
  const handlePickFileLocation = async () => {
    const dateStr = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "_")
      .split(".")[0];
    const suggestedFileName = `backup_puntov_${dateStr}.sql`;

    // 1. Explorador nativo moderno (showSaveFilePicker)
    if (typeof (window as any).showSaveFilePicker === "function") {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: suggestedFileName,
          types: [
            {
              description: "Respaldo de Base de Datos (*.sql)",
              accept: { "application/sql": [".sql"] },
            },
          ],
        });

        if (handle && handle.name) {
          setCustomDestination((prev) => {
            const trimmed = prev.trim();
            if (trimmed.includes("\\") || trimmed.includes("/")) {
              const sep = trimmed.includes("\\") ? "\\" : "/";
              const parts = trimmed.split(sep);
              parts.pop();
              return `${parts.join(sep)}${sep}${handle.name}`;
            }
            return `C:\\RespaldosPOS\\${handle.name}`;
          });
          setPathError(null);
          toast.success(`Archivo y ubicación configurados: ${handle.name}`);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error al abrir explorador de archivos:", err);
        }
      }
      return;
    }

    // 2. Si solo soporta selector de directorio (showDirectoryPicker)
    if (typeof (window as any).showDirectoryPicker === "function") {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          setCustomDestination(`C:\\${dirHandle.name}\\${suggestedFileName}`);
          setPathError(null);
          toast.info(`Carpeta asignada: ${dirHandle.name}\\${suggestedFileName}`);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error al seleccionar carpeta:", err);
        }
      }
      return;
    }

    // 3. Fallback de ruta sugerida si el navegador no expone File System Access API
    setCustomDestination(`C:\\RespaldosPOS\\${suggestedFileName}`);
    setPathError(null);
    toast.info(`Ruta de resguardo configurada: C:\\RespaldosPOS\\${suggestedFileName}`);
  };

  // 4. Generar Respaldo
  const handleGenerateBackup = async () => {
    // Validar ruta y nombre de archivo antes de procesar
    const validation = validateBackupDestination(customDestination);
    if (!validation.isValid) {
      setPathError(validation.message || "Ruta o nombre de archivo inválido");
      toast.error(validation.message || "Ruta o nombre de archivo inválido");
      return;
    }
    setPathError(null);

    setGeneratingBackup(true);
    try {
      const res = await api.post("/backups/generate", {
        custom_destination: customDestination.trim() || undefined,
      });

      setLastGeneratedFile(res.data.data.filename);
      toast.success(
        `Copia de seguridad generada con éxito (${res.data.data.fileSize})`
      );
      if (showBackupHistory) {
        fetchBackupLogs();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al generar respaldo");
    } finally {
      setGeneratingBackup(false);
    }
  };

  // 5. Cargar Historial de Respaldos
  const fetchBackupLogs = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const res = await api.get("/backups/history", {
        params: {
          startDate: backupStartDate || undefined,
          endDate: backupEndDate || undefined,
          userId: backupUserFilter || undefined,
          limit: 20,
        },
      });
      setBackupLogs(res.data.items || []);
    } catch (error: any) {
      toast.error("Error al cargar historial de respaldos");
    } finally {
      setLoadingBackups(false);
    }
  }, [backupStartDate, backupEndDate, backupUserFilter]);

  useEffect(() => {
    if (showBackupHistory) {
      fetchBackupLogs();
    }
  }, [showBackupHistory, fetchBackupLogs]);

  // 6. Cargar Historial de Restauraciones
  const fetchRestoreLogs = useCallback(async () => {
    setLoadingRestores(true);
    try {
      const res = await api.get("/backups/restore-history", {
        params: {
          startDate: restoreStartDate || undefined,
          endDate: restoreEndDate || undefined,
          userId: restoreUserFilter || undefined,
          limit: 20,
        },
      });
      setRestoreLogs(res.data.items || []);
    } catch (error: any) {
      toast.error("Error al cargar historial de restauraciones");
    } finally {
      setLoadingRestores(false);
    }
  }, [restoreStartDate, restoreEndDate, restoreUserFilter]);

  useEffect(() => {
    if (showRestoreHistory) {
      fetchRestoreLogs();
    }
  }, [showRestoreHistory, fetchRestoreLogs]);

  // 7. Descargar Respaldo
  const handleDownloadBackup = (filename: string) => {
    window.open(`/api/backups/download/${encodeURIComponent(filename)}`, "_blank");
  };

  // 8. Restaurar Base de Datos
  const handleExecuteRestore = async () => {
    if (!restoreFile) {
      toast.error("Seleccione un archivo de volcado .sql");
      return;
    }

    if (
      !window.confirm(
        "⚠️ ADVERTENCIA: Esta acción sobreescribirá la base de datos con el archivo seleccionado.\n\nPor seguridad, el sistema creará automáticamente un respaldo previo de resguardo.\n\n¿Desea continuar?"
      )
    ) {
      return;
    }

    setRestoring(true);
    const formData = new FormData();
    formData.append("backup_file", restoreFile);

    try {
      const res = await api.post("/backups/restore", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `¡Base de datos restaurada! Se generó respaldo preventivo: ${res.data.data.autoBackupFilename}`
      );
      setRestoreFile(null);
      if (showRestoreHistory) {
        fetchRestoreLogs();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al restaurar base de datos");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <Settings className="w-7 h-7 mr-2.5 text-blue-600" />
          Configuración del Sistema
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Administración de identidad empresarial, respaldos de base de datos y restauración
        </p>
      </div>

      {/* Tabs Principales */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3.5 px-3 text-sm font-bold border-b-2 flex items-center transition-colors cursor-pointer ${
              activeTab === "info"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            1. Información de la Empresa
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`pb-3.5 px-3 text-sm font-bold border-b-2 flex items-center transition-colors cursor-pointer ${
              activeTab === "backup"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Database className="w-4 h-4 mr-2" />
            2. Copia de Seguridad
          </button>

          <button
            onClick={() => setActiveTab("restore")}
            className={`pb-3.5 px-3 text-sm font-bold border-b-2 flex items-center transition-colors cursor-pointer ${
              activeTab === "restore"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            3. Restaurar Copia
          </button>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* SUBPANEL 1: INFORMACIÓN DE EMPRESA                       */}
      {/* ========================================================= */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Datos */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Datos Comerciales y de Facturación
            </h3>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Nombre del Restaurante / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej. Restaurante El Buen Sabor"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Identificación Fiscal (RFC / NIT / CIF)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Ej. ABC123456XYZ"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +52 55 1234 5678"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@restaurante.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Símbolo de Moneda
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="$, Q, €, MXN"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Dirección Comercial (para impresión en tickets)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Av. Principal #123, Col. Centro"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingInfo}
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingInfo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Guardar Información
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Subida de Logotipo */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
              Logotipo Oficial
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Se resguarda en la carpeta <code className="font-mono text-blue-700">files/config</code>
            </p>

            <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden mb-4 p-2 shadow-inner">
              {logoPreview ? (
                <img
                  src={getFileUrl(logoPreview)}
                  alt="Logotipo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                  Sin logotipo cargado
                </div>
              )}
            </div>

            <input
              type="file"
              id="logo-upload"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                }
              }}
              className="hidden"
            />

            <div className="space-y-2 w-full">
              <label
                htmlFor="logo-upload"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4 mr-1.5 text-slate-500" />
                {logoFile ? "Cambiar archivo seleccionado" : "Seleccionar imagen"}
              </label>

              {logoFile && (
                <button
                  type="button"
                  onClick={handleUploadLogo}
                  disabled={uploadingLogo}
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirmar y Guardar Logotipo
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBPANEL 2: COPIA DE SEGURIDAD                            */}
      {/* ========================================================= */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Generación de Copia de Seguridad
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              El sistema generará un volcado estructurado de la base de datos y lo almacenará automáticamente en la carpeta <code className="font-mono text-blue-700 font-bold">copia_de_seguridad</code>.
            </p>

            <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center">
                  <Folder className="w-4 h-4 mr-1 text-slate-500" />
                  Carpeta y Archivo de Resguardo Personalizado (Opcional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDestination}
                    onChange={(e) => {
                      setCustomDestination(e.target.value);
                      if (pathError) setPathError(null);
                    }}
                    placeholder="Ej. C:\RespaldosPOS\respaldo_puntov.sql"
                    className={`flex-1 px-3.5 py-2.5 bg-white border ${
                      pathError
                        ? "border-rose-500 ring-1 ring-rose-500"
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500"
                    } rounded-lg text-slate-900 text-sm font-medium outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={handlePickFileLocation}
                    title="Seleccionar carpeta y nombre de archivo mediante el explorador"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 rounded-lg shadow-sm text-sm font-bold transition-all cursor-pointer gap-1.5 shrink-0"
                  >
                    <FolderOpen className="w-4 h-4 text-amber-600" />
                    <span>Examinar...</span>
                  </button>
                </div>
                {pathError ? (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center">
                    <XCircle className="w-3.5 h-3.5 mr-1 inline shrink-0" />
                    {pathError}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Haga clic en <strong>Examinar...</strong> para elegir la carpeta y nombre del archivo con extensión <code className="font-mono text-blue-700">.sql</code>, o ingréselo manualmente.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateBackup}
                  disabled={generatingBackup}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {generatingBackup ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generando volcado SQL...
                    </>
                  ) : (
                    <>
                      <Database className="w-5 h-5 mr-2" />
                      Generar Copia de Seguridad Ahora
                    </>
                  )}
                </button>

                {lastGeneratedFile && (
                  <button
                    type="button"
                    onClick={() => handleDownloadBackup(lastGeneratedFile)}
                    className="inline-flex items-center px-4 py-3 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2 text-emerald-600" />
                    Descargar Último Respaldo ({lastGeneratedFile})
                  </button>
                )}
              </div>
            </div>

            {/* Vínculo para Historial de Bitácora */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowBackupHistory(!showBackupHistory)}
                className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 cursor-pointer underline"
              >
                <History className="w-4 h-4 mr-1.5" />
                {showBackupHistory
                  ? "Ocultar Historial de Bitácora de Respaldos"
                  : "📋 Ver Historial de Bitácora de Respaldos"}
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Auditoría completa de copias de seguridad
              </span>
            </div>
          </div>

          {/* HISTORIAL Y FILTROS DE RESPALDOS */}
          {showBackupHistory && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center">
                  <History className="w-5 h-5 mr-2 text-slate-700" />
                  Bitácora de Copias de Seguridad Realizadas
                </h4>

                <button
                  type="button"
                  onClick={fetchBackupLogs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  Actualizar Lista
                </button>
              </div>

              {/* Filtros de Bitácora */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Desde:</span>
                  <input
                    type="date"
                    value={backupStartDate}
                    onChange={(e) => setBackupStartDate(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Hasta:</span>
                  <input
                    type="date"
                    value={backupEndDate}
                    onChange={(e) => setBackupEndDate(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Usuario:</span>
                  <select
                    value={backupUserFilter}
                    onChange={(e) => setBackupUserFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="">Todos los usuarios</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (@{u.user})
                      </option>
                    ))}
                  </select>
                </div>

                {(backupStartDate || backupEndDate || backupUserFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBackupStartDate("");
                      setBackupEndDate("");
                      setBackupUserFilter("");
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>

              {/* Tabla de Bitácora */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                {loadingBackups ? (
                  <div className="py-12 flex justify-center items-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
                    Cargando bitácora de respaldos...
                  </div>
                ) : backupLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm font-semibold">
                    No se encontraron registros de copias de seguridad con los filtros aplicados.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Fecha y Hora</th>
                        <th className="px-4 py-3">Usuario</th>
                        <th className="px-4 py-3">Nombre del Archivo</th>
                        <th className="px-4 py-3">Tamaño</th>
                        <th className="px-4 py-3">Ruta de Destino</th>
                        <th className="px-4 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-xs">
                      {backupLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("es-MX")}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            <span className="font-bold">{log.user_name}</span>{" "}
                            <span className="text-slate-500">(@{log.user_login})</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                            {log.filename}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {log.file_size_formatted}
                          </td>
                          <td className="px-4 py-3 text-slate-500 truncate max-w-xs" title={log.custom_destination || log.file_path}>
                            {log.custom_destination || "copia_de_seguridad/"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDownloadBackup(log.filename)}
                              className="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold rounded border border-slate-200 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Descargar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBPANEL 3: RESTAURAR COPIA                               */}
      {/* ========================================================= */}
      {activeTab === "restore" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2 text-rose-600" />
              Restaurar Base de Datos desde Respaldo
            </h3>

            {/* Alerta de seguridad sobre el auto-backup previo */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  Protocolo de Protección Automática
                </p>
                <p>
                  El archivo importado se guardará en la carpeta <code className="font-mono font-bold">importar_base_de_datos</code>.
                </p>
                <p className="font-semibold">
                  ⚠️ Previo a la sobreescritura, el sistema generará automáticamente una copia de seguridad en la carpeta <code className="font-mono">copia_de_seguridad</code> para que nunca pierdas datos si necesitas volver atrás.
                </p>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Seleccionar Documento de Respaldo (.sql)
                </label>
                <input
                  type="file"
                  accept=".sql,text/plain"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRestoreFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-300 rounded-xl p-1"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={restoring || !restoreFile}
                  className="inline-flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {restoring ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generando auto-backup y restaurando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Restaurar Base de Datos Ahora
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Vínculo para Historial de Restauraciones */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowRestoreHistory(!showRestoreHistory)}
                className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 cursor-pointer underline"
              >
                <History className="w-4 h-4 mr-1.5" />
                {showRestoreHistory
                  ? "Ocultar Historial de Bitácora de Restauraciones"
                  : "📋 Ver Historial de Bitácora de Restauraciones"}
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Auditoría completa de restauraciones
              </span>
            </div>
          </div>

          {/* HISTORIAL Y FILTROS DE RESTAURACIONES */}
          {showRestoreHistory && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center">
                  <History className="w-5 h-5 mr-2 text-slate-700" />
                  Bitácora de Restauraciones de Base de Datos
                </h4>

                <button
                  type="button"
                  onClick={fetchRestoreLogs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  Actualizar Lista
                </button>
              </div>

              {/* Filtros de Bitácora */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Desde:</span>
                  <input
                    type="date"
                    value={restoreStartDate}
                    onChange={(e) => setRestoreStartDate(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Hasta:</span>
                  <input
                    type="date"
                    value={restoreEndDate}
                    onChange={(e) => setRestoreEndDate(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Usuario:</span>
                  <select
                    value={restoreUserFilter}
                    onChange={(e) => setRestoreUserFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <option value="">Todos los usuarios</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (@{u.user})
                      </option>
                    ))}
                  </select>
                </div>

                {(restoreStartDate || restoreEndDate || restoreUserFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRestoreStartDate("");
                      setRestoreEndDate("");
                      setRestoreUserFilter("");
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>

              {/* Tabla de Bitácora */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                {loadingRestores ? (
                  <div className="py-12 flex justify-center items-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
                    Cargando bitácora de restauraciones...
                  </div>
                ) : restoreLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm font-semibold">
                    No se encontraron registros de restauraciones con los filtros aplicados.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Fecha y Hora</th>
                        <th className="px-4 py-3">Usuario Responsable</th>
                        <th className="px-4 py-3">Archivo Importado</th>
                        <th className="px-4 py-3">Tamaño</th>
                        <th className="px-4 py-3">Respaldo Automático Previo</th>
                        <th className="px-4 py-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-xs">
                      {restoreLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("es-MX")}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            <span className="font-bold">{log.user_name}</span>{" "}
                            <span className="text-slate-500">(@{log.user_login})</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                            {log.imported_filename}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {log.file_size_formatted}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-blue-700">
                            {log.auto_backup_filename}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {log.status === "SUCCESS" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Exitoso
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200" title={log.error_message || "Error"}>
                                <XCircle className="w-3 h-3 mr-1" />
                                Fallido
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
