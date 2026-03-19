import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Settings, 
  Store,
  LucideIcon
} from 'lucide-react';

export enum UserRole {
  ADMIN = 'admin',
  RETAILER = 'retailer',
  SUPPLIER = 'supplier',
  DRIVER = 'driver'
}

export interface NavigationItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    title: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard, 
    roles: [UserRole.ADMIN, UserRole.SUPPLIER, UserRole.RETAILER, UserRole.DRIVER] 
  },
  { 
    title: 'Produtos', 
    path: '/products', 
    icon: Package, 
    roles: [UserRole.ADMIN, UserRole.SUPPLIER] 
  },
  { 
    title: 'Catálogo', 
    path: '/catalog', 
    icon: Store, 
    roles: [UserRole.ADMIN, UserRole.RETAILER] 
  },
  { 
    title: 'Pedidos', 
    path: '/orders', 
    icon: ShoppingCart, 
    roles: [UserRole.ADMIN, UserRole.SUPPLIER, UserRole.RETAILER] 
  },
  { 
    title: 'Entregas', 
    path: '/deliveries', 
    icon: Truck, 
    roles: [UserRole.ADMIN, UserRole.SUPPLIER, UserRole.DRIVER] 
  },
  { 
    title: 'Usuários', 
    path: '/admin/users', 
    icon: Users, 
    roles: [UserRole.ADMIN] 
  },
  { 
    title: 'Configurações', 
    path: '/settings', 
    icon: Settings, 
    roles: [UserRole.ADMIN, UserRole.SUPPLIER, UserRole.RETAILER, UserRole.DRIVER] 
  },
];

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: NAVIGATION_ITEMS.map(item => item.path),
  [UserRole.RETAILER]: NAVIGATION_ITEMS.filter(item => item.roles.includes(UserRole.RETAILER)).map(item => item.path),
  [UserRole.SUPPLIER]: NAVIGATION_ITEMS.filter(item => item.roles.includes(UserRole.SUPPLIER)).map(item => item.path),
  [UserRole.DRIVER]: NAVIGATION_ITEMS.filter(item => item.roles.includes(UserRole.DRIVER)).map(item => item.path),
};

export const DEFAULT_REDIRECTS = {
  [UserRole.ADMIN]: '/dashboard',
  [UserRole.RETAILER]: '/dashboard',
  [UserRole.SUPPLIER]: '/dashboard',
  [UserRole.DRIVER]: '/dashboard',
};
