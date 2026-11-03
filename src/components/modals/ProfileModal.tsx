import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../services/api";
import { toast } from "sonner";
import { X, UserCircle, KeyRound, Shield, Mail, CheckCircle2, Loader2 } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pinCode, setPinCode] = useState(user?.pin_code || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name,
        email: email.trim() || undefined,
        pin_code: pinCode.trim() || undefined,
      };

      if (newPassword) {
        if (!currentPassword) {
          toast.error("Debe ingresar la contraseña actual para cambiarla");
          setLoading(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.put("/auth/profile", payload);
      updateUser(res.data.data);
      toast.success("Perfil actualizado correctamente");
      setCurrentPassword("");
      setNewPassword("");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const rolesText = user.roles && user.roles.length > 0
    ? user.roles.map((r) => r.name).join(", ")
    : "Sin roles asignados";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UserCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Mi Perfil de Usuario</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Básica no editable */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Roles Asignados
              </p>
              <p className="text-sm font-bold text-slate-900 flex items-center mt-0.5">
                <Shield className="w-4 h-4 mr-1.5 text-blue-600 flex-shrink-0" />
                {rolesText}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Usuario Login
              </p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">@{user.user}</p>
            </div>
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-1 text-slate-500" />
              Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@restaurante.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* PIN de 4 dígitos */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              PIN Rápido (4 dígitos numéricos)
            </label>
            <input
              type="text"
              maxLength={4}
              pattern="\d{4}"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej. 1234"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Cambio de Contraseña */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 flex items-center mb-3">
              <KeyRound className="w-4 h-4 mr-1.5 text-amber-600" />
              Cambiar Contraseña (Opcional)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingrese para confirmar cambio"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
