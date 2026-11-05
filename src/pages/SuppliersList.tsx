import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { Supplier } from "../types";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package,
  Loader2,
  X,
} from "lucide-react";

export const SuppliersList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    category: "GENERAL",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers", {
        params: {
          page,
          limit: 10,
          search,
          category: categoryFilter,
        },
      });
      setSuppliers(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error al cargar proveedores", error);
      toast.error("Error al cargar la lista de proveedores");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contact_name: "",
      phone: "",
      email: "",
      address: "",
      category: "GENERAL",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contact_name: s.contact_name || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      category: s.category || "GENERAL",
      is_active: s.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("El nombre del proveedor es obligatorio");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        toast.success("Proveedor actualizado exitosamente");
      } else {
        await api.post("/suppliers", formData);
        toast.success("Proveedor registrado exitosamente");
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error: any) {
      console.error("Error al guardar proveedor", error);
      toast.error(error.response?.data?.message || "Error al guardar el proveedor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el proveedor "${name}"?`)) return;

    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Proveedor eliminado exitosamente");
      fetchSuppliers();
    } catch (error: any) {
      console.error("Error al eliminar proveedor", error);
      toast.error(error.response?.data?.message || "No se pudo eliminar el proveedor");
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "FRUTAS":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Frutas y Verduras</span>;
      case "PANADERIA":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Panadería</span>;
      case "CARNICERIA":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Carnicería</span>;
      case "ABARROTES":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Abarrotes y Lácteos</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">General</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Truck className="w-7 h-7 mr-2.5 text-blue-600" />
            Catálogo de Proveedores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de proveedores de frutas, carnes, panadería, lácteos y abarrotes
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las Categorías</option>
            <option value="FRUTAS">Frutas y Verduras</option>
            <option value="PANADERIA">Panadería</option>
            <option value="CARNICERIA">Carnicería</option>
            <option value="ABARROTES">Abarrotes y Lácteos</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Tabla de Proveedores */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Cargando proveedores...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No se encontraron proveedores</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || categoryFilter ? "Intente con otros filtros" : "Comience registrando uno nuevo"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Giro / Categoría</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Teléfono / Correo</th>
                  <th className="py-3 px-4 text-center">Insumos Suministrados</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{s.name}</div>
                      {s.address && (
                        <div className="text-[11px] font-normal text-slate-400 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{s.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getCategoryBadge(s.category)}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {s.contact_name || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{s.email}</span>
                        </div>
                      )}
                      {!s.phone && !s.email && "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Package className="w-3 h-3 mr-1" />
                        {s.products_count || 0} insumos
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar Proveedor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar Proveedor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Total: {total} proveedores</span>
            <div className="flex space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 py-1 font-bold">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Proveedor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-400" />
                {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nombre de la Empresa / Proveedor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Frutas La Terminal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Giro / Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FRUTAS">Frutas y Verduras</option>
                    <option value="PANADERIA">Panadería</option>
                    <option value="CARNICERIA">Carnicería</option>
                    <option value="ABARROTES">Abarrotes y Lácteos</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Contacto / Encargado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Pedro Morales"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. +502 5555-1001"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="proveedor@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Dirección / Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mercado La Terminal, Pasillo Central"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : editingSupplier ? "Guardar Cambios" : "Crear Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
