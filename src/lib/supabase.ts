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
  avatar_url: string | null;
  notification_preferences: {
    approval: boolean;
    new_order: boolean;
    order_status: boolean;
    delivery: boolean;
  } | null;
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
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pix_key?: string;
  pix_recipient_name?: string;
  free_shipping_enabled?: boolean;
  free_shipping_min_value?: number;
  free_shipping_max_distance?: number;
  night_service?: boolean;
  is_24h?: boolean;
  accepts_after_hours?: boolean;
  is_featured?: boolean;
  plan_type?: 'free' | 'featured' | 'premium';
  plan_status?: 'active' | 'inactive' | 'expired';
  plan_started_at?: string;
  plan_expires_at?: string;
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
  subcategory?: string;
  subtype?: string;
  brand?: string;
  unit_type: 'unit' | 'pack' | 'box';
  min_quantity: number;
  purchase_multiple: number;
  volume_discounts?: {
    min_quantity: number;
    discount_percentage: number;
  }[];
}

export interface Order {
  id: string;
  retailer_id: string;
  total_amount: number;
  status: string;
  payment_method: 'pix' | 'card' | 'cash';
  change_for?: number;
  pix_code: string;
  created_at: string;
  delivery_fee?: number;
  is_free_shipping?: boolean;
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

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: string;
  delivery_fee: number;
  distance_km?: number;
  vehicle_type?: string;
  is_free_shipping?: boolean;
  driver_payout?: number;
  platform_fee?: number;
  pickup_address?: string;
  delivery_address?: string;
  accepted_at?: string;
  created_at: string;
  order?: Order;
}
