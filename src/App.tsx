import { useState, useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { checkAndRefreshToken } from "./services/api";
import { Login } from "./pages/Login";
import { Navbar, AppTab } from "./components/layout/Navbar";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PosSalesPage } from "./pages/PosSalesPage";
import { SalesList } from "./pages/SalesList";
import { ExpensesList } from "./pages/ExpensesList";
import { CashOutflowsPage } from "./pages/CashOutflowsPage";
import { FinancialFlowPage } from "./pages/FinancialFlowPage";
import { UsersList } from "./pages/UsersList";
import { RolesList } from "./pages/RolesList";
import { SettingsPage } from "./pages/SettingsPage";
import { AreasList } from "./pages/AreasList";
import { TablesList } from "./pages/TablesList";
import { ProductsList } from "./pages/ProductsList";
import { CategoriesList } from "./pages/CategoriesList";
import { BrandsList } from "./pages/BrandsList";
import { UnitsList } from "./pages/UnitsList";
import { SuppliersList } from "./pages/SuppliersList";
import { RecipesList } from "./pages/RecipesList";
import { EntriesList } from "./pages/EntriesList";
import { ProfileModal } from "./components/modals/ProfileModal";
import { Toaster } from "sonner";

export function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<AppTab>("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Rol Cajero Exclusivo:
  // "En el caso del rol del 'Cajero' solo debe ver la pantalla de nuevas ventas y no poder ver ni el listado de ventas."
  const isCashier =
    user?.roles?.some((r) => r.name === "Cajero") &&
    !user?.roles?.some(
      (r) => r.name === "Administrador" || r.name === "Gerente / Supervisor"
    );

  // Mapear la ruta por defecto del rol a la pestaña inicial
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (isCashier) {
      setCurrentTab("pos");
      return;
    }

    const primaryRole = user.roles?.[0];
    const defaultPath = primaryRole?.default_path || "/";

    switch (defaultPath) {
      case "/pos":
        setCurrentTab("pos");
        break;
      case "/ventas":
        setCurrentTab("sales");
        break;
      case "/gastos":
        setCurrentTab("expenses");
        break;
      case "/finanzas/egresos":
        setCurrentTab("outflows");
        break;
      case "/finanzas/flujo":
        setCurrentTab("finances");
        break;
      case "/entradas":
        setCurrentTab("entries");
        break;
      case "/productos":
        setCurrentTab("products");
        break;
      case "/preparaciones":
      case "/recetas":
        setCurrentTab("recipes");
        break;
      case "/mesas":
        setCurrentTab("tables");
        break;
      case "/":
      default:
        setCurrentTab("dashboard");
        break;
    }
  }, [isAuthenticated, user?.id]);

  // Si es cajero y de alguna manera la pestaña cambia, restringir a POS
  const handleTabChange = (tab: AppTab) => {
    if (isCashier && tab !== "pos") {
      setCurrentTab("pos");
    } else {
      setCurrentTab(tab);
    }
  };

  // Monitor proactivo de renovación de sesión (Silent Refresh)
  useEffect(() => {
    if (!isAuthenticated) return;

    checkAndRefreshToken();

    const intervalId = setInterval(() => {
      checkAndRefreshToken();
    }, 15 * 60 * 1000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Barra de Navegación Superior */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tablero Administrativo (Home para Admin) */}
        {currentTab === "dashboard" && !isCashier && (
          <AdminDashboard onNavigate={handleTabChange} />
        )}

        {/* Módulo de Ventas / POS */}
        {currentTab === "pos" && <PosSalesPage />}
        {currentTab === "sales" && !isCashier && <SalesList />}

        {/* Módulo Financiero */}
        {currentTab === "finances" && !isCashier && <FinancialFlowPage />}
        {currentTab === "outflows" && !isCashier && <CashOutflowsPage />}
        {currentTab === "expenses" && !isCashier && <ExpensesList />}

        {/* Módulo de Compras y Almacén */}
        {currentTab === "entries" && !isCashier && <EntriesList />}
        {currentTab === "suppliers" && !isCashier && <SuppliersList />}

        {/* Módulo de Inventario */}
        {currentTab === "products" && !isCashier && <ProductsList />}
        {currentTab === "recipes" && !isCashier && <RecipesList />}
        {currentTab === "categories" && !isCashier && <CategoriesList />}
        {currentTab === "brands" && !isCashier && <BrandsList />}
        {currentTab === "units" && !isCashier && <UnitsList />}

        {/* Módulo de Salón */}
        {currentTab === "areas" && !isCashier && <AreasList />}
        {currentTab === "tables" && !isCashier && <TablesList />}

        {/* Módulo de Seguridad */}
        {currentTab === "users" && !isCashier && <UsersList />}
        {currentTab === "roles" && !isCashier && <RolesList />}
        {currentTab === "settings" && !isCashier && <SettingsPage />}
      </main>

      {/* Modal de Perfil */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default App;
