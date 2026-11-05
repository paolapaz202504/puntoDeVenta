import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Supplier, Product } from "../types";
import {
  PackagePlus,
  Search,
  Truck,
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  Boxes,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

interface StockEntryItem {
  id: string;
  entry_number: string;
  supplier_name: string;
  category: string;
  received_at: string;
  items_count: number;
  total_cost: number;
  status: "RECIBIDO" | "PENDIENTE" | "EN_REVISION";
  notes?: string;
}

export const EntriesList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rawMaterials, setRawMaterials] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Entradas registradas (historial inicial de stock y compras de materias primas)
  const [entries] = useState<StockEntryItem[]>([
    {
      id: "ent-001",
      entry_number: "ENT-2026-001",
      supplier_name: "Distribuidora Frutas y Verduras La Terminal",
      category: "Frutas y Verduras",
      received_at: "2026-11-04T08:00:00",
      items_count: 8,
      total_cost: 145.5,
      status: "RECIBIDO",
      notes: "Melones, piñas, limones, zanahorias y ejotes frescos para cocina y barra.",
    },
    {
      id: "ent-002",
      entry_number: "ENT-2026-002",
      supplier_name: "Carnicería El Buen Corte",
      category: "Carnes y Aves",
      received_at: "2026-11-04T07:30:00",
      items_count: 2,
      total_cost: 110.0,
      status: "RECIBIDO",
      notes: "10 libras de pechuga cruda y jamón virginia para panes y tostadas.",
    },
    {
      id: "ent-003",
      entry_number: "ENT-2026-003",
      supplier_name: "Panadería La Espiga de Oro",
      category: "Panadería",
      received_at: "2026-11-04T06:45:00",
      items_count: 2,
      total_cost: 45.0,
      status: "RECIBIDO",
      notes: "Pan francés artesanal fresco del día.",
    },
    {
      id: "ent-004",
      entry_number: "ENT-2026-004",
      supplier_name: "Fábrica de Tostadas y Tortillas El Maizal",
      category: "Insumos de Maíz",
      received_at: "2026-11-03T16:00:00",
      items_count: 1,
      total_cost: 35.0,
      status: "RECIBIDO",
      notes: "Tostadas horneadas crujientes de maíz en paquetes de 50.",
    },
    {
      id: "ent-005",
      entry_number: "ENT-2026-005",
      supplier_name: "Distribuidora de Abarrotes El Trébol",
      category: "Abarrotes y Lácteos",
      received_at: "2026-11-03T14:20:00",
      items_count: 6,
      total_cost: 215.8,
      status: "RECIBIDO",
      notes: "Azúcar, leche entera, fideos chaomín, mayonesa y aderezos.",
    },
  ]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, rawRes] = await Promise.all([
        api.get("/suppliers?limit=100"),
        api.get("/products?product_type=RAW_MATERIAL&limit=100"),
      ]);

      if (suppliersRes.data?.data) {
        setSuppliers(suppliersRes.data.data);
      }
      if (rawRes.data?.data) {
        setRawMaterials(rawRes.data.data);
      }
    } catch (error) {
      console.error("Error al cargar datos de entradas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSupplier =
      !supplierFilter || e.supplier_name === supplierFilter;

    return matchesSearch && matchesSupplier;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Módulo de Entradas y Compras
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Recepción de mercadería, compras a proveedores e ingreso de materias primas a inventario
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              toast.info(
                "El formulario para registrar nuevas órdenes de compra y entradas de almacén está en fase de vinculación con recepción.",
                { duration: 4000 }
              );
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Entrada
          </button>
        </div>
      </div>

      {/* Tarjetas Informativas / Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Proveedores Vinculados
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {suppliers.length || 5}
            </span>
            <span className="text-xs font-medium text-slate-500">
              empresas activas
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Materias Primas de Compra
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {rawMaterials.length || 27}
            </span>
            <span className="text-xs font-medium text-slate-500">
              insumos e ingredientes
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Entradas Registradas
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {entries.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              comprobantes de recepción
            </span>
          </div>
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por comprobante, proveedor o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="w-full sm:w-72">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">Todos los Proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchInitialData}
          disabled={loading}
          title="Actualizar lista"
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabla de Entradas Registradas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Comprobante</th>
                <th className="py-3.5 px-4">Proveedor</th>
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4 text-center">Insumos</th>
                <th className="py-3.5 px-4 text-right">Total (Q)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4">Notas / Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {entry.entry_number}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">
                      {entry.supplier_name}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {entry.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center text-xs">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {new Date(entry.received_at).toLocaleDateString("es-GT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {entry.items_count} ítems
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    Q{entry.total_cost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                    {entry.notes || "—"}
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      No se encontraron registros de entrada
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Intente ajustar los términos de búsqueda o el proveedor seleccionado
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
