import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { ChangelogModal } from "../modals/ChangelogModal";
import { CURRENT_VERSION } from "../../data/changelog";
import {
  UtensilsCrossed,
  ShieldCheck,
  Users,
  UserCircle,
  LogOut,
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
  History,
} from "lucide-react";

interface NavbarProps {
  currentTab:
    | "users"
    | "roles"
    | "settings"
    | "areas"
    | "tables"
    | "products"
    | "categories"
    | "brands"
    | "units";
  onTabChange: (
    tab:
      | "users"
      | "roles"
      | "settings"
      | "areas"
      | "tables"
      | "products"
      | "categories"
      | "brands"
      | "units"
  ) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenProfile,
}) => {
  const { user, logout, hasPermission } = useAuthStore();
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const restaurantDropdownRef = useRef<HTMLDivElement>(null);
  const inventoryDropdownRef = useRef<HTMLDivElement>(null);
  const securityDropdownRef = useRef<HTMLDivElement>(null);

  const canManageSettings =
    hasPermission("settings:manage") ||
    user?.roles?.some((r) => r.name === "Administrador");

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  const roleDisplay =
    user?.roles && user.roles.length > 0
      ? user.roles.map((r) => r.name).join(" • ")
      : "Usuario";

  const isRestaurantActive = currentTab === "areas" || currentTab === "tables";
  const isInventoryActive =
    currentTab === "products" ||
    currentTab === "categories" ||
    currentTab === "brands" ||
    currentTab === "units";
  const isSecurityActive =
    currentTab === "users" || currentTab === "roles" || currentTab === "settings";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y Marca */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tight text-slate-900">
                punto<span className="text-blue-600">V</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                POS Restaurante
              </span>

              {/* Indicador discreto de versión (Clic para desplegar Changelog) */}
              <button
                type="button"
                onClick={() => setIsChangelogOpen(true)}
                title="Haga clic para ver el historial de cambios y novedades"
                className="ml-2.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 transition-all cursor-pointer shadow-2xs group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform animate-pulse"></span>
                <span>{CURRENT_VERSION}</span>
              </button>
            </div>

            {/* Menú de Navegación Principal (Desktop) */}
            <nav className="hidden md:flex ml-8 items-center space-x-2">
              {/* DROPDOWN DE RESTAURANTE */}
              <div className="relative" ref={restaurantDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRestaurantOpen(!isRestaurantOpen);
                    setIsInventoryOpen(false);
                    setIsSecurityOpen(false);
                  }}
                  className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isRestaurantActive
                      ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Store className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Restaurante</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-1.5 transition-transform duration-200 text-slate-500 ${
                      isRestaurantOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* Menú Desplegable Restaurante */}
                {isRestaurantOpen && (
                  <div className="absolute left-0 mt-2 w-[28rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

              {/* DROPDOWN DE INVENTARIO */}
              <div className="relative" ref={inventoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsInventoryOpen(!isInventoryOpen);
                    setIsRestaurantOpen(false);
                    setIsSecurityOpen(false);
                  }}
                  className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isInventoryActive
                      ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Boxes className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Inventario</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-1.5 transition-transform duration-200 text-slate-500 ${
                      isInventoryOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* Menú Desplegable Inventario */}
                {isInventoryOpen && (
                  <div className="absolute left-0 mt-2 w-[28rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Módulo de Inventario y Productos
                    </div>

                    <div className="mt-1 space-y-1">
                      {/* Opción 1: Catálogo de Productos */}
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
                            Bebidas, alimentos, costos y presentaciones
                          </p>
                        </div>
                      </button>

                      {/* Opción 2: Catálogo de Categorías */}
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
                            Gaseosas, aguas, jugos, isotónicas
                          </p>
                        </div>
                      </button>

                      {/* Opción 3: Catálogo de Marcas */}
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
                            Empresas fabricantes y marcas comerciales
                          </p>
                        </div>
                      </button>

                      {/* Opción 4: Unidades de Medida */}
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
                            Unidades base de inventario (UND, VASO, ML)
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
                    setIsRestaurantOpen(false);
                    setIsInventoryOpen(false);
                  }}
                  className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isSecurityActive
                      ? "bg-slate-100 text-blue-700 ring-1 ring-slate-200"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Seguridad</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-1.5 transition-transform duration-200 text-slate-500 ${
                      isSecurityOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* Menú Desplegable Seguridad */}
                {isSecurityOpen && (
                  <div className="absolute left-0 mt-2 w-[28rem] rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                            Administrar empleados, credenciales y PIN
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
                            Roles jerárquicos y matriz de acceso
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
            </nav>
          </div>

          {/* Perfil de Usuario y Acciones Rápidas */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 truncate">
                {user?.name}
              </span>
              <span
                className="text-xs font-semibold text-slate-500 truncate"
                title={roleDisplay}
              >
                {roleDisplay} (@{user?.user})
              </span>
            </div>

            {/* Botón Mi Perfil */}
            <button
              onClick={onOpenProfile}
              title="Ver Mi Perfil"
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <UserCircle className="w-4 h-4 sm:mr-1.5 text-slate-600" />
              <span className="hidden sm:inline">Mi Perfil</span>
            </button>

            {/* Botón Cerrar Sesión */}
            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="inline-flex items-center px-3 py-2 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>

            {/* Botón Menú Móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-3">
          {/* Sección Inventario */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center px-2 py-1">
              <Boxes className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Módulo Inventario
            </p>
            <div className="space-y-1 mt-1">
              <button
                onClick={() => {
                  onTabChange("products");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "products"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Package className="w-4 h-4 mr-2 text-blue-600" />
                Catálogo de Productos
              </button>
              <button
                onClick={() => {
                  onTabChange("categories");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "categories"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Tag className="w-4 h-4 mr-2 text-purple-600" />
                Catálogo de Categorías
              </button>
              <button
                onClick={() => {
                  onTabChange("brands");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "brands"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-4 h-4 mr-2 text-amber-600" />
                Catálogo de Marcas
              </button>
              <button
                onClick={() => {
                  onTabChange("units");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "units"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Ruler className="w-4 h-4 mr-2 text-indigo-600" />
                Unidades de Medida
              </button>
            </div>
          </div>

          {/* Sección Restaurante */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center px-2 py-1">
              <Store className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Módulo Restaurante
            </p>
            <div className="space-y-1 mt-1">
              <button
                onClick={() => {
                  onTabChange("areas");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "areas"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                Catálogo de Áreas
              </button>

              <button
                onClick={() => {
                  onTabChange("tables");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "tables"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Utensils className="w-4 h-4 mr-2 text-amber-600" />
                Catálogo de Mesas
              </button>
            </div>
          </div>

          {/* Sección Seguridad */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center px-2 py-1">
              <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Módulo Seguridad
            </p>
            <div className="space-y-1 mt-1">
              <button
                onClick={() => {
                  onTabChange("users");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "users"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Catálogo de Usuarios
              </button>

              <button
                onClick={() => {
                  onTabChange("roles");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                  currentTab === "roles"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4 mr-2 text-amber-600" />
                Catálogo de Roles y Permisos
              </button>

              {canManageSettings && (
                <button
                  onClick={() => {
                    onTabChange("settings");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold ${
                    currentTab === "settings"
                      ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2 text-emerald-600" />
                  Configuración del Sistema
                </button>
              )}
            </div>
          </div>

          {/* Botón Historial de Versiones (Móvil) */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                setIsChangelogOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow-2xs"
            >
              <span className="flex items-center">
                <History className="w-4 h-4 mr-2 text-blue-600" />
                Historial de Versiones ({CURRENT_VERSION})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                Activa
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Interactivo de Control de Cambios y Versiones */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </header>
  );
};
