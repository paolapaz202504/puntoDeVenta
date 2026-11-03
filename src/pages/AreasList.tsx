import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { Area } from "../types";
import { AreaModal } from "../components/modals/AreaModal";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export const AreasList: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/areas", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          sortBy,
          order,
        },
      });
      setAreas(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar las áreas");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleDelete = async (area: Area) => {
    const tableCount = area._count?.tables || 0;
    if (tableCount > 0) {
      toast.error(
        `No es posible eliminar el área "${area.name}" porque contiene ${tableCount} mesa(s) o espacio(s) asignado(s). Debe reasignar o eliminar los espacios primero.`
      );
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de eliminar el área "${area.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/areas/${area.id}`);
      toast.success("Área eliminada exitosamente");
      fetchAreas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar área");
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
            <MapPin className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Áreas
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Administra las zonas y salones del restaurante ({total} áreas registradas)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setAreaToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Área
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar área por nombre..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
          Total: <span className="text-slate-900 font-bold">{total}</span> áreas
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
                    <span>Nombre del Área</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mesas / Espacios Asignados
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
                    <p className="text-sm font-semibold">Cargando catálogo de áreas...</p>
                  </td>
                </tr>
              ) : areas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-700">No se encontraron áreas</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search ? "Intente con otro término de búsqueda" : "Cree una nueva área para comenzar"}
                    </p>
                  </td>
                </tr>
              ) : (
                areas.map((area) => {
                  const tableCount = area._count?.tables || 0;
                  return (
                    <tr key={area.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mr-3 font-black text-xs border border-blue-200">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{area.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            tableCount > 0
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                          {tableCount} {tableCount === 1 ? "mesa / espacio" : "mesas / espacios"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(area.created_at).toLocaleDateString("es-ES", {
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
                            setAreaToEdit(area);
                            setIsModalOpen(true);
                          }}
                          title="Editar área"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(area)}
                          title={
                            tableCount > 0
                              ? "No se puede eliminar porque contiene mesas asociadas"
                              : "Eliminar área"
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            tableCount > 0
                              ? "text-slate-300 hover:text-amber-600 hover:bg-amber-50"
                              : "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          {tableCount > 0 ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
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
      <AreaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAreaToEdit(null);
        }}
        onSaved={fetchAreas}
        areaToEdit={areaToEdit}
      />
    </div>
  );
};
