import { useState, useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { checkAndRefreshToken } from "./services/api";
import { Login } from "./pages/Login";
import { Navbar } from "./components/layout/Navbar";
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
  const { isAuthenticated } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<
    | "users"
    | "roles"
    | "settings"
    | "areas"
    | "tables"
    | "products"
    | "categories"
    | "brands"
    | "units"
    | "suppliers"
    | "recipes"
    | "entries"
  >("products");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Monitor proactivo de renovación de sesión (Silent Refresh)
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Verificación inicial al cargar la aplicación
    checkAndRefreshToken();

    // 2. Temporizador periódico cada 15 minutos (900,000 ms)
    const intervalId = setInterval(() => {
      checkAndRefreshToken();
    }, 15 * 60 * 1000);

    // 3. Listener al volver a enfocar la pestaña tras inactividad
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

      {/* Barra de Navegación Superior con Menú Seguridad */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "products" && <ProductsList />}
        {currentTab === "categories" && <CategoriesList />}
        {currentTab === "brands" && <BrandsList />}
        {currentTab === "units" && <UnitsList />}
        {currentTab === "entries" && <EntriesList />}
        {currentTab === "suppliers" && <SuppliersList />}
        {currentTab === "recipes" && <RecipesList />}
        {currentTab === "areas" && <AreasList />}
        {currentTab === "tables" && <TablesList />}
        {currentTab === "users" && <UsersList />}
        {currentTab === "roles" && <RolesList />}
        {currentTab === "settings" && <SettingsPage />}
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
