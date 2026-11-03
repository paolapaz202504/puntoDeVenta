import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  CheckSquare,
  Square,
  Layers,
  Info,
} from "lucide-react";
import { Role, Permission } from "../../types";

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSaved: () => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  onSaved,
}) => {
  const [groupedPermissions, setGroupedPermissions] = useState<
    Record<string, Permission[]>
  >({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !role) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [permsRes, rolePermsRes] = await Promise.all([
          api.get("/permissions"),
          api.get(`/permissions/roles/${role.id}`),
        ]);

        setGroupedPermissions(permsRes.data.grouped);
        setSelectedIds(new Set(rolePermsRes.data.data.permissionIds));
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Error al cargar la matriz de permisos"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, role]);

  if (!isOpen || !role) return null;

  const togglePermission = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const toggleModule = (modulePerms: Permission[]) => {
    const allSelected = modulePerms.every((p) => selectedIds.has(p.id));
    const updated = new Set(selectedIds);

    if (allSelected) {
      modulePerms.forEach((p) => updated.delete(p.id));
    } else {
      modulePerms.forEach((p) => updated.add(p.id));
    }
    setSelectedIds(updated);
  };

  const selectAll = () => {
    const all = new Set<string>();
    Object.values(groupedPermissions).forEach((list) => {
      list.forEach((p) => all.add(p.id));
    });
    setSelectedIds(all);
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/permissions/roles/${role.id}`, {
        permission_ids: Array.from(selectedIds),
      });
      toast.success(
        `Permisos asignados correctamente al rol "${role.name}"`
      );
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al guardar los permisos"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Matriz de Permisos — Rol: {role.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {selectedIds.size} permisos seleccionados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones Rápidas */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs font-semibold text-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
            >
              Seleccionar Todos
            </button>
            <button
              onClick={clearAll}
              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              Limpiar Selección
            </button>
          </div>
          <span className="text-blue-900 hidden sm:inline flex items-center">
            <Info className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Haga clic en los módulos para selección masiva
          </span>
        </div>

        {/* Contenedor de Módulos (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                Cargando matriz de permisos...
              </p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([moduleName, perms]) => {
              const allModuleSelected = perms.every((p) => selectedIds.has(p.id));

              return (
                <div
                  key={moduleName}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Cabecera del Módulo */}
                  <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                        Módulo: {moduleName}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {perms.filter((p) => selectedIds.has(p.id)).length} de{" "}
                        {perms.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleModule(perms)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                    >
                      {allModuleSelected ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Desmarcar Módulo
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Marcar Todo el Módulo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Listado de Permisos del Módulo */}
                  <div className="divide-y divide-slate-100 p-2">
                    {perms.map((p) => {
                      const isChecked = selectedIds.has(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? "bg-blue-50/50" : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.id)}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900">
                                {p.name}
                              </span>
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {p.slug}
                              </span>
                            </div>
                            {p.description && (
                              <p className="text-xs text-slate-600 mt-0.5">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center flex-shrink-0">
          <span className="text-xs font-semibold text-slate-600">
            Total asignados:{" "}
            <span className="font-bold text-slate-900">
              {selectedIds.size}
            </span>
          </span>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando matriz...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Guardar Permisos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
