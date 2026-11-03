import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import {
  X,
  UserCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  KeyRound,
  Mail,
  Shield,
  CheckSquare,
  Square,
} from "lucide-react";
import { User, Role } from "../../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userToEdit?: User | null;
  rolesList: Role[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  userToEdit,
  rolesList,
}) => {
  const [name, setName] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Validaciones
  const [nameError, setNameError] = useState("");
  const [userError, setUserError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [roleError, setRoleError] = useState("");

  const nameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  const userRegex = /^[a-zA-Z0-9_]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setUserLogin(userToEdit.user);
      setEmail(userToEdit.email || "");
      setPassword("");
      setPinCode(userToEdit.pin_code || "");
      setSelectedRoleIds(userToEdit.roles ? userToEdit.roles.map((r) => r.id) : []);
      setIsActive(userToEdit.is_active);
    } else {
      setName("");
      setUserLogin("");
      setEmail("");
      setPassword("");
      setPinCode("");
      setSelectedRoleIds(rolesList.length > 0 ? [rolesList[0].id] : []);
      setIsActive(true);
    }
    setNameError("");
    setUserError("");
    setEmailError("");
    setRoleError("");
  }, [userToEdit, isOpen, rolesList]);

  if (!isOpen) return null;

  const validateName = (val: string) => {
    if (val.length < 3) return "El nombre debe contener al menos 3 caracteres";
    if (val.length > 75) return "El nombre no puede exceder 75 caracteres";
    if (!nameRegex.test(val)) return "Solo alfanuméricos, acentos y espacios, sin símbolos especiales";
    return "";
  };

  const validateUser = (val: string) => {
    if (val.length < 3) return "El usuario debe contener al menos 3 caracteres";
    if (val.length > 50) return "El usuario no puede exceder 50 caracteres";
    if (!userRegex.test(val)) return "Solo alfanuméricos y guion bajo (sin espacios ni acentos)";
    return "";
  };

  const validateEmail = (val: string) => {
    if (!val || val.trim() === "") return "";
    if (val.length < 3 || val.length > 75) return "El correo debe tener entre 3 y 75 caracteres";
    if (!emailRegex.test(val)) return "Formato inválido (ejemplo: usuario@dominio.com)";
    return "";
  };

  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      if (selectedRoleIds.length === 1) {
        setRoleError("El usuario debe tener al menos 1 rol obligatorio");
        return;
      }
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
      setRoleError("");
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
      setRoleError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nErr = validateName(name.trim());
    const uErr = validateUser(userLogin.trim());
    const eErr = validateEmail(email.trim());
    let rErr = "";

    if (selectedRoleIds.length === 0) {
      rErr = "Debe asignar al menos 1 rol obligatorio al usuario";
    }

    if (nErr || uErr || eErr || rErr) {
      setNameError(nErr);
      setUserError(uErr);
      setEmailError(eErr);
      setRoleError(rErr);
      return;
    }

    if (!userToEdit && !password) {
      toast.error("Debe ingresar una contraseña para el nuevo usuario");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        user: userLogin.trim(),
        email: email.trim() || undefined,
        pin_code: pinCode.trim() || undefined,
        role_ids: selectedRoleIds,
        is_active: isActive,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (userToEdit) {
        await api.put(`/users/${userToEdit.id}`, payload);
        toast.success("Usuario actualizado correctamente");
      } else {
        await api.post("/users", payload);
        toast.success("Usuario creado exitosamente");
      }

      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al procesar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {userToEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Nombre Completo (para tickets/comandas) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(validateName(e.target.value));
                }}
                placeholder="Ej. Jorge Ramírez"
                className={`w-full px-3.5 py-2 bg-white border rounded-lg text-slate-900 text-sm focus:ring-2 outline-none transition-all ${
                  nameError
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {nameError && (
                <p className="mt-1 text-xs text-rose-600 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Usuario de login */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Usuario (Login) *
              </label>
              <input
                type="text"
                required
                disabled={userToEdit?.user === "admin"}
                value={userLogin}
                onChange={(e) => {
                  setUserLogin(e.target.value);
                  setUserError(validateUser(e.target.value));
                }}
                placeholder="Ej. jorge"
                className={`w-full px-3.5 py-2 bg-white border rounded-lg text-slate-900 text-sm focus:ring-2 outline-none transition-all disabled:bg-slate-100 ${
                  userError
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {userError && (
                <p className="mt-1 text-xs text-rose-600 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {userError}
                </p>
              )}
            </div>

            {/* PIN de 4 dígitos */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                PIN Rápido (4 dígitos numéricos)
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej. 1234"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Correo Electrónico */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(validateEmail(e.target.value));
                }}
                placeholder="jorge@restaurante.com"
                className={`w-full px-3.5 py-2 bg-white border rounded-lg text-slate-900 text-sm focus:ring-2 outline-none transition-all ${
                  emailError
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-rose-600 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {emailError}
                </p>
              )}
            </div>

            {/* ASIGNACIÓN DE UNO O MÁS ROLES */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-blue-600" />
                  Roles Asignados (Mínimo 1 obligatorio) *
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedRoleIds.length} seleccionado(s)
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {rolesList.map((r) => {
                  const isChecked = selectedRoleIds.includes(r.id);
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => toggleRole(r.id)}
                      className={`flex items-center p-2.5 rounded-lg border text-left transition-all ${
                        isChecked
                          ? "bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-xs truncate">{r.name}</span>
                    </button>
                  );
                })}
              </div>

              {roleError && (
                <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {roleError}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {userToEdit
                  ? "Nueva Contraseña (dejar en blanco para mantener la actual)"
                  : "Contraseña de Acceso *"}
              </label>
              <input
                type="password"
                required={!userToEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={userToEdit ? "••••••••" : "Mínimo 3 caracteres"}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Estado Activo / Inactivo */}
            <div className="md:col-span-2 flex items-center space-x-3 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-semibold text-slate-800">
                  Usuario {isActive ? "Activo (Permite Login)" : "Inactivo (Bloqueado)"}
                </span>
              </label>
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
              disabled={
                loading ||
                !!nameError ||
                !!userError ||
                !!emailError ||
                selectedRoleIds.length === 0
              }
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
                  {userToEdit ? "Actualizar Usuario" : "Crear Usuario"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
