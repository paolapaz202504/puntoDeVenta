import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, Utensils, CheckCircle2, Loader2, AlertCircle, MapPin } from "lucide-react";
import { RestaurantTable, Area } from "../../types";

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  tableToEdit?: RestaurantTable | null;
  defaultAreaId?: string;
}

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  tableToEdit,
  defaultAreaId,
}) => {
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar lista de áreas disponibles para el selector
  useEffect(() => {
    if (isOpen) {
      const fetchAreas = async () => {
        setLoadingAreas(true);
        try {
          const res = await api.get("/areas", {
            params: { limit: 100, sortBy: "name", order: "asc" },
          });
          setAreas(res.data.items || []);
        } catch (error) {
          toast.error("Error al cargar las áreas disponibles");
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (tableToEdit) {
      setName(tableToEdit.name);
      setAreaId(tableToEdit.area_id);
    } else {
      setName("");
      setAreaId(defaultAreaId || "");
    }
    setErrorMsg("");
  }, [tableToEdit, defaultAreaId, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return "El nombre de la mesa debe contener al menos 3 caracteres";
    if (trimmed.length > 50) return "El nombre de la mesa no puede superar los 50 caracteres";
    if (!areaId) return "Debe seleccionar un área para la mesa";
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
      if (tableToEdit) {
        await api.put(`/tables/${tableToEdit.id}`, {
          name: name.trim(),
          area_id: areaId,
        });
        toast.success("Mesa o espacio actualizado exitosamente");
      } else {
        await api.post("/tables", {
          name: name.trim(),
          area_id: areaId,
        });
        toast.success("Mesa o espacio creado exitosamente");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ocurrió un error al guardar la mesa";
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
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {tableToEdit ? "Editar Mesa / Espacio" : "Nueva Mesa / Espacio"}
              </h3>
              <p className="text-xs text-slate-500">
                {tableToEdit ? "Modificar datos de la mesa o espacio" : "Registrar nueva mesa en el salón"}
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

          {/* Selector de Área */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Área Correspondiente <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <select
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              disabled={loadingAreas}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
            >
              <option value="">-- Seleccione un área --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {areas.length === 0 && !loadingAreas && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ No existen áreas registradas. Debe crear un área primero.
              </p>
            )}
          </div>

          {/* Nombre de la mesa / espacio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre de la Mesa o Espacio <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Ej. Mesa 1, Espacio 2, Barra Central..."
              maxLength={50}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
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
              disabled={loading || !name.trim() || !areaId}
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
                  {tableToEdit ? "Actualizar Mesa" : "Crear Mesa"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
