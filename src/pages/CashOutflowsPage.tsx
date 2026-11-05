import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { OutflowItem } from "../types";
import {
  TrendingDown,
  Search,
  RefreshCw,
  Package,
  Receipt,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";

export const CashOutflowsPage: React.FC = () => {
  const [items, setItems] = useState<OutflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalOutflows: 0,
    totalPurchasesAmount: 0,
    totalExpensesAmount: 0,
  });

  // Filtros
  const [search, setSearch] = useState("");
  const [outflowType, setOutflowType] = useState<"TODOS" | "COMPRA" | "GASTO">("TODOS");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOutflows = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit,
        outflow_type: outflowType,
      };

      if (search.trim()) params.search = search.trim();
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/finances/outflows", { params });
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      if (res.data.summary) {
        setSummary(res.data.summary);
      }
      setPage(targetPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar reporte de egresos de dinero");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutflows(1);
  }, [outflowType]);

  const handleApplyFilters = () => {
    fetchOutflows(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOutflowType("TODOS");
    setPaymentMethod("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchOutflows(1);
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <TrendingDown className="w-7 h-7 text-rose-600 mr-2.5" />
            Egresos y Salidas de Dinero
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consolidado unificado de pagos de mercadería (compras) y gastos operativos del restaurante
          </p>
        </div>
      </div>

      {/* KPI Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Egresos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Egresos
            </p>
            <h3 className="text-2xl font-black text-rose-700 mt-1 font-mono">
              Q {summary.totalOutflows.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compras pagadas + Gastos registrados
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Compras de Mercadería */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Compras de Mercadería
            </p>
            <h3 className="text-2xl font-black text-blue-700 mt-1 font-mono">
              Q {summary.totalPurchasesAmount.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pagos al contado y abonos de crédito
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Gastos de Operación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Gastos Operativos
            </p>
            <h3 className="text-2xl font-black text-amber-700 mt-1 font-mono">
              Q {summary.totalExpensesAmount.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Planilla, servicios, SAT, alquiler, etc.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Píldoras de Tipo */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
            Tipo de Egreso:
          </span>
          <button
            type="button"
            onClick={() => setOutflowType("TODOS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              outflowType === "TODOS"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Todos los Egresos
          </button>
          <button
            type="button"
            onClick={() => setOutflowType("COMPRA")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              outflowType === "COMPRA"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Compras de Mercadería
          </button>
          <button
            type="button"
            onClick={() => setOutflowType("GASTO")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              outflowType === "GASTO"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Gastos Operativos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar referencia, doc o banco..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de Pago */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="">-- Todos los Métodos --</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="CHEQUE">Cheque</option>
            <option value="DEPOSITO">Depósito Bancario</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>

          {/* Fecha Inicio */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          />

          {/* Fecha Fin */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Acciones de filtro */}
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

      {/* Tabla Unificada de Egresos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold">Cargando egresos...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-base font-bold text-slate-700">No se encontraron egresos de dinero</p>
            <p className="text-xs text-slate-500 mt-1">Ajuste los filtros de búsqueda o fecha.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Referencia</th>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Tipo de Egreso</th>
                  <th className="px-5 py-3.5">Descripción / Concepto</th>
                  <th className="px-5 py-3.5">Método de Pago</th>
                  <th className="px-5 py-3.5 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                      {item.reference_number}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono">
                      {new Date(item.date).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {item.outflow_type === "COMPRA" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                          <Package className="w-3 h-3 mr-1" />
                          Compra Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Receipt className="w-3 h-3 mr-1" />
                          Gasto Operativo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 max-w-sm truncate">
                      {item.description}
                      {item.notes && (
                        <span className="block text-[11px] text-slate-400 italic">
                          Nota: {item.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{item.payment_method}</div>
                      {item.bank_name && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.bank_name} - {item.document_number}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-black text-rose-700 text-sm">
                      Q {item.amount.toFixed(2)}
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
                onClick={() => fetchOutflows(page - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchOutflows(page + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
