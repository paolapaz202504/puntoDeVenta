import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { User, Role } from "../types";
import { UserModal } from "../components/modals/UserModal";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Shield,
  KeyRound,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "user" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get("/roles", { params: { limit: 100 } });
      setRoles(res.data.items);
    } catch (e) {
      console.error("Error al cargar roles", e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          roleId: roleFilter,
          isActive: activeFilter,
          sortBy,
          order,
        },
      });
      setUsers(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter, sortBy, order]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (user: User) => {
    if (user.user === "admin") {
      toast.error("No es posible eliminar el usuario administrador predeterminado");
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de eliminar al usuario "${user.name}" (@${user.user})?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      toast.success("Usuario eliminado exitosamente");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar usuario");
    }
  };

  const toggleOrder = (column: "name" | "user" | "created_at") => {
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
            <Users className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Usuarios
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Administra empleados y sus roles asignados ({total} registrados)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setUserToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Crear Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
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
            placeholder="Buscar por nombre, usuario o email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro por Rol */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Filtro por Estado */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="true">Solo Activos</option>
            <option value="false">Solo Inactivos</option>
          </select>

          {/* Ordenar */}
          <button
            onClick={() => toggleOrder("name")}
            className="px-2.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center text-xs font-bold"
          >
            Nombre
            <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">No se encontraron usuarios</p>
            <p className="text-sm text-slate-500 mt-1">
              Verifique los filtros aplicados o cree un nuevo empleado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Empleado / Usuario
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Roles Asignados
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contacto / PIN
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center font-bold text-sm mr-3">
                          {u.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">
                            {u.name}
                          </span>
                          <span className="text-xs font-semibold text-blue-600 font-mono">
                            @{u.user}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {u.roles.map((r) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            <Shield className="w-3 h-3 mr-1 text-blue-500" />
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div>
                        {u.email ? (
                          <span className="text-xs text-slate-700 font-medium block">
                            {u.email}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic block">
                            Sin correo
                          </span>
                        )}
                        {u.pin_code && (
                          <span className="inline-flex items-center text-xs font-bold text-slate-600 mt-0.5">
                            <KeyRound className="w-3 h-3 mr-1 text-amber-500" />
                            PIN: ••••
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {new Date(u.created_at).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setUserToEdit(u);
                          setIsModalOpen(true);
                        }}
                        title="Editar usuario"
                        className="inline-flex items-center p-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={u.user === "admin"}
                        title={
                          u.user === "admin"
                            ? "No se puede eliminar al admin"
                            : "Eliminar usuario"
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

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchUsers}
        userToEdit={userToEdit}
        rolesList={roles}
      />
    </div>
  );
};
