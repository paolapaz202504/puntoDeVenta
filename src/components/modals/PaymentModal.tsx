import React, { useState } from "react";
import { api } from "../../services/api";
import { StockEntry } from "../../types";
import {
  X,
  CreditCard,
  Banknote,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: StockEntry | null;
  onPaymentSuccess: () => void;
}

const COMMON_BANKS = [
  "Banrural",
  "Banco Industrial",
  "G&T Continental",
  "BAM",
  "BAC Credomatic",
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  entry,
  onPaymentSuccess,
}) => {
  if (!isOpen || !entry) return null;

  const balance = Number(entry.balance_amount || 0);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "EFECTIVO" | "CHEQUE" | "DEPOSITO" | "TRANSFERENCIA"
  >("EFECTIVO");
  const [bankName, setBankName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Reiniciar formulario cada vez que se abra o cambie la compra
  React.useEffect(() => {
    if (isOpen && entry) {
      setAmount("");
      setPaymentMethod("EFECTIVO");
      setBankName("");
      setDocumentNumber("");
      setDocumentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [isOpen, entry]);

  const numAmount = parseFloat(amount) || 0;
  const remainingBalance = Math.max(0, balance - numAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numAmount <= 0) {
      toast.error("Debe ingresar un monto válido a abonar mayor a Q0.00");
      return;
    }

    if (numAmount > balance) {
      toast.error(
        `El monto (Q${numAmount.toFixed(2)}) no puede exceder el saldo pendiente (Q${balance.toFixed(2)})`
      );
      return;
    }

    if (paymentMethod !== "EFECTIVO") {
      if (!bankName.trim()) {
        toast.error("Debe especificar el banco emisor o receptor");
        return;
      }
      if (!documentNumber.trim()) {
        toast.error("Debe indicar el número de comprobante, cheque o transferencia");
        return;
      }
    }

    setSaving(true);
    try {
      await api.post(`/stock-entries/${entry.id}/payments`, {
        amount: numAmount,
        payment_method: paymentMethod,
        bank_name: paymentMethod === "EFECTIVO" ? null : bankName.trim(),
        document_number: paymentMethod === "EFECTIVO" ? null : documentNumber.trim(),
        document_date: paymentMethod === "EFECTIVO" ? null : documentDate,
        notes: notes.trim() || null,
      });

      toast.success(
        numAmount >= balance
          ? `¡Compra ${entry.entry_number} liquidada en su totalidad!`
          : `Abono de Q${numAmount.toFixed(2)} registrado exitosamente. Saldo restante: Q${remainingBalance.toFixed(2)}`
      );
      onPaymentSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al registrar el pago";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Registrar Abono o Pago Total</h2>
              <p className="text-xs text-indigo-100">
                {entry.entry_number} • {entry.supplier?.name || "Sin Proveedor"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tarjeta Resumen de Saldos */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Compra
              </span>
              <span className="text-sm font-bold text-slate-800">
                Q{Number(entry.total_cost).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Abonado
              </span>
              <span className="text-sm font-bold text-emerald-600">
                Q{Number(entry.paid_amount).toFixed(2)}
              </span>
            </div>
            <div className="bg-amber-50 rounded-lg p-1 border border-amber-200">
              <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Saldo Pendiente
              </span>
              <span className="text-base font-black text-amber-700">
                Q{balance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Campo Monto con botón Pagar Total */}
          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Monto a Abonar (Q) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Pagar Saldo Completo (Q{balance.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Q
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={balance}
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            {numAmount > 0 && (
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-medium">Saldo restante proyectado:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    remainingBalance <= 0.009
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Q{remainingBalance.toFixed(2)}{" "}
                  {remainingBalance <= 0.009 ? "(Liquidación Total)" : "(Pago Parcial)"}
                </span>
              </div>
            )}
          </div>

          {/* Selector de Método de Pago */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "EFECTIVO", label: "Efectivo", icon: Banknote },
                { id: "TRANSFERENCIA", label: "Transferencia", icon: Building2 },
                { id: "DEPOSITO", label: "Depósito", icon: Receipt },
                { id: "CHEQUE", label: "Cheque", icon: FileText },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campos Bancarios Condicionales */}
          {paymentMethod !== "EFECTIVO" && (
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Banco <span className="text-rose-500">*</span>
                </label>
                {/* Botones rápidos de bancos */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_BANKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankName(b)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        bankName === b
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="O escriba el nombre del banco..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Documento / Ref. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. No. 1294829"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha del Documento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notas u Observaciones del Abono
            </label>
            <input
              type="text"
              placeholder="Ej. Pago parcial acordado según factura..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || numAmount <= 0 || numAmount > balance}
              className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-40 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Registrando pago...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Confirmar Abono de Q{numAmount.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
