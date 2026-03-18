/*
  SUPABASE DATABASE SCHEMA (PostgreSQL)
  
  -- 1. Profiles (Users)
  CREATE TYPE user_role AS ENUM ('admin', 'supplier', 'retailer', 'driver');
  CREATE TYPE user_status AS ENUM ('pending', 'active', 'blocked');

  CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'retailer',
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 2. Companies (Suppliers and Retailers)
  CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    responsible_name TEXT NOT NULL,
    type TEXT CHECK (type IN ('supplier', 'retailer')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 3. Delivery Drivers
  CREATE TABLE delivery_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cpf TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    vehicle_type TEXT NOT NULL, -- 'Moto', 'Carro', 'Fiorino'
    plate TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 4. Categories
  CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_category TEXT, -- 'Tabacaria' or 'Adega'
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 5. Products
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    weight DECIMAL(10,3),
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 6. Orders
  CREATE TYPE order_status AS ENUM ('pendente', 'aguardando pagamento', 'pago', 'em separação', 'pronto para envio', 'em entrega', 'entregue', 'cancelado');

  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID REFERENCES companies(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pendente',
    pix_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 7. Order Items
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL
  );

  -- 8. Deliveries
  CREATE TYPE delivery_status AS ENUM ('aguardando entregador', 'aceita', 'em coleta', 'saiu para entrega', 'entregue', 'falhou');

  CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES delivery_drivers(id),
    status delivery_status DEFAULT 'aguardando entregador',
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 9. Admin Logs
  CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 10. Product Price History
  CREATE TABLE product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    changed_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- SEED CATEGORIES
  INSERT INTO categories (name, parent_category) VALUES 
  ('Essências', 'Tabacaria'), ('Carvão', 'Tabacaria'), ('Alumínio', 'Tabacaria'), ('Rosh', 'Tabacaria'), ('Seda', 'Tabacaria'), ('Piteira', 'Tabacaria'), ('Acessórios', 'Tabacaria'),
  ('Whisky', 'Adega'), ('Gin', 'Adega'), ('Vodka', 'Adega'), ('Energético', 'Adega'), ('Refrigerante', 'Adega'), ('Gelo', 'Adega'), ('Cerveja', 'Adega'), ('Destilados', 'Adega'), ('Combos', 'Adega');

  -- RLS POLICIES (Row Level Security)
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE delivery_drivers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

  -- Profiles: Users can read their own profile, admins can read all
  CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

  -- Products: Everyone can read active products, suppliers can manage their own
  CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (is_active = true);
  CREATE POLICY "Suppliers can manage own products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM companies WHERE id = products.supplier_id AND profile_id = auth.uid())
  );

  -- Orders: Retailers can see their own, suppliers can see orders with their items, admins see all
  CREATE POLICY "Retailers can see own orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM companies WHERE id = orders.retailer_id AND profile_id = auth.uid())
  );
  CREATE POLICY "Retailers can create orders" ON orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE id = retailer_id AND profile_id = auth.uid())
  );

  -- Deliveries: Drivers can see available or their own, admins see all
  CREATE POLICY "Drivers can see available or own deliveries" ON deliveries FOR SELECT USING (
    status = 'aguardando entregador' OR 
    EXISTS (SELECT 1 FROM delivery_drivers WHERE id = deliveries.driver_id AND profile_id = auth.uid())
  );
  CREATE POLICY "Drivers can update own deliveries" ON deliveries FOR UPDATE USING (
    EXISTS (SELECT 1 FROM delivery_drivers WHERE id = deliveries.driver_id AND profile_id = auth.uid()) OR
    (status = 'aguardando entregador' AND driver_id IS NULL)
  );
*/
