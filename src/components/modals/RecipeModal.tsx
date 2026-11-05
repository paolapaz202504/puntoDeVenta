import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Recipe, Product } from "../../types";
import { toast } from "sonner";
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Package,
  Layers,
  Scale,
  FileText,
  DollarSign,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recipeToEdit: Recipe | null;
}

interface RecipeFormItem {
  ingredient_id: string;
  quantity: number;
  unit: string;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  recipeToEdit,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [recipeType, setRecipeType] = useState<
    "BATCH_SCALABLE" | "SUB_RECIPE_BATCH" | "ON_DEMAND_UNIT"
  >("BATCH_SCALABLE");
  const [baseYield, setBaseYield] = useState<number>(1000);
  const [yieldUnit, setYieldUnit] = useState("ML");
  const [instructions, setInstructions] = useState("");
  const [items, setItems] = useState<RecipeFormItem[]>([
    { ingredient_id: "", quantity: 1, unit: "UND" },
  ]);

  // Cargar productos para selección
  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      fetchProducts();
    }
  }, [isOpen, allProducts.length]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get("/products", { params: { limit: 100, sortBy: "name", order: "asc" } });
      setAllProducts(res.data.items || []);
    } catch (error) {
      console.error("Error al cargar productos para la receta:", error);
      toast.error("No se pudieron cargar los productos del catálogo");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Inicializar datos al abrir o editar
  useEffect(() => {
    if (recipeToEdit) {
      setProductId(recipeToEdit.product_id);
      setName(recipeToEdit.name);
      setRecipeType(recipeToEdit.recipe_type);
      setBaseYield(recipeToEdit.base_yield);
      setYieldUnit(recipeToEdit.yield_unit);
      setInstructions(recipeToEdit.instructions || "");
      if (recipeToEdit.items && recipeToEdit.items.length > 0) {
        setItems(
          recipeToEdit.items.map((it) => ({
            ingredient_id: it.ingredient_id,
            quantity: it.quantity,
            unit: it.unit,
          }))
        );
      } else {
        setItems([{ ingredient_id: "", quantity: 1, unit: "UND" }]);
      }
    } else {
      setProductId("");
      setName("");
      setRecipeType("BATCH_SCALABLE");
      setBaseYield(1000);
      setYieldUnit("ML");
      setInstructions("");
      setItems([{ ingredient_id: "", quantity: 1, unit: "UND" }]);
    }
  }, [recipeToEdit, isOpen]);

  // Auto-completar nombre y unidad al elegir producto final si es nueva receta
  const handleProductSelect = (selectedId: string) => {
    setProductId(selectedId);
    if (!recipeToEdit) {
      const prod = allProducts.find((p) => p.id === selectedId);
      if (prod) {
        if (!name.trim()) {
          setName(`Fórmula Base ${prod.name}`);
        }
        if (prod.product_type === "MANUFACTURED") {
          setRecipeType("BATCH_SCALABLE");
          setBaseYield(1000);
          setYieldUnit("ML");
        } else if (prod.product_type === "SUB_RECIPE") {
          setRecipeType("SUB_RECIPE_BATCH");
          setBaseYield(1);
          setYieldUnit("LB");
        } else {
          setRecipeType("ON_DEMAND_UNIT");
          setBaseYield(1);
          setYieldUnit(prod.base_unit?.symbol || "UND");
        }
      }
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ingredient_id: "", quantity: 1, unit: "UND" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.warning("La receta debe incluir al menos un ingrediente");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RecipeFormItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // Si cambia el ingrediente, sugerir la unidad del ingrediente
      if (field === "ingredient_id") {
        const ing = allProducts.find((p) => p.id === value);
        if (ing?.base_unit?.symbol) {
          next[index].unit = ing.base_unit.symbol;
        }
      }
      return next;
    });
  };

  // Calcular costo estimado de la tanda base
  const estimatedCost = items.reduce((acc, it) => {
    const ing = allProducts.find((p) => p.id === it.ingredient_id);
    if (ing && it.quantity > 0) {
      return acc + ing.current_cost * it.quantity;
    }
    return acc;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Debe seleccionar el producto final para la receta");
      return;
    }

    if (!name.trim()) {
      toast.error("El nombre de la receta es obligatorio");
      return;
    }

    if (baseYield <= 0) {
      toast.error("El rendimiento base debe ser mayor a 0");
      return;
    }

    // Validar items
    const validItems = items.filter((it) => it.ingredient_id && it.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Debe agregar al menos un ingrediente válido con cantidad mayor a 0");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: productId,
        name: name.trim(),
        recipe_type: recipeType,
        base_yield: Number(baseYield),
        yield_unit: yieldUnit.trim().toUpperCase(),
        instructions: instructions.trim() || null,
        items: validItems.map((it) => ({
          ingredient_id: it.ingredient_id,
          quantity: Number(it.quantity),
          unit: it.unit.trim().toUpperCase(),
        })),
      };

      if (recipeToEdit) {
        await api.put(`/recipes/${recipeToEdit.id}`, payload);
        toast.success("Receta actualizada exitosamente");
      } else {
        await api.post("/recipes", payload);
        toast.success("Receta creada exitosamente");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al guardar receta:", error);
      toast.error(error.response?.data?.message || "Error al procesar la receta");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filtrar productos para producto final (elaborables o vendibles)
  const finalProductOptions = allProducts.filter(
    (p) =>
      p.product_type === "MANUFACTURED" ||
      p.product_type === "SUB_RECIPE" ||
      p.product_type === "ON_DEMAND"
  );

  // Filtrar productos para ingredientes (materias primas y sub-ensambles)
  const ingredientOptions = allProducts.filter(
    (p) => p.product_type === "RAW_MATERIAL" || p.product_type === "SUB_RECIPE"
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {recipeToEdit ? "Editar Receta o Fórmula" : "Nueva Receta o Fórmula Base"}
              </h3>
              <p className="text-xs text-slate-500">
                {recipeToEdit
                  ? "Modifique los parámetros y proporciones de ingredientes"
                  : "Defina la fórmula de preparación para cocina o barra"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Fila 1: Producto Final Asignado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Package className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Producto Final a Producir / Elaborar *
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={loadingProducts || !!recipeToEdit}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 transition-all"
            >
              <option value="">-- Seleccione un Producto Final --</option>
              {recipeToEdit && !finalProductOptions.some((p) => p.id === recipeToEdit.product_id) && (
                <option value={recipeToEdit.product_id}>
                  {recipeToEdit.product?.name || "Producto Actual"} ({recipeToEdit.product?.code || ""})
                </option>
              )}
              {finalProductOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.product_type}
                </option>
              ))}
            </select>
          </div>

          {/* Fila 2: Nombre de la Receta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre de la Receta o Fórmula *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Fórmula Base Refresco de Melón 1L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Fila 3: Tipo de Receta, Rendimiento y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Tipo de Receta
              </label>
              <select
                value={recipeType}
                onChange={(e) =>
                  setRecipeType(e.target.value as any)
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BATCH_SCALABLE">Bebida Escalable (1-10L)</option>
                <option value="SUB_RECIPE_BATCH">Relleno Cocina (Por Libra)</option>
                <option value="ON_DEMAND_UNIT">Ensamble al Vender (POS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                <Scale className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Rendimiento Base *
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={baseYield}
                onChange={(e) => setBaseYield(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unidad de Rendimiento *
              </label>
              <input
                type="text"
                required
                placeholder="ML, LB, UND"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fila 4: Instrucciones de Preparación */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Instrucciones / Procedimiento (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Licuar pulpa de fruta con azúcar y mezclar con agua purificada hasta completar la cubeta..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Fila 5: Lista de Ingredientes Requeridos */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ingredientes e Insumos ({items.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Cantidades requeridas para producir la base de {baseYield} {yieldUnit}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Ingrediente</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const ingProduct = allProducts.find((p) => p.id === item.ingredient_id);
                const itemCost = ingProduct ? ingProduct.current_cost * item.quantity : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {/* Selector de Ingrediente */}
                    <div className="flex-1">
                      <select
                        required
                        value={item.ingredient_id}
                        onChange={(e) => handleItemChange(index, "ingredient_id", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Seleccionar Ingrediente --</option>
                        {item.ingredient_id && !ingredientOptions.some((ing) => ing.id === item.ingredient_id) && (
                          <option value={item.ingredient_id}>
                            {recipeToEdit?.items?.find((it) => it.ingredient_id === item.ingredient_id)?.ingredient?.name || "Ingrediente Registrado"}
                          </option>
                        )}
                        {ingredientOptions.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.base_unit?.symbol || "UND"}) — Q{ing.current_cost.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="w-24">
                      <input
                        type="number"
                        min="0.0001"
                        step="any"
                        required
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Unidad */}
                    <div className="w-20">
                      <input
                        type="text"
                        required
                        placeholder="Unidad"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-center uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Costo Estimado */}
                    <div className="w-20 text-right shrink-0">
                      <span className="text-[11px] font-mono font-bold text-slate-600 block">
                        Q{itemCost.toFixed(2)}
                      </span>
                    </div>

                    {/* Botón Eliminar Fila */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Totalizador de Costo Estimado */}
            <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
                Costo Estimado de Materia Prima por Tanda Base ({baseYield} {yieldUnit}):
              </span>
              <span className="font-mono text-sm font-black text-blue-800">
                Q{estimatedCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {recipeToEdit ? "Actualizar Receta" : "Crear Receta"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
