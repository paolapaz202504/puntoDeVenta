import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Role } from "../../types";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  roleToEdit?: Role | null;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  roleToEdit,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const roleNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s/]+$/;

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
    } else {
      setName("");
    }
    setErrorMsg("");
  }, [roleToEdit, isOpen]);

  if (!isOpen) return null;

  const validateName = (val: string) => {
    if (val.length < 3) return "El nombre debe contener al menos 3 caracteres";
    if (val.length > 50) return "El nombre no puede superar los 50 caracteres";
    if (!roleNameRegex.test(val)) {
      return "Solo se permiten caracteres alfanuméricos, acentos y espacios (sin símbolos especiales)";
    }
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
    const validation = validateName(name.trim());
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setLoading(true);

    try {
      if (roleToEdit) {
        await api.put(`/roles/${roleToEdit.id}`, { name: name.trim() });
        toast.success("Rol actualizado exitosamente");
      } else {
        await api.post("/roles", { name: name.trim() });
        toast.success("Rol creado exitosamente");
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al procesar el rol");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {roleToEdit ? "Editar Rol" : "Crear Nuevo Rol"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Nombre del Rol
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={handleNameChange}
              placeholder="Ej. Capitán de Meseros, Bartender"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-900 text-sm focus:ring-2 outline-none transition-all ${
                errorMsg
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errorMsg ? (
              <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                {errorMsg}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Entre 3 y 50 caracteres alfanuméricos, acepta acentos y espacios.
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!errorMsg}
              className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {roleToEdit ? "Actualizar Rol" : "Guardar Rol"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
