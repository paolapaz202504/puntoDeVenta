import React, { useState, useEffect } from "react";
import { api } from "../services/api";
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
        api.get("/categories?limit=50"),
        api.get("/tables?limit=50"),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes.data.items || catRes.data.data || []);
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
    setCashReceived(cartTotal.toFixed(2));
    setIsCheckoutOpen(true);
  };

  const cashNum = parseFloat(cashReceived) || 0;
  const changeToReturn = Math.max(0, cashNum - cartTotal);

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();

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

            {/* Píldoras de Categorías */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Todas las Categorías
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos */}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.current_stock <= 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between group relative cursor-pointer"
                  >
                    <div>
                      {/* Categoría y Stock */}
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-slate-500 truncate max-w-[100px]">
                          {p.category.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            isOutOfStock
                              ? "bg-rose-100 text-rose-700"
                              : p.current_stock <= p.min_stock_alert
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {p.current_stock} {p.base_unit.symbol}
                        </span>
                      </div>

                      {/* Nombre del Producto */}
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    {/* Precio y Botón Agregar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-black text-slate-900 font-mono">
                        Q {p.sale_price.toFixed(2)}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                        <Plus className="w-4 h-4" />
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
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Seleccionar Mesa
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Asignar Mesa / Espacio --</option>
                  {tables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id}>
                      {tbl.name}
                    </option>
                  ))}
                </select>
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
                  <p className="text-xs text-slate-500">Cliente: {customerName}</p>
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
