import React, { useState, useEffect } from 'react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Package,
  X,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { TAXONOMY } from '../constants/taxonomy';

export default function Products() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: '',
    supplier_id: '',
    image_url: '',
    is_active: true,
    subcategory: '',
    subtype: '',
    brand: '',
    unit_type: 'unit' as 'unit' | 'pack' | 'box',
    min_quantity: 1,
    purchase_multiple: 1,
    volume_discounts: [] as { min_quantity: number; discount_percentage: number }[]
  });

  useEffect(() => {
    if (profile) {
      fetchProducts();
      fetchCategories();
      if (profile.role === 'admin') {
        fetchSuppliers();
      }
    }
  }, [profile]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        stock_quantity: editingProduct.stock_quantity,
        category_id: editingProduct.category_id,
        supplier_id: editingProduct.supplier_id,
        image_url: editingProduct.image_url || '',
        is_active: editingProduct.is_active,
        subcategory: editingProduct.subcategory || '',
        subtype: editingProduct.subtype || '',
        brand: editingProduct.brand || '',
        unit_type: editingProduct.unit_type || 'unit',
        min_quantity: editingProduct.min_quantity || 1,
        purchase_multiple: editingProduct.purchase_multiple || 1,
        volume_discounts: editingProduct.volume_discounts || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category_id: '',
        supplier_id: '',
        image_url: '',
        is_active: true,
        subcategory: '',
        subtype: '',
        brand: '',
        unit_type: 'unit',
        min_quantity: 1,
        purchase_multiple: 1,
        volume_discounts: []
      });
    }
  }, [editingProduct]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  }

  async function fetchSuppliers() {
    const { data } = await supabase
      .from('companies')
      .select('id, name')
      .eq('type', 'supplier')
      .order('name');
    setSuppliers(data || []);
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(name, parent_category), supplier:companies(name)');

      if (profile?.role === 'supplier') {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile.id)
          .single();
        
        if (company) {
          query = query.eq('supplier_id', company.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalSupplierId = formData.supplier_id;

      if (profile?.role !== 'admin') {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (!company) throw new Error('Empresa não encontrada');
        finalSupplierId = company.id;
      } else if (!finalSupplierId) {
        throw new Error('Selecione um fornecedor');
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            ...formData,
            supplier_id: finalSupplierId
          })
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...formData,
            supplier_id: finalSupplierId
          });
        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produto excluído com sucesso');
      fetchProducts();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Produtos</h1>
          <p className="text-zinc-500">Cadastre e controle seu estoque de mercadorias.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome do produto..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Produto</th>
                {profile?.role === 'admin' && (
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Fornecedor</th>
                )}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Preço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Estoque</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={profile?.role === 'admin' ? 7 : 6} className="px-6 py-10 text-center text-zinc-500">Carregando produtos...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={profile?.role === 'admin' ? 7 : 6} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={32} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-500">Nenhum produto encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="text-zinc-600" size={24} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{product.name}</div>
                          <div className="text-xs text-zinc-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    {profile?.role === 'admin' && (
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400">
                          {product.supplier?.name}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-400">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "text-sm font-medium",
                        product.stock_quantity < 10 ? "text-red-500" : "text-zinc-400"
                      )}>
                        {product.stock_quantity} un
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        product.is_active ? "bg-green-500/10 text-green-500" : "bg-zinc-500/10 text-zinc-500"
                      )}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">Nome do Produto</label>
                    <input 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  {profile?.role === 'admin' && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-400">Fornecedor (Ação Administrativa)</label>
                      <select 
                        required
                        className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                        value={formData.supplier_id}
                        onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                      >
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">Categoria Principal</label>
                    <select 
                      required
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                      value={formData.category_id}
                      onChange={e => {
                        const cat = categories.find(c => c.id === e.target.value);
                        setFormData({
                          ...formData, 
                          category_id: e.target.value,
                          subcategory: '',
                          subtype: ''
                        });
                      }}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {formData.category_id && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Subcategoria</label>
                        <select 
                          className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                          value={formData.subcategory}
                          onChange={e => setFormData({...formData, subcategory: e.target.value, subtype: ''})}
                        >
                          <option value="">Selecione uma subcategoria</option>
                          {TAXONOMY.find(t => t.name === categories.find(c => c.id === formData.category_id)?.name)?.subcategories.map(sub => (
                            <option key={sub.name} value={sub.name}>{sub.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Subtipo / Marca</label>
                        <select 
                          className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                          value={formData.subtype}
                          onChange={e => setFormData({...formData, subtype: e.target.value})}
                        >
                          <option value="">Selecione um subtipo</option>
                          {TAXONOMY.find(t => t.name === categories.find(c => c.id === formData.category_id)?.name)
                            ?.subcategories.find(s => s.name === formData.subcategory)
                            ?.subtypes?.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Marca (Opcional)</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      placeholder="Ex: Zomo, Coca-Cola"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Tipo de Unidade</label>
                    <select 
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                      value={formData.unit_type}
                      onChange={e => setFormData({...formData, unit_type: e.target.value as any})}
                    >
                      <option value="unit">Unitário</option>
                      <option value="pack">Pack</option>
                      <option value="box">Caixa Fechada</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Quantidade Mínima</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                      value={formData.min_quantity}
                      onChange={e => setFormData({...formData, min_quantity: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Múltiplo de Compra</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                      value={formData.purchase_multiple}
                      onChange={e => setFormData({...formData, purchase_multiple: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-400">Descontos por Volume</label>
                      <button 
                        type="button"
                        onClick={() => setFormData({
                          ...formData, 
                          volume_discounts: [...formData.volume_discounts, { min_quantity: 0, discount_percentage: 0 }]
                        })}
                        className="text-xs text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1"
                      >
                        <Plus size={14} /> Adicionar Faixa
                      </button>
                    </div>
                    
                    {formData.volume_discounts.map((discount, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500">Qtd Mínima</label>
                          <input 
                            type="number"
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                            value={discount.min_quantity}
                            onChange={e => {
                              const newDiscounts = [...formData.volume_discounts];
                              newDiscounts[index].min_quantity = parseInt(e.target.value);
                              setFormData({...formData, volume_discounts: newDiscounts});
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500">Desconto (%)</label>
                          <input 
                            type="number"
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                            value={discount.discount_percentage}
                            onChange={e => {
                              const newDiscounts = [...formData.volume_discounts];
                              newDiscounts[index].discount_percentage = parseInt(e.target.value);
                              setFormData({...formData, volume_discounts: newDiscounts});
                            }}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newDiscounts = formData.volume_discounts.filter((_, i) => i !== index);
                            setFormData({...formData, volume_discounts: newDiscounts});
                          }}
                          className="p-2 text-zinc-500 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">Descrição</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 h-24" 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Preço de Venda (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Estoque</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                      value={formData.stock_quantity}
                      onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-400">URL da Imagem</label>
                    <div className="flex gap-4">
                      <input 
                        type="url"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" 
                        value={formData.image_url}
                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      {formData.image_url && (
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                        className={cn(
                          "w-6 h-6 rounded border flex items-center justify-center transition-all",
                          formData.is_active ? "bg-orange-600 border-orange-600" : "border-white/20"
                        )}
                      >
                        {formData.is_active && <Check size={14} />}
                      </div>
                      <span className="text-sm font-medium text-zinc-300">Produto Ativo (visível no catálogo)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={loading}
                    type="submit"
                    className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
