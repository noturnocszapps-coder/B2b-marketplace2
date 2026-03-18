import { Company } from './supabase';

export type SupplierStatus = 'aberto_24h' | 'noite' | 'fora_horario' | 'indisponivel';

export function getSupplierStatus(company: Company): SupplierStatus {
  const currentHour = new Date().getHours();

  if (company.is_24h) {
    return 'aberto_24h';
  }

  if (company.night_service && currentHour >= 18) {
    return 'noite';
  }

  if (company.accepts_after_hours) {
    return 'fora_horario';
  }

  return 'indisponivel';
}

export const STATUS_CONFIG = {
  aberto_24h: {
    label: 'Aberto 24h',
    icon: '🟢',
    bg: 'bg-emerald-600/10',
    text: 'text-emerald-500',
    border: 'border-emerald-600/20'
  },
  noite: {
    label: 'Atendendo agora',
    icon: '🌙',
    bg: 'bg-indigo-600/10',
    text: 'text-indigo-400',
    border: 'border-indigo-600/20'
  },
  fora_horario: {
    label: 'Aceita pedidos fora do horário',
    icon: '⏳',
    bg: 'bg-orange-600/10',
    text: 'text-orange-500',
    border: 'border-orange-600/20'
  },
  indisponivel: {
    label: 'Pode estar indisponível',
    icon: '🔴',
    bg: 'bg-zinc-600/10',
    text: 'text-zinc-500',
    border: 'border-zinc-600/20'
  }
};

export type PlanType = 'free' | 'featured' | 'premium';

export function getCompanyPlan(company: Company): PlanType {
  // If plan_status is 'expired' or 'inactive', treat as 'free'
  if (company.plan_status === 'expired' || company.plan_status === 'inactive') {
    return 'free';
  }
  
  // Default to 'free' if not set
  return company.plan_type || 'free';
}

export const PLAN_CONFIG = {
  free: {
    label: 'Free',
    description: 'Visibilidade básica',
    icon: '⚪',
    badge: null,
    color: 'text-zinc-400',
    bg: 'bg-zinc-800',
    text: 'text-zinc-400'
  },
  featured: {
    label: 'Destaque',
    description: 'Aparece no topo',
    icon: '⭐',
    badge: 'Destaque',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500',
    text: 'text-black'
  },
  premium: {
    label: 'Premium',
    description: 'Máxima visibilidade',
    icon: '🔥',
    badge: 'Premium',
    color: 'text-orange-500',
    bg: 'bg-orange-600',
    text: 'text-white'
  }
};
