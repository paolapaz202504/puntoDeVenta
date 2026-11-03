import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, MapPin, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Area } from "../../types";

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  areaToEdit?: Area | null;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  areaToEdit,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (areaToEdit) {
      setName(areaToEdit.name);
    } else {
      setName("");
    }
    setErrorMsg("");
  }, [areaToEdit, isOpen]);

  if (!isOpen) return null;

  const validateName = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.length < 3) return "El nombre del área debe contener al menos 3 caracteres";
    if (trimmed.length > 50) return "El nombre del área no puede superar los 50 caracteres";
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (val.trim()) {
      setErrorMsg(validateName(val));
    } else {
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateName(name);
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setLoading(true);

    try {
      if (areaToEdit) {
        await api.put(`/areas/${areaToEdit.id}`, { name: name.trim() });
        toast.success("Área actualizada exitosamente");
      } else {
        await api.post("/areas", { name: name.trim() });
        toast.success("Área creada exitosamente");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ocurrió un error al guardar el área";
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
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {areaToEdit ? "Editar Área" : "Nueva Área"}
              </h3>
              <p className="text-xs text-slate-500">
                {areaToEdit ? "Modificar datos del área" : "Registrar nueva zona en el restaurante"}
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
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del Área <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej. Terraza Principal, Salón VIP, Barra #1..."
              maxLength={50}
              autoFocus
              className={`w-full px-3.5 py-2.5 bg-white border ${
                errorMsg ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-300 focus:ring-2 focus:ring-blue-500"
              } rounded-xl text-slate-900 text-sm font-medium outline-none transition-all shadow-xs`}
            />
            <div className="flex justify-between items-center mt-1.5 text-xs text-slate-400">
              <span>De 3 a 50 caracteres (alfanumérico, espacios y símbolos)</span>
              <span>{name.length}/50</span>
            </div>
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
              disabled={loading || !name.trim()}
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
                  {areaToEdit ? "Actualizar Área" : "Crear Área"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
