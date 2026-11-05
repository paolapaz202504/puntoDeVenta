import React, { useEffect, useState, useCallback } from "react";
import { api, getFileUrl } from "../services/api";
import { Product, Category, Brand } from "../types";
import { ProductModal } from "../components/modals/ProductModal";
import { ProductImageModal } from "../components/modals/ProductImageModal";
import { ProductionModal } from "../components/modals/ProductionModal";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Boxes,
  Building2,
  Image as ImageIcon,
  Maximize2,
  ChefHat,
  AlertTriangle,
} from "lucide-react";

// Componente auxiliar para renderizar la miniatura con fondo blanco y fallback
const ProductThumbnail: React.FC<{
  src?: string | null;
  alt: string;
  onClick?: () => void;
}> = ({ src, alt, onClick }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center mx-auto shadow-xs">
        <ImageIcon className="w-5 h-5 text-slate-300" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title="Hacer clic para ampliar imagen"
      className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center mx-auto shadow-xs overflow-hidden group hover:border-blue-500 hover:shadow-md transition-all cursor-pointer relative"
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-200"
        onError={() => setError(true)}
      />
      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
        <Maximize2 className="w-3.5 h-3.5 text-blue-700 drop-shadow-sm" />
      </div>
    </button>
  );
};

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [presentationsList, setPresentationsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [presentationFilter, setPresentationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<
    "name" | "code" | "sale_price" | "current_stock" | "created_at" | "category"
  >("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [viewingImageProduct, setViewingImageProduct] = useState<Product | null>(null);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [productionRecipeId, setProductionRecipeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [catsRes, brandsRes, presRes] = await Promise.all([
          api.get("/categories", { params: { limit: 100, sortBy: "name", order: "asc" } }),
          api.get("/brands", { params: { limit: 100, sortBy: "name", order: "asc" } }),
          api.get("/products/presentations/list"),
        ]);
        setCategories(catsRes.data.items || []);
        setBrands(brandsRes.data.items || []);
        setPresentationsList(presRes.data.items || []);
      } catch (error) {
        console.error("Error al cargar opciones de filtros", error);
      }
    };
    fetchFilterData();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          category_id: categoryFilter || undefined,
          brand_id: brandFilter || undefined,
          presentation: presentationFilter || undefined,
          sortBy,
          order,
        },
      });
      setProducts(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, brandFilter, presentationFilter, sortBy, order]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product: Product) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar el producto "${product.name}" (${product.code})? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);
      toast.success("Producto eliminado exitosamente");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar producto");
    }
  };

  const toggleOrder = (
    column: "name" | "code" | "sale_price" | "current_stock" | "created_at" | "category"
  ) => {
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
            <Package className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Productos
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Bebidas, alimentos e insumos de inventario ({total} productos registrados)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2.5">
          <button
            onClick={() => {
              setProductionRecipeId(null);
              setIsProductionOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105"
          >
            <ChefHat className="w-4 h-4 mr-1.5" />
            Elaborar en Cocina
          </button>
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {/* Input de Búsqueda */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por código o nombre..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filtro por Categoría */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Marca / Empresa */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Todas las marcas / empresas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Presentación de Compra */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <select
              value={presentationFilter}
              onChange={(e) => {
                setPresentationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Todas las presentaciones</option>
              {presentationsList.map((pres) => (
                <option key={pres} value={pres}>
                  {pres}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
          <div>
            {(categoryFilter || brandFilter || presentationFilter || search) && (
              <button
                onClick={() => {
                  setCategoryFilter("");
                  setBrandFilter("");
                  setPresentationFilter("");
                  setSearch("");
                  setPage(1);
                }}
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
          <div>
            Mostrando resultados: <span className="text-slate-900 font-bold">{total}</span> productos
          </div>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200 text-left text-sm table-fixed">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center w-14 shrink-0">
                  Foto
                </th>
                <th
                  onClick={() => toggleOrder("name")}
                  className="px-3 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors w-auto"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Producto</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleOrder("category")}
                  className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors w-28 text-center"
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <span>Categoría</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center w-24">
                  Tipo
                </th>
                <th className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-right w-24">
                  Costo Prom.
                </th>
                <th
                  onClick={() => toggleOrder("sale_price")}
                  className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 transition-colors w-28"
                >
                  <div className="flex items-center justify-end space-x-1.5">
                    <span>Precio Venta</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleOrder("current_stock")}
                  className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors w-28"
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider w-40">
                  Presentaciones Compra
                </th>
                <th className="px-2 py-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider text-right w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-semibold">Cargando catálogo de productos...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-bold text-slate-700">No se encontraron productos</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || categoryFilter || brandFilter || presentationFilter
                        ? "Intente con otros criterios de búsqueda o filtros"
                        : "Registre un nuevo producto para comenzar"}
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.current_stock <= p.min_stock_alert;
                  const brandName = p.brand?.name || (typeof p.brand === "string" ? p.brand : null);
                  const isBeverage = p.product_type === "MANUFACTURED";
                  const isSubRecipe = p.product_type === "SUB_RECIPE";
                  const canProduce = isBeverage || isSubRecipe;

                  const getTypeBadge = (type: string) => {
                    switch (type) {
                      case "MANUFACTURED":
                        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Refresco</span>;
                      case "SUB_RECIPE":
                        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Relleno</span>;
                      case "ON_DEMAND":
                        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Al Momento</span>;
                      case "RAW_MATERIAL":
                        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Insumo</span>;
                      default:
                        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Venta Directa</span>;
                    }
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* Imagen con fondo blanco (Clic para ampliar) */}
                      <td className="px-2 py-3 text-center align-middle">
                        <ProductThumbnail
                          src={getFileUrl(p.image_url)}
                          alt={p.name}
                          onClick={() => setViewingImageProduct(p)}
                        />
                      </td>

                      {/* Código, Nombre y Marca (permite múltiples líneas sin forzar scroll) */}
                      <td className="px-3 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors break-words leading-snug">
                            {p.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1">
                            <span className="font-mono font-bold text-slate-400 shrink-0">
                              {p.code}
                            </span>
                            {brandName && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-amber-700 font-semibold truncate max-w-[150px]">
                                  {brandName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-2 py-3 text-center align-middle">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 break-words text-center">
                          {p.category?.name || "Sin categoría"}
                        </span>
                      </td>

                      {/* Tipo de Producto */}
                      <td className="px-2 py-3 text-center align-middle">
                        {getTypeBadge(p.product_type)}
                      </td>

                      {/* Costo Unitario Promedio */}
                      <td className="px-2 py-3 text-right align-middle">
                        <span className="font-mono text-xs font-bold text-slate-600">
                          Q {p.current_cost.toFixed(2)}
                        </span>
                      </td>

                      {/* Precio de Venta */}
                      <td className="px-2 py-3 text-right align-middle">
                        <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 inline-block">
                          Q {p.sale_price.toFixed(2)}
                        </span>
                      </td>

                      {/* Stock Actual y Alertas */}
                      <td className="px-2 py-3 text-center align-middle">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold ${
                              isLowStock
                                ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {p.current_stock.toLocaleString()} {p.base_unit?.symbol || "UND"}
                          </span>

                          {/* Alerta de umbral para Refrescos o Rellenos */}
                          {isLowStock && (
                            <span className="text-[10px] font-bold text-rose-600 mt-1 flex items-center text-center">
                              <AlertTriangle className="w-3 h-3 mr-0.5 text-rose-500 shrink-0" />
                              {isBeverage
                                ? "< 1L! Elaborar"
                                : isSubRecipe
                                ? "< 1 LB! Cocer"
                                : "Stock crítico"}
                            </span>
                          )}

                          {isBeverage && !isLowStock && (
                            <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                              ~{(p.current_stock / 5000).toFixed(1)} cubetas (5L)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Presentaciones de Compra */}
                      <td className="px-3 py-3 align-middle">
                        {p.presentations && p.presentations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.presentations.map((pres, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap"
                              >
                                <Boxes className="w-2.5 h-2.5 mr-1 text-amber-600 shrink-0" />
                                {pres.name} ({pres.conversion_factor}x)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unidad suelta</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-2 py-3 text-right align-middle whitespace-nowrap">
                        <div className="inline-flex items-center justify-end space-x-1">
                          {canProduce && (
                            <button
                              type="button"
                              onClick={() => {
                                setProductionRecipeId(p.recipes_as_final?.[0]?.id || null);
                                setIsProductionOpen(true);
                              }}
                              title={isBeverage ? "Elaborar cubeta de refresco" : "Preparar tanda de relleno"}
                              className="p-1.5 text-emerald-700 hover:text-white hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer bg-emerald-50 border border-emerald-200"
                            >
                              <ChefHat className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setProductToEdit(p);
                              setIsModalOpen(true);
                            }}
                            title="Editar producto"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            title="Eliminar producto"
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        onSaved={fetchProducts}
        productToEdit={productToEdit}
      />

      {/* Modal Vista Ampliada de Imagen de Producto */}
      <ProductImageModal
        isOpen={!!viewingImageProduct}
        onClose={() => setViewingImageProduct(null)}
        imageUrl={getFileUrl(viewingImageProduct?.image_url)}
        productName={viewingImageProduct?.name || ""}
        categoryName={viewingImageProduct?.category?.name}
        brand={viewingImageProduct?.brand?.name || (typeof viewingImageProduct?.brand === "string" ? viewingImageProduct.brand : null)}
        code={viewingImageProduct?.code}
      />

      {/* Modal Producción Ágil de Cocina / Barra */}
      <ProductionModal
        isOpen={isProductionOpen}
        onClose={() => {
          setIsProductionOpen(false);
          setProductionRecipeId(null);
        }}
        onSuccess={fetchProducts}
        initialRecipeId={productionRecipeId}
      />
    </div>
  );
};
