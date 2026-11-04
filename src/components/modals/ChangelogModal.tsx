import React, { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  Calendar,
  History,
} from "lucide-react";
import {
  CHANGELOG_DATA,
  CURRENT_VERSION,
  ChangeItem,
} from "../../data/changelog";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderBadge = (type: ChangeItem["type"]) => {
    switch (type) {
      case "feature":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
            Novedad
          </span>
        );
      case "improvement":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Zap className="w-3 h-3 mr-1 text-amber-600" />
            Mejora
          </span>
        );
      case "security":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
            Seguridad
          </span>
        );
      case "cloud":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Cloud className="w-3 h-3 mr-1 text-purple-600" />
            Infraestructura
          </span>
        );
      case "fix":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-rose-600" />
            Corrección
          </span>
        );
    }
  };

  const filteredReleases =
    selectedVersion === "all"
      ? CHANGELOG_DATA
      : CHANGELOG_DATA.filter((r) => r.version === selectedVersion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Fondo para cerrar al hacer clic */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Contenedor del Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Control de Cambios y Versiones
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  {CURRENT_VERSION} Activa
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Bitácora de incrementos funcionales y evolutivos del sistema puntoV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtro Rápido */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Filtrar por versión:
          </span>
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedVersion("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedVersion === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas ({CHANGELOG_DATA.length})
            </button>
            {CHANGELOG_DATA.map((r) => (
              <button
                key={r.version}
                onClick={() => setSelectedVersion(r.version)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedVersion === r.version
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r.version}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Versiones (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {filteredReleases.map((release) => (
            <div
              key={release.version}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                release.isLatest
                  ? "border-blue-300 ring-2 ring-blue-500/10"
                  : "border-slate-200"
              }`}
            >
              {/* Encabezado de la versión */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`font-mono text-sm font-black px-2.5 py-1 rounded-xl shadow-2xs ${
                      release.isLatest
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {release.version}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {release.title}
                  </h4>
                  {release.isLatest && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Actual
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{release.date}</span>
                </div>
              </div>

              {/* Resumen del hito */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3 mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {release.summary}
              </p>

              {/* Desglose de cambios */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cambios e incrementos incluidos:
                </h5>
                <ul className="space-y-2.5">
                  {release.changes.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-xs sm:text-sm text-slate-800"
                    >
                      <div className="shrink-0 mr-2 mt-0.5">
                        {renderBadge(item.type)}
                      </div>
                      <span className="font-medium text-slate-700 leading-snug">
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            pmAgent • DevTeam • Control de Calidad y Entregables
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
