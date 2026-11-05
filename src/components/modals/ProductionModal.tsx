import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Recipe } from "../../types";
import { toast } from "sonner";
import {
  X,
  ChefHat,
  Droplets,
  Package,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRecipeId?: string | null;
}

export const ProductionModal: React.FC<ProductionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRecipeId,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [containerCapacity, setContainerCapacity] = useState<number>(5); // 5 Litros por defecto
  const [poundsMultiplier, setPoundsMultiplier] = useState<number>(5); // 5 Libras por defecto
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(true);

  // Cargar recetas activas
  useEffect(() => {
    if (!isOpen) return;

    const fetchRecipes = async () => {
      setLoadingRecipes(true);
      try {
        const res = await api.get("/recipes", { params: { limit: 100 } });
        const allRecipes: Recipe[] = res.data.items || [];
        // Filtrar recetas que sean de elaboración por tandas (Refrescos y Sub-ensambles)
        const batchRecipes = allRecipes.filter(
          (r) => r.recipe_type === "BATCH_SCALABLE" || r.recipe_type === "SUB_RECIPE_BATCH"
        );
        setRecipes(batchRecipes);

        if (initialRecipeId) {
          setSelectedRecipeId(initialRecipeId);
          const found = batchRecipes.find((r) => r.id === initialRecipeId);
          if (found) setSelectedRecipe(found);
        } else if (batchRecipes.length > 0) {
          setSelectedRecipeId(batchRecipes[0].id);
          setSelectedRecipe(batchRecipes[0]);
        }
      } catch (error) {
        console.error("Error al cargar recetas", error);
        toast.error("No se pudieron cargar las recetas de cocina");
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [isOpen, initialRecipeId]);

  // Actualizar receta seleccionada
  useEffect(() => {
    if (!selectedRecipeId || recipes.length === 0) return;
    const found = recipes.find((r) => r.id === selectedRecipeId);
    if (found) {
      setSelectedRecipe(found);
      if (found.recipe_type === "BATCH_SCALABLE") {
        setContainerCapacity(5); // 5L estándar
      } else {
        setPoundsMultiplier(5); // 5 LB estándar
      }
    }
  }, [selectedRecipeId, recipes]);

  if (!isOpen) return null;

  const isBeverage = selectedRecipe?.recipe_type === "BATCH_SCALABLE";

  // Multiplicador efectivo
  const effectiveMultiplier = isBeverage
    ? containerCapacity / (Number(selectedRecipe?.base_yield || 1000) / 1000)
    : poundsMultiplier;

  // Rendimiento total esperado
  const totalProduced = isBeverage
    ? containerCapacity * 1000 // en ML
    : poundsMultiplier * Number(selectedRecipe?.base_yield || 1); // en LB

  const handleConfirm = async () => {
    if (!selectedRecipe) return;

    setLoading(true);
    try {
      const payload = {
        recipe_id: selectedRecipe.id,
        container_capacity_liters: isBeverage ? containerCapacity : null,
        multiplier: effectiveMultiplier,
        notes:
          notes ||
          (isBeverage
            ? `Cubeta de ${containerCapacity} Litros elaborada`
            : `Tanda de ${poundsMultiplier} Libras preparada`),
      };

      await api.post("/production/batches", payload);
      toast.success(
        isBeverage
          ? `¡Cubeta de ${containerCapacity}L de ${selectedRecipe.product?.name} ingresada exitosamente!`
          : `¡${poundsMultiplier} Libras de ${selectedRecipe.product?.name} ingresadas a cocina!`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al registrar producción", error);
      toast.error(error.response?.data?.message || "Error al registrar la producción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera con ícono de cocina */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Elaboración Ágil de Cocina y Barra
              </h3>
              <p className="text-xs text-blue-100">
                Incrementa el inventario de producto listo y descuenta materias primas en 1 clic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loadingRecipes ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium">Cargando recetas de cocina...</p>
            </div>
          ) : (
            <>
              {/* Selector de Producto / Receta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Seleccione el Refresco o Relleno a Preparar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                  {recipes.map((r) => {
                    const isSelected = r.id === selectedRecipeId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRecipeId(r.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-white border-slate-200 hover:border-blue-400 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : r.recipe_type === "BATCH_SCALABLE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {r.recipe_type === "BATCH_SCALABLE" ? "Refresco" : "Relleno"}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p className="text-xs font-bold leading-tight line-clamp-2">
                          {r.product?.name || r.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de Capacidad de Cubeta o Libras */}
              {selectedRecipe && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center">
                        {isBeverage ? (
                          <>
                            <Droplets className="w-4 h-4 mr-1.5 text-blue-600" />
                            2. Capacidad de la Cubeta Utilizada (1 a 10 Litros)
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4 mr-1.5 text-emerald-600" />
                            2. Cantidad en Libras Preparada
                          </>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isBeverage
                          ? "Seleccione el tamaño real de la cubeta para escalar los insumos"
                          : "Seleccione cuántas libras de relleno cocinó"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold uppercase block">
                        Rendimiento Final
                      </span>
                      <span className="text-base font-black text-blue-700">
                        {isBeverage
                          ? `${totalProduced.toLocaleString()} ML (${containerCapacity}L)`
                          : `${totalProduced} Libras`}
                      </span>
                    </div>
                  </div>

                  {isBeverage ? (
                    /* Botones Rápidos de Cubetas: 1L a 10L */
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((liters) => (
                          <button
                            key={liters}
                            type="button"
                            onClick={() => setContainerCapacity(liters)}
                            className={`py-2 px-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              containerCapacity === liters
                                ? "bg-blue-600 text-white shadow-xs scale-105"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                          >
                            {liters}L
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1 text-xs">
                        <span className="text-slate-500">¿Otra capacidad?</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="50"
                          value={containerCapacity}
                          onChange={(e) => setContainerCapacity(Number(e.target.value) || 1)}
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                        />
                        <span className="font-bold text-slate-700">Litros</span>
                      </div>
                    </div>
                  ) : (
                    /* Botones Rápidos de Libras: 1 a 10 LB */
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 5, 8, 10].map((lb) => (
                          <button
                            key={lb}
                            type="button"
                            onClick={() => setPoundsMultiplier(lb)}
                            className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              poundsMultiplier === lb
                                ? "bg-emerald-600 text-white shadow-xs scale-105"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            {lb} LB
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1 text-xs">
                        <span className="text-slate-500">¿Otras Libras?</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="100"
                          value={poundsMultiplier}
                          onChange={(e) => setPoundsMultiplier(Number(e.target.value) || 1)}
                          className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                        />
                        <span className="font-bold text-slate-700">Libras</span>
                      </div>
                    </div>
                  )}

                  {/* Resumen de Insumos que se descontarán automáticamente */}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center justify-between">
                      <span>Materias Primas Requeridas (Se descontarán del stock):</span>
                      <span className="text-emerald-700 font-semibold normal-case">
                        Factor escala: x{effectiveMultiplier.toFixed(2)}
                      </span>
                    </p>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedRecipe.items?.map((item) => {
                        const requiredQty = Number(item.quantity) * effectiveMultiplier;
                        const stockAvailable = Number(item.ingredient?.current_stock || 0);
                        const hasEnoughStock = stockAvailable >= requiredQty;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                          >
                            <span className="font-medium text-slate-800">
                              {item.ingredient?.name}
                            </span>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-slate-900">
                                {requiredQty >= 100
                                  ? requiredQty.toLocaleString(undefined, { maximumFractionDigits: 1 })
                                  : requiredQty.toFixed(2)}{" "}
                                {item.unit}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                  hasEnoughStock
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {hasEnoughStock ? "✓ Disponible" : "⚠️ Stock bajo"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Campo de Notas opcionales */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Notas de Producción (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cubeta plástica azul #3 / Pollo cocido con laurel"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer con Botón Gigante de 1 Clic */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selectedRecipe}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Registrando Producción...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>
                  {isBeverage
                    ? `Confirmar Cubeta de ${containerCapacity}L`
                    : `Confirmar Tanda de ${poundsMultiplier} Libras`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
