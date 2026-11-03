import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { MeasurementUnit } from "../types";
import { UnitModal } from "../components/modals/UnitModal";
import { toast } from "sonner";
import {
  Ruler,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  AlertTriangle,
  Package,
} from "lucide-react";

export const UnitsList: React.FC = () => {
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "symbol" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<MeasurementUnit | null>(null);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/units", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          sortBy,
          order,
        },
      });
      setUnits(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar las unidades");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleDelete = async (unit: MeasurementUnit) => {
    const productCount = unit._count?.products || 0;
    if (productCount > 0) {
      toast.error(
        `No es posible eliminar la unidad "${unit.name}" (${unit.symbol}) porque está asignada a ${productCount} producto(s).`
      );
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de eliminar la unidad "${unit.name}" (${unit.symbol})? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/units/${unit.id}`);
      toast.success("Unidad de medida eliminada exitosamente");
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar unidad");
    }
  };

  const toggleOrder = (column: "name" | "symbol" | "created_at") => {
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
            <Ruler className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Unidades de Medida
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Unidades base para inventario, recetas y ventas ({total} unidades registradas)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setUnitToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Unidad
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
            placeholder="Buscar por nombre o símbolo (Ej. UND, Vaso)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
          Total: <span className="text-slate-900 font-bold">{total}</span> unidades
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
                    <span>Nombre de la Unidad</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleOrder("symbol")}
                  className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Símbolo</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Productos Asignados
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-semibold">Cargando unidades de medida...</p>
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Ruler className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-700">No se encontraron unidades</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search ? "Intente con otro término de búsqueda" : "Cree una nueva unidad para comenzar"}
                    </p>
                  </td>
                </tr>
              ) : (
                units.map((unit) => {
                  const productCount = unit._count?.products || 0;
                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mr-3 font-black text-xs border border-indigo-200">
                            <Ruler className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{unit.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300 font-mono tracking-wider">
                          {unit.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            productCount > 0
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <Package className="w-3.5 h-3.5 mr-1" />
                          {productCount} {productCount === 1 ? "producto" : "productos"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(unit.created_at).toLocaleDateString("es-ES", {
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
                            setUnitToEdit(unit);
                            setIsModalOpen(true);
                          }}
                          title="Editar unidad"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(unit)}
                          title={
                            productCount > 0
                              ? "No se puede eliminar porque contiene productos asociados"
                              : "Eliminar unidad"
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            productCount > 0
                              ? "text-slate-300 hover:text-amber-600 hover:bg-amber-50"
                              : "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          {productCount > 0 ? (
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
      <UnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUnitToEdit(null);
        }}
        onSaved={fetchUnits}
        unitToEdit={unitToEdit}
      />
    </div>
  );
};
