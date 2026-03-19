import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCompanyPlan, PLAN_CONFIG, PlanType } from '../lib/supplier';
import { User, Building2, Shield, Bell, Save, Camera, Star, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'company'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Company state
  const [company, setCompany] = useState<any>(null);
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [pixKeyType, setPixKeyType] = useState<string>('');
  const [pixKey, setPixKey] = useState('');
  const [pixRecipientName, setPixRecipientName] = useState('');
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingMinValue, setFreeShippingMinValue] = useState(0);
  const [freeShippingMaxDistance, setFreeShippingMaxDistance] = useState(0);
  const [nightService, setNightService] = useState(false);
  const [is24h, setIs24h] = useState(false);
  const [acceptsAfterHours, setAcceptsAfterHours] = useState(false);

  React.useEffect(() => {
    if (profile && (profile.role === 'retailer' || profile.role === 'supplier')) {
      fetchCompany();
    }
  }, [profile]);

  async function fetchCompany() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('profile_id', profile?.id)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setCompany(data);
        setCompanyName(data.name || '');
        setCnpj(data.cnpj || '');
        setAddress(data.address || '');
        setWhatsapp(data.whatsapp || '');
        setResponsibleName(data.responsible_name || '');
        setPixKeyType(data.pix_key_type || '');
        setPixKey(data.pix_key || '');
        setPixRecipientName(data.pix_recipient_name || '');
        setFreeShippingEnabled(data.free_shipping_enabled || false);
        setFreeShippingMinValue(data.free_shipping_min_value || 0);
        setFreeShippingMaxDistance(data.free_shipping_max_distance || 0);
        setNightService(data.night_service || false);
        setIs24h(data.is_24h || false);
        setAcceptsAfterHours(data.accepts_after_hours || false);
      }
    } catch (error: any) {
      console.error('Erro ao carregar empresa:', error.message);
    }
  }

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const companyData = {
        name: companyName,
        cnpj,
        address,
        whatsapp,
        responsible_name: responsibleName,
        pix_key_type: pixKeyType,
        pix_key: pixKey,
        pix_recipient_name: pixRecipientName,
        free_shipping_enabled: freeShippingEnabled,
        free_shipping_min_value: freeShippingMinValue,
        free_shipping_max_distance: freeShippingMaxDistance,
        night_service: nightService,
        is_24h: is24h,
        accepts_after_hours: acceptsAfterHours
      };

      if (company) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', company.id);
        
        if (error) throw error;
        toast.success('Dados da empresa atualizados!');
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            profile_id: profile.id,
            type: profile.role
          })
          .select()
          .single();
        
        if (error) throw error;
        setCompany(data);
        toast.success('Empresa cadastrada com sucesso!');
      }
    } catch (error: any) {
      toast.error('Erro ao salvar dados da empresa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Notifications State
  const [prefs, setPrefs] = useState(profile?.notification_preferences || {
    approval: true,
    new_order: true,
    order_status: true,
    delivery: true
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (newPrefs: typeof prefs) => {
    if (!profile) return;
    setPrefs(newPrefs);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPrefs })
        .eq('id', profile.id);
      
      if (error) throw error;
      toast.success('Preferências de notificação atualizadas!');
    } catch (error: any) {
      toast.error('Erro ao atualizar notificações: ' + error.message);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer o upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Foto de perfil carregada!');
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-zinc-500">Gerencie sua conta e preferências da plataforma.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              activeTab === 'profile' ? "bg-orange-600 text-white" : "text-zinc-400 hover:bg-white/5"
            )}
          >
            <User size={20} />
            Perfil
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              activeTab === 'security' ? "bg-orange-600 text-white" : "text-zinc-400 hover:bg-white/5"
            )}
          >
            <Shield size={20} />
            Segurança
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              activeTab === 'notifications' ? "bg-orange-600 text-white" : "text-zinc-400 hover:bg-white/5"
            )}
          >
            <Bell size={20} />
            Notificações
          </button>
          {(profile?.role === 'retailer' || profile?.role === 'supplier') && (
            <button 
              onClick={() => setActiveTab('company')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === 'company' ? "bg-orange-600 text-white" : "text-zinc-400 hover:bg-white/5"
              )}
            >
              <Building2 size={20} />
              Empresa
            </button>
          )}
        </aside>

        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold overflow-hidden border-2 border-white/10 group-hover:border-orange-500 transition-all">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile?.full_name?.charAt(0)
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                    <Camera size={24} className="text-white" />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile?.full_name}</h3>
                  <p className="text-zinc-500 capitalize">{profile?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome Completo</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">E-mail</label>
                  <input 
                    type="email" 
                    defaultValue={profile?.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <button 
                disabled={loading || uploading}
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                Salvar Alterações
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="pb-6 border-b border-white/5">
                <h3 className="text-xl font-bold mb-1">Alterar Senha</h3>
                <p className="text-zinc-500 text-sm">Garanta a segurança da sua conta com uma senha forte.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nova Senha</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <button 
                disabled={loading || !newPassword || !confirmPassword}
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Shield size={20} />}
                Atualizar Senha
              </button>
            </form>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              {/* Plan Info Card */}
              {(() => {
                console.log('PLAN CARD RENDERIZADO');
                const planType = (company?.plan_type as PlanType) || 'free';
                const planStatus = company?.plan_status || 'active';
                const config = PLAN_CONFIG[planType];
                
                return (
                  <div className={cn(
                    "bg-[#0A0A0A] border rounded-3xl p-8 relative overflow-hidden",
                    (planType === 'premium' && planStatus !== 'expired') ? "border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]" :
                    (planType === 'featured' && planStatus !== 'expired') ? "border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]" :
                    "border-white/10"
                  )}>
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl",
                            planType === 'premium' ? "bg-orange-600/20 text-orange-500" :
                            planType === 'featured' ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-zinc-800 text-zinc-400"
                          )}>
                            {config.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-2xl font-bold">Plano {config.label}</h3>
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                planStatus === 'expired' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                              )}>
                                {planStatus === 'expired' ? 'Expirado' : 'Ativo'}
                              </span>
                            </div>
                            <p className="text-zinc-500 text-sm">{config.description}</p>
                          </div>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => toast.info('Gerenciamento de planos em breve!')}
                          className={cn(
                            "px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2",
                            (planType === 'free') 
                              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20" 
                              : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          )}
                        >
                          {planType === 'free' ? (
                            <>
                              <span>🔥</span>
                              Quero mais pedidos
                            </>
                          ) : (
                            'Gerenciar plano'
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Início do Plano</p>
                          <p className="font-bold">{company?.plan_started_at ? new Date(company.plan_started_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Expiração</p>
                          <p className="font-bold">{company?.plan_expires_at ? new Date(company.plan_expires_at).toLocaleDateString('pt-BR') : 'Vitalício'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Background Accents */}
                    <div className={cn(
                      "absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 -mr-32 -mt-32",
                      planType === 'premium' ? "bg-orange-500" :
                      planType === 'featured' ? "bg-yellow-500" :
                      "bg-zinc-500"
                    )} />
                  </div>
                );
              })()}

              <form onSubmit={handleCompanyUpdate} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="pb-6 border-b border-white/5">
                <h3 className="text-xl font-bold mb-1">Dados da Empresa</h3>
                <p className="text-zinc-500 text-sm">Gerencie as informações comerciais do seu perfil.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome da Empresa / Fantasia</label>
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">CNPJ</label>
                  <input 
                    type="text" 
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome do Responsável</label>
                  <input 
                    type="text" 
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">WhatsApp / Contato</label>
                  <input 
                    type="text" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>

                {/* Pix Configuration */}
                <div className="sm:col-span-2 pt-6 border-t border-white/5">
                  <h4 className="text-lg font-bold mb-4">Configuração de Pagamento Pix</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tipo de Chave Pix</label>
                      <select 
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all appearance-none"
                      >
                        <option value="" className="bg-[#0A0A0A]">Selecione o tipo</option>
                        <option value="cpf" className="bg-[#0A0A0A]">CPF</option>
                        <option value="cnpj" className="bg-[#0A0A0A]">CNPJ</option>
                        <option value="email" className="bg-[#0A0A0A]">E-mail</option>
                        <option value="phone" className="bg-[#0A0A0A]">Telefone</option>
                        <option value="random" className="bg-[#0A0A0A]">Chave Aleatória</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Chave Pix</label>
                      <input 
                        type="text" 
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="Sua chave Pix"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome do Favorecido (Recipient)</label>
                      <input 
                        type="text" 
                        value={pixRecipientName}
                        onChange={(e) => setPixRecipientName(e.target.value)}
                        placeholder="Nome completo do titular da conta"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Configuration */}
                {profile?.role === 'supplier' && (
                  <>
                    <div className="sm:col-span-2 pt-6 border-t border-white/5">
                      <h4 className="text-lg font-bold mb-4">Disponibilidade e Horários</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider">Atende à noite</h4>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setNightService(!nightService)}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative",
                              nightService ? "bg-orange-600" : "bg-zinc-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                              nightService ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider">Atendimento 24h</h4>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIs24h(!is24h)}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative",
                              is24h ? "bg-orange-600" : "bg-zinc-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                              is24h ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider">Fora do horário</h4>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setAcceptsAfterHours(!acceptsAfterHours)}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative",
                              acceptsAfterHours ? "bg-orange-600" : "bg-zinc-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                              acceptsAfterHours ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-6 border-t border-white/5">
                      <h4 className="text-lg font-bold mb-4">Configuração de Frete Grátis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 sm:col-span-2">
                        <div>
                          <h4 className="font-bold text-sm">Ativar Frete Grátis</h4>
                          <p className="text-xs text-zinc-500">Ofereça frete grátis para pedidos que atingirem o valor mínimo e distância máxima.</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFreeShippingEnabled(!freeShippingEnabled)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            freeShippingEnabled ? "bg-orange-600" : "bg-zinc-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                            freeShippingEnabled ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                      
                      {freeShippingEnabled && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Valor Mínimo do Pedido (R$)</label>
                            <input 
                              type="number" 
                              value={freeShippingMinValue}
                              onChange={(e) => setFreeShippingMinValue(Number(e.target.value))}
                              placeholder="0.00"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Distância Máxima (km)</label>
                            <input 
                              type="number" 
                              value={freeShippingMaxDistance}
                              onChange={(e) => setFreeShippingMaxDistance(Number(e.target.value))}
                              placeholder="0"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-all"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

              <button 
                disabled={loading}
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                {company ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
              </button>
            </form>
          </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="pb-6 border-b border-white/5">
                <h3 className="text-xl font-bold mb-1">Preferências de Notificação</h3>
                <p className="text-zinc-500 text-sm">Escolha quais avisos você deseja receber.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'approval', label: 'Aprovação de conta', desc: 'Receba um aviso quando seu acesso for liberado.' },
                  { id: 'new_order', label: 'Novos pedidos', desc: 'Seja notificado quando um novo pedido for realizado.' },
                  { id: 'order_status', label: 'Status de pedidos', desc: 'Acompanhe as mudanças de status dos seus pedidos.' },
                  { id: 'delivery', label: 'Entregas', desc: 'Receba atualizações sobre o andamento das entregas.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-sm">{item.label}</h4>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleNotificationUpdate({
                        ...prefs,
                        [item.id]: !prefs[item.id as keyof typeof prefs]
                      })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        prefs[item.id as keyof typeof prefs] ? "bg-orange-600" : "bg-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        prefs[item.id as keyof typeof prefs] ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
            <h3 className="text-red-500 font-bold mb-2">Zona de Perigo</h3>
            <p className="text-zinc-500 text-sm mb-6">Uma vez que você excluir sua conta, não há como voltar atrás. Por favor, tenha certeza.</p>
            <button 
              onClick={() => {
                if (confirm('TEM CERTEZA? Esta ação é irreversível e excluirá todos os seus dados.')) {
                  toast.error('Funcionalidade de exclusão restrita. Entre em contato com o suporte.');
                }
              }}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all"
            >
              Excluir minha conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
