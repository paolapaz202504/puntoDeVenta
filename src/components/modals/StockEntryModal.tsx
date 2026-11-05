import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Supplier, Product } from "../../types";
import { QuickSupplierModal } from "./QuickSupplierModal";
import {
  X,
  PackagePlus,
  Plus,
  Trash2,
  Truck,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  product_id: string;
  presentation_name: string;
  conversion_factor: number;
  quantity: number;
  unit_cost: number;
  base_unit_symbol: string;
}

const COMMON_BANKS = [
  "Banrural",
  "Banco Industrial",
  "G&T Continental",
  "BAM",
  "BAC Credomatic",
];

export const StockEntryModal: React.FC<StockEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Quick Supplier Modal
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);

  // Form State
  const [entryType, setEntryType] = useState<"COMPRA" | "DONACION" | "AJUSTE">("COMPRA");
  const [supplierId, setSupplierId] = useState<string>("");
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"CONTADO" | "CREDITO">("CONTADO");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Payment method (if CONTADO)
  const [paymentMethod, setPaymentMethod] = useState<
    "EFECTIVO" | "CHEQUE" | "DEPOSITO" | "TRANSFERENCIA"
  >("EFECTIVO");
  const [bankName, setBankName] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Items y Paginación de Artículos
  const ITEMS_PER_PAGE = 10;
  const [items, setItems] = useState<ItemRow[]>([]);
  const [itemPage, setItemPage] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialCatalog();
    }
  }, [isOpen]);

  const loadInitialCatalog = async () => {
    setLoadingData(true);
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        api.get("/suppliers?limit=100&sortBy=name&order=asc"),
        api.get("/products?limit=200&sortBy=name&order=asc"),
      ]);

      const loadedSuppliers =
        suppliersRes.data?.items ||
        suppliersRes.data?.data ||
        (Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      const loadedProducts =
        productsRes.data?.data ||
        productsRes.data?.items ||
        (Array.isArray(productsRes.data) ? productsRes.data : []);

      setSuppliers(loadedSuppliers);
      setProducts(loadedProducts);

      // Reset form
      setEntryType("COMPRA");
      setSupplierId(loadedSuppliers[0]?.id || "");
      setEntryDate(new Date().toISOString().split("T")[0]);
      setInvoiceNumber("");
      setPaymentType("CONTADO");
      setDueDate("");
      setNotes("");
      setPaymentMethod("EFECTIVO");
      setBankName("");
      setDocumentNumber("");
      setDocumentDate(new Date().toISOString().split("T")[0]);

      // Initialize with 1 empty row if products exist
      setItemPage(1);
      if (loadedProducts.length > 0) {
        const firstProd = loadedProducts[0];
        setItems([
          {
            product_id: firstProd.id,
            presentation_name: "",
            conversion_factor: 1,
            quantity: 1,
            unit_cost: Number(firstProd.current_cost || 0),
            base_unit_symbol: firstProd.base_unit?.symbol || "UND",
          },
        ]);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error al cargar catálogos para entrada:", error);
      toast.error("Error al cargar proveedores y productos");
    } finally {
      setLoadingData(false);
    }
  };

  const handleQuickSupplierCreated = (newSup: Supplier) => {
    setSuppliers((prev) => [newSup, ...prev]);
    setSupplierId(newSup.id);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        product_id: prod.id,
        presentation_name: "",
        conversion_factor: 1,
        unit_cost: Number(prod.current_cost || 0),
        base_unit_symbol: prod.base_unit?.symbol || "UND",
      };
      return updated;
    });
  };

  const handlePresentationChange = (index: number, presName: string) => {
    const row = items[index];
    const prod = products.find((p) => p.id === row.product_id);
    if (!prod) return;

    if (!presName) {
      // Unidad base
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          presentation_name: "",
          conversion_factor: 1,
          unit_cost: Number(prod.current_cost || 0),
        };
        return updated;
      });
      return;
    }

    const pres = prod.presentations?.find((pr) => pr.name === presName);
    if (pres) {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          presentation_name: pres.name,
          conversion_factor: pres.conversion_factor,
          unit_cost: Number(pres.default_cost || Number(prod.current_cost || 0) * pres.conversion_factor),
        };
        return updated;
      });
    }
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0, qty) };
      return updated;
    });
  };

  const handleCostChange = (index: number, cost: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], unit_cost: Math.max(0, cost) };
      return updated;
    });
  };

  const addRow = () => {
    if (products.length === 0) return;
    const prod = products[0];
    const newItems = [
      ...items,
      {
        product_id: prod.id,
        presentation_name: "",
        conversion_factor: 1,
        quantity: 1,
        unit_cost: Number(prod.current_cost || 0),
        base_unit_symbol: prod.base_unit?.symbol || "UND",
      },
    ];
    setItems(newItems);
    // Si sobrepasa la página actual, navegar a la nueva página
    const newTotalPages = Math.ceil(newItems.length / ITEMS_PER_PAGE);
    setItemPage(newTotalPages);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) {
      toast.info("Debe conservar al menos un producto en la entrada");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    const newTotalPages = Math.max(1, Math.ceil(newItems.length / ITEMS_PER_PAGE));
    if (itemPage > newTotalPages) {
      setItemPage(newTotalPages);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Debe ingresar al menos un producto");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].quantity <= 0) {
        toast.error(`La cantidad en el renglón #${i + 1} debe ser mayor a 0`);
        return;
      }
    }

    if (entryType === "COMPRA" && paymentType === "CONTADO" && paymentMethod !== "EFECTIVO") {
      if (!bankName.trim()) {
        toast.error("Debe indicar el banco para pagos con cheque, depósito o transferencia");
        return;
      }
      if (!documentNumber.trim()) {
        toast.error("Debe indicar el número de documento o comprobante bancario");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        supplier_id: supplierId || null,
        entry_type: entryType,
        entry_date: entryDate,
        invoice_number: invoiceNumber.trim() || null,
        payment_type: entryType === "COMPRA" ? paymentType : "NO_APLICA",
        due_date: entryType === "COMPRA" && paymentType === "CREDITO" ? dueDate || null : null,
        notes: notes.trim() || null,
        items: items.map((it) => ({
          product_id: it.product_id,
          presentation_name: it.presentation_name || null,
          quantity: it.quantity,
          conversion_factor: it.conversion_factor,
          unit_cost: it.unit_cost,
        })),
      };

      if (entryType === "COMPRA" && paymentType === "CONTADO") {
        payload.initial_payment = {
          payment_method: paymentMethod,
          bank_name: paymentMethod === "EFECTIVO" ? null : bankName.trim(),
          document_number: paymentMethod === "EFECTIVO" ? null : documentNumber.trim(),
          document_date: paymentMethod === "EFECTIVO" ? null : documentDate,
          notes: "Pago total al contado al recibir mercadería",
        };
      }

      const res = await api.post("/stock-entries", payload);
      toast.success(res.data?.message || "Entrada de inventario registrada con éxito");
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al registrar la entrada";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = calculateTotal();

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera Fija */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <PackagePlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg">
                  Nueva Entrada de Almacén y Compra
                </h2>
                <p className="text-xs text-blue-100">
                  Recepción física de mercadería, ajuste de costos y gestión de pagos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo Desplazable */}
          {loadingData ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-semibold">Cargando proveedores y catálogo de productos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* 1. Selector de Tipo de Entrada */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Tipo de Entrada de Inventario
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "COMPRA",
                    label: "Compra a Proveedor",
                    desc: "Afecta costos, caja o cuentas por pagar",
                  },
                  {
                    id: "DONACION",
                    label: "Donación",
                    desc: "Ingreso sin costo ni pasivo financiero",
                  },
                  {
                    id: "AJUSTE",
                    label: "Ajuste / Otro",
                    desc: "Sobrantes, muestras o traslados",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEntryType(t.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      entryType === t.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-bold text-xs">{t.label}</span>
                    <span
                      className={`block text-[10px] mt-0.5 ${
                        entryType === t.id ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {t.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Datos Generales (Proveedor, Fecha, Factura) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Proveedor con botón Rápido */}
              <div className="sm:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Proveedor {entryType === "COMPRA" && <span className="text-rose-500">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickSupplierOpen(true)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center cursor-pointer"
                  >
                    <Plus className="w-3 h-3 mr-0.5" />
                    Rápido
                  </button>
                </div>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Seleccione Proveedor --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de Entrada */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Fecha de Recepción <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Factura / Documento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  No. Factura / Comprobante
                </label>
                <input
                  type="text"
                  placeholder="Ej. FAC-A-12498"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 3. Detalle de Productos Ingresados */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Mercadería Recibida ({items.length} productos)
                  </label>
                  {items.length > ITEMS_PER_PAGE && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      Pág. {itemPage} de {Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar Producto
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 w-10 text-center">#</th>
                        <th className="px-3 py-2 w-5/12">Producto</th>
                        <th className="px-2 py-2 w-3/12">Presentación de Compra</th>
                        <th className="px-2 py-2 text-center w-2/12">Cantidad</th>
                        <th className="px-2 py-2 text-right w-2/12">Costo (Q)</th>
                        <th className="px-2 py-2 text-right w-2/12">Subtotal</th>
                        <th className="px-2 py-2 w-8 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(() => {
                        const startItemIdx = (itemPage - 1) * ITEMS_PER_PAGE;
                        const paginatedItems = items.slice(startItemIdx, startItemIdx + ITEMS_PER_PAGE);

                        return paginatedItems.map((row, localIdx) => {
                          const globalIdx = startItemIdx + localIdx;
                          const prod = products.find((p) => p.id === row.product_id);
                          const hasPres = prod?.presentations && prod.presentations.length > 0;
                          const subtotal = row.quantity * row.unit_cost;
                          const totalBaseUnits = row.quantity * row.conversion_factor;

                          return (
                            <tr key={globalIdx} className="hover:bg-slate-50/70">
                              {/* Número de fila */}
                              <td className="px-3 py-2 text-center text-[10px] font-bold text-slate-400">
                                #{globalIdx + 1}
                              </td>

                              {/* Selector Producto */}
                              <td className="px-3 py-2">
                                <select
                                  value={row.product_id}
                                  onChange={(e) => handleProductChange(globalIdx, e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                                >
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.code})
                                    </option>
                                  ))}
                                </select>
                                {prod && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Stock actual: {Number(prod.current_stock).toFixed(1)}{" "}
                                    {prod.base_unit?.symbol}
                                  </span>
                                )}
                              </td>

                              {/* Presentación */}
                              <td className="px-2 py-2">
                                {hasPres ? (
                                  <select
                                    value={row.presentation_name}
                                    onChange={(e) =>
                                      handlePresentationChange(globalIdx, e.target.value)
                                    }
                                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                                  >
                                    <option value="">
                                      Unidad Base ({prod?.base_unit?.symbol})
                                    </option>
                                    {prod?.presentations?.map((pr) => (
                                      <option key={pr.id} value={pr.name}>
                                        {pr.name} (x{pr.conversion_factor})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic block py-1.5">
                                    Unidad ({row.base_unit_symbol})
                                  </span>
                                )}
                              </td>

                              {/* Cantidad */}
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="number"
                                  min="0.01"
                                  step="any"
                                  required
                                  value={row.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(globalIdx, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-16 px-2 py-1 text-xs text-center font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                />
                                {row.conversion_factor > 1 && (
                                  <span className="block text-[9px] text-emerald-600 font-bold mt-0.5">
                                    =+{totalBaseUnits} {row.base_unit_symbol}
                                  </span>
                                )}
                              </td>

                              {/* Costo Unitario */}
                              <td className="px-2 py-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  required
                                  value={row.unit_cost}
                                  onChange={(e) =>
                                    handleCostChange(globalIdx, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-20 px-2 py-1 text-xs text-right font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              {/* Subtotal */}
                              <td className="px-2 py-2 text-right font-bold text-slate-800">
                                Q{subtotal.toFixed(2)}
                              </td>

                              {/* Borrar */}
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeRow(globalIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Controles de Paginación si hay más de 10 productos */}
                {items.length > ITEMS_PER_PAGE && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Mostrando artículos <strong>{(itemPage - 1) * ITEMS_PER_PAGE + 1}</strong> a{" "}
                      <strong>
                        {Math.min(items.length, itemPage * ITEMS_PER_PAGE)}
                      </strong>{" "}
                      de <strong>{items.length}</strong>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        disabled={itemPage <= 1}
                        onClick={() => setItemPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors flex items-center text-xs font-semibold cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                        Anterior
                      </button>
                      <span className="text-[11px] font-bold text-slate-700 px-1.5">
                        {itemPage} / {Math.ceil(items.length / ITEMS_PER_PAGE)}
                      </span>
                      <button
                        type="button"
                        disabled={itemPage >= Math.ceil(items.length / ITEMS_PER_PAGE)}
                        onClick={() =>
                          setItemPage((p) =>
                            Math.min(Math.ceil(items.length / ITEMS_PER_PAGE), p + 1)
                          )
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors flex items-center text-xs font-semibold cursor-pointer"
                      >
                        Siguiente
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Pie de tabla con Total */}
                <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Total de la Entrada:
                  </span>
                  <span className="text-base font-black text-blue-700">
                    Q{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Sección Financiera y Pagos (Solo para COMPRA) */}
            {entryType === "COMPRA" ? (
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center">
                    <CreditCard className="w-4 h-4 mr-1.5 text-indigo-600" />
                    3. Condición y Forma de Pago
                  </label>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                    Monto a cubrir: Q{totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Selector Contado vs Crédito */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType("CONTADO")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentType === "CONTADO"
                        ? "bg-white border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900">Al Contado</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Liquidación total inmediata en la recepción
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("CREDITO")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentType === "CREDITO"
                        ? "bg-white border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-xs text-slate-900">A Crédito</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Genera cuenta por pagar para abonos posteriores
                    </p>
                  </button>
                </div>

                {/* Si es AL CONTADO -> Desglose de Métodos */}
                {paymentType === "CONTADO" ? (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-indigo-100">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Método de Pago al Contado
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
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Si no es efectivo, pedir banco y comprobante */}
                    {paymentMethod !== "EFECTIVO" && (
                      <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Banco Emisor / Receptor <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {COMMON_BANKS.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setBankName(b)}
                                className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-colors cursor-pointer ${
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
                            placeholder="Nombre del banco..."
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              No. Comprobante / Cheque <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. 9812498"
                              value={documentNumber}
                              onChange={(e) => setDocumentNumber(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Fecha del Documento <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={documentDate}
                              onChange={(e) => setDocumentDate(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Si es A CRÉDITO */
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-semibold">
                        La compra se registrará con estado <strong>PENDIENTE</strong> por un saldo de{" "}
                        <strong>Q{totalAmount.toFixed(2)}</strong>. Podrás abonar o liquidar desde el listado.
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Fecha Límite de Pago / Vencimiento (Opcional)
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full sm:w-60 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Donación o Ajuste */
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Esta entrada se registra como <strong>{entryType}</strong>. Se incrementará el stock físico sin generar obligaciones de pago ni comprometer cuentas por pagar.
                </span>
              </div>
            )}

            {/* 5. Observaciones Generales */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observaciones o Notas
              </label>
              <textarea
                rows={2}
                placeholder="Detalles sobre la entrega, estado de la mercadería, chofer o recepción..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Footer Fijo con Botón Gigante */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving || items.length === 0}
                className="inline-flex items-center px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando Entrada...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Registrar Entrada ({items.length} productos) • Q{totalAmount.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>

      {/* Micro-Modal de Creación Rápida de Proveedor */}
      <QuickSupplierModal
        isOpen={isQuickSupplierOpen}
        onClose={() => setIsQuickSupplierOpen(false)}
        onSupplierCreated={handleQuickSupplierCreated}
      />
    </>
  );
};
