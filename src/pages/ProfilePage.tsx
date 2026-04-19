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
  const [stats, setStats] = useState({
    followers: 124,
    following: 89,
    tickets: 0,
    favorites: 0,
    created: 0
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchProfileStats(currentUser.id);
      }
      setLoading(false);
    };

    const fetchProfileStats = async (userId: string) => {
      try {
        // Tickets count
        const { count: tickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        // Favorites count
        const { count: favorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        // Created events count
        const { count: created } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('organizer_id', userId);
        
        // Mocking followers for now as table might not be ready
        setStats({
          followers: 142,
          following: 89,
          tickets: tickets || 0,
          favorites: favorites || 0,
          created: created || 0
        });
      } catch (e) {
        console.error("Error fetching stats", e);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfileStats(session.user.id);
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
    { icon: Ticket, label: 'Mis Tickets', count: stats.tickets, path: '/tickets' },
    { icon: CalendarDays, label: 'Mis Eventos', count: stats.created, path: '/my-events' },
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
            <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
            <div className="flex gap-4 mt-1">
              <button onClick={() => toast.info('Ver seguidores')} className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">{stats.followers}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seguidores</span>
              </button>
              <div className="w-1 h-1 bg-slate-200 rounded-full my-auto"></div>
              <button onClick={() => toast.info('Ver seguidos')} className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">{stats.following}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siguiendo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button 
            onClick={() => navigate('/tickets')}
            className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 transition-all active:scale-95 hover:bg-slate-100"
          >
            <p className="text-xl font-black text-slate-900 leading-none mb-1">{stats.tickets}</p>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tickets</p>
          </button>
          <button 
            onClick={() => navigate('/my-events')}
            className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 transition-all active:scale-95 hover:bg-slate-100"
          >
            <p className="text-xl font-black text-slate-900 leading-none mb-1">{stats.created}</p>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Creados</p>
          </button>
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
