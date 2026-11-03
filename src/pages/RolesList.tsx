import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { Role } from "../types";
import { RoleModal } from "../components/modals/RoleModal";
import { RolePermissionsModal } from "../components/modals/RolePermissionsModal";
import { toast } from "sonner";
import {
  ShieldCheck,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Key,
} from "lucide-react";

export const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
  const [roleForPerms, setRoleForPerms] = useState<Role | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/roles", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          sortBy,
          order,
        },
      });
      setRoles(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar los roles");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (role: Role) => {
    if (role.name === "Administrador") {
      toast.error("No es posible eliminar el rol Administrador del sistema");
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/roles/${role.id}`);
      toast.success("Rol eliminado exitosamente");
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar rol");
    }
  };

  const toggleOrder = (column: "name" | "created_at") => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ShieldCheck className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Roles y Permisos
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Administra los roles y su matriz de permisos ({total} roles registrados)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setRoleToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Crear Nuevo Rol
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar rol por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="text-xs font-semibold text-slate-600 flex items-center space-x-2">
          <span>Ordenar por:</span>
          <button
            onClick={() => toggleOrder("name")}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center text-xs font-bold"
          >
            Nombre
            <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
          </button>
          <button
            onClick={() => toggleOrder("created_at")}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center text-xs font-bold"
          >
            Fecha
            <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Cargando roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">No se encontraron roles</p>
            <p className="text-sm text-slate-500 mt-1">
              Intente con otro término de búsqueda o cree un nuevo rol.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nombre del Rol
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Permisos Asignados
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mr-3">
                          {role.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900">
                            {role.name}
                          </span>
                          <span className="block text-xs text-slate-400 font-mono">
                            {role.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setRoleForPerms(role);
                          setIsPermsModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Ver y configurar permisos"
                      >
                        <Key className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        {role._count?.permissions || 0} permisos
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {role._count?.users || 0} usuarios
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {new Date(role.created_at).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1 sm:space-x-2">
                      <button
                        onClick={() => {
                          setRoleForPerms(role);
                          setIsPermsModalOpen(true);
                        }}
                        title="Asignar permisos"
                        className="inline-flex items-center p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setRoleToEdit(role);
                          setIsModalOpen(true);
                        }}
                        title="Editar nombre de rol"
                        className="inline-flex items-center p-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        disabled={role.name === "Administrador"}
                        title={
                          role.name === "Administrador"
                            ? "No se puede eliminar"
                            : "Eliminar rol"
                        }
                        className="inline-flex items-center p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Página <span className="font-bold text-slate-900">{page}</span> de{" "}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Rol */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchRoles}
        roleToEdit={roleToEdit}
      />

      {/* Modal de Matriz de Permisos */}
      <RolePermissionsModal
        isOpen={isPermsModalOpen}
        onClose={() => setIsPermsModalOpen(false)}
        role={roleForPerms}
        onSaved={fetchRoles}
      />
    </div>
  );
};
