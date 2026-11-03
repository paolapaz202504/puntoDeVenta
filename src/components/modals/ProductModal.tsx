import React, { useState, useEffect } from "react";
import { api, getFileUrl } from "../../services/api";
import { toast } from "sonner";
import {
  X,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Boxes,
  Upload,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";
import { Product, Category, MeasurementUnit, ProductPurchasePresentation, Brand } from "../../types";
import { ProductImageModal } from "./ProductImageModal";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  productToEdit,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [baseUnitId, setBaseUnitId] = useState("");
  const [salePrice, setSalePrice] = useState<number | string>(5.00);
  const [currentCost, setCurrentCost] = useState<number | string>(0.00);
  const [currentStock, setCurrentStock] = useState<number | string>(0);
  const [minStockAlert, setMinStockAlert] = useState<number | string>(5);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isZoomImageOpen, setIsZoomImageOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [presentations, setPresentations] = useState<ProductPurchasePresentation[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        setLoadingData(true);
        try {
          const [catRes, unitRes, brandRes] = await Promise.all([
            api.get("/categories", { params: { limit: 100, sortBy: "name", order: "asc" } }),
            api.get("/units", { params: { limit: 100, sortBy: "name", order: "asc" } }),
            api.get("/brands", { params: { limit: 100, sortBy: "name", order: "asc" } }),
          ]);
          setCategories(catRes.data.items || []);
          setUnits(unitRes.data.items || []);
          setBrands(brandRes.data.items || []);

          if (!productToEdit && unitRes.data.items?.length > 0) {
            const und = unitRes.data.items.find((u: MeasurementUnit) => u.symbol === "UND");
            if (und) setBaseUnitId(und.id);
          }
        } catch (error) {
          toast.error("Error al cargar categorías, marcas y unidades");
        } finally {
          setLoadingData(false);
        }
      };
      loadOptions();
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    if (productToEdit) {
      setCode(productToEdit.code);
      setName(productToEdit.name);
      setBrandId(productToEdit.brand_id || "");
      setCategoryId(productToEdit.category_id);
      setBaseUnitId(productToEdit.base_unit_id);
      setSalePrice(productToEdit.sale_price);
      setCurrentCost(productToEdit.current_cost);
      setCurrentStock(productToEdit.current_stock);
      setMinStockAlert(productToEdit.min_stock_alert);
      setImageUrl(productToEdit.image_url || "");
      setIsActive(productToEdit.is_active);
      setPresentations(productToEdit.presentations || []);
    } else {
      setCode("");
      setName("");
      setBrandId("");
      setCategoryId("");
      setSalePrice(5.00);
      setCurrentCost(0.00);
      setCurrentStock(0);
      setMinStockAlert(5);
      setImageUrl("");
      setIsActive(true);
      setPresentations([]);
    }
    setErrorMsg("");
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddPresentation = () => {
    setPresentations([
      ...presentations,
      {
        name: "Caja de 24",
        conversion_factor: 24,
        default_cost: undefined,
        barcode: "",
      },
    ]);
  };

  const handleRemovePresentation = (index: number) => {
    setPresentations(presentations.filter((_, i) => i !== index));
  };

  const handlePresentationChange = (
    index: number,
    field: keyof ProductPurchasePresentation,
    value: any
  ) => {
    const updated = [...presentations];
    updated[index] = { ...updated[index], [field]: value };
    setPresentations(updated);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo seleccionado debe ser una imagen válida (.png, .jpg, .webp)");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.imageUrl);
      toast.success("Imagen de producto subida exitosamente");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    if (code.trim().length < 2) return "El código debe tener al menos 2 caracteres";
    if (name.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (!categoryId) return "Debe seleccionar una categoría";
    if (!baseUnitId) return "Debe seleccionar una unidad de medida";
    if (Number(salePrice) < 0) return "El precio de venta no puede ser negativo";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setLoading(true);

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      brand_id: brandId || null,
      category_id: categoryId,
      base_unit_id: baseUnitId,
      product_type: "DIRECT_SALE",
      sale_price: Number(salePrice),
      current_cost: Number(currentCost),
      current_stock: Number(currentStock),
      min_stock_alert: Number(minStockAlert),
      image_url: imageUrl.trim() || null,
      is_active: isActive,
      presentations: presentations.map((p) => ({
        name: p.name.trim(),
        conversion_factor: Number(p.conversion_factor) || 1,
        default_cost: p.default_cost ? Number(p.default_cost) : null,
        barcode: p.barcode ? p.barcode.trim() : null,
      })),
    };

    try {
      if (productToEdit) {
        await api.put(`/products/${productToEdit.id}`, payload);
        toast.success("Producto actualizado exitosamente");
      } else {
        await api.post("/products", payload);
        toast.success("Producto registrado exitosamente");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ocurrió un error al guardar el producto";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {productToEdit ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <p className="text-xs text-slate-500">
                {productToEdit ? "Modificar ficha de producto y presentaciones" : "Registrar producto en el catálogo de inventario"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con scroll vertical */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs animate-in shake duration-150">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fila 1: Código y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Ej. BEB-CC-V355"
                maxLength={30}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Producto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Ej. Coca-Cola Clásica Vidrio 355 ml"
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Fila 2: Categoría, Marca y Unidad Base */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoría <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                disabled={loadingData}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Marca / Empresa
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                disabled={loadingData}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
              >
                <option value="">-- Sin Marca / Seleccionar --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unidad Base de Venta <span className="text-rose-500">*</span>
              </label>
              <select
                value={baseUnitId}
                onChange={(e) => {
                  setBaseUnitId(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                disabled={loadingData}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xs"
              >
                <option value="">-- Seleccionar Unidad --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 3: Precios y Costos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Precio Venta (Q) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Costo Unitario (Q)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentCost}
                onChange={(e) => setCurrentCost(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alerta Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Fila 4: Imagen de Producto (Ruta técnica oculta, tamaño duplicado y clic para ampliar) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fotografía del Producto (Fondo Blanco)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
              {/* Vista de imagen al doble de tamaño (128x128px) con clic para modal ampliado */}
              <div
                onClick={() => {
                  if (imageUrl) setIsZoomImageOpen(true);
                }}
                title={imageUrl ? "Hacer clic para ampliar imagen" : "Sin foto asignada"}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 bg-white p-2 flex flex-col items-center justify-center shadow-xs overflow-hidden shrink-0 transition-all relative ${
                  imageUrl
                    ? "border-slate-300 hover:border-blue-500 cursor-pointer group hover:shadow-md"
                    : "border-dashed border-slate-300 cursor-default"
                }`}
              >
                {imageUrl ? (
                  <>
                    <img
                      src={getFileUrl(imageUrl)}
                      alt={name || "Foto del producto"}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity rounded-xl">
                      <Maximize2 className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Ampliar</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon className="w-10 h-10 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400">Sin Foto</span>
                  </div>
                )}
              </div>

              {/* Acciones para actualizar o quitar la fotografía */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-white" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1.5" />
                    )}
                    <span>{uploadingImage ? "Subiendo archivo..." : imageUrl ? "Cambiar Fotografía" : "Subir Fotografía"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                    />
                  </label>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="inline-flex items-center px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Quitar Foto
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  Formato PNG o JPG con fondo blanco puro (<code className="font-mono text-slate-700 font-bold">#FFFFFF</code>).
                  {imageUrl && (
                    <span className="block text-blue-600 font-semibold mt-0.5">
                      💡 Haz clic sobre la foto para verla en pantalla completa.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN PRESENTACIONES DE COMPRA Y FACTORES DE CONVERSIÓN */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <Boxes className="w-4 h-4 mr-1.5 text-blue-600" />
                  Presentaciones de Compra y Factores de Conversión
                </h4>
                <p className="text-xs text-slate-500">
                  Define cómo se compra al por mayor (Caja de 24, Paquete de 6) para alimentar el stock individual.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPresentation}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Agregar Presentación
              </button>
            </div>

            {presentations.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                Sin presentaciones de compra registradas. (Se comprará por unidad suelta).
              </div>
            ) : (
              <div className="space-y-2.5">
                {presentations.map((pres, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex-1 min-w-[140px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Nombre Presentación</span>
                      <input
                        type="text"
                        value={pres.name}
                        onChange={(e) => handlePresentationChange(idx, "name", e.target.value)}
                        placeholder="Ej. Caja de 24"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div className="w-24">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Factor (Unidades)</span>
                      <input
                        type="number"
                        min="1"
                        value={pres.conversion_factor}
                        onChange={(e) => handlePresentationChange(idx, "conversion_factor", Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-center outline-none"
                      />
                    </div>
                    <div className="w-28">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Costo Compra (Q)</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pres.default_cost !== undefined && pres.default_cost !== null ? pres.default_cost : ""}
                        onChange={(e) => handlePresentationChange(idx, "default_cost", e.target.value ? Number(e.target.value) : null)}
                        placeholder="Ej. 82.00"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div className="self-end pb-0.5">
                      <button
                        type="button"
                        onClick={() => handleRemovePresentation(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar presentación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Botones de Acción al pie */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <label className="flex items-center text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mr-2"
            />
            Producto Activo para Venta en POS
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !code.trim()}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {productToEdit ? "Actualizar Producto" : "Crear Producto"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Imagen Ampliada desde el Formulario */}
      <ProductImageModal
        isOpen={isZoomImageOpen}
        onClose={() => setIsZoomImageOpen(false)}
        imageUrl={getFileUrl(imageUrl)}
        productName={name || "Vista Previa de Fotografía"}
        categoryName={categories.find((c) => c.id === categoryId)?.name}
        brand={brands.find((b) => b.id === brandId)?.name || null}
        code={code}
      />
    </div>
  );
};
