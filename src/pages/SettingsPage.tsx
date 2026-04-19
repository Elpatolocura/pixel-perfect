import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Lock, Globe, Moon, ShieldCheck, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const SettingsPage = () => {
  const navigate = useNavigate();

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
        { icon: Lock, label: 'Seguridad y Contraseña', path: '/forgot-password' },
        { icon: Bell, label: 'Notificaciones', type: 'toggle', default: true },
      ]
    },
    {
      title: 'Preferencias',
      items: [
        { icon: Globe, label: 'Idioma', value: 'Español' },
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

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
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
                      } else {
                        toast.info('Próximamente: Cambiar idioma');
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
                    <div className="p-2 rounded-xl bg-secondary/50 text-muted-foreground">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  
                  {item.type === 'toggle' ? (
                    <Switch 
                      defaultChecked={item.default as boolean} 
                      onCheckedChange={(checked) => handleToggle(item.label, checked)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
    </div>
  );
};

export default SettingsPage;
