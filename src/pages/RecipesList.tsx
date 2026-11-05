import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { Recipe } from "../types";
import { RecipeModal } from "../components/modals/RecipeModal";
import { ProductionModal } from "../components/modals/ProductionModal";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Droplets,
  UtensilsCrossed,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";

export const RecipesList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "recipe_type" | "base_yield" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Modales
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [selectedRecipeIdForProduction, setSelectedRecipeIdForProduction] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/recipes", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          recipe_type: typeFilter || undefined,
          sortBy,
          order,
        },
      });
      setRecipes(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (error: any) {
      console.error("Error al cargar recetas:", error);
      toast.error(error.response?.data?.message || "Error al cargar las recetas");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, sortBy, order]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const toggleOrder = (column: "name" | "recipe_type" | "base_yield" | "created_at") => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1);
  };

  const handleOpenCreate = () => {
    setRecipeToEdit(null);
    setIsRecipeModalOpen(true);
  };

  const handleOpenEdit = (r: Recipe) => {
    setRecipeToEdit(r);
    setIsRecipeModalOpen(true);
  };

  const handleDelete = async (recipe: Recipe) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar la receta "${recipe.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/recipes/${recipe.id}`);
      toast.success("Receta eliminada exitosamente");
      fetchRecipes();
    } catch (error: any) {
      console.error("Error al eliminar receta:", error);
      toast.error(
        error.response?.data?.message ||
          "No se puede eliminar la receta porque ya cuenta con registros de ventas, entradas o salidas."
      );
    }
  };

  const handleOpenProduction = (recipeId: string) => {
    setSelectedRecipeIdForProduction(recipeId);
    setIsProductionOpen(true);
  };

  const getRecipeTypeBadge = (type: string) => {
    switch (type) {
      case "BATCH_SCALABLE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Droplets className="w-3 h-3 mr-1 text-blue-600 shrink-0" />
            Bebida Escalable
          </span>
        );
      case "SUB_RECIPE_BATCH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ChefHat className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
            Relleno Cocina
          </span>
        );
      case "ON_DEMAND_UNIT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <UtensilsCrossed className="w-3 h-3 mr-1 text-purple-600 shrink-0" />
            Ensamble al Vender
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <BookOpen className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Recetas y Fórmulas Base
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fórmulas paramétricas de refrescos naturales en cubetas, rellenos por libra y ensamble en barra ({total} recetas)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setSelectedRecipeIdForProduction(null);
              setIsProductionOpen(true);
            }}
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Elaborar en Cocina</span>
          </button>

          <button
            onClick={handleOpenCreate}
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre de receta o producto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">Todos los Tipos de Receta</option>
            <option value="BATCH_SCALABLE">Refrescos (Cubetas 1 a 10L)</option>
            <option value="SUB_RECIPE_BATCH">Rellenos de Cocina (Por Libra)</option>
            <option value="ON_DEMAND_UNIT">Ensamble al Vender (POS / Vaso)</option>
          </select>

          {(search || typeFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("");
                setPage(1);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Recetas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200 text-left text-sm table-fixed">
            <thead className="bg-slate-50/75">
              <tr>
                <th
                  onClick={() => toggleOrder("name")}
                  className="px-4 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors w-auto"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Receta / Fórmula</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider w-56">
                  Producto Final
                </th>
                <th
                  onClick={() => toggleOrder("recipe_type")}
                  className="px-3 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors w-36"
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <span>Tipo</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleOrder("base_yield")}
                  className="px-3 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors w-32"
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <span>Rendimiento</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center w-28">
                  Insumos
                </th>
                <th className="px-3 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-right w-28">
                  Costo Est.
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-right w-36">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-semibold">Cargando catálogo de recetas...</p>
                  </td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-700">No se encontraron recetas</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || typeFilter
                        ? "Intente con otros criterios de búsqueda o filtros"
                        : "Haga clic en 'Nueva Receta' para registrar su primera fórmula"}
                    </p>
                  </td>
                </tr>
              ) : (
                recipes.map((r) => {
                  const isExpanded = expandedRecipeId === r.id;
                  const canProduce =
                    r.recipe_type === "BATCH_SCALABLE" || r.recipe_type === "SUB_RECIPE_BATCH";

                  // Calcular costo total estimado
                  const totalCost = (r.items || []).reduce((acc, it) => {
                    const cost = it.ingredient?.current_cost || 0;
                    return acc + cost * it.quantity;
                  }, 0);

                  return (
                    <React.Fragment key={r.id}>
                      <tr className="hover:bg-slate-50/75 transition-colors">
                        {/* Nombre de la Receta */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors break-words leading-snug">
                              {r.name}
                            </span>
                            {r.instructions && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 italic">
                                "{r.instructions}"
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Producto Final */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {r.product?.name || "Sin producto"}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {r.product?.code || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Tipo de Receta */}
                        <td className="px-3 py-3 align-middle text-center">
                          {getRecipeTypeBadge(r.recipe_type)}
                        </td>

                        {/* Rendimiento Base */}
                        <td className="px-3 py-3 align-middle text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {r.base_yield} {r.yield_unit}
                          </span>
                        </td>

                        {/* Insumos Requeridos (Botón Acordeón) */}
                        <td className="px-3 py-3 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => setExpandedRecipeId(isExpanded ? null : r.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{r.items?.length || 0} ítems</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        </td>

                        {/* Costo Estimado */}
                        <td className="px-3 py-3 align-middle text-right">
                          <span className="font-mono text-xs font-black text-slate-800">
                            Q{totalCost.toFixed(2)}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end space-x-1.5">
                            {canProduce && (
                              <button
                                type="button"
                                onClick={() => handleOpenProduction(r.id)}
                                title={
                                  r.recipe_type === "BATCH_SCALABLE"
                                    ? "Elaborar cubeta (1-10L)"
                                    : "Preparar relleno en cocina"
                                }
                                className="p-1.5 text-emerald-700 hover:text-white hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer bg-emerald-50 border border-emerald-200"
                              >
                                <ChefHat className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(r)}
                              title="Editar receta"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(r)}
                              title="Eliminar receta"
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Fila Desplegable de Ingredientes */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-3.5">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                                <Boxes className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                Desglose de Materias Primas e Insumos ({r.name}):
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {r.items?.map((it) => (
                                  <div
                                    key={it.id || it.ingredient_id}
                                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-800">
                                        {it.ingredient?.name}
                                      </p>
                                      <span className="text-[10px] text-slate-400">
                                        Stock actual: {it.ingredient?.current_stock} {it.ingredient?.base_unit?.symbol || "UND"}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 block">
                                        {it.quantity} {it.unit}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Mostrando{" "}
              <span className="font-bold text-slate-800">
                {(page - 1) * 10 + 1}
              </span>{" "}
              a{" "}
              <span className="font-bold text-slate-800">
                {Math.min(page * 10, total)}
              </span>{" "}
              de <span className="font-bold text-slate-800">{total}</span> recetas
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>

              <span className="px-2 font-bold text-slate-700">
                Página {page} de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Receta */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onSuccess={() => {
          fetchRecipes();
        }}
        recipeToEdit={recipeToEdit}
      />

      {/* Modal de Producción Ágil en Cocina */}
      <ProductionModal
        isOpen={isProductionOpen}
        onClose={() => setIsProductionOpen(false)}
        onSuccess={() => {
          fetchRecipes();
        }}
        initialRecipeId={selectedRecipeIdForProduction}
      />
    </div>
  );
};
