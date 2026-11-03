import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { Brand } from "../types";
import { BrandModal } from "../components/modals/BrandModal";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Package,
} from "lucide-react";

export const BrandsList: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/brands", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          sortBy,
          order,
        },
      });
      setBrands(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar las marcas");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDelete = async (brand: Brand) => {
    const productCount = brand._count?.products || 0;
    if (productCount > 0) {
      toast.error(
        `No es posible eliminar la marca "${brand.name}" porque contiene ${productCount} producto(s) asignado(s).`
      );
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/brands/${brand.id}`);
      toast.success("Marca eliminada exitosamente");
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar la marca");
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
            <Building2 className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Marcas
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Empresas fabricantes, embotelladoras y marcas comerciales de productos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setBrandToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Marca
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de marca..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
          Total: <span className="text-slate-900 font-bold">{total}</span> marcas registradas
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
                    <span>Marca / Empresa</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
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
                    <p className="text-sm font-semibold">Cargando catálogo de marcas...</p>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-700">No se encontraron marcas</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search ? "Intente con otro término de búsqueda" : "Cree una nueva marca para comenzar"}
                    </p>
                  </td>
                </tr>
              ) : (
                brands.map((b) => {
                  const productCount = b._count?.products || 0;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 font-bold shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 line-clamp-2">
                          {b.description || <span className="text-slate-400 italic">Sin descripción</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            productCount > 0
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <Package className="w-3.5 h-3.5 mr-1" />
                          {productCount} {productCount === 1 ? "producto" : "productos"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="flex items-center space-x-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setBrandToEdit(b);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar marca"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            disabled={productCount > 0}
                            className={`p-1.5 rounded-lg transition-colors ${
                              productCount > 0
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            }`}
                            title={
                              productCount > 0
                                ? `No se puede eliminar: tiene ${productCount} producto(s) asignado(s)`
                                : "Eliminar marca"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBrandToEdit(null);
        }}
        onSaved={fetchBrands}
        brandToEdit={brandToEdit}
      />
    </div>
  );
};
