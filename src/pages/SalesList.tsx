import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Sale } from "../types";
import {
  Search,
  ShoppingCart,
  Eye,
  Ban,
  RefreshCw,
  CreditCard,
  Banknote,
  Send,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);

  // Filtros
  const [search, setSearch] = useState("");
  const [saleType, setSaleType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal de Detalle
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal de Anulación
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSales = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit,
        sortBy: "sale_date",
        order: "desc",
      };

      if (search.trim()) params.search = search.trim();
      if (saleType) params.sale_type = saleType;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/sales", { params });
      setSales(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      setTotalSalesAmount(res.data.totalSalesAmount || 0);
      setPage(targetPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar listado de ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(1);
  }, []);

  const handleApplyFilters = () => {
    fetchSales(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSaleType("");
    setPaymentMethod("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchSales(1);
    }, 50);
  };

  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSelectedSale(res.data);
      setIsDetailOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar detalle de venta");
    }
  };

  const handleConfirmCancel = async () => {
    if (!saleToCancel) return;
    setCancelling(true);
    try {
      await api.patch(`/sales/${saleToCancel.id}/cancel`);
      toast.success(`Venta ${saleToCancel.sale_number} anulada correctamente. Se restituyó el inventario.`);
      setSaleToCancel(null);
      fetchSales(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al anular venta");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ShoppingCart className="w-7 h-7 text-blue-600 mr-2.5" />
            Historial de Ventas y Comandas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro cronológico de transacciones en caja, detalle de consumos y anulación
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">
              Ventas Filtradas
            </span>
            <div className="text-xl font-black font-mono text-emerald-800">
              Q {totalSalesAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="No. Venta, Cliente o Doc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de Venta */}
          <select
            value={saleType}
            onChange={(e) => setSaleType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Todos los Tipos --</option>
            <option value="DIRECTA">Venta Directa</option>
            <option value="MESA">Consumo en Mesa</option>
            <option value="LLEVAR">Para Llevar</option>
            <option value="DELIVERY">Delivery</option>
          </select>

          {/* Método de Pago */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Todos los Métodos --</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta POS</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>

          {/* Estado */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Todos los Estados --</option>
            <option value="COMPLETADA">Completada</option>
            <option value="ANULADA">Anulada</option>
          </select>

          {/* Fecha Inicio */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Botones de Filtro */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Se encontraron <strong className="text-slate-800">{totalCount}</strong> registro(s)
          </span>

          <div className="flex space-x-2">
            <button
              onClick={handleClearFilters}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={handleApplyFilters}
              className="inline-flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Actualizar Lista
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold">Cargando ventas...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-base font-bold text-slate-700">No se encontraron ventas</p>
            <p className="text-xs text-slate-500 mt-1">Ajuste los filtros o registre una nueva venta en el POS.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">No. Venta</th>
                  <th className="px-5 py-3.5">Fecha y Hora</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Tipo / Mesa</th>
                  <th className="px-5 py-3.5">Método de Pago</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                  <th className="px-5 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                      {sale.sale_number}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono">
                      {new Date(sale.sale_date).toLocaleString("es-GT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                      {sale.customer_name}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {sale.sale_type === "MESA" ? `Mesa: ${sale.table?.name || "Sin asignar"}` : sale.sale_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700">
                      <div className="flex items-center space-x-1.5">
                        {sale.payment_method === "EFECTIVO" ? (
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        ) : sale.payment_method === "TARJETA" ? (
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        <span>{sale.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-black text-slate-900">
                      Q {sale.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === "COMPLETADA"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleViewDetail(sale.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {sale.status === "COMPLETADA" && (
                        <button
                          onClick={() => setSaleToCancel(sale)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Anular venta y restituir stock"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Página {page} de {totalPages}
            </span>
            <div className="flex space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => fetchSales(page - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchSales(page + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE VENTA */}
      {isDetailOpen && selectedSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detalle de Venta {selectedSale.sale_number}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {new Date(selectedSale.sale_date).toLocaleString("es-GT")}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Cliente:</span>
                  <span className="font-bold text-slate-800">{selectedSale.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Tipo de Consumo:</span>
                  <span className="font-bold text-slate-800">
                    {selectedSale.sale_type}{" "}
                    {selectedSale.table ? `(${selectedSale.table.name})` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Método de Pago:</span>
                  <span className="font-bold text-slate-800">{selectedSale.payment_method}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Estado:</span>
                  <span
                    className={`font-bold ${
                      selectedSale.status === "COMPLETADA" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {selectedSale.status}
                  </span>
                </div>
              </div>

              {/* Lista de Productos */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Artículos Consumidos
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {selectedSale.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-slate-500 font-mono">
                          {item.quantity} x Q {item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        Q {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between font-black text-sm">
                <span>TOTAL DE LA VENTA:</span>
                <span className="text-lg font-mono text-emerald-800">
                  Q {selectedSale.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ANULACIÓN */}
      {saleToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ban className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">¿Anular Venta?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Se anulará la transacción <strong className="font-mono">{saleToCancel.sale_number}</strong> por{" "}
              <strong>Q {saleToCancel.total.toFixed(2)}</strong> y se restituirá automáticamente el inventario de los productos vendidos.
            </p>

            <div className="mt-6 flex space-x-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setSaleToCancel(null)}
                className="w-1/2 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                No, Volver
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center"
              >
                {cancelling ? "Anulando..." : "Sí, Anular"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
