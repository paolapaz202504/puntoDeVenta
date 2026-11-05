export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  _count?: {
    users: number;
    permissions: number;
  };
}

export interface Permission {
  id: string;
  slug: string;
  name: string;
  module: string;
  description?: string | null;
}

export interface User {
  id: string;
  name: string;
  user: string;
  email?: string | null;
  pin_code?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  roles: Array<{
    id: string;
    name: string;
  }>;
}

export interface SystemSetting {
  id: string;
  company_name: string;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  currency_symbol: string;
  logo_url?: string | null;
}

export interface BackupLog {
  id: string;
  filename: string;
  file_path: string;
  file_size_formatted: string;
  custom_destination?: string | null;
  user_name: string;
  user_login: string;
  created_at: string;
}

export interface RestoreLog {
  id: string;
  imported_filename: string;
  file_size_formatted: string;
  auto_backup_filename: string;
  status: "SUCCESS" | "FAILED";
  error_message?: string | null;
  user_name: string;
  user_login: string;
  created_at: string;
}

export interface Area {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  _count?: {
    tables: number;
  };
}

export interface RestaurantTable {
  id: string;
  name: string;
  area_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  area?: {
    id: string;
    name: string;
  };
}

export interface MeasurementUnit {
  id: string;
  name: string;
  symbol: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  _count?: {
    products: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductPurchasePresentation {
  id?: string;
  product_id?: string;
  name: string;
  conversion_factor: number;
  barcode?: string | null;
  default_cost?: number | null;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category: "FRUTAS" | "PANADERIA" | "CARNICERIA" | "ABARROTES" | "GENERAL";
  is_active: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeItem {
  id?: string;
  recipe_id?: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient?: {
    id: string;
    code: string;
    name: string;
    current_stock: number;
    current_cost: number;
    base_unit?: {
      symbol: string;
      name: string;
    };
  };
}

export interface Recipe {
  id: string;
  product_id: string;
  name: string;
  recipe_type: "BATCH_SCALABLE" | "SUB_RECIPE_BATCH" | "ON_DEMAND_UNIT";
  base_yield: number;
  yield_unit: string;
  instructions?: string | null;
  is_active: boolean;
  product?: {
    id: string;
    code: string;
    name: string;
    product_type: string;
    current_stock: number;
    base_unit?: {
      symbol: string;
    };
  };
  items?: RecipeItem[];
  created_at: string;
  updated_at: string;
}

export interface ProductionBatch {
  id: string;
  recipe_id: string;
  recipe_name: string;
  product_id: string;
  product_name: string;
  container_capacity_liters?: number | null;
  produced_quantity: number;
  unit: string;
  total_cost: number;
  notes?: string | null;
  created_at: string;
  created_by?: string | null;
  consumed_items?: Array<{
    id: string;
    ingredient_name: string;
    quantity_consumed: number;
    unit: string;
    unit_cost_applied: number;
    total_cost: number;
  }>;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  brand_id?: string | null;
  category_id: string;
  base_unit_id: string;
  supplier_id?: string | null;
  product_type: "DIRECT_SALE" | "MANUFACTURED" | "RAW_MATERIAL" | "SUB_RECIPE" | "ON_DEMAND";
  sale_price: number;
  current_cost: number;
  current_stock: number;
  min_stock_alert: number;
  image_url?: string | null;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  } | null;
  supplier?: {
    id: string;
    name: string;
    category: string;
  } | null;
  base_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  recipes_as_final?: Recipe[];
  presentations?: ProductPurchasePresentation[];
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface PurchasePayment {
  id: string;
  entry_id: string;
  payment_date: string;
  amount: number;
  payment_method: "EFECTIVO" | "CHEQUE" | "DEPOSITO" | "TRANSFERENCIA";
  bank_name?: string | null;
  document_number?: string | null;
  document_date?: string | null;
  notes?: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface StockEntryItem {
  id: string;
  entry_id: string;
  product_id: string;
  presentation_name?: string | null;
  quantity: number;
  conversion_factor: number;
  base_quantity: number;
  unit_cost: number;
  total_cost: number;
  product?: {
    id: string;
    code: string;
    name: string;
    base_unit?: {
      name: string;
      symbol: string;
    };
  };
}

export interface StockEntry {
  id: string;
  entry_number: string;
  supplier_id?: string | null;
  entry_type: "COMPRA" | "DONACION" | "AJUSTE";
  entry_date: string;
  invoice_number?: string | null;
  payment_type: "CONTADO" | "CREDITO" | "NO_APLICA";
  payment_status: "PAGADA" | "PENDIENTE" | "PARCIAL" | "NO_APLICA";
  total_cost: number;
  paid_amount: number;
  balance_amount: number;
  due_date?: string | null;
  notes?: string | null;
  supplier?: {
    id: string;
    name: string;
    contact_name?: string | null;
    phone?: string | null;
    category: string;
  } | null;
  items?: StockEntryItem[];
  payments?: PurchasePayment[];
  created_at: string;
  created_by?: string | null;
}

export interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    user: string;
    email?: string | null;
    pin_code?: string | null;
    roles: Array<{
      id: string;
      name: string;
    }>;
    permissions: string[];
  } | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
  updateUser: (user: Partial<NonNullable<AuthState["user"]>>) => void;
  hasPermission: (slug: string) => boolean;
}
