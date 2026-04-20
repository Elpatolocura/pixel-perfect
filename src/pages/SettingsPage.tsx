import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Lock, Globe, Moon, ShieldCheck, HelpCircle, LogOut, ChevronRight, Briefcase, Heart, Check, X, Sparkles, Palette, Crown, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { applyTheme } from '@/components/ThemeHandler';

const ALL_INTERESTS = ['Música', 'Arte', 'Gastronomía', 'Deportes', 'Tecnología', 'Cine', 'Teatro', 'Bienestar'];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [showInterests, setShowInterests] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState('Español');
  const [interests, setInterests] = useState<string[]>(['Música', 'Arte']);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [membership, setMembership] = useState<string>('Basic');
  const [showAppearance, setShowAppearance] = useState(false);
  const [accentColor, setAccentColor] = useState(localStorage.getItem('app-accent-color') || 'indigo');
  const [interfaceStyle, setInterfaceStyle] = useState(localStorage.getItem('app-interface-style') || 'Moderno');

  useEffect(() => {
    const fetchMembership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
      }
    };
    fetchMembership();
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
      setShowPassword(false);
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
      title: 'Cuenta',
      items: [
        { icon: User, label: 'Información Personal', path: '/profile/edit' },
        { icon: Lock, label: 'Seguridad y Contraseña' },
        { icon: Bell, label: 'Notificaciones', type: 'toggle', default: true },
      ]
    },
    {
      title: 'Personalización',
      items: [
        { 
          icon: Sparkles, 
          label: 'Apariencia y Temas', 
          value: membership === 'Basic' ? 'Plan Básico' : `Plan ${membership}`,
          badge: membership !== 'Basic' ? 'Premium' : null
        },
        { icon: Heart, label: 'Intereses y Categorías', value: interests.length > 0 ? interests.join(', ') : 'Ninguno' },
        { icon: Globe, label: 'Idioma', value: language },
        { icon: Moon, label: 'Modo Oscuro', type: 'toggle', default: document.documentElement.classList.contains('dark') },
      ]
    },
    {
      title: 'Soporte',
      items: [
        { icon: ShieldCheck, label: 'Privacidad y Términos', path: '/terms' },
        { icon: HelpCircle, label: 'Centro de Ayuda', path: '/support' },
      ]
    }
  ];

  const handleToggle = (label: string, checked: boolean) => {
    if (label === 'Modo Oscuro') {
      if (checked) {
        document.documentElement.classList.add('dark');
        toast.success('Modo Oscuro activado');
      } else {
        document.documentElement.classList.remove('dark');
        toast.success('Modo Claro activado');
      }
    } else if (label === 'Notificaciones') {
      toast.success(checked ? 'Notificaciones activadas' : 'Notificaciones silenciadas');
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const selectLanguage = (lang: string) => {
    setLanguage(lang);
    setShowLanguage(false);
    toast.success(`Idioma cambiado a ${lang}`);
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
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Configuración</h1>
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
                      } else if (item.label === 'Apariencia y Temas') {
                        if (membership === 'Basic') {
                          toast.error('Esta función requiere un plan Pro o Business', {
                            action: {
                              label: 'Ver Planes',
                              onClick: () => navigate('/premium')
                            }
                          });
                        } else {
                          setShowAppearance(true);
                        }
                      } else if (item.label === 'Intereses y Categorías') {
                        setShowInterests(true);
                      } else if (item.label === 'Idioma') {
                        setShowLanguage(true);
                      } else if (item.label === 'Seguridad y Contraseña') {
                        setShowPassword(true);
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
                      defaultChecked={item.default as boolean} 
                      onCheckedChange={(checked) => handleToggle(item.label, checked)}
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
            Cerrar Sesión
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-6">
            Eventia v1.0.0 · Hecho con ❤️ para la comunidad
          </p>
        </div>
      </div>

      {/* Language Modal */}
      {showLanguage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLanguage(false)}>
          <div className="bg-background w-full max-w-sm rounded-[32px] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Seleccionar Idioma</h2>
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
                {ALL_INTERESTS.map(interest => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                          : 'bg-card border border-border text-foreground hover:bg-secondary'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <Button onClick={() => setShowInterests(false)} className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 mt-2 shrink-0">
              Guardar Preferencias
            </Button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPassword(false)}>
          <div className="bg-background w-full max-w-sm rounded-[32px] p-6 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
              <button onClick={() => setShowPassword(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Min. 6 caracteres"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Repite la contraseña"
                />
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
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Apariencia</h2>
              </div>
              <button onClick={() => setShowAppearance(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8 relative">
              {/* Accent Color Section - Needs Pro */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Color de Acento</h3>
                  {(membership === 'Basic') && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-full border border-amber-100">
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 uppercase">Requiere Pro</span>
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
                        toast.success(`Color ${color.name} seleccionado`);
                      }}
                      className={`w-10 h-10 rounded-2xl ${color.color} transition-all active:scale-90 relative ${accentColor === color.id ? 'ring-4 ring-primary/20 scale-110 shadow-lg' : 'hover:scale-105'}`}
                    >
                      {accentColor === color.id && <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Section - Needs Business */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Estilo de Interfaz</h3>
                  {membership !== 'Business' && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                      <Rocket className="w-3 h-3 text-indigo-500" />
                      <span className="text-[9px] font-black text-indigo-600 uppercase">Requiere Business</span>
                    </div>
                  )}
                </div>
                
                <div className={`grid grid-cols-2 gap-3 ${membership !== 'Business' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => {
                      setInterfaceStyle('Moderno');
                      applyTheme(accentColor, 'Moderno');
                      toast.success('Estilo Moderno aplicado');
                    }}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${interfaceStyle === 'Moderno' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="w-full aspect-video bg-white rounded-lg border border-slate-200 p-2 space-y-1">
                      <div className="w-8 h-1 bg-slate-200 rounded"></div>
                      <div className="w-12 h-1 bg-slate-100 rounded"></div>
                    </div>
                    <span className="text-xs font-bold">Moderno</span>
                  </button>
                  <button 
                    onClick={() => {
                      setInterfaceStyle('Minimalista');
                      applyTheme(accentColor, 'Minimalista');
                      toast.success('Estilo Minimalista aplicado');
                    }}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${interfaceStyle === 'Minimalista' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="w-full aspect-video bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold">Minimalista</span>
                  </button>
                </div>
              </div>

              {membership === 'Basic' ? (
                <Button 
                  onClick={() => navigate('/premium')}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-white font-black uppercase tracking-widest shadow-xl shadow-amber-500/20"
                >
                  Mejorar a Pro
                </Button>
              ) : membership === 'Pro' ? (
                <Button 
                  onClick={() => navigate('/premium')}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  Mejorar a Business
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
