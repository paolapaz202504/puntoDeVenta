import React, { useState, useEffect } from "react";
import { api, getFileUrl } from "../services/api";
import { Category, RestaurantTable } from "../types";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Send,
  RefreshCw,
  X,
  Receipt,
  User,
  Coffee,
  Layers,
  GlassWater,
  Beer,
  Sparkles,
  UtensilsCrossed,
  Tag,
  Armchair,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface PosProduct {
  id: string;
  code: string;
  name: string;
  sale_price: number;
  current_cost: number;
  current_stock: number;
  min_stock_alert: number;
  product_type: string;
  image_url?: string | null;
  category: { id: string; name: string };
  brand?: { id: string; name: string } | null;
  base_unit: { id: string; name: string; symbol: string };
}

interface CartItem {
  product: PosProduct;
  quantity: number;
  unit_price: number;
}

// Helper para icono contextual de categoría en POS
const getCategoryIcon = (categoryName: string) => {
  const norm = categoryName.toLowerCase();
  if (norm.includes("gaseosa") || norm.includes("soda") || norm.includes("bebida")) {
    return <GlassWater className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" />;
  }
  if (norm.includes("agua")) {
    return <GlassWater className="w-3.5 h-3.5 mr-1.5 text-sky-500 shrink-0" />;
  }
  if (norm.includes("jugo") || norm.includes("refresco") || norm.includes("licuado")) {
    return <Coffee className="w-3.5 h-3.5 mr-1.5 text-amber-500 shrink-0" />;
  }
  if (norm.includes("alimento") || norm.includes("comida") || norm.includes("pan") || norm.includes("tostada")) {
    return <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5 text-emerald-500 shrink-0" />;
  }
  if (norm.includes("cerveza") || norm.includes("licor")) {
    return <Beer className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />;
  }
  if (norm.includes("postre") || norm.includes("dulce")) {
    return <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-500 shrink-0" />;
  }
  return <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />;
};

// Paletas de color diferenciadas para cada Área en la Comanda POS
const AREA_PALETTES = [
  {
    areaBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    containerBg: "bg-emerald-50/70 border-emerald-200",
    tagDefault: "bg-white text-emerald-950 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100/60",
    tagSelected: "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/60 font-black",
  },
  {
    areaBadge: "bg-blue-100 text-blue-800 border-blue-300",
    containerBg: "bg-blue-50/70 border-blue-200",
    tagDefault: "bg-white text-blue-950 border-blue-300 hover:border-blue-500 hover:bg-blue-100/60",
    tagSelected: "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/60 font-black",
  },
  {
    areaBadge: "bg-amber-100 text-amber-800 border-amber-300",
    containerBg: "bg-amber-50/70 border-amber-200",
    tagDefault: "bg-white text-amber-950 border-amber-300 hover:border-amber-500 hover:bg-amber-100/60",
    tagSelected: "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/60 font-black",
  },
  {
    areaBadge: "bg-purple-100 text-purple-800 border-purple-300",
    containerBg: "bg-purple-50/70 border-purple-200",
    tagDefault: "bg-white text-purple-950 border-purple-300 hover:border-purple-500 hover:bg-purple-100/60",
    tagSelected: "bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-400/60 font-black",
  },
  {
    areaBadge: "bg-rose-100 text-rose-800 border-rose-300",
    containerBg: "bg-rose-50/70 border-rose-200",
    tagDefault: "bg-white text-rose-950 border-rose-300 hover:border-rose-500 hover:bg-rose-100/60",
    tagSelected: "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-400/60 font-black",
  },
  {
    areaBadge: "bg-teal-100 text-teal-800 border-teal-300",
    containerBg: "bg-teal-50/70 border-teal-200",
    tagDefault: "bg-white text-teal-950 border-teal-300 hover:border-teal-500 hover:bg-teal-100/60",
    tagSelected: "bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-400/60 font-black",
  },
];

