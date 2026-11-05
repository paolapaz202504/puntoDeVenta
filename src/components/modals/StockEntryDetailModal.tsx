import React from "react";
import { StockEntry } from "../../types";
import {
  X,
  Package,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface StockEntryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: StockEntry | null;
  onOpenPayment?: (entry: StockEntry) => void;
}

export const StockEntryDetailModal: React.FC<StockEntryDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  onOpenPayment,
}) => {
  if (!isOpen || !entry) return null;

  const totalCost = Number(entry.total_cost || 0);
  const paidAmount = Number(entry.paid_amount || 0);
  const balanceAmount = Number(entry.balance_amount || 0);

  const getStatusBadge = () => {
    switch (entry.payment_status) {
      case "PAGADA":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Pagada Totalmente
          </span>
        );
      case "PARCIAL":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pago Parcial
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Pendiente de Pago
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            No Aplica
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base">{entry.entry_number}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 font-bold uppercase tracking-wider">
                  {entry.entry_type}
                </span>
              </div>
              <p className="text-xs text-blue-100">
                {entry.supplier?.name || "Sin Proveedor"} • Registrada el{" "}
                {new Date(entry.entry_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tarjetas informativas superiores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Condición
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {entry.payment_type}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                No. Factura / Doc
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {entry.invoice_number || "Sin Documento"}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Entrada
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                Q{totalCost.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Estado Pago
              </span>
              <div>{getStatusBadge()}</div>
            </div>
          </div>

          {/* Saldo y Acción de Pago si aplica */}
          {entry.entry_type === "COMPRA" && balanceAmount > 0 && onOpenPayment && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Cuenta por Pagar Pendiente
                </span>
                <p className="text-xs text-amber-700 mt-0.5">
                  Saldo pendiente:{" "}
                  <strong className="text-sm font-black text-amber-900">
                    Q{balanceAmount.toFixed(2)}
                  </strong>{" "}
                  (Abonado: Q{paidAmount.toFixed(2)} de Q{totalCost.toFixed(2)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPayment(entry);
                }}
                className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Registrar Abono
              </button>
            </div>
          )}

          {/* Tabla de Productos Ingresados */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <Package className="w-4 h-4 mr-1.5 text-blue-600" />
              Productos Recibidos ({entry.items?.length || 0})
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Producto</th>
                    <th className="px-3 py-2.5 text-center">Presentación / Factor</th>
                    <th className="px-3 py-2.5 text-right">Cant. Compra</th>
                    <th className="px-3 py-2.5 text-right">Stock Base</th>
                    <th className="px-3 py-2.5 text-right">Costo Unit. Base</th>
                    <th className="px-3 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {entry.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2">
                        <span className="font-bold text-slate-900 block">
                          {item.product?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.product?.code}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">
                        {item.presentation_name ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-blue-200">
                            {item.presentation_name} (x{item.conversion_factor})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unidad Base</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-bold">
                        {Number(item.quantity).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-bold">
                        +{Number(item.base_quantity).toFixed(2)}{" "}
                        <span className="text-[10px] text-slate-500">
                          {item.product?.base_unit?.symbol}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        Q{Number(item.unit_cost).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">
                        Q{Number(item.total_cost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right uppercase text-[11px] text-slate-500">
                      Total de la Entrada:
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-blue-700">
                      Q{totalCost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Historial de Pagos y Abonos */}
          {entry.entry_type === "COMPRA" && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Receipt className="w-4 h-4 mr-1.5 text-emerald-600" />
                Historial de Pagos y Abonos ({entry.payments?.length || 0})
              </h3>
              {entry.payments && entry.payments.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Método</th>
                        <th className="px-3 py-2">Banco</th>
                        <th className="px-3 py-2">No. Documento</th>
                        <th className="px-3 py-2">Notas</th>
                        <th className="px-3 py-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {entry.payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 text-slate-600">
                            {new Date(pay.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {pay.payment_method}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {pay.bank_name || "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-700">
                            {pay.document_number || "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px]">
                            {pay.notes || "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600">
                            Q{Number(pay.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  No se registran pagos para esta entrada.
                </p>
              )}
            </div>
          )}

          {/* Notas */}
          {entry.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block mb-0.5">
                Observaciones Generales
              </span>
              <p className="text-slate-700">{entry.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
