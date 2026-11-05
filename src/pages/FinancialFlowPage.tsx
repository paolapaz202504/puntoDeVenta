import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { FinancialFlowSummary } from "../types";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";

export const FinancialFlowPage: React.FC = () => {
  const [data, setData] = useState<FinancialFlowSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all" | "custom">("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const calculateDates = (selectedPeriod: string) => {
    const now = new Date();
    let start = "";
    let end = "";

    if (selectedPeriod === "today") {
      start = now.toISOString().substring(0, 10);
      end = now.toISOString().substring(0, 10);
    } else if (selectedPeriod === "week") {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      start = d.toISOString().substring(0, 10);
      end = now.toISOString().substring(0, 10);
    } else if (selectedPeriod === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = firstDay.toISOString().substring(0, 10);
      end = now.toISOString().substring(0, 10);
    }

    return { start, end };
  };

  const fetchFlow = async () => {
    try {
      setLoading(true);
      let sDate = startDate;
      let eDate = endDate;

      if (period !== "custom" && period !== "all") {
        const calculated = calculateDates(period);
        sDate = calculated.start;
        eDate = calculated.end;
      }

      const params: any = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;

      const res = await api.get("/finances/flow", { params });
      setData(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar flujo de caja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== "custom") {
      fetchFlow();
    }
  }, [period]);

  const handleCustomSearch = () => {
    fetchFlow();
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case "PERSONAL_PLANILLA":
        return "Personal / Planilla";
      case "ENERGIA_ELECTRICA":
        return "Energía Eléctrica";
      case "AGUA_POTABLE":
        return "Agua Potable";
      case "GAS_PROPANO":
        return "Gas Propano";
      case "IMPUESTOS_SAT":
        return "Impuestos / SAT";
      case "ALQUILER":
        return "Alquiler";
      case "MANTENIMIENTO":
        return "Mantenimiento";
      case "DESECHABLES_LIMPIEZA":
        return "Desechables y Limpieza";
      default:
        return "Otros Gastos";
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <DollarSign className="w-7 h-7 text-emerald-600 mr-2.5" />
            Flujo Financiero y Rendimiento de Caja
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Balance consolidado de ingresos por ventas contra egresos por compras de inventario y gastos operativos
          </p>
        </div>

        <button
          onClick={fetchFlow}
          className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer mt-3 sm:mt-0"
          title="Actualizar datos"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Selector de Periodo */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Periodo:
          </span>
          <button
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === "today"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === "week"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === "month"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Historial Completo
          </button>
          <button
            onClick={() => setPeriod("custom")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === "custom"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Personalizado
          </button>
        </div>

        {period === "custom" && (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
            />
            <span className="text-xs text-slate-400">a</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
            />
            <button
              onClick={handleCustomSearch}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Consultar
            </button>
          </div>
        )}
      </div>

      {loading || !data ? (
        <div className="p-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold">Calculando balance financiero...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjetas Principales del Flujo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Ingresos Totales */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Ingresos (Ventas)
                </span>
                <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
                  Q {data.summary.totalInflows.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data.summary.salesCount} venta(s) completada(s)
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpRight className="w-8 h-8" />
              </div>
            </div>

            {/* Egresos Totales */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Egresos (Salidas)
                </span>
                <div className="text-3xl font-black text-rose-700 font-mono mt-1">
                  Q {data.summary.totalOutflows.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Q {data.summary.purchasesOutflows.toFixed(2)} compras + Q {data.summary.expensesOutflows.toFixed(2)} gastos
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownRight className="w-8 h-8" />
              </div>
            </div>

            {/* Flujo Neto */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Flujo de Caja Neto
                </span>
                <div
                  className={`text-3xl font-black font-mono mt-1 ${
                    data.summary.netCashFlow >= 0 ? "text-blue-700" : "text-rose-700"
                  }`}
                >
                  Q {data.summary.netCashFlow.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data.summary.netCashFlow >= 0
                    ? "Excedente positivo en el periodo"
                    : "Déficit en el periodo"}
                </p>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  data.summary.netCashFlow >= 0
                    ? "bg-blue-50 text-blue-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Desglose por Métodos de Pago */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingresos por Método */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                Ingresos por Método de Cobro
              </h3>
              <div className="mt-4 space-y-3">
                {Object.entries(data.inflowsByMethod).map(([method, amount]) => {
                  const pct =
                    data.summary.totalInflows > 0
                      ? (amount / data.summary.totalInflows) * 100
                      : 0;
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{method}</span>
                        <span className="font-mono text-emerald-800">
                          Q {amount.toFixed(2)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Egresos por Método */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center">
                <TrendingDown className="w-5 h-5 text-rose-600 mr-2" />
                Egresos por Método de Pago
              </h3>
              <div className="mt-4 space-y-3">
                {Object.entries(data.outflowsByMethod).map(([method, amount]) => {
                  const pct =
                    data.summary.totalOutflows > 0
                      ? (amount / data.summary.totalOutflows) * 100
                      : 0;
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{method}</span>
                        <span className="font-mono text-rose-800">
                          Q {amount.toFixed(2)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-rose-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desglose de Gastos por Categoría */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center">
              <PieChart className="w-5 h-5 text-amber-600 mr-2" />
              Gastos Operativos por Categoría
            </h3>

            {Object.keys(data.expensesByCategory).length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No hay gastos operativos registrados en este periodo.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.expensesByCategory).map(([cat, amount]) => (
                  <div key={cat} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {getCategoryName(cat)}
                    </span>
                    <div className="text-xl font-black font-mono text-amber-900 mt-1">
                      Q {amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
