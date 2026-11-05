import React, { useState, useEffect, useMemo } from "react";
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
  Receipt,
  Building2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onNavigate: (tab: any) => void;
}

type GroupingType = "HORA" | "DIA" | "SEMANA" | "MES" | "AÑO";

const GROUPING_OPTIONS: Array<{ id: GroupingType; label: string }> = [
  { id: "HORA", label: "Hora" },
  { id: "DIA", label: "Día" },
  { id: "SEMANA", label: "Sem" },
  { id: "MES", label: "Mes" },
  { id: "AÑO", label: "Año" },
];

// Helper: Formatear Date a dd/mm/yyyy
function formatDateDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Helper: Parsear dd/mm/yyyy a Date
function parseDDMMYYYY(str: string): Date | null {
  const parts = str.trim().split("/");
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m - 1, d);
}

// Helper: Convertir Date a YYYY-MM-DD
function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  PERSONAL_PLANILLA: "Personal / Planilla",
  ENERGIA_ELECTRICA: "Energía Eléctrica",
  AGUA_POTABLE: "Agua Potable",
  GAS_PROPANO: "Gas Propano",
  IMPUESTOS_SAT: "Impuestos / SAT",
  ALQUILER: "Alquiler",
  MANTENIMIENTO: "Mantenimiento",
  DESECHABLES_LIMPIEZA: "Desechables / Limpieza",
  OTROS: "Otros Gastos",
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros de Temporalidad (dd/mm/yyyy)
  const todayDate = new Date();
  const [activeTag, setActiveTag] = useState<"hoy" | "semana" | "mes" | "dos_meses" | "custom">("hoy");
  const [startDateInput, setStartDateInput] = useState<string>(formatDateDDMMYYYY(todayDate));
  const [endDateInput, setEndDateInput] = useState<string>(formatDateDDMMYYYY(todayDate));

  // Opciones de Agrupación Temporal por Sección
  const [salesGrouping, setSalesGrouping] = useState<GroupingType>("DIA");
  const [salesCategoryFilter, setSalesCategoryFilter] = useState<string>("ALL");
  const [salesCatChartGrouping, setSalesCatChartGrouping] = useState<GroupingType>("DIA");

  const [purchasesGrouping, setPurchasesGrouping] = useState<GroupingType>("DIA");
  const [purchasesCategoryFilter, setPurchasesCategoryFilter] = useState<string>("ALL");
  const [purchasesCatChartGrouping, setPurchasesCatChartGrouping] = useState<GroupingType>("DIA");

  const [expensesGrouping, setExpensesGrouping] = useState<GroupingType>("DIA");
  const [expensesCategoryFilter, setExpensesCategoryFilter] = useState<string>("ALL");
  const [expensesCatChartGrouping, setExpensesCatChartGrouping] = useState<GroupingType>("DIA");

  const [inventoryGrouping, setInventoryGrouping] = useState<GroupingType>("DIA");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>("ALL");

  // Hover Tooltip para el Gráfico de Líneas
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  // Función para consultar datos al backend
  const fetchMetrics = async (sDateStr: string, eDateStr: string) => {
    try {
      setLoading(true);
      const parsedStart = parseDDMMYYYY(sDateStr);
      const parsedEnd = parseDDMMYYYY(eDateStr);

      if (!parsedStart || !parsedEnd) {
        toast.error("Formato de fecha inválido. Debe ser dd/mm/yyyy");
        setLoading(false);
        return;
      }

      if (parsedStart > parsedEnd) {
        toast.error("La fecha inicial no puede ser posterior a la fecha final");
        setLoading(false);
        return;
      }

      const isoStart = `${toISODateString(parsedStart)}T00:00:00.000`;
      const isoEnd = `${toISODateString(parsedEnd)}T23:59:59.999`;

      const res = await api.get("/finances/dashboard-metrics", {
        params: {
          startDate: isoStart,
          endDate: isoEnd,
        },
      });

      setMetrics(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar métricas del tablero");
    } finally {
      setLoading(false);
    }
  };

  // Manejador de Tags rápidos
  const handleSelectTag = (tag: "hoy" | "semana" | "mes" | "dos_meses") => {
    setActiveTag(tag);
    const end = new Date();
    const start = new Date();

    if (tag === "hoy") {
      // Mismo día
    } else if (tag === "semana") {
      start.setDate(start.getDate() - 7);
    } else if (tag === "mes") {
      start.setMonth(start.getMonth() - 1);
    } else if (tag === "dos_meses") {
      start.setMonth(start.getMonth() - 2);
    }

    const sFormatted = formatDateDDMMYYYY(start);
    const eFormatted = formatDateDDMMYYYY(end);
    setStartDateInput(sFormatted);
    setEndDateInput(eFormatted);
    fetchMetrics(sFormatted, eFormatted);
  };

  useEffect(() => {
    fetchMetrics(startDateInput, endDateInput);
  }, []);

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTag("custom");
    fetchMetrics(startDateInput, endDateInput);
  };

  // -------------------------------------------------------------
  // Cálculos y Agrupaciones en Tiempo Real
  // -------------------------------------------------------------

  // Función genérica para obtener la clave de agrupación según fecha
  const getGroupKey = (dateStr: string, grouping: GroupingType): { key: string; label: string; order: number } => {
    const d = new Date(dateStr);
    if (grouping === "HORA") {
      const h = d.getHours();
      const label = `${String(h).padStart(2, "0")}:00`;
      return { key: String(h), label, order: h };
    }
    if (grouping === "DIA") {
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const key = `${d.getFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const label = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
      return { key, label, order: d.getTime() };
    }
    if (grouping === "SEMANA") {
      const day = d.getDate();
      const weekNum = Math.ceil(day / 7);
      const label = `Semana ${weekNum}`;
      return { key: `W${weekNum}`, label, order: weekNum };
    }
    if (grouping === "MES") {
      const month = d.getMonth();
      const monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      const key = `${d.getFullYear()}-${String(month + 1).padStart(2, "0")}`;
      const label = `${monthNames[month]} ${d.getFullYear()}`;
      return { key, label, order: d.getFullYear() * 100 + (month + 1) };
    }
    // AÑO
    const y = d.getFullYear();
    return { key: String(y), label: String(y), order: y };
  };

  // 1. Agrupación Ventas (Gráfico de Ventas)
  const salesTimeChartData = useMemo(() => {
    if (!metrics) return [];
    const map: Record<string, { label: string; value: number; order: number }> = {};

    for (const sale of metrics.sales) {
      let saleTotal = 0;
      if (salesCategoryFilter === "ALL") {
        saleTotal = sale.total;
      } else {
        saleTotal = sale.items
          .filter((item) => item.category_id === salesCategoryFilter)
          .reduce((sum, item) => sum + item.subtotal, 0);
      }

      if (saleTotal > 0 || salesCategoryFilter === "ALL") {
        const { key, label, order } = getGroupKey(sale.sale_date, salesGrouping);
        if (!map[key]) {
          map[key] = { label, value: 0, order };
        }
        map[key].value += saleTotal;
      }
    }

    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [metrics, salesGrouping, salesCategoryFilter]);

  // 2. Gráfico Categorías Vendidas
  const salesCategoriesChartData = useMemo(() => {
    if (!metrics) return [];
    const timeKeys = new Set<string>();
    for (const sale of metrics.sales) {
      timeKeys.add(getGroupKey(sale.sale_date, salesCatChartGrouping).key);
    }
    const hasMultipleTimes = timeKeys.size > 1;

    const catMap: Record<string, { label: string; value: number; order: number }> = {};

    for (const sale of metrics.sales) {
      const { key: timeKey, label: timeLabel, order: timeOrder } = getGroupKey(sale.sale_date, salesCatChartGrouping);

      for (const item of sale.items) {
        const catName = item.category_name || "Sin Categoría";
        const compositeKey = hasMultipleTimes ? `${item.category_id || catName}__${timeKey}` : (item.category_id || catName);
        const label = hasMultipleTimes ? `${catName} (${timeLabel})` : catName;

        if (!catMap[compositeKey]) {
          catMap[compositeKey] = { label, value: 0, order: timeOrder };
        }
        catMap[compositeKey].value += item.subtotal;
      }
    }

    return Object.values(catMap)
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [metrics, salesCatChartGrouping]);

  // 3. Agrupación Compras (Gráfico de Compras)
  const purchasesTimeChartData = useMemo(() => {
    if (!metrics) return [];
    const map: Record<string, { label: string; value: number; order: number }> = {};

    for (const purchase of metrics.purchases) {
      let costTotal = 0;
      if (purchasesCategoryFilter === "ALL") {
        costTotal = purchase.total_cost;
      } else {
        costTotal = purchase.items
          .filter((item) => item.category_id === purchasesCategoryFilter)
          .reduce((sum, item) => sum + item.total_cost, 0);
      }

      if (costTotal > 0 || purchasesCategoryFilter === "ALL") {
        const { key, label, order } = getGroupKey(purchase.entry_date, purchasesGrouping);
        if (!map[key]) {
          map[key] = { label, value: 0, order };
        }
        map[key].value += costTotal;
      }
    }

    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [metrics, purchasesGrouping, purchasesCategoryFilter]);

  // 4. Gráfico Categorías Compradas
  const purchasesCategoriesChartData = useMemo(() => {
    if (!metrics) return [];
    const timeKeys = new Set<string>();
    for (const purchase of metrics.purchases) {
      timeKeys.add(getGroupKey(purchase.entry_date, purchasesCatChartGrouping).key);
    }
    const hasMultipleTimes = timeKeys.size > 1;

    const catMap: Record<string, { label: string; value: number; order: number }> = {};

    for (const purchase of metrics.purchases) {
      const { key: timeKey, label: timeLabel, order: timeOrder } = getGroupKey(purchase.entry_date, purchasesCatChartGrouping);

      for (const item of purchase.items) {
        const catName = item.category_name || "Sin Categoría";
        const compositeKey = hasMultipleTimes ? `${item.category_id || catName}__${timeKey}` : (item.category_id || catName);
        const label = hasMultipleTimes ? `${catName} (${timeLabel})` : catName;

        if (!catMap[compositeKey]) {
          catMap[compositeKey] = { label, value: 0, order: timeOrder };
        }
        catMap[compositeKey].value += item.total_cost;
      }
    }

    return Object.values(catMap)
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [metrics, purchasesCatChartGrouping]);

  // 5. Agrupación Gastos de Operación (Gráfico de Gastos)
  const expensesTimeChartData = useMemo(() => {
    if (!metrics) return [];
    const map: Record<string, { label: string; value: number; order: number }> = {};

    for (const expense of metrics.expenses) {
      if (expensesCategoryFilter === "ALL" || expense.category === expensesCategoryFilter) {
        const { key, label, order } = getGroupKey(expense.expense_date, expensesGrouping);
        if (!map[key]) {
          map[key] = { label, value: 0, order };
        }
        map[key].value += expense.amount;
      }
    }

    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [metrics, expensesGrouping, expensesCategoryFilter]);

  // 6. Gráfico Categorías de Gastos de Operación
  const expensesCategoriesChartData = useMemo(() => {
    if (!metrics) return [];
    const timeKeys = new Set<string>();
    for (const expense of metrics.expenses) {
      timeKeys.add(getGroupKey(expense.expense_date, expensesCatChartGrouping).key);
    }
    const hasMultipleTimes = timeKeys.size > 1;

    const catMap: Record<string, { label: string; value: number; order: number }> = {};

    for (const expense of metrics.expenses) {
      const { key: timeKey, label: timeLabel, order: timeOrder } = getGroupKey(expense.expense_date, expensesCatChartGrouping);
      const categoryName = EXPENSE_CATEGORY_LABELS[expense.category] || expense.category;
      const compositeKey = hasMultipleTimes ? `${expense.category}__${timeKey}` : expense.category;
      const label = hasMultipleTimes ? `${categoryName} (${timeLabel})` : categoryName;

      if (!catMap[compositeKey]) {
        catMap[compositeKey] = { label, value: 0, order: timeOrder };
      }
      catMap[compositeKey].value += expense.amount;
    }

    return Object.values(catMap)
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [metrics, expensesCatChartGrouping]);

  // 7. Productos Más Vendidos
  const topProductsChartData = useMemo(() => {
    if (!metrics) return [];
    const timeKeys = new Set<string>();
    for (const sale of metrics.sales) {
      timeKeys.add(getGroupKey(sale.sale_date, inventoryGrouping).key);
    }
    const hasMultipleTimes = timeKeys.size > 1;

    const prodMap: Record<string, { label: string; value: number; revenue: number; order: number }> = {};

    for (const sale of metrics.sales) {
      const { key: timeKey, label: timeLabel, order: timeOrder } = getGroupKey(sale.sale_date, inventoryGrouping);

      for (const item of sale.items) {
        if (inventoryCategoryFilter === "ALL" || item.category_id === inventoryCategoryFilter) {
          const compositeKey = hasMultipleTimes ? `${item.product_id}__${timeKey}` : item.product_id;
          const label = hasMultipleTimes ? `${item.product_name} (${timeLabel})` : item.product_name;

          if (!prodMap[compositeKey]) {
            prodMap[compositeKey] = {
              label,
              value: 0,
              revenue: 0,
              order: timeOrder,
            };
          }
          prodMap[compositeKey].value += item.quantity;
          prodMap[compositeKey].revenue += item.subtotal;
        }
      }
    }

    return Object.values(prodMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [metrics, inventoryCategoryFilter, inventoryGrouping]);

  // -------------------------------------------------------------
  // Renderizado de Subcomponente de Gráfico de Barras Ergonómico
  // -------------------------------------------------------------
  const renderBarChart = (
    data: Array<{ label: string; value: number }>,
    barColorClass: string,
    emptyMessage: string
  ) => {
    if (data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
          {emptyMessage}
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
      <div className="mt-4 flex items-end space-x-2 sm:space-x-3 h-48 pt-6 pb-2 overflow-x-auto scrollbar-thin">
        {data.map((item, idx) => {
          const heightPercent = Math.max(6, Math.min(100, (item.value / maxValue) * 100));
          return (
            <div
              key={idx}
              className="flex-1 min-w-[38px] flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip hovering */}
              <div className="text-[10px] font-mono font-bold text-slate-700 bg-white shadow-md border border-slate-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap z-10">
                Q {item.value.toFixed(2)}
              </div>

              {/* Barra */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[32px] ${barColorClass} rounded-t-md transition-all relative group-hover:brightness-90`}
              ></div>

              {/* Etiqueta */}
              <span className="text-[10px] font-bold text-slate-500 mt-2 truncate max-w-[48px] text-center" title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Encabezado y Filtro de Temporalidad                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
              <Building2 className="w-7 h-7 text-blue-600 mr-2.5" />
              Tablero Administrativo y Métricas
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Control general de ventas, compras, gastos de operación e inventario
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <button
              onClick={() => fetchMetrics(startDateInput, endDateInput)}
              className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtro Temporal con Tags y Formato dd/mm/yyyy */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tags Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Rango Rápido:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTag("hoy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTag === "hoy"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handleSelectTag("semana")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTag === "semana"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => handleSelectTag("mes")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTag === "mes"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => handleSelectTag("dos_meses")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTag === "dos_meses"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Dos Meses
            </button>
          </div>

          {/* Formulario Fechas dd/mm/yyyy */}
          <form onSubmit={handleApplyCustomDates} className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-bold text-slate-500">Desde (00:00:00):</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-32 pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-bold text-slate-500">Hasta (23:59:59):</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="w-32 pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Filtrar Rango
            </button>
          </form>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold">Cargando métricas y gráficos del período...</p>
        </div>
      ) : (
        <>
          {/* ------------------------------------------------------------- */}
          {/* 2. Resumen de 4 Montos del Período Seleccionado                */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Monto de Ventas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  1. Ventas / Salidas
                </p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                  Q {metrics.summary.salesTotal.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {metrics.sales.length} venta(s) completada(s)
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>

            {/* 2. Monto de Compras */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. Compras / Entradas
                </p>
                <h3 className="text-2xl font-black text-blue-700 mt-1 font-mono">
                  Q {metrics.summary.purchasesTotal.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {metrics.purchases.length} entrada(s) de stock
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* 3. Monto de Gastos de Operación */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. Gastos de Operación
                </p>
                <h3 className="text-2xl font-black text-amber-700 mt-1 font-mono">
                  Q {metrics.summary.expensesTotal.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Planilla, energía, gas, SAT, etc.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            {/* 4. Monto de Utilidad */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  4. Utilidad del Período
                </p>
                <h3
                  className={`text-2xl font-black mt-1 font-mono ${
                    metrics.summary.netProfit >= 0 ? "text-indigo-700" : "text-rose-700"
                  }`}
                >
                  Q {metrics.summary.netProfit.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ventas - Compras - Gastos
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  metrics.summary.netProfit >= 0 ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 3. Gráfico de Líneas Multi-Serie (Los 4 Montos por Día)       */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  Evolución Diaria: Ventas, Compras, Gastos y Utilidad
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gráfico de líneas con los 4 montos por cada día dentro del período seleccionado
                </p>
              </div>

              {/* Leyenda interactiva */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <span className="flex items-center text-emerald-700">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full mr-1.5"></span>
                  Ventas
                </span>
                <span className="flex items-center text-blue-700">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-1.5"></span>
                  Compras
                </span>
                <span className="flex items-center text-amber-700">
                  <span className="w-3 h-3 bg-amber-500 rounded-full mr-1.5"></span>
                  Gastos
                </span>
                <span className="flex items-center text-indigo-700">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full mr-1.5"></span>
                  Utilidad
                </span>
              </div>
            </div>

            {/* SVG Multi-Line Chart */}
            {metrics.dailyTrend.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No hay movimientos registrados en el período seleccionado.
              </div>
            ) : (
              <div className="mt-6 relative">
                {/* Tooltip flotante al pasar el mouse */}
                {hoveredLineIndex !== null && metrics.dailyTrend[hoveredLineIndex] && (
                  <div className="absolute top-2 right-4 bg-slate-900/90 text-white text-xs p-3 rounded-xl shadow-xl z-20 backdrop-blur-xs font-mono space-y-1">
                    <p className="font-bold text-slate-300 border-b border-slate-700 pb-1">
                      Fecha: {metrics.dailyTrend[hoveredLineIndex].date}
                    </p>
                    <p className="text-emerald-400">
                      Ventas: Q {metrics.dailyTrend[hoveredLineIndex].sales.toFixed(2)}
                    </p>
                    <p className="text-blue-400">
                      Compras: Q {metrics.dailyTrend[hoveredLineIndex].purchases.toFixed(2)}
                    </p>
                    <p className="text-amber-400">
                      Gastos: Q {metrics.dailyTrend[hoveredLineIndex].expenses.toFixed(2)}
                    </p>
                    <p className="text-indigo-300 font-bold">
                      Utilidad: Q {metrics.dailyTrend[hoveredLineIndex].profit.toFixed(2)}
                    </p>
                  </div>
                )}

                {(() => {
                  const points = metrics.dailyTrend;
                  const maxVal = Math.max(
                    ...points.map((p) => Math.max(p.sales, p.purchases, p.expenses, Math.abs(p.profit))),
                    100
                  );
                  const width = 800;
                  const height = 240;
                  const paddingX = 40;
                  const paddingY = 30;
                  const graphWidth = width - paddingX * 2;
                  const graphHeight = height - paddingY * 2;

                  const getX = (i: number) =>
                    points.length === 1
                      ? width / 2
                      : paddingX + (i / (points.length - 1)) * graphWidth;

                  const getY = (val: number) => {
                    const norm = Math.max(0, val) / maxVal;
                    return height - paddingY - norm * graphHeight;
                  };

                  const salesPath = points.map((p, i) => `${getX(i)},${getY(p.sales)}`).join(" ");
                  const purchasesPath = points.map((p, i) => `${getX(i)},${getY(p.purchases)}`).join(" ");
                  const expensesPath = points.map((p, i) => `${getX(i)},${getY(p.expenses)}`).join(" ");
                  const profitPath = points.map((p, i) => `${getX(i)},${getY(p.profit)}`).join(" ");

                  return (
                    <div className="w-full overflow-x-auto">
                      <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-64 sm:h-72 select-none"
                      >
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                          const y = height - paddingY - pct * graphHeight;
                          const gridVal = maxVal * pct;
                          return (
                            <g key={idx}>
                              <line
                                x1={paddingX}
                                y1={y}
                                x2={width - paddingX}
                                y2={y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                              />
                              <text
                                x={paddingX - 8}
                                y={y + 3}
                                textAnchor="end"
                                fontSize="10"
                                fill="#94a3b8"
                                fontFamily="monospace"
                              >
                                Q{gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : gridVal.toFixed(0)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Líneas */}
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={salesPath}
                        />
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={purchasesPath}
                        />
                        <polyline
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={expensesPath}
                        />
                        <polyline
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={profitPath}
                        />

                        {/* Puntos interactivos con hover */}
                        {points.map((p, i) => {
                          const cx = getX(i);
                          return (
                            <g
                              key={i}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredLineIndex(i)}
                              onMouseLeave={() => setHoveredLineIndex(null)}
                            >
                              <line
                                x1={cx}
                                y1={paddingY}
                                x2={cx}
                                y2={height - paddingY}
                                stroke={hoveredLineIndex === i ? "#cbd5e1" : "transparent"}
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                              <circle cx={cx} cy={getY(p.sales)} r={hoveredLineIndex === i ? 5 : 3.5} fill="#10b981" />
                              <circle cx={cx} cy={getY(p.purchases)} r={hoveredLineIndex === i ? 4.5 : 3} fill="#3b82f6" />
                              <circle cx={cx} cy={getY(p.expenses)} r={hoveredLineIndex === i ? 4.5 : 3} fill="#f59e0b" />
                              <circle cx={cx} cy={getY(p.profit)} r={hoveredLineIndex === i ? 4.5 : 3} fill="#6366f1" />

                              {/* Label en eje X */}
                              <text
                                x={cx}
                                y={height - 8}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#64748b"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {p.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 4. Sección Ventas (2 Gráficos)                                */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-600 mr-2" />
                  Módulo de Ventas
                </h2>
                <p className="text-xs text-slate-500">
                  Desglose temporal y distribución por categorías de productos vendidos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 4.1 Gráfico de Ventas */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">1. Gráfico de Ventas</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Filtro Categoría */}
                    <select
                      value={salesCategoryFilter}
                      onChange={(e) => setSalesCategoryFilter(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 outline-none"
                    >
                      <option value="ALL">Todas las Categorías</option>
                      {metrics.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    {/* Selector de Agrupación */}
                    <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                      {GROUPING_OPTIONS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setSalesGrouping(g.id)}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                            salesGrouping === g.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {renderBarChart(salesTimeChartData, "bg-emerald-500", "No hay ventas para este filtro temporal.")}
              </div>

              {/* 4.2 Gráfico de Categorías Vendidas */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">2. Categorías Vendidas</span>

                  {/* Agrupación temporal */}
                  <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                    {GROUPING_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setSalesCatChartGrouping(g.id)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          salesCatChartGrouping === g.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {renderBarChart(salesCategoriesChartData, "bg-teal-500", "No hay categorías vendidas en este período.")}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 5. Sección Compras (2 Gráficos)                               */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  Módulo de Compras y Entradas de Mercadería
                </h2>
                <p className="text-xs text-slate-500">
                  Volumen de compras temporal y distribución por categorías de insumos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 5.1 Gráfico de Compras */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">1. Gráfico de Compras</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      value={purchasesCategoryFilter}
                      onChange={(e) => setPurchasesCategoryFilter(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 outline-none"
                    >
                      <option value="ALL">Todas las Categorías</option>
                      {metrics.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                      {GROUPING_OPTIONS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setPurchasesGrouping(g.id)}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                            purchasesGrouping === g.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {renderBarChart(purchasesTimeChartData, "bg-blue-500", "No hay compras registradas en este período.")}
              </div>

              {/* 5.2 Gráfico de Categorías Compradas */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">2. Categorías Compradas</span>

                  <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                    {GROUPING_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setPurchasesCatChartGrouping(g.id)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          purchasesCatChartGrouping === g.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {renderBarChart(purchasesCategoriesChartData, "bg-indigo-500", "No hay categorías compradas en este período.")}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 6. Sección Gastos de Operación (2 Gráficos)                   */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center">
                  <Receipt className="w-5 h-5 text-amber-600 mr-2" />
                  Módulo de Gastos de Operación
                </h2>
                <p className="text-xs text-slate-500">
                  Registro de costos operativos, planilla, servicios básicos, impuestos y suministros
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 6.1 Gráfico de Gastos de Operación */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">1. Gastos de Operación</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <select
                      value={expensesCategoryFilter}
                      onChange={(e) => setExpensesCategoryFilter(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 outline-none"
                    >
                      <option value="ALL">Todas las Categorías</option>
                      {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                      {GROUPING_OPTIONS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setExpensesGrouping(g.id)}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                            expensesGrouping === g.id ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {renderBarChart(expensesTimeChartData, "bg-amber-500", "No hay gastos de operación registrados en este período.")}
              </div>

              {/* 6.2 Gráfico de Categorías Gastos de Operación */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">2. Categorías Gastos de Operación</span>

                  <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                    {GROUPING_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setExpensesCatChartGrouping(g.id)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          expensesCatChartGrouping === g.id ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {renderBarChart(expensesCategoriesChartData, "bg-orange-500", "No hay gastos por categoría en este período.")}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 7. Sección Inventario (Productos Más Vendidos y Stock Crítico)*/}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7.1 Productos Más Vendidos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <ShoppingBag className="w-5 h-5 text-purple-600 mr-2" />
                    1. Productos Más Vendidos
                  </h3>
                  <p className="text-xs text-slate-500">Unidades despachadas en el período</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 outline-none"
                  >
                    <option value="ALL">Todas las Categorías</option>
                    {metrics.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px] font-bold">
                    {GROUPING_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setInventoryGrouping(g.id)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          inventoryGrouping === g.id ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {topProductsChartData.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No se registraron ventas de productos en este período.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {topProductsChartData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800 truncate max-w-[200px]">
                          {idx + 1}. {item.label}
                        </span>
                        <span className="font-mono text-purple-700">
                          {item.value} unds (Q {item.revenue.toFixed(2)})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (item.value / (topProductsChartData[0]?.value || 1)) * 100
                            )}%`,
                          }}
                          className="h-full bg-purple-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7.2 Stock Crítico y Reposición Requerida */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-rose-500 mr-2" />
                      2. Stock Crítico y Reposición Requerida
                    </h3>
                    <p className="text-xs text-slate-500">
                      Productos con existencias en nivel de alerta mínima o agotados
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate("entries")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Comprar Insumos →
                  </button>
                </div>

                {metrics.criticalInventory.products.length === 0 ? (
                  <div className="py-16 text-center text-emerald-600 font-medium text-sm flex flex-col items-center">
                    <Package className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
                    Inventario en estado óptimo. No hay productos en nivel crítico.
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100 max-h-80 overflow-y-auto scrollbar-thin">
                    {metrics.criticalInventory.products.map((p) => {
                      const isZero = p.current_stock <= 0;
                      return (
                        <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">{p.code}</span>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <span className="text-[10px] text-slate-500">{p.category_name}</span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                isZero ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isZero ? "AGOTADO (0)" : `Stock: ${p.current_stock} ${p.unit_symbol}`}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Alerta en: {p.min_stock_alert} {p.unit_symbol}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
