import React, { useEffect } from "react";
import { X, Package, Tag, Building2 } from "lucide-react";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  productName: string;
  categoryName?: string;
  brand?: string | null;
  code?: string;
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  productName,
  categoryName,
  brand,
  code,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* Fondo oscuro para cerrar al hacer clic */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Tarjeta del Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 z-10 transform transition-all animate-scale-up">
        {/* Cabecera con botón de cerrar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              {code || "Detalle de Producto"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Visual Central con Fondo Blanco */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full h-72 sm:h-80 bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center shadow-inner overflow-hidden mb-5">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={productName}
                className="max-h-full max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <Package className="w-16 h-16 stroke-1 mb-2" />
                <span className="text-sm font-semibold">Sin imagen asignada</span>
              </div>
            )}
          </div>

          {/* Información y Títulos */}
          <div className="w-full text-center space-y-2.5">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {productName}
            </h3>

            {/* Badges de Marca y Categoría */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {brand && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  {brand}
                </span>
              )}
              {categoryName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80 shadow-xs">
                  <Tag className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  {categoryName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};
