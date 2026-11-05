import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Expense } from "../types";
import { ExpenseModal } from "../components/modals/ExpenseModal";
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export const ExpensesList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Filtros
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Crear
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Eliminar
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit,
        sortBy: "expense_date",
        order: "desc",
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/expenses", { params });
      setExpenses(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      setTotalAmount(res.data.totalAmount || 0);
      setPage(targetPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar gastos operativos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
  }, []);

  const handleApplyFilters = () => {
    fetchExpenses(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setPaymentMethod("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchExpenses(1);
    }, 50);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${expenseToDelete.id}`);
      toast.success("Gasto operativo eliminado exitosamente");
      setExpenseToDelete(null);
      fetchExpenses(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar gasto");
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
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
            <Receipt className="w-7 h-7 text-amber-600 mr-2.5" />
            Gastos Operativos del Negocio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro de salidas de dinero por planilla, servicios básicos, impuestos, mantenimiento y suministros
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[11px] font-bold text-amber-800 uppercase">
              Total Gastos Filtrados
            </span>
            <div className="text-xl font-black font-mono text-amber-900">
              Q {totalAmount.toFixed(2)}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Registrar Gasto
          </button>
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
              placeholder="Buscar gasto, doc o nota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Categoría */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
          >
            <option value="">-- Todas las Categorías --</option>
            <option value="PERSONAL_PLANILLA">Personal / Planilla</option>
            <option value="ENERGIA_ELECTRICA">Energía Eléctrica</option>
            <option value="AGUA_POTABLE">Agua Potable</option>
            <option value="GAS_PROPANO">Gas Propano</option>
            <option value="IMPUESTOS_SAT">Impuestos / SAT</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="DESECHABLES_LIMPIEZA">Desechables y Limpieza</option>
            <option value="OTROS">Otros Gastos</option>
          </select>

          {/* Tipo de Pago */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-amber-500"
          />

          {/* Fecha Fin */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-amber-500"
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
              className="inline-flex items-center px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Actualizar Lista
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Gastos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold">Cargando gastos operativos...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-base font-bold text-slate-700">No se encontraron gastos</p>
            <p className="text-xs text-slate-500 mt-1">Ajuste los filtros o registre un nuevo gasto operativo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">No. Gasto</th>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5">Descripción / Concepto</th>
                  <th className="px-5 py-3.5">Método de Pago</th>
                  <th className="px-5 py-3.5 text-right">Monto</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                      {item.expense_number}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono">
                      {new Date(item.expense_date).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 max-w-xs truncate">
                      {item.description}
                      {item.notes && (
                        <span className="block text-[11px] text-slate-400 italic">
                          Nota: {item.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">
                        {item.payment_method}
                      </div>
                      {item.bank_name && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.bank_name} - {item.document_number}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-black text-rose-700 text-sm">
                      Q {item.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setExpenseToDelete(item)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Eliminar registro de gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                onClick={() => fetchExpenses(page - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchExpenses(page + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Gasto */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => fetchExpenses(1)}
      />

      {/* Modal Confirmar Eliminación */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">¿Eliminar Registro?</h3>
            <p className="text-xs text-slate-500 mt-1">
              ¿Está seguro de eliminar el gasto <strong className="font-mono">{expenseToDelete.expense_number}</strong> ({expenseToDelete.description}) por <strong>Q {expenseToDelete.amount.toFixed(2)}</strong>?
            </p>

            <div className="mt-6 flex space-x-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setExpenseToDelete(null)}
                className="w-1/2 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center cursor-pointer"
              >
                {deleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
