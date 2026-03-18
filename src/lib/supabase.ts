import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback to avoid "supabaseUrl is required" error during initial setup/preview
const finalUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

export type UserRole = 'admin' | 'supplier' | 'retailer' | 'driver';
export type UserStatus = 'pending' | 'active' | 'blocked';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Company {
  id: string;
  profile_id: string;
  name: string;
  cnpj: string;
  address: string;
  whatsapp: string;
  responsible_name: string;
  type: 'supplier' | 'retailer';
}

export interface DeliveryDriver {
  id: string;
  profile_id: string;
  cpf: string;
  whatsapp: string;
  vehicle_type: string;
  plate: string;
  city: string;
}

export interface Product {
  id: string;
  supplier_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  weight: number;
  shipping_fee: number;
  image_url: string;
  is_active: boolean;
  category?: { name: string; parent_category: string };
  supplier?: Company;
}

export interface Order {
  id: string;
  retailer_id: string;
  total_amount: number;
  status: string;
  pix_code: string;
  created_at: string;
  retailer?: Company;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}
