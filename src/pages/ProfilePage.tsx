import { mockTickets, mockEvents, mockNotifications } from '@/data/mockData';
import { Settings, Ticket, Heart, CalendarDays, ChevronRight, Crown, LogOut, User, Bell, ChevronLeft, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    tickets: 0,
    favorites: 0,
    created: 0
  });

  const isOwnProfile = !id || user?.id === id;
  const targetId = id || user?.id;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      const userIdToFetch = id || currentUser?.id;
      if (userIdToFetch) {
        fetchProfileData(userIdToFetch);
        if (currentUser && id && currentUser.id !== id) {
          checkFollowStatus(currentUser.id, id);
        }
      } else if (!id) {
        setLoading(false);
      }
    };

    const fetchProfileData = async (userId: string) => {
      setLoading(true);
      try {
        // Fetch Profile Info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // Tickets count
        const { count: tickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        // Favorites count
        const { count: favorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        // Created events count
        const { count: created } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('organizer_id', userId);
        
        // Followers count
        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);
        
        // Following count
        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);
        
        setStats({
          followers: followers || 0,
          following: following || 0,
          tickets: tickets || 0,
          favorites: favorites || 0,
          created: created || 0
        });
      } catch (e) {
        console.error("Error fetching stats", e);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    const checkFollowStatus = async (followerId: string, followingId: string) => {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();
      
      setIsFollowing(!!data);
    };

    checkUser();
  }, [id]);

  const handlePrivateChat = async () => {
    if (!user || !id) return;
    
    setLoading(true);
    try {
      // 1. Find if a private room already exists between these two
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          chat_room_members!inner(user_id)
        `)
        .eq('type', 'private')
        .eq('chat_room_members.user_id', user.id);
      
      // Post-filter to find the one where the OTHER user is also a member
      let existingRoomId = null;
      if (rooms) {
        for (const room of rooms) {
          const { data: members } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', room.id);
          
          if (members?.some(m => m.user_id === id)) {
            existingRoomId = room.id;
            break;
          }
        }
      }

      let targetRoomId = existingRoomId;

      // 2. If not, create it
      if (!targetRoomId) {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            name: 'Chat Privado',
            type: 'private',
            participants_count: 2
          })
          .select()
          .single();
        
        if (roomError) throw roomError;
        targetRoomId = newRoom.id;

        // Add both members
        await supabase.from('chat_room_members').insert([
          { room_id: targetRoomId, user_id: user.id },
          { room_id: targetRoomId, user_id: id }
        ]);
      }

      navigate(`/chat/${targetRoomId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error('No se pudo abrir el chat');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast.success('Dejaste de seguir');
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: id
          });
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success('Siguiendo');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && !id) {
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
    <div className="pb-24 px-5 pt-safe animate-fade-in bg-background min-h-screen">
      <div className="pt-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {!isOwnProfile && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {isOwnProfile ? 'Mi Perfil' : 'Perfil'}
          </h1>
        </div>
        {isOwnProfile && (
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-3xl border border-border p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl border border-primary/10 shadow-inner overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-foreground text-xl">
                {profile?.full_name || profile?.email?.split('@')[0]}
              </h2>
              {profile?.role === 'premium' ? (
                <span className="bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-amber-500/20 uppercase tracking-tight">
                  <Crown className="w-3 h-3 fill-amber-500" /> Premium
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-slate-200 uppercase tracking-tight">
                  Plan Básico
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{profile?.email}</p>
            <div className="flex gap-5 mt-1">
              <button onClick={() => navigate(`/profile/followers?uid=${targetId}`)} className="flex flex-col items-start gap-0.5 group">
                <span className="text-sm font-black text-foreground group-active:scale-95 transition-transform">{stats.followers}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Seguidores</span>
              </button>
              <div className="w-px h-6 bg-border my-auto"></div>
              <button onClick={() => navigate(`/profile/following?uid=${targetId}`)} className="flex flex-col items-start gap-0.5 group">
                <span className="text-sm font-black text-foreground group-active:scale-95 transition-transform">{stats.following}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Siguiendo</span>
              </button>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="mt-6 flex gap-3">
            <Button 
              onClick={handleFollowToggle}
              className={`flex-1 h-12 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] ${
                isFollowing 
                  ? 'bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive' 
                  : 'bg-primary text-primary-foreground shadow-primary/20'
              }`}
            >
              {isFollowing ? (
                <span className="flex items-center gap-2"><UserCheck className="w-4 h-4" /> Siguiendo</span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Seguir</span>
              )}
            </Button>
            {isFollowing ? (
              <Button 
                variant="outline"
                className="h-12 w-12 rounded-2xl p-0 border-border bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                onClick={handlePrivateChat}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="h-12 w-12 rounded-2xl p-0 border-border"
                onClick={() => toast.info('Sigue a este usuario para enviar mensajes')}
              >
                <Bell className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button 
            onClick={() => isOwnProfile && navigate('/tickets')}
            className="bg-secondary/30 rounded-2xl p-4 text-center border border-border/50 transition-all active:scale-95 hover:bg-secondary/50 group"
          >
            <p className="text-2xl font-black text-foreground leading-none mb-1 group-hover:scale-110 transition-transform">{stats.tickets}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Tickets</p>
          </button>
          <button 
            onClick={() => isOwnProfile && navigate('/my-events')}
            className="bg-secondary/30 rounded-2xl p-4 text-center border border-border/50 transition-all active:scale-95 hover:bg-secondary/50 group"
          >
            <p className="text-2xl font-black text-foreground leading-none mb-1 group-hover:scale-110 transition-transform">{stats.created}</p>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Creados</p>
          </button>
        </div>
      </div>

      {isOwnProfile && (
        <>
          {/* Membership Banner */}
          <div 
            onClick={() => navigate('/premium')}
            className={`p-5 rounded-[2.5rem] flex items-center justify-between cursor-pointer shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group mb-6 ${
              profile?.role !== 'user' 
                ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-indigo-500/20' 
                : 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 shadow-amber-500/20'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/30">
                <Crown className="w-6 h-6 text-white fill-white/20" />
              </div>
              <div>
                <p className="font-black text-base leading-none uppercase tracking-tight">
                  {profile?.role !== 'user' ? 'Administrar Membresía' : 'Mejorar a Premium'}
                </p>
                <p className="text-xs text-white/90 mt-1.5 font-medium">
                  {profile?.role !== 'user' ? 'Gestiona tu plan y beneficios Pro' : 'Desbloquea funciones exclusivas y más'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 relative z-10" />
          </div>

          {/* Menu */}
          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden mb-6 shadow-sm">
            {menuItems.map((item, i) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-secondary/50 active:bg-secondary ${
                  i < menuItems.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="bg-secondary/50 p-2 rounded-xl">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm font-bold text-foreground">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-tight">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