export const PosSalesPage: React.FC = () => {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Consumidor Final");
  const [saleType, setSaleType] = useState<"DIRECTA" | "MESA" | "LLEVAR">("DIRECTA");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [saleNotes, setSaleNotes] = useState("");

  // Modal de cobro
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA">("EFECTIVO");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [processingSale, setProcessingSale] = useState(false);

  // Recibo tras venta exitosa
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, tablesRes] = await Promise.all([
        api.get("/sales/pos-products"),
        api.get("/categories?limit=100"),
        api.get("/tables?limit=100"),
      ]);

      const allCats: Category[] = catRes.data.items || catRes.data.data || [];
      // Filtrar categorías que están configuradas para mostrar en POS
      const posCats = allCats.filter((c) => c.show_in_pos !== false);

      setProducts(prodRes.data || []);
      setCategories(posCats);
      setTables(tablesRes.data.items || tablesRes.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar productos del Punto de Venta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filtrado de productos en catálogo
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" || p.category.id === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Agrupar mesas por Área para selección visual directa en POS
  const tablesByArea = React.useMemo(() => {
    const map = new Map<string, { areaId: string; areaName: string; tables: RestaurantTable[] }>();

    tables.forEach((tbl) => {
      const areaId = tbl.area?.id || tbl.area_id || "sin-area";
      const areaName = tbl.area?.name || "Otras Mesas / General";

      if (!map.has(areaId)) {
        map.set(areaId, {
          areaId,
          areaName,
          tables: [],
        });
      }
      map.get(areaId)!.tables.push(tbl);
    });

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        tables: [...group.tables].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
        ),
      }))
      .sort((a, b) => a.areaName.localeCompare(b.areaName));
  }, [tables]);

  const selectedTable = React.useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  // Operaciones del Carrito
  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unit_price: product.sale_price }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("Consumidor Final");
    setSaleType("DIRECTA");
    setSelectedTableId("");
    setSaleNotes("");
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const cartTotal = cartSubtotal;

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      toast.error("El carrito de compras está vacío");
      return;
    }
    if (saleType === "MESA" && !selectedTableId) {
      toast.error("Por favor seleccione una mesa o espacio de trabajo");
      return;
    }
    setCashReceived(cartTotal.toFixed(2));
    setIsCheckoutOpen(true);
  };

  const cashNum = parseFloat(cashReceived) || 0;
  const changeToReturn = Math.max(0, cashNum - cartTotal);

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saleType === "MESA" && !selectedTableId) {
      toast.error("Debe seleccionar una mesa o espacio de trabajo");
      return;
    }

    if (paymentMethod === "EFECTIVO" && cashNum < cartTotal) {
      toast.error(`El monto recibido (Q ${cashNum.toFixed(2)}) es menor al total a cobrar (Q ${cartTotal.toFixed(2)})`);
      return;
    }

    if (paymentMethod === "TRANSFERENCIA" && (!bankName.trim() || !documentNumber.trim())) {
      toast.error("Debe ingresar el banco y el número de comprobante de la transferencia");
      return;
    }

    setProcessingSale(true);
    try {
      const payload = {
        customer_name: customerName.trim() || "Consumidor Final",
        sale_type: saleType,
        table_id: saleType === "MESA" && selectedTableId ? selectedTableId : null,
        payment_method: paymentMethod,
        bank_name: paymentMethod === "TRANSFERENCIA" ? bankName.trim() : null,
        document_number: paymentMethod === "TRANSFERENCIA" ? documentNumber.trim() : null,
        cash_received: paymentMethod === "EFECTIVO" ? cashNum : null,
        notes: saleNotes.trim() || null,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const res = await api.post("/sales", payload);
      toast.success(`¡Venta ${res.data.sale_number} completada con éxito!`);

      setLastSaleReceipt(res.data);
      clearCart();
      setIsCheckoutOpen(false);
      fetchInitialData(); // Refrescar existencias actualizadas
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrar la venta");
    } finally {
      setProcessingSale(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Contenedor Flex: Catálogo a la izquierda, Carrito a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO: Catálogo y Productos (8 columnas en lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Barra Superior de Búsqueda y Filtros de Categoría */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar producto o código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 w-full sm:w-auto justify-end">
                <span>{filteredProducts.length} productos disponibles</span>
                <button
                  onClick={fetchInitialData}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Actualizar catálogo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Píldoras de Categorías con desborde multilínea e iconos */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                Todas las Categorías
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  {getCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos - Con Imagen Prominente y Textos Compactos */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Cargando catálogo para venta...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-bold text-slate-700">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">Pruebe con otra categoría o término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.current_stock <= 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-white p-2.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all text-left flex flex-col justify-between group relative cursor-pointer"
                  >
                    <div>
                      {/* Imagen Prominente del Producto */}
                      <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center p-2 border border-slate-100">
                        {p.image_url ? (
                          <img
                            src={getFileUrl(p.image_url)}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback = target.parentElement?.querySelector(".img-fallback");
                              if (fallback) (fallback as HTMLElement).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`img-fallback w-full h-full flex flex-col items-center justify-center text-slate-300 ${
                            p.image_url ? "hidden" : "flex"
                          }`}
                        >
                          <Coffee className="w-10 h-10 text-slate-300" />
                        </div>

                        {/* Badge de Stock en la esquina superior */}
                        <div className="absolute top-1.5 right-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-md font-mono font-bold text-[9px] shadow-xs ${
                              isOutOfStock
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : p.current_stock <= p.min_stock_alert
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {isOutOfStock ? "Agotado" : `${p.current_stock} ${p.base_unit.symbol}`}
                          </span>
                        </div>
                      </div>

                      {/* Categoría reducida */}
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate block leading-none mb-1">
                        {p.category.name}
                      </span>

                      {/* Nombre del Producto reducido para priorizar guía visual */}
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[30px]" title={p.name}>
                        {p.name}
                      </h4>
                    </div>

                    {/* Precio y Botón Agregar */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        Q {p.sale_price.toFixed(2)}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: Comanda / Carrito de Venta (4 columnas en lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sticky top-20 overflow-hidden">
          {/* Header del Carrito */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Comanda / Venta Actual</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Opciones Rápidas: Cliente y Tipo de Venta */}
          <div className="p-3.5 bg-slate-50/50 border-b border-slate-100 space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Cliente
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente o NIT"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(["DIRECTA", "MESA", "LLEVAR"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSaleType(type)}
                  className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    saleType === type
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {type === "DIRECTA" ? "Directa" : type === "MESA" ? "Mesa" : "Para Llevar"}
                </button>
              ))}
            </div>

            {saleType === "MESA" && (
              <div className="space-y-2 pt-1 border-t border-slate-200/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Armchair className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Mesas y Espacios por Área
                    </span>
                  </div>
                  {selectedTable ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 mr-1 text-emerald-600" />
                      {selectedTable.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold animate-pulse">
                      * Elija una mesa
                    </span>
                  )}
                </div>

                {tablesByArea.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                    No hay mesas o espacios configurados
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {tablesByArea.map((group, idx) => {
                      const palette = AREA_PALETTES[idx % AREA_PALETTES.length];
                      return (
                        <div
                          key={group.areaId}
                          className={`p-1.5 rounded-lg border ${palette.containerBg} transition-all flex items-center flex-wrap gap-1.5`}
                        >
                          <span
                            className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${palette.areaBadge}`}
                            title={`${group.tables.length} ${group.tables.length === 1 ? "mesa/espacio" : "mesas/espacios"}`}
                          >
                            {group.areaName}:
                          </span>

                          <div className="flex flex-wrap items-center gap-1 flex-1">
                            {group.tables.map((tbl) => {
                              const isSelected = selectedTableId === tbl.id;
                              return (
                                <button
                                  key={tbl.id}
                                  type="button"
                                  onClick={() => setSelectedTableId(tbl.id)}
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer border ${
                                    isSelected
                                      ? palette.tagSelected
                                      : palette.tagDefault
                                  }`}
                                  title={`Seleccionar ${tbl.name} (${group.areaName})`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5 mr-1 shrink-0" />}
                                  <span>{tbl.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lista de Ítems en Carrito */}
          <div className="flex-1 max-h-[380px] overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">El carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-0.5">Seleccione productos del catálogo para agregar</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-2 flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Q {item.unit_price.toFixed(2)} c/u
                    </p>
                  </div>

                  {/* Modificadores de Cantidad */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black font-mono text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <span className="w-16 text-right text-xs font-black font-mono text-slate-900">
                      Q {(item.quantity * item.unit_price).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Quitar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales y Botón de Cobro */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Subtotal:</span>
              <span className="font-mono">Q {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 text-base font-black border-t border-slate-200 pt-2">
              <span>TOTAL A COBRAR:</span>
              <span className="text-xl font-mono text-emerald-700">Q {cartTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleOpenCheckout}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-black shadow-md hover:shadow-lg focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>COBRAR (Q {cartTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE PAGO Y FINALIZACIÓN DE VENTA */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Finalizar Cobro de Venta</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <p className="text-xs text-slate-500">Cliente: <span className="font-semibold text-slate-700">{customerName}</span></p>
                    {saleType === "MESA" && selectedTable && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Mesa: {selectedTable.name} ({selectedTable.area?.name || "General"})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSale} className="p-6 space-y-4">
              {/* Gran Total Display */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Total a Pagar
                </span>
                <div className="text-3xl font-black text-emerald-800 font-mono mt-0.5">
                  Q {cartTotal.toFixed(2)}
                </div>
              </div>

              {/* Selección de Método de Pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("EFECTIVO")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      paymentMethod === "EFECTIVO"
                        ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TARJETA")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      paymentMethod === "TARJETA"
                        ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Tarjeta POS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TRANSFERENCIA")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      paymentMethod === "TRANSFERENCIA"
                        ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Si es Efectivo: Monto Recibido y Cambio */}
              {paymentMethod === "EFECTIVO" && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Monto Recibido del Cliente (Q)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold font-mono">Q</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        autoFocus
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-lg font-black font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Botones de Efectivo Rápido */}
                  <div className="flex space-x-2">
                    {[cartTotal, 20, 50, 100, 200].map((val) => {
                      if (val < cartTotal && val !== cartTotal) return null;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCashReceived(val.toFixed(2))}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-mono font-bold text-slate-700 cursor-pointer"
                        >
                          Q{val.toFixed(0)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Cambio a devolver */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-600 uppercase">Cambio a Devolver:</span>
                    <span className="text-xl font-black font-mono text-blue-700">
                      Q {changeToReturn.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Si es Transferencia: Banco y Referencia */}
              {paymentMethod === "TRANSFERENCIA" && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banco Receptor
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Banrural, BI, BAM"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. de Autorización / Doc
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. TR-982342"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Notas de la venta */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Notas u Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Servir sin hielo, entrega en puerta..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingSale}
                  className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {processingSale ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Procesando Venta...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Registrar Venta
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECIBO DE VENTA EXITOSA */}
      {lastSaleReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900">¡Venta Exitosa!</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Comprobante: {lastSaleReceipt.sale_number}
            </p>

            <div className="my-4 p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-800">{lastSaleReceipt.customer_name}</span>
              </div>
              {lastSaleReceipt.table && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mesa / Espacio:</span>
                  <span className="font-bold text-blue-700">
                    {lastSaleReceipt.table.name} {lastSaleReceipt.table.area?.name ? `(${lastSaleReceipt.table.area.name})` : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-bold text-slate-800">{lastSaleReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                <span>Total Cobrado:</span>
                <span className="font-mono text-emerald-700">Q {lastSaleReceipt.total.toFixed(2)}</span>
              </div>
              {lastSaleReceipt.change_returned > 0 && (
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>Cambio Entregado:</span>
                  <span className="font-mono">Q {lastSaleReceipt.change_returned.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setLastSaleReceipt(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Aceptar y Nueva Venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
