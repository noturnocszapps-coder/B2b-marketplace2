import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, ArrowRight, CheckCircle2, User, Building2, Truck as TruckIcon, Mail, Lock, Phone, FileText, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'supplier' | 'retailer' | 'driver'>('retailer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    cnpj: '',
    address: '',
    whatsapp: '',
    responsibleName: '',
    cpf: '',
    vehicleType: 'Moto',
    plate: '',
    city: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // 2. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName || formData.responsibleName,
        role: role,
        status: 'pending'
      });

      if (profileError) throw profileError;

      // 3. Create role specific data
      if (role === 'supplier' || role === 'retailer') {
        const { error: companyError } = await supabase.from('companies').insert({
          profile_id: authData.user.id,
          name: formData.companyName,
          cnpj: formData.cnpj,
          address: formData.address,
          whatsapp: formData.whatsapp,
          responsible_name: formData.responsibleName,
          type: role
        });
        if (companyError) throw companyError;
      } else if (role === 'driver') {
        const { error: driverError } = await supabase.from('delivery_drivers').insert({
          profile_id: authData.user.id,
          cpf: formData.cpf,
          whatsapp: formData.whatsapp,
          vehicle_type: formData.vehicleType,
          plate: formData.plate,
          city: formData.city
        });
        if (driverError) throw driverError;
      }

      setSuccess(true);
      toast.success('Conta criada com sucesso! Aguarde aprovação.');
    } catch (err: any) {
      toast.error('Erro ao criar conta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-500" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Cadastro Realizado!</h1>
          <p className="text-zinc-400 mb-8">
            Sua conta foi criada com sucesso e está aguardando aprovação dos nossos administradores. 
            Você receberá um e-mail assim que for aprovado.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:underline">
            Voltar para o Login <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">
      {/* Sidebar Info */}
      <div className="hidden md:flex md:w-1/3 bg-orange-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Package className="text-orange-600" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">B2B MARKET</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            Expanda seu negócio no atacado regional.
          </h2>
          <p className="text-orange-100 text-lg lg:text-xl font-medium opacity-90">
            Conectamos os melhores fornecedores aos lojistas que buscam qualidade e agilidade.
          </p>
        </div>
        <div className="relative z-10 text-orange-200 text-sm font-medium">
          © 2026 B2B Marketplace Premium. Todos os direitos reservados.
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-xl w-full">
          <div className="mb-10">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Crie sua conta</h1>
            <p className="text-zinc-500 text-lg">Escolha seu perfil e preencha os dados abaixo.</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {(['retailer', 'supplier', 'driver'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex flex-col items-center gap-3 py-4 px-2 rounded-2xl border transition-all",
                  role === r 
                    ? "bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-600/20" 
                    : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20 hover:bg-white/10"
                )}
              >
                {r === 'retailer' ? <Building2 size={20} /> : r === 'supplier' ? <Package size={20} /> : <TruckIcon size={20} />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {r === 'retailer' ? 'Lojista' : r === 'supplier' ? 'Fornecedor' : 'Entregador'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="exemplo@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {role !== 'driver' ? (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Nome da Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="Razão Social ou Nome Fantasia"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">CNPJ</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.cnpj}
                        onChange={e => setFormData({...formData, cnpj: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="(00) 00000-0000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Endereço Completo</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="Rua, número, bairro, cidade - UF"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Nome do Responsável</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="Nome completo do gestor"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.responsibleName}
                        onChange={e => setFormData({...formData, responsibleName: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="Seu nome completo"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">CPF</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="000.000.000-00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.cpf}
                        onChange={e => setFormData({...formData, cpf: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="(00) 00000-0000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Tipo de Veículo</label>
                    <div className="relative">
                      <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <select
                        className="w-full bg-[#151515] border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all appearance-none"
                        value={formData.vehicleType}
                        onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                      >
                        <option>Moto</option>
                        <option>Carro</option>
                        <option>Fiorino</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Placa</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="ABC-1234"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.plate}
                        onChange={e => setFormData({...formData, plate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Cidade</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input
                        required
                        placeholder="Sua cidade de atuação"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-orange-600/20 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-zinc-500 font-medium">
              Já tem uma conta? <Link to="/login" className="text-orange-500 font-bold hover:underline">Entre aqui</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
