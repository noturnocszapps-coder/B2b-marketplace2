import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
}

export function formatCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
}

export function formatCEP(cep: string) {
  const digits = cep.replace(/\D/g, "");
  return digits.replace(/^(\d{5})(\d{3}).*/, "$1-$2");
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
}

export function validateCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || !!digits.match(/(\d)\1{10}/)) return false;
  const cpfArray = digits.split("").map(Number);
  const validator = (length: number) =>
    (cpfArray
      .slice(0, length)
      .map((v, i) => v * (length + 1 - i))
      .reduce((a, b) => a + b) *
      10) %
    11 %
    10;
  return validator(9) === cpfArray[9] && validator(10) === cpfArray[10];
}

export function validateCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14 || !!digits.match(/(\d)\1{13}/)) return false;
  const size = digits.length - 2;
  const numbers = digits.substring(0, size);
  const lastDigits = digits.substring(size);
  const calc = (n: string) => {
    let pos = n.length - 7;
    let sum = 0;
    for (let i = n.length; i >= 1; i--) {
      sum += parseInt(n.charAt(n.length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result;
  };
  return calc(numbers) === parseInt(lastDigits.charAt(0)) && calc(numbers + lastDigits.charAt(0)) === parseInt(lastDigits.charAt(1));
}
