import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { ChangelogModal } from "../modals/ChangelogModal";
import { CURRENT_VERSION } from "../../data/changelog";
import {
  UtensilsCrossed,
  ShieldCheck,
  Users,
  User,
  ChevronDown,
  Shield,
  Settings,
  Menu,
  X,
  MapPin,
  Utensils,
  Store,
  Package,
  Boxes,
  Tag,
  Building2,
  Ruler,
  Truck,
  BookOpen,
  PackagePlus,
  ArrowDownLeft,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  DollarSign,
  TrendingDown,
  FileText,
} from "lucide-react";

export type AppTab =
  | "dashboard"
  | "pos"
  | "sales"
  | "entries"
  | "suppliers"
  | "products"
  | "categories"
  | "brands"
  | "units"
  | "recipes"
  | "areas"
  | "tables"
  | "expenses"
  | "outflows"
  | "finances"
  | "users"
  | "roles"
  | "settings";

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenProfile,
}) => {
  const { user, hasPermission } = useAuthStore();
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isFinancesOpen, setIsFinancesOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isEntriesOpen, setIsEntriesOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const salesDropdownRef = useRef<HTMLDivElement>(null);
  const financesDropdownRef = useRef<HTMLDivElement>(null);
  const restaurantDropdownRef = useRef<HTMLDivElement>(null);
  const inventoryDropdownRef = useRef<HTMLDivElement>(null);
  const entriesDropdownRef = useRef<HTMLDivElement>(null);
  const securityDropdownRef = useRef<HTMLDivElement>(null);

  // Rol de Cajero Exclusivo:
  // "En el caso del rol del 'Cajero' solo debe ver la pantalla de nuevas ventas y no poder ver ni el listado de ventas."
  const isCashier =
    user?.roles?.some((r) => r.name === "Cajero") &&
    !user?.roles?.some(
      (r) => r.name === "Administrador" || r.name === "Gerente / Supervisor"
    );

  const canManageSettings =
    hasPermission("settings:manage") ||
    user?.roles?.some((r) => r.name === "Administrador");

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        salesDropdownRef.current &&
        !salesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSalesOpen(false);
      }
      if (
        financesDropdownRef.current &&
        !financesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFinancesOpen(false);
      }
      if (
        restaurantDropdownRef.current &&
        !restaurantDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRestaurantOpen(false);
      }
      if (
        inventoryDropdownRef.current &&
        !inventoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsInventoryOpen(false);
      }
      if (
        entriesDropdownRef.current &&
        !entriesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEntriesOpen(false);
      }
      if (
        securityDropdownRef.current &&
        !securityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSecurityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSalesActive = currentTab === "pos" || currentTab === "sales";
  const isFinancesActive =
    currentTab === "finances" ||
    currentTab === "outflows" ||
    currentTab === "expenses";
  const isRestaurantActive = currentTab === "areas" || currentTab === "tables";
  const isInventoryActive =
    currentTab === "products" ||
    currentTab === "categories" ||
    currentTab === "brands" ||
    currentTab === "units" ||
    currentTab === "recipes";
  const isEntriesActive =
    currentTab === "entries" || currentTab === "suppliers";
  const isSecurityActive =
    currentTab === "users" || currentTab === "roles" || currentTab === "settings";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y Marca */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (!isCashier) onTabChange("dashboard");
                else onTabChange("pos");
              }}
              className="flex items-center space-x-2 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                punto<span className="text-blue-600">V</span>
              </span>
            </button>

            {/* Indicador discreto de versión (Clic para desplegar Changelog) */}
            <button
              type="button"
              onClick={() => setIsChangelogOpen(true)}
              title="Haga clic para ver el historial de cambios y novedades"
              className="ml-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 transition-all cursor-pointer shadow-2xs group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform animate-pulse"></span>
              <span>{CURRENT_VERSION}</span>
            </button>

            {/* MENÚ DE NAVEGACIÓN PRINCIPAL (DESKTOP) */}
            <nav className="hidden md:flex ml-6 items-center space-x-1.5">
              {/* Si es Cajero: SOLO PUEDE VER EL BOTÓN DE PUNTO DE VENTA */}
              {isCashier ? (
                <button
                  type="button"
                  onClick={() => onTabChange("pos")}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-xs"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span>Punto de Venta (Caja)</span>
                </button>
              ) : (
                /* Menús Completos para Administrador / Gerente */
                <>
                  {/* BOTÓN DASHBOARD */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange("dashboard");
                      setIsSalesOpen(false);
                      setIsFinancesOpen(false);
                      setIsRestaurantOpen(false);
                      setIsInventoryOpen(false);
                      setIsEntriesOpen(false);
                      setIsSecurityOpen(false);
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      currentTab === "dashboard"
                        ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1.5 text-blue-600" />
                    <span>Dashboard</span>
                  </button>

                  {/* DROPDOWN DE VENTAS Y POS */}
                  <div className="relative" ref={salesDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSalesOpen(!isSalesOpen);
                        setIsFinancesOpen(false);
                        setIsRestaurantOpen(false);
                        setIsInventoryOpen(false);
                        setIsEntriesOpen(false);
                        setIsSecurityOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isSalesActive
                          ? "bg-slate-100 text-emerald-700 ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5 text-emerald-600" />
                      <span>Ventas</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-500 ${
                          isSalesOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>

                    {isSalesOpen && (
                      <div className="absolute left-0 mt-2 w-[24rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Módulo de Ventas y Comandas
                        </div>
                        <div className="mt-1 space-y-1">
                          <button
                            onClick={() => {
                              onTabChange("pos");
                              setIsSalesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "pos"
                                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Punto de Venta (POS)
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Facturación rápida, bebidas, alimentos y cobro
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("sales");
                              setIsSalesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "sales"
                                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Historial de Ventas
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Registro cronológico, detalle de consumos y anulación
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN DE FINANZAS */}
                  <div className="relative" ref={financesDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFinancesOpen(!isFinancesOpen);
                        setIsSalesOpen(false);
                        setIsRestaurantOpen(false);
                        setIsInventoryOpen(false);
                        setIsEntriesOpen(false);
                        setIsSecurityOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isFinancesActive
                          ? "bg-slate-100 text-amber-700 ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <DollarSign className="w-4 h-4 mr-1.5 text-amber-600" />
                      <span>Finanzas</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-500 ${
                          isFinancesOpen ? "rotate-180 text-amber-600" : ""
                        }`}
                      />
                    </button>

                    {isFinancesOpen && (
                      <div className="absolute left-0 mt-2 w-[26rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Módulo Financiero y Caja
                        </div>
                        <div className="mt-1 space-y-1">
                          <button
                            onClick={() => {
                              onTabChange("finances");
                              setIsFinancesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "finances"
                                ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Flujo de Caja y Resumen
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Balance general de ingresos vs egresos y utilidades
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("outflows");
                              setIsFinancesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "outflows"
                                ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <TrendingDown className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Egresos de Dinero
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Reporte unificado de compras y gastos de operación
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("expenses");
                              setIsFinancesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "expenses"
                                ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Gastos Operativos
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Planilla, energía, agua, gas, SAT, alquileres
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN DE ENTRADAS Y COMPRAS */}
                  <div className="relative" ref={entriesDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEntriesOpen(!isEntriesOpen);
                        setIsSalesOpen(false);
                        setIsFinancesOpen(false);
                        setIsRestaurantOpen(false);
                        setIsInventoryOpen(false);
                        setIsSecurityOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isEntriesActive
                          ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <PackagePlus className="w-4 h-4 mr-1.5 text-blue-600" />
                      <span>Compras</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-500 ${
                          isEntriesOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {isEntriesOpen && (
                      <div className="absolute left-0 mt-2 w-[26rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Módulo de Entradas y Compras
                        </div>
                        <div className="mt-1 space-y-1">
                          <button
                            onClick={() => {
                              onTabChange("entries");
                              setIsEntriesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "entries"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <ArrowDownLeft className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Entradas y Compras
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Recepción de mercadería, pagos al contado y crédito
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("suppliers");
                              setIsEntriesOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "suppliers"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Proveedores
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Frutas, carnes, panadería, lácteos y abarrotes
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN DE INVENTARIO */}
                  <div className="relative" ref={inventoryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInventoryOpen(!isInventoryOpen);
                        setIsSalesOpen(false);
                        setIsFinancesOpen(false);
                        setIsRestaurantOpen(false);
                        setIsEntriesOpen(false);
                        setIsSecurityOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isInventoryActive
                          ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Boxes className="w-4 h-4 mr-1.5 text-blue-600" />
                      <span>Inventario</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-500 ${
                          isInventoryOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {isInventoryOpen && (
                      <div className="absolute left-0 mt-2 w-[28rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Módulo de Inventario y Productos
                        </div>
                        <div className="mt-1 space-y-1">
                          <button
                            onClick={() => {
                              onTabChange("products");
                              setIsInventoryOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "products"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Productos
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Bebidas, insumos, costos y existencias
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("recipes");
                              setIsInventoryOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "recipes"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Recetas y Fórmulas Base
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Refrescos naturales, rellenos y ensamble
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("categories");
                              setIsInventoryOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "categories"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Categorías
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Clasificación de artículos
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("brands");
                              setIsInventoryOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "brands"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Marcas
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Empresas y marcas comerciales
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("units");
                              setIsInventoryOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "units"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Ruler className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Unidades de Medida
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Unidades base de inventario (UND, VASO, ML, LB)
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN DE RESTAURANTE */}
                  <div className="relative" ref={restaurantDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRestaurantOpen(!isRestaurantOpen);
                        setIsSalesOpen(false);
                        setIsFinancesOpen(false);
                        setIsInventoryOpen(false);
                        setIsEntriesOpen(false);
                        setIsSecurityOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isRestaurantActive
                          ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Store className="w-4 h-4 mr-1.5 text-blue-600" />
                      <span>Restaurante</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-500 ${
                          isRestaurantOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {isRestaurantOpen && (
                      <div className="absolute left-0 mt-2 w-[24rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Módulo de Salón y Espacios
                        </div>
                        <div className="mt-1 space-y-1">
                          <button
                            onClick={() => {
                              onTabChange("areas");
                              setIsRestaurantOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "areas"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Áreas
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Zonas, salones y terrazas del restaurante
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("tables");
                              setIsRestaurantOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "tables"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Utensils className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Mesas
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Mesas y espacios asignados por área
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN DE SEGURIDAD */}
                  <div className="relative" ref={securityDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSecurityOpen(!isSecurityOpen);
                        setIsSalesOpen(false);
                        setIsFinancesOpen(false);
                        setIsRestaurantOpen(false);
                        setIsInventoryOpen(false);
                        setIsEntriesOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isSecurityActive
                          ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1.5 text-blue-600" />
                      <span>Seguridad</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 text-slate-500 ${
                          isSecurityOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {isSecurityOpen && (
                      <div className="absolute left-0 mt-2 w-[26rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Módulo de Seguridad y Control
                        </div>
                        <div className="mt-1 space-y-1">
                          <button
                            onClick={() => {
                              onTabChange("users");
                              setIsSecurityOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "users"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Usuarios
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Empleados, credenciales y PIN
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onTabChange("roles");
                              setIsSecurityOpen(false);
                            }}
                            className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer ${
                              currentTab === "roles"
                                ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                : "hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Catálogo de Roles y Permisos
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Roles, rutas de inicio y permisos
                              </p>
                            </div>
                          </button>

                          {canManageSettings && (
                            <button
                              onClick={() => {
                                onTabChange("settings");
                                setIsSecurityOpen(false);
                              }}
                              className={`w-full flex items-start p-3 rounded-xl transition-colors text-left cursor-pointer border-t border-slate-100 mt-1 pt-2 ${
                                currentTab === "settings"
                                  ? "bg-blue-50 text-blue-900 ring-1 ring-blue-200"
                                  : "hover:bg-slate-50 text-slate-800"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                <Settings className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm font-bold text-slate-900">
                                    Configuración del Sistema
                                  </p>
                                  <span className="ml-2 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase">
                                    Admin
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Datos fiscales, logotipo y respaldos SQL
                                </p>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </nav>
          </div>

          {/* Perfil de Usuario */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenProfile}
              title={`Mi Perfil: ${user?.name || "Usuario"} (@${user?.user || ""})`}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">
                  {user?.name || "Usuario"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  {user?.roles?.[0]?.name || "Rol"}
                </span>
              </div>
            </button>

            {/* Botón Menú Móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-3">
          {isCashier ? (
            <button
              onClick={() => {
                onTabChange("pos");
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Punto de Venta (Caja)
            </button>
          ) : (
            <>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onTabChange("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2 text-blue-600" />
                  Dashboard Administrativo
                </button>
                <button
                  onClick={() => {
                    onTabChange("pos");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-emerald-700 hover:bg-emerald-50 flex items-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2 text-emerald-600" />
                  Punto de Venta (POS)
                </button>
                <button
                  onClick={() => {
                    onTabChange("sales");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2 text-slate-600" />
                  Historial de Ventas
                </button>
                <button
                  onClick={() => {
                    onTabChange("finances");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <DollarSign className="w-4 h-4 mr-2 text-amber-600" />
                  Flujo de Caja y Resumen
                </button>
                <button
                  onClick={() => {
                    onTabChange("outflows");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <TrendingDown className="w-4 h-4 mr-2 text-rose-600" />
                  Egresos de Dinero
                </button>
                <button
                  onClick={() => {
                    onTabChange("expenses");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <Receipt className="w-4 h-4 mr-2 text-amber-600" />
                  Gastos Operativos
                </button>
                <button
                  onClick={() => {
                    onTabChange("entries");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <PackagePlus className="w-4 h-4 mr-2 text-blue-600" />
                  Entradas y Compras
                </button>
                <button
                  onClick={() => {
                    onTabChange("products");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-slate-100 flex items-center"
                >
                  <Package className="w-4 h-4 mr-2 text-blue-600" />
                  Catálogo de Productos
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Historial de Versiones (Changelog) */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </header>
  );
};
