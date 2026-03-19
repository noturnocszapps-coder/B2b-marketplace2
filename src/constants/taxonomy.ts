export interface TaxonomyCategory {
  name: string;
  icon: string;
  subcategories: {
    name: string;
    subtypes?: string[];
  }[];
}

export const TAXONOMY: TaxonomyCategory[] = [
  {
    name: 'TABACARIA',
    icon: '💨',
    subcategories: [
      { name: 'Carvão', subtypes: ['250g', '500g', '1kg'] },
      { name: 'Alumínio' },
      { name: 'Essência', subtypes: ['Zgy', 'Nay', 'Zomo', 'Adalya', 'Onix', 'Magic'] },
      { 
        name: 'Acessórios', 
        subtypes: ['Rosh', 'Mangueiras', 'Piteiras', 'Acendedor / Panelinha (110v)', 'Acendedor / Panelinha (220v)', 'Borrachas', 'Pegador'] 
      }
    ]
  },
  {
    name: 'BEBIDAS',
    icon: '🥤',
    subcategories: [
      { name: 'Gin' },
      { name: 'Energético' },
      { name: 'Gelo Saborizado' },
      { name: 'Refrigerante', subtypes: ['Lata', 'Retornáveis', '2 Litros', '600ml'] },
      { name: 'Água' }
    ]
  },
  {
    name: 'WHISKY',
    icon: '🥃',
    subcategories: [
      { name: 'White Horse' },
      { name: 'Passport' },
      { name: 'Red Label' }
    ]
  },
  {
    name: 'CERVEJA',
    icon: '🍺',
    subcategories: [
      { name: 'Lata' },
      { name: 'Long Neck' },
      { name: '300ml' },
      { name: '600ml' },
      { name: '1 Litro' }
    ]
  },
  {
    name: 'HEADSHOP',
    icon: '🌿',
    subcategories: [
      { name: 'Seda' },
      { name: 'Piteira' },
      { name: 'Acessórios' }
    ]
  },
  {
    name: 'OUTROS',
    icon: '📦',
    subcategories: [
      { name: 'Palheiros' },
      { name: 'Cigarros' }
    ]
  }
];
