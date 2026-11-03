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

export interface Product {
  id: string;
  code: string;
  name: string;
  brand_id?: string | null;
  category_id: string;
  base_unit_id: string;
  product_type: "DIRECT_SALE" | "MANUFACTURED" | "RAW_MATERIAL";
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
  base_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
  presentations?: ProductPurchasePresentation[];
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
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
