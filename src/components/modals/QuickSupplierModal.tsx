import React, { useState } from "react";
import { api } from "../../services/api";
import { Supplier } from "../../types";
import { X, Truck, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface QuickSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated: (newSupplier: Supplier) => void;
}

export const QuickSupplierModal: React.FC<QuickSupplierModalProps> = ({
  isOpen,
  onClose,
  onSupplierCreated,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("El nombre del proveedor es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const response = await api.post("/suppliers", {
        name: trimmedName,
        phone: phone.trim() || null,
        category,
        is_active: true,
      });

      const created = response.data?.supplier || response.data?.data;
      toast.success(`Proveedor "${trimmedName}" registrado con éxito`);
      if (created) {
        onSupplierCreated(created);
      }
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear proveedor rápido";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Nuevo Proveedor Rápido</h2>
              <p className="text-[11px] text-emerald-100">Registro exprés sin salir de la compra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre de la Empresa o Proveedor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej. Distribuidora Santa Lucía, Carnes San Juan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. 5555-1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="GENERAL">General</option>
                <option value="FRUTAS">Frutas y Verduras</option>
                <option value="CARNICERIA">Carnicería</option>
                <option value="PANADERIA">Panadería</option>
                <option value="ABARROTES">Abarrotes</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            💡 Podrás complementar NIT, dirección física y correo electrónico más adelante desde el catálogo completo de proveedores.
          </p>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Crear y Seleccionar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
