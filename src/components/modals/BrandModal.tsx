import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, Building2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Brand } from "../../types";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  brandToEdit?: Brand | null;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  brandToEdit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (brandToEdit) {
      setName(brandToEdit.name);
      setDescription(brandToEdit.description || "");
    } else {
      setName("");
      setDescription("");
    }
    setErrorMsg("");
  }, [brandToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (name.trim().length < 2) return "El nombre debe contener al menos 2 caracteres";
    if (name.trim().length > 80) return "El nombre no puede superar los 80 caracteres";
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
      if (brandToEdit) {
        await api.put(`/brands/${brandToEdit.id}`, {
          name: name.trim(),
          description: description.trim() || null,
        });
        toast.success("Marca actualizada exitosamente");
      } else {
        await api.post("/brands", {
          name: name.trim(),
          description: description.trim() || null,
        });
        toast.success("Marca creada exitosamente");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ocurrió un error al guardar la marca";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {brandToEdit ? "Editar Marca" : "Nueva Marca / Empresa"}
              </h3>
              <p className="text-xs text-slate-500">
                {brandToEdit ? "Modificar datos de la marca comercial" : "Registrar una nueva marca o empresa fabricante"}
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
              Nombre de la Marca o Empresa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Ej. The Coca-Cola Company, PepsiCo / cbc, Cervecería Centro Americana"
              maxLength={80}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
            />
            <p className="mt-1 text-xs text-slate-400">
              De 2 a 80 caracteres.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción o Razón Social (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Embotelladora, distribuidor autorizado o fabricante..."
              maxLength={255}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {brandToEdit ? "Actualizar Marca" : "Crear Marca"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
