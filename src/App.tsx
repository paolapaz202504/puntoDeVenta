import { useState } from "react";
import { useAuthStore } from "./store/authStore";
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
  >("products");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
