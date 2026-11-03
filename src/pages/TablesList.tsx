import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { RestaurantTable, Area } from "../types";
import { TableModal } from "../components/modals/TableModal";
import { toast } from "sonner";
import {
  Utensils,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Filter,
} from "lucide-react";

export const TablesList: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<RestaurantTable | null>(null);

  // Cargar lista de áreas para el filtro
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.get("/areas", {
          params: { limit: 100, sortBy: "name", order: "asc" },
        });
        setAreas(res.data.items || []);
      } catch (error) {
        console.error("Error al cargar áreas para filtro", error);
      }
    };
    fetchAreas();
  }, []);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tables", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          area_id: areaFilter || undefined,
          sortBy,
          order,
        },
      });
      setTables(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar las mesas");
    } finally {
      setLoading(false);
    }
  }, [page, search, areaFilter, sortBy, order]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleDelete = async (table: RestaurantTable) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar la mesa o espacio "${table.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/tables/${table.id}`);
      toast.success("Mesa o espacio eliminado exitosamente");
      fetchTables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar mesa");
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
            <Utensils className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Mesas y Espacios
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Administra las mesas y espacios por área ({total} registros)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setTableToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Mesa / Espacio
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          {/* Input de Búsqueda */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre (Ej. Mesa 1)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filtro por Área */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
          Total: <span className="text-slate-900 font-bold">{total}</span> registros
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/75">
              <tr>
                <th
                  onClick={() => toggleOrder("name")}
                  className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Nombre de Mesa / Espacio</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Área Asignada
                </th>
                <th
                  onClick={() => toggleOrder("created_at")}
                  className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Fecha Registro</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-semibold">Cargando mesas y espacios...</p>
                  </td>
                </tr>
              ) : tables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Utensils className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-700">No se encontraron mesas o espacios</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || areaFilter
                        ? "Intente ajustando los filtros de búsqueda"
                        : "Cree una nueva mesa o espacio para comenzar"}
                    </p>
                  </td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mr-3 font-black text-xs border border-amber-200">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{table.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        {table.area?.name || "Sin área"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(table.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => {
                          setTableToEdit(table);
                          setIsModalOpen(true);
                        }}
                        title="Editar mesa o espacio"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(table)}
                        title="Eliminar mesa o espacio"
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Página <span className="font-bold text-slate-900">{page}</span> de{" "}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTableToEdit(null);
        }}
        onSaved={fetchTables}
        tableToEdit={tableToEdit}
        defaultAreaId={areaFilter || undefined}
      />
    </div>
  );
};
