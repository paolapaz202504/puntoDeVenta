import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { DashboardMetrics } from "../types";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PlusCircle,
  Building2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onNavigate: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/finances/dashboard-metrics");
      setMetrics(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar métricas del tablero");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-600 font-medium">Cargando tablero administrativo...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No se pudieron cargar los datos del tablero.</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const maxChartValue = Math.max(
    ...metrics.chartData.map((d) => Math.max(d.sales, d.outflows)),
    100
  );

  return (
    <div className="space-y-6">
      {/* Encabezado y Accesos Rápidos */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-7 h-7 text-blue-600 mr-2.5" />
            Tablero Administrativo y Métricas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumen en tiempo real de ventas, compras, gastos de operación e inventario
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate("pos")}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Punto de Venta (POS)
          </button>
          <button
            onClick={() => onNavigate("entries")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nueva Compra
          </button>
          <button
            onClick={() => onNavigate("expenses")}
            className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Registrar Gasto
          </button>
          <button
            onClick={fetchMetrics}
            className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards: Ventas y Egresos de Hoy */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Resumen de Hoy ({new Date().toLocaleDateString("es-GT")})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ventas de Hoy
              </p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                Q {metrics.today.salesTotal.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {metrics.today.salesCount} transacción(es) registrada(s)
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Egresos de Hoy
              </p>
              <h3 className="text-2xl font-black text-rose-700 mt-1 font-mono">
                Q {metrics.today.outflowsTotal.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compras pagadas + Gastos del día
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Balance Neto de Hoy
              </p>
              <h3
                className={`text-2xl font-black mt-1 font-mono ${
                  metrics.today.netBalance >= 0 ? "text-blue-700" : "text-rose-700"
                }`}
              >
                Q {metrics.today.netBalance.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {metrics.today.netBalance >= 0 ? "Flujo positivo en caja" : "Déficit del día"}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                metrics.today.netBalance >= 0
                  ? "bg-blue-50 text-blue-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: Mes Actual */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Rendimiento del Mes Actual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Ventas del Mes</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              Q {metrics.month.salesTotal.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
              Ingresos brutos acumulados
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Compras de Mercadería</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              Q {metrics.month.purchasesTotal.toFixed(2)}
            </div>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Pagos e inversión en stock
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Gastos de Operación</span>
              <Receipt className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              Q {metrics.month.expensesTotal.toFixed(2)}
            </div>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              Planilla, energía, sat, etc.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Utilidad Neta Mes</span>
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </div>
            <div
              className={`text-2xl font-black mt-2 font-mono ${
                metrics.month.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              Q {metrics.month.netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Ventas - (Compras + Gastos)
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo de los Últimos 7 Días */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              Tendencia de Ventas vs Egresos (Últimos 7 días)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativa diaria de flujo de ingresos por ventas contra salidas por compras y gastos
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-bold">
            <span className="flex items-center text-emerald-700">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5"></span>
              Ventas (Ingresos)
            </span>
            <span className="flex items-center text-rose-700">
              <span className="w-3 h-3 bg-rose-500 rounded-sm mr-1.5"></span>
              Egresos (Salidas)
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4 h-56 items-end pt-6 pb-2">
          {metrics.chartData.map((d, index) => {
            const salesHeight = Math.max(6, Math.min(100, (d.sales / maxChartValue) * 100));
            const outflowsHeight = Math.max(6, Math.min(100, (d.outflows / maxChartValue) * 100));

            return (
              <div key={index} className="flex flex-col items-center h-full justify-end group">
                {/* Tooltip hovering info */}
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-center hidden sm:block">
                  V: Q{d.sales.toFixed(0)} <br /> E: Q{d.outflows.toFixed(0)}
                </div>

                {/* Bars side by side */}
                <div className="w-full flex items-end justify-center space-x-1 sm:space-x-2 h-40">
                  <div
                    style={{ height: `${salesHeight}%` }}
                    className="w-full max-w-[20px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative"
                    title={`Ventas: Q ${d.sales.toFixed(2)}`}
                  ></div>
                  <div
                    style={{ height: `${outflowsHeight}%` }}
                    className="w-full max-w-[20px] bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all relative"
                    title={`Egresos: Q ${d.outflows.toFixed(2)}`}
                  ></div>
                </div>

                <span className="text-[11px] font-bold text-slate-600 mt-2 font-mono">
                  {d.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Productos Más Vendidos + Alertas de Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Productos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <ShoppingBag className="w-5 h-5 text-purple-600 mr-2" />
              Top Productos Más Vendidos
            </h2>
            <button
              onClick={() => onNavigate("sales")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver Todas las Ventas →
            </button>
          </div>

          {metrics.topProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Aún no hay ventas registradas en el mes actual.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {metrics.topProducts.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold mr-3">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.quantity} unidades despachadas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 font-mono">
                      Q {p.revenue.toFixed(2)}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold">Total generado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de Inventario Crítico */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              Stock Crítico y Reposición Requerida
            </h2>
            <button
              onClick={() => onNavigate("entries")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Comprar Stock →
            </button>
          </div>

          {metrics.criticalInventory.products.length === 0 ? (
            <div className="py-8 text-center text-emerald-600 font-medium text-sm flex flex-col items-center">
              <Package className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
              Todos los productos tienen niveles óptimos de inventario.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {metrics.criticalInventory.products.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400">{item.code}</span>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        item.current_stock === 0
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.current_stock === 0
                        ? "AGOTADO (0)"
                        : `Stock: ${item.current_stock} ${item.unit_symbol}`}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Alerta en: {item.min_stock_alert} {item.unit_symbol}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
