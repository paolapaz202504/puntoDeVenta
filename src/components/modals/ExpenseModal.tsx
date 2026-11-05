import React, { useState } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, Receipt, CheckCircle2, Loader2 } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().substring(0, 10));
  const [category, setCategory] = useState("PERSONAL_PLANILLA");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

  // Bancarios
  const [bankName, setBankName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("El monto debe ser un valor mayor a cero");
      return;
    }

    if (paymentMethod !== "EFECTIVO" && (!bankName.trim() || !documentNumber.trim())) {
      toast.error("Para pagos bancarios debe especificar el banco y el número de documento");
      return;
    }

    setLoading(true);
    try {
      await api.post("/expenses", {
        expense_date: expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString(),
        category,
        description: description.trim(),
        amount: amountNum,
        payment_method: paymentMethod,
        bank_name: paymentMethod !== "EFECTIVO" ? bankName.trim() : null,
        document_number: paymentMethod !== "EFECTIVO" ? documentNumber.trim() : null,
        document_date: paymentMethod !== "EFECTIVO" && documentDate ? new Date(documentDate).toISOString() : null,
        notes: notes.trim() || null,
      });

      toast.success("Gasto operativo registrado exitosamente");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrar el gasto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrar Gasto Operativo</h3>
              <p className="text-xs text-slate-500">Salida de dinero de operación del restaurante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Fecha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha del Gasto
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoría del Gasto
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="PERSONAL_PLANILLA">Personal / Planilla</option>
                <option value="ENERGIA_ELECTRICA">Servicio de Energía Eléctrica</option>
                <option value="AGUA_POTABLE">Servicio de Agua Potable</option>
                <option value="GAS_PROPANO">Gas Propano para Cocina</option>
                <option value="IMPUESTOS_SAT">Impuestos / SAT / Tributos</option>
                <option value="ALQUILER">Alquiler de Local / Instalación</option>
                <option value="MANTENIMIENTO">Mantenimiento y Reparaciones</option>
                <option value="DESECHABLES_LIMPIEZA">Desechables y Artículos de Limpieza</option>
                <option value="OTROS">Otros Gastos Generales</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción o Concepto
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Pago de quincena a cocinero, factura de luz mes actual..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monto Pagado (Q)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold font-mono text-xs">Q</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black font-mono text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DEPOSITO">Depósito Bancario</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
              </select>
            </div>
          </div>

          {/* Campos bancarios si no es Efectivo */}
          {paymentMethod !== "EFECTIVO" && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Datos del Comprobante Bancario ({paymentMethod})
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Banco</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Banrural, BI, G&T"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    No. Documento / Cheque
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CHQ-48291"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Fecha del Documento Bancario
                </label>
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones / Notas Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales, proveedor de servicio o notas contables..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Guardar Gasto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
