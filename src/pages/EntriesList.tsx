import React, { useState, useEffect } from "react";
import { api } from "../../src/services/api";
import { Supplier, StockEntry } from "../types";
import { StockEntryModal } from "../components/modals/StockEntryModal";
import { PaymentModal } from "../components/modals/PaymentModal";
import { StockEntryDetailModal } from "../components/modals/StockEntryDetailModal";
import {
  PackagePlus,
  Search,
  Plus,
  RefreshCw,
  Boxes,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface MetricsData {
  totalEntries: number;
  totalPurchasesAmount: number;
  totalPendingBalance: number;
  pendingCreditCount: number;
}

export const EntriesList: React.FC = () => {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData>({
    totalEntries: 0,
    totalPurchasesAmount: 0,
    totalPendingBalance: 0,
    pendingCreditCount: 0,
  });

  // Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modales
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StockEntry | null>(null);

  useEffect(() => {
    loadSuppliers();
    loadMetrics();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [page, searchTerm, supplierFilter, typeFilter, statusFilter]);

  const loadSuppliers = async () => {
    try {
      const res = await api.get("/suppliers?limit=100&sortBy=name&order=asc");
      const list =
        res.data?.items ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setSuppliers(list);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await api.get("/stock-entries/metrics");
      if (res.data?.data) {
        setMetrics(res.data.data);
      }
    } catch (error) {
      console.error("Error al cargar métricas de entradas:", error);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (supplierFilter) params.append("supplier_id", supplierFilter);
      if (typeFilter) params.append("entry_type", typeFilter);
      if (statusFilter) params.append("payment_status", statusFilter);

      const res = await api.get(`/stock-entries?${params.toString()}`);
      if (res.data?.data) {
        setEntries(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalRecords(res.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error al consultar entradas:", error);
      toast.error("Error al cargar entradas de almacén");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMetrics();
    loadEntries();
  };

  const handleOpenPayment = (entry: StockEntry) => {
    setSelectedEntry(entry);
    setIsPaymentModalOpen(true);
  };

  const handleOpenDetail = (entry: StockEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  };

  const getPaymentStatusBadge = (status: string, balance: number) => {
    switch (status) {
      case "PAGADA":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Pagada
          </span>
        );
      case "PARCIAL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Parcial (Q{balance.toFixed(2)})
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pendiente (Q{balance.toFixed(2)})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
            No Aplica
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "COMPRA":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Compra
          </span>
        );
      case "DONACION":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Donación
          </span>
        );
      case "AJUSTE":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            Ajuste
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-50 text-slate-700 border border-slate-200 uppercase tracking-wider">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Módulo de Entradas y Compras
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Recepción de mercadería, compras a proveedores, ajuste de costos y gestión de pagos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Entrada
          </button>
        </div>
      </div>

      {/* Tarjetas Informativas / Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Entradas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Entradas Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {metrics.totalEntries}
            </span>
            <span className="text-xs text-slate-500 font-medium">registros</span>
          </div>
        </div>

        {/* Total Compras */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Monto en Compras
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-indigo-700">
              Q{metrics.totalPurchasesAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cuentas por Pagar (Saldo) */}
        <div
          className={`p-5 rounded-2xl border shadow-2xs ${
            metrics.totalPendingBalance > 0
              ? "bg-rose-50/50 border-rose-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                metrics.totalPendingBalance > 0 ? "text-rose-700" : "text-slate-400"
              }`}
            >
              Cuentas por Pagar
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metrics.totalPendingBalance > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black ${
                metrics.totalPendingBalance > 0 ? "text-rose-700" : "text-slate-900"
              }`}
            >
              Q{metrics.totalPendingBalance.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-medium">saldo</span>
          </div>
        </div>

        {/* Facturas a Crédito Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Créditos por Liquidar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-700">
              {metrics.pendingCreditCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">compras</span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número, factura, proveedor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro Proveedor */}
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Todos los Proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Filtro Tipo Entrada */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Todos los Tipos</option>
            <option value="COMPRA">Compra</option>
            <option value="DONACION">Donación</option>
            <option value="AJUSTE">Ajuste / Otro</option>
          </select>

          {/* Filtro Estado Pago */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Todos los Estados de Pago</option>
            <option value="PAGADA">Pagadas</option>
            <option value="PENDIENTE">Pendientes de Pago</option>
            <option value="PARCIAL">Con Pago Parcial</option>
          </select>
        </div>
      </div>

      {/* Tabla de Entradas */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">No. Entrada</th>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Proveedor</th>
                <th className="px-4 py-3.5">Factura / Doc.</th>
                <th className="px-4 py-3.5 text-center">Ítems</th>
                <th className="px-4 py-3.5 text-right">Total</th>
                <th className="px-4 py-3.5 text-center">Estado Pago</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Cargando entradas y compras...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <PackagePlus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No se encontraron entradas registradas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const balance = Number(entry.balance_amount || 0);
                  const isCreditPending =
                    entry.entry_type === "COMPRA" &&
                    (entry.payment_status === "PENDIENTE" ||
                      entry.payment_status === "PARCIAL");

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* No. Entrada + Tipo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">
                            {entry.entry_number}
                          </span>
                          {getTypeBadge(entry.entry_type)}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </td>

                      {/* Proveedor */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 block">
                          {entry.supplier?.name || "—"}
                        </span>
                        {entry.supplier?.category && (
                          <span className="text-[10px] text-slate-400">
                            {entry.supplier.category}
                          </span>
                        )}
                      </td>

                      {/* Factura */}
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {entry.invoice_number || "—"}
                      </td>

                      {/* Cantidad de Ítems */}
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px]">
                          {entry.items?.length || 0} prod.
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right font-black text-slate-900">
                        Q{Number(entry.total_cost).toFixed(2)}
                      </td>

                      {/* Estado Pago */}
                      <td className="px-4 py-3 text-center">
                        {getPaymentStatusBadge(entry.payment_status, balance)}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(entry)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Abonar / Liquidar si tiene saldo */}
                          {isCreditPending && (
                            <button
                              type="button"
                              onClick={() => handleOpenPayment(entry)}
                              className="inline-flex items-center px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                              title="Registrar Abono o Pago Total"
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              Abonar
                            </button>
                          )}
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
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> (
              {totalRecords} entradas)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <StockEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        entry={selectedEntry}
        onPaymentSuccess={handleRefresh}
      />

      <StockEntryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        entry={selectedEntry}
        onOpenPayment={handleOpenPayment}
      />
    </div>
  );
};
