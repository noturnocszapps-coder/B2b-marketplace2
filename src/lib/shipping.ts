import { Company } from './supabase';

export type VehicleType = 'MOTO' | 'CARRO' | 'FIORINO';

interface ShippingRates {
  base: {
    [key in VehicleType]: {
      upTo3km: number;
      upTo5km: number;
      upTo8km: number;
      upTo12km: number;
      extraPerKm: number;
    };
  };
}

const RATES: ShippingRates = {
  base: {
    MOTO: {
      upTo3km: 8,
      upTo5km: 10,
      upTo8km: 13,
      upTo12km: 16,
      extraPerKm: 2,
    },
    CARRO: {
      upTo3km: 12,
      upTo5km: 15,
      upTo8km: 18,
      upTo12km: 23,
      extraPerKm: 2.5,
    },
    FIORINO: {
      upTo3km: 18,
      upTo5km: 22,
      upTo8km: 28,
      upTo12km: 35,
      extraPerKm: 3.5,
    },
  },
};

export function suggestVehicle(totalWeight: number): VehicleType {
  if (totalWeight <= 8) return 'MOTO';
  if (totalWeight <= 30) return 'CARRO';
  return 'FIORINO';
}

export function calculateDistance(origin: string, destination: string): number {
  // Para o MVP, se for na mesma cidade (ou se não for possível calcular real), 
  // usamos um fallback de 5km.
  // Futuramente integrar com Google Maps Distance Matrix API.
  
  // Exemplo simples de lógica de fallback:
  // Se os endereços forem idênticos, distância é 0.
  if (origin.toLowerCase() === destination.toLowerCase()) return 0;
  
  // Fallback padrão para MVP
  return 5; 
}

export function calculateShippingFee(
  distanceKm: number,
  vehicleType: VehicleType
): number {
  const rates = RATES.base[vehicleType];
  let fee = 0;

  if (distanceKm <= 3) {
    fee = rates.upTo3km;
  } else if (distanceKm <= 5) {
    fee = rates.upTo5km;
  } else if (distanceKm <= 8) {
    fee = rates.upTo8km;
  } else if (distanceKm <= 12) {
    fee = rates.upTo12km;
  } else {
    // Acima de 12km: base de 12km + adicional por km excedente
    const extraKm = Math.ceil(distanceKm - 12);
    fee = rates.upTo12km + (extraKm * rates.extraPerKm);
  }

  return fee;
}

export interface ShippingResult {
  distanceKm: number;
  vehicleType: VehicleType;
  deliveryFee: number;
  isFreeShipping: boolean;
  subtotal: number;
  total: number;
  driverPayout: number;
  platformFee: number;
}

export function getShippingDetails(
  subtotal: number,
  totalWeight: number,
  originAddress: string,
  destinationAddress: string,
  supplier: Company
): ShippingResult {
  const distanceKm = calculateDistance(originAddress, destinationAddress);
  const vehicleType = suggestVehicle(totalWeight);
  let deliveryFee = calculateShippingFee(distanceKm, vehicleType);
  let isFreeShipping = false;

  // Regra de Frete Grátis
  if (
    supplier.free_shipping_enabled &&
    subtotal >= (supplier.free_shipping_min_value || 0) &&
    distanceKm <= (supplier.free_shipping_max_distance || 999999)
  ) {
    deliveryFee = 0;
    isFreeShipping = true;
  }

  // Divisão de valores (Exemplo: 80% motorista, 20% plataforma)
  // Se for frete grátis, o fornecedor paga o frete (neste MVP assumimos que o custo é absorvido ou pago separadamente)
  // Para fins de registro, calculamos o valor que seria pago se não fosse grátis
  const baseFee = calculateShippingFee(distanceKm, vehicleType);
  const driverPayout = baseFee * 0.8;
  const platformFee = baseFee * 0.2;

  return {
    distanceKm,
    vehicleType,
    deliveryFee,
    isFreeShipping,
    subtotal,
    total: subtotal + deliveryFee,
    driverPayout,
    platformFee
  };
}
