import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, User, Bell, Lock, Globe, Moon, ShieldCheck, HelpCircle, LogOut, ChevronRight, Briefcase, Heart, Check, X, Sparkles, Palette, Crown, Rocket, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { applyTheme } from '@/components/ThemeHandler';
import { useTranslation } from 'react-i18next';

import { allCategories, categoryEmojis } from '@/data/mockData';

const SettingsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/profile');
  const { t, i18n } = useTranslation();
  const [showInterests, setShowInterests] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState(i18n.language.startsWith('en') ? 'English' : 'Español');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('app-theme') === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [membership, setMembership] = useState<string>('Basic');
  const [showAppearance, setShowAppearance] = useState(false);
  const [accentColor, setAccentColor] = useState(localStorage.getItem('app-accent-color') || 'indigo');
  const [interfaceStyle, setInterfaceStyle] = useState(localStorage.getItem('app-interface-style') || 'Moderno');
  const [savingInterests, setSavingInterests] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch Membership
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (sub) {
          setMembership(sub.plan_id);
          localStorage.setItem('user_membership', sub.plan_id);
        }

        // Fetch Interests
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (profile?.preferences) {
          setInterests(profile.preferences);
        }
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error('Error al actualizar contraseña');
    } else {
      toast.success('Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada');
      navigate('/auth');
    }
  };

  const sections = [
    {
      title: t('settings.account'),
      items: [
        { id: 'personal_info', icon: User, label: t('settings.personal_info'), path: '/profile/edit' },
        { id: 'security', icon: Lock, label: t('settings.security') },
        { id: 'notifications', icon: Bell, label: t('settings.notifications'), type: 'toggle', checked: notificationsEnabled },
      ]
    },
    {
      title: t('settings.personalization'),
      items: [
        { 
          id: 'appearance',
          icon: Sparkles, 
          label: t('settings.appearance_label'), 
          value: membership === 'Basic' ? t('common.basic_plan') : `${t('profile.membership.plan')} ${membership}`,
          badge: membership !== 'Basic' ? 'Premium' : null
        },
        { id: 'interests', icon: Heart, label: t('settings.interests'), value: interests.length > 0 ? interests.join(', ') : t('settings.none') },
        { id: 'language', icon: Globe, label: t('settings.language'), value: language },
        { id: 'dark_mode', icon: Moon, label: t('settings.dark_mode'), type: 'toggle', checked: isDarkMode },
      ]
    },
    {
      title: t('settings.support'),
      items: [
        { id: 'privacy', icon: ShieldCheck, label: t('settings.privacy'), path: '/terms' },
        { id: 'help_center', icon: HelpCircle, label: t('settings.help_center'), path: '/support' },
      ]
    }
  ];

  const handleToggle = (id: string, checked: boolean) => {
    if (id === 'dark_mode') {
      setIsDarkMode(checked);
      if (checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('app-theme', 'dark');
        toast.success(t('settings.dark_mode_on') || 'Modo Oscuro activado');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('app-theme', 'light');
        toast.success(t('settings.dark_mode_off') || 'Modo Claro activado');
      }
    } else if (id === 'notifications') {
      setNotificationsEnabled(checked);
      toast.success(checked ? t('settings.notifications_on') : t('settings.notifications_off'));
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferences: interests,
          tags: interests // Keeping both synced
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update auth metadata too
      await supabase.auth.updateUser({
        data: { preferences: interests }
      });

      // Dispatch event for ProfilePage to refresh
      window.dispatchEvent(new Event('profile-updated'));

      toast.success(t('settings.interests_saved') || 'Intereses actualizados');
      setShowInterests(false);
    } catch (error: any) {
      console.error('Error saving interests:', error);
      toast.error(t('common.error'));
    } finally {
      setSavingInterests(false);
    }
  };

  const selectLanguage = (lang: string) => {
    setLanguage(lang);
    const langCode = lang === 'English' ? 'en' : 'es';
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setShowLanguage(false);
    toast.success(t('settings.language_changed', { lang }));
  };

  const ACCENT_COLORS = [
    { id: 'indigo', color: 'bg-indigo-600', name: 'Índigo' },
    { id: 'rose', color: 'bg-rose-500', name: 'Rosa' },
    { id: 'emerald', color: 'bg-emerald-500', name: 'Esmeralda' },
    { id: 'amber', color: 'bg-amber-500', name: 'Ámbar' },
    { id: 'violet', color: 'bg-violet-600', name: 'Violeta' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{t('settings.title')}</h1>
      </div>

      <div className="p-4 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
              {section.title}
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {section.items.map((item, i) => (
                <div 
                  key={item.label}
                  onClick={() => {
                    if (item.type !== 'toggle') {
                      if (item.path) {
                        navigate(item.path);
                      } else if (item.id === 'appearance') {
                        if (membership === 'Basic') {
                          toast.error('Esta función requiere el plan Acceso Total', {
                            action: {
                              label: 'Ver Planes',
                              onClick: () => navigate('/premium')
                            }
                          });
                        } else {
                          setShowAppearance(true);
                        }
                      } else if (item.id === 'interests') {
                        setShowInterests(true);
                      } else if (item.id === 'language') {
                        setShowLanguage(true);
                      } else if (item.id === 'security') {
                        setShowPasswordModal(true);
                      }
                    }
                  }}
                  className={`flex items-center justify-between p-4 ${
                    item.type !== 'toggle' ? 'cursor-pointer hover:bg-secondary/50 transition-colors' : ''
                  } ${
                    i < section.items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-secondary/50 text-muted-foreground relative">
                      <item.icon className="w-4 h-4" />
                      {(item as any).badge && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {item.label}
                        {(item as any).badge && (
                          <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase font-black tracking-widest">
                            {(item as any).badge}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {item.type === 'toggle' ? (
                    <Switch 
                      checked={item.checked as boolean} 
                      onCheckedChange={(checked) => handleToggle(item.id, checked)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 max-w-[150px]">
                      {item.value && <span className="text-xs text-muted-foreground truncate">{item.value}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button 
            variant="destructive" 
            className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg shadow-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {t('settings.logout')}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-6">
            {t('settings.version')}
          </p>
        </div>
      </div>

      {showLanguage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLanguage(false)}>
          <div className="bg-background w-full max-w-sm rounded-[32px] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('settings.select_language')}</h2>
              <button onClick={() => setShowLanguage(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {['Español', 'English'].map(lang => (
                <button 
                  key={lang}
                  onClick={() => selectLanguage(lang)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-secondary/50'}`}
                >
                  <span className="font-bold">{lang}</span>
                  {language === lang && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interests Modal */}
      {showInterests && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowInterests(false)}>
          <div className="bg-background w-full max-w-md rounded-[32px] p-6 shadow-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Tus Intereses</h2>
              <button onClick={() => setShowInterests(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Selecciona los temas que más te gustan para personalizar tu experiencia.</p>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
              <div className="flex flex-wrap gap-2.5">
                {allCategories.map(interest => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                          : 'bg-card border border-border text-foreground hover:bg-secondary'
                      }`}
                    >
                      <span className="text-lg">{categoryEmojis[interest]}</span>
                      <span className="capitalize">{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <Button 
              onClick={handleSaveInterests} 
              disabled={savingInterests}
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 mt-2 shrink-0"
            >
              {savingInterests ? <Rocket className="w-5 h-5 animate-spin" /> : 'Guardar Preferencias'}
            </Button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-background w-full max-w-sm rounded-[32px] p-6 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nueva Contraseña</label>
                <div className="relative">
                  <input 
                    type={showPasswordText ? "text" : "password"} 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                    placeholder="Min. 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Confirmar Contraseña</label>
                <div className="relative">
                  <input 
                    type={showPasswordText ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                    placeholder="Repite la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <Button onClick={handleUpdatePassword} className="w-full h-12 rounded-2xl font-bold shadow-xl shadow-primary/20">
              Actualizar Contraseña
            </Button>
          </div>
        </div>
      )}
      {/* Appearance Modal */}
      {showAppearance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAppearance(false)}>
          <div className="bg-background w-full max-w-md rounded-[32px] p-6 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-center mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                  <Palette className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight">{t('settings.appearance.title')}</h2>
              </div>
              <button onClick={() => setShowAppearance(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8 relative">
              {/* Accent Color Section - Needs Acceso Total */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('settings.appearance.accent_color')}</h3>
                  {membership !== 'Acceso Total' && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-full border border-amber-100">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 uppercase">{t('settings.appearance.requires_pro')}</span>
                    </div>
                  )}
                </div>
                
                <div className={`flex gap-3 ${(membership === 'Basic') ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setAccentColor(color.id);
                        applyTheme(color.id, interfaceStyle);
                        toast.success(t('settings.appearance.color_selected', { name: color.name }));
                      }}
                      className={`w-10 h-10 rounded-2xl ${color.color} transition-all active:scale-90 relative ${accentColor === color.id ? 'ring-4 ring-primary/20 scale-110 shadow-lg' : 'hover:scale-105'}`}
                    >
                      {accentColor === color.id && <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Section - Needs Acceso Total */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('settings.appearance.interface_style')}</h3>
                  {membership !== 'Acceso Total' && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                      <Rocket className="w-3 h-3 text-indigo-500" />
                      <span className="text-[9px] font-black text-indigo-600 uppercase">{t('settings.appearance.requires_pro')}</span>
                    </div>
                  )}
                </div>
                
                <div className={`grid grid-cols-2 gap-3 ${membership !== 'Acceso Total' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => {
                      setInterfaceStyle('Moderno');
                      applyTheme(accentColor, 'Moderno');
                      toast.success(t('settings.appearance.style_applied', { style: t('settings.appearance.modern') }));
                    }}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${interfaceStyle === 'Moderno' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="w-full aspect-video bg-card rounded-lg border border-border p-2 space-y-1">
                      <div className="w-8 h-1 bg-muted rounded"></div>
                      <div className="w-12 h-1 bg-muted/50 rounded"></div>
                    </div>
                    <span className="text-xs font-bold text-foreground">{t('settings.appearance.modern')}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setInterfaceStyle('Minimalista');
                      applyTheme(accentColor, 'Minimalista');
                      toast.success(t('settings.appearance.style_applied', { style: t('settings.appearance.minimalist') }));
                    }}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${interfaceStyle === 'Minimalista' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="w-full aspect-video bg-card rounded-lg border border-border p-2 flex items-center justify-center">
                      <div className="w-4 h-4 bg-muted rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-foreground">{t('settings.appearance.minimalist')}</span>
                  </button>
                </div>
              </div>

              {membership === 'Basic' ? (
                <Button 
                  onClick={() => navigate('/premium')}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  {t('settings.appearance.upgrade_button')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
