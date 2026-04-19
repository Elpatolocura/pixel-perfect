import { mockTickets, mockEvents, mockNotifications } from '@/data/mockData';
import { Settings, Ticket, Heart, CalendarDays, ChevronRight, Crown, LogOut, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada');
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in pb-24">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Inicia sesión</h2>
        <p className="text-muted-foreground mb-8">Únete a la comunidad de Eventia para gestionar tus eventos y tickets.</p>
        <Button onClick={() => navigate('/auth')} className="w-full max-w-xs">
          Ir a Iniciar Sesión
        </Button>
      </div>
    );
  }



  const menuItems = [
    { icon: Ticket, label: 'Mis Tickets', count: mockTickets.length, path: '/tickets' },
    { icon: Bell, label: 'Notificaciones', count: mockNotifications.filter(n => !n.read).length, path: '/notifications' },
    { icon: Heart, label: 'Favoritos', count: mockEvents.filter(e => e.isFavorite).length, path: '/favorites' },
    { icon: CalendarDays, label: 'Mis Eventos', count: 0, path: '/my-events' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <div className="pb-24 px-5 pt-safe animate-fade-in">
      <div className="pt-6 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl border border-primary/10">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground text-lg">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </h2>
              {user.user_metadata?.role === 'premium' && (
                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
            <p className="text-lg font-bold text-foreground">{mockTickets.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tickets</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
            <p className="text-lg font-bold text-foreground">{mockEvents.filter(e => e.isFavorite).length}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Favoritos</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border/50">
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Creados</p>
          </div>
        </div>
      </div>

      {/* Premium Banner */}
      <div 
        onClick={() => navigate('/premium')}
        className="mx-4 mt-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-2xl">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Mejorar a Premium</p>
            <p className="text-[10px] text-white/80 mt-1">Desbloquea funciones exclusivas</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/70" />
      </div>

      {/* Menu */}
      <div className="mx-4 mt-6 bg-card rounded-3xl border border-border overflow-hidden mb-6 shadow-sm">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-secondary/80 ${
              i < menuItems.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{item.count}</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>


    </div>
  );
};

export default ProfilePage;
