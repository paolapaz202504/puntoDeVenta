import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, Ruler, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { MeasurementUnit } from "../../types";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  unitToEdit?: MeasurementUnit | null;
}

export const UnitModal: React.FC<UnitModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  unitToEdit,
}) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (unitToEdit) {
      setName(unitToEdit.name);
      setSymbol(unitToEdit.symbol);
    } else {
      setName("");
      setSymbol("");
    }
    setErrorMsg("");
  }, [unitToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (name.trim().length < 2) return "El nombre debe contener al menos 2 caracteres";
    if (name.trim().length > 50) return "El nombre no puede superar los 50 caracteres";
    if (symbol.trim().length < 1) return "El símbolo es obligatorio";
    if (symbol.trim().length > 10) return "El símbolo no puede superar los 10 caracteres";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setLoading(true);

    try {
      if (unitToEdit) {
        await api.put(`/units/${unitToEdit.id}`, {
          name: name.trim(),
          symbol: symbol.trim().toUpperCase(),
        });
        toast.success("Unidad de medida actualizada exitosamente");
      } else {
        await api.post("/units", {
          name: name.trim(),
          symbol: symbol.trim().toUpperCase(),
        });
        toast.success("Unidad de medida creada exitosamente");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ocurrió un error al guardar la unidad";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {unitToEdit ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}
              </h3>
              <p className="text-xs text-slate-500">
                {unitToEdit ? "Modificar magnitud de inventario" : "Registrar unidad de medición"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs animate-in shake duration-150">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre de la Unidad <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Ej. Unidad, Vaso, Mililitro, Gramo..."
              maxLength={50}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Símbolo o Abreviatura <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value.toUpperCase());
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Ej. UND, VASO, ML, G, LB..."
              maxLength={10}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-bold tracking-wider uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
            />
            <p className="mt-1 text-xs text-slate-400">
              Símbolo estándar en mayúsculas (1 a 10 caracteres).
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !symbol.trim()}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {unitToEdit ? "Actualizar Unidad" : "Crear Unidad"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
