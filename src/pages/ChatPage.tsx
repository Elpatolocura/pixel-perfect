import { supabase } from '@/lib/supabase';
import { Loader2, MessageCircle, Users, User, Lock, Ticket, UserPlus, Search, ArrowRight, Bell } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();
  const [eventRooms, setEventRooms] = useState<any[]>([]);
  const [privateRooms, setPrivateRooms] = useState<any[]>([]);
  const [lockedEventRooms, setLockedEventRooms] = useState<any[]>([]);
  const [lockedPrivateUsers, setLockedPrivateUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // ── 1. Fetch user memberships and ticketed event IDs ──────────────────
      const [
        { data: memberships, error: memberError },
        { data: userTickets }
      ] = await Promise.all([
        supabase
          .from('chat_room_members')
          .select(`
            room_id,
            unread_count,
            chat_rooms!inner (
              *,
              chat_room_members (user_id),
              events!event_id (title, image_url)
            )
          `)
          .eq('user_id', user.id),
        supabase
          .from('tickets')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      if (memberError) throw memberError;

      const ticketedEventIds = new Set(userTickets?.map(t => t.event_id) || []);
      const joinedRoomIds = new Set(memberships?.map(m => m.room_id) || []);

      // ── 2. Fetch all event rooms user has access to or could join ──────────
      const { data: allEventRooms } = await supabase
        .from('chat_rooms')
        .select('*, events!event_id(title, image_url, category)')
        .eq('type', 'event')
        .not('event_id', 'is', null);

      // ── 3. Resolve profiles for private chats ─────────────────────────────
      const otherUserIds = new Set<string>();
      memberships?.forEach(m => {
        if (m.chat_rooms.type === 'private') {
          const other = m.chat_rooms.chat_room_members.find((rm: any) => rm.user_id !== user.id);
          if (other) otherUserIds.add(other.user_id);
        }
      });

      let profileMap = new Map<string, any>();
      if (otherUserIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', Array.from(otherUserIds));
        profileMap = new Map(profiles?.map(p => [p.id, p]));
      }

      // ── 4. Process Active Chats (Joined OR Ticketed) ───────────────────────
      const processedRooms = memberships?.map(m => {
        const room = m.chat_rooms;
        let displayName = room.name || 'Chat';
        let displayAvatar = null;

        if (room.type === 'private') {
          const otherMember = room.chat_room_members.find((rm: any) => rm.user_id !== user.id);
          const profile = otherMember ? profileMap.get(otherMember.user_id) : null;
          if (profile) {
            displayName = profile.full_name || 'Usuario';
            displayAvatar = profile.avatar_url;
          }
        } else if (room.type === 'event') {
          displayName = room.events?.title || room.name;
          displayAvatar = room.events?.image_url;
        }

        return {
          ...room,
          name: displayName,
          avatar: displayAvatar,
          unread: m.unread_count,
          isJoined: true
        };
      }) || [];

      // Add rooms where user has a ticket but hasn't joined yet
      const ticketedNotJoined = (allEventRooms || [])
        .filter(room => ticketedEventIds.has(room.event_id) && !joinedRoomIds.has(room.id))
        .map(room => ({
          ...room,
          name: room.events?.title || room.name,
          avatar: room.events?.image_url,
          unread: 0,
          isJoined: false
        }));

      const finalEventRooms = [...processedRooms.filter(r => r.type === 'event'), ...ticketedNotJoined]
        .sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());

      setEventRooms(finalEventRooms);
      setPrivateRooms(processedRooms
        .filter(r => r.type === 'private' && r.last_message_at !== null)
        .sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()));

      // ── 5. Locked Rooms ───────────────────────────────────────────────────
      const lockedEvents = (allEventRooms || [])
        .filter(room => !ticketedEventIds.has(room.event_id) && !joinedRoomIds.has(room.id))
        .slice(0, 10);
      setLockedEventRooms(lockedEvents);

      // Locked private users (mutual follow check)
      const { data: followersData } = await supabase
        .from('follows')
        .select(`follower_id, profiles!follower_id(id, full_name, avatar_url)`)
        .eq('following_id', user.id);

      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = new Set(followingData?.map(f => f.following_id) || []);
      const privateRoomPartnerIds = new Set(
        processedRooms.filter(r => r.type === 'private').flatMap(r =>
          r.chat_room_members?.filter((m: any) => m.user_id !== user.id).map((m: any) => m.user_id)
        )
      );

      const pendingUsers = (followersData || [])
        .filter(f => !followingIds.has(f.follower_id) && !privateRoomPartnerIds.has(f.follower_id))
        .map(f => (f as any).profiles)
        .filter(Boolean)
        .slice(0, 5);

      setLockedPrivateUsers(pendingUsers);

    } catch (error) {
      console.error('Error fetching chats', error);
      toast.error('Error al actualizar tus mensajes');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .ilike('full_name', `%${query}%`)
        .limit(10);
      
      if (!error) {
        setSearchResults(data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to changes in chat_rooms and chat_room_members
    const roomChannel = supabase
      .channel('chat_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => fetchChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_room_members' }, () => fetchChats())
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [fetchChats]);

  const handleJoinEventChat = async (room: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    // Check if user has a ticket
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', room.event_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!ticket) {
      toast.error('Acceso restringido', { description: 'Necesitas un ticket para este evento.' });
      navigate(`/event/${room.event_id}`);
      return;
    }

    // Join room
    const { error } = await supabase
      .from('chat_room_members')
      .upsert({ room_id: room.id, user_id: user.id }, { onConflict: 'room_id,user_id' });

    if (!error) {
      navigate(`/chat/${room.id}`);
    } else {
      toast.error('Error al entrar al chat');
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return 'Ahora';
    if (diffInMins < 60) return `${diffInMins}m`;
    
    const dayDiff = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (dayDiff === 0 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dayDiff <= 1) {
      return 'Ayer';
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl border-4 border-primary/20 animate-pulse"></div>
          <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Actualizando chats</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center pb-32 animate-fade-in">
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 border border-primary/10 shadow-2xl shadow-primary/5">
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">Conecta con la Comunidad</h2>
        <p className="text-muted-foreground mb-10 max-w-xs leading-relaxed">Únete a los chats de tus eventos favoritos y conoce a personas con tus mismos intereses.</p>
        <button 
          onClick={() => navigate('/auth')} 
          className="w-full max-w-xs h-16 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
        >
          Empezar a Chatear
        </button>
      </div>
    );
  }

  const ActiveChatItem = ({ room, type }: { room: any, type: 'event' | 'private' }) => (
    <button
      onClick={() => room.isJoined ? navigate(`/chat/${room.id}`) : handleJoinEventChat(room)}
      className="w-full flex items-center gap-4 bg-card rounded-[24px] p-4 border border-border text-left transition-all hover:shadow-xl hover:shadow-slate-100 hover:border-primary/20 active:scale-[0.98] group relative overflow-hidden"
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden shrink-0 transition-transform group-hover:scale-105 shadow-sm",
        type === 'event' ? 'bg-primary/5 border-primary/10' : 'bg-secondary border-border'
      )}>
        {room.avatar ? (
          <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
        ) : type === 'event' ? (
          <Users className="w-6 h-6 text-primary" />
        ) : (
          <User className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <p className="font-black text-foreground text-[14px] truncate leading-tight group-hover:text-primary transition-colors">
            {room.name}
          </p>
          <span className="text-[10px] font-bold text-muted-foreground/60 shrink-0 mt-0.5">
            {formatTime(room.last_message_at)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-[12px] truncate max-w-[85%]",
            room.unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
          )}>
            {!room.isJoined && type === 'event' ? (
              <span className="text-primary font-black uppercase text-[9px] tracking-wider">¡Nuevo acceso desbloqueado!</span>
            ) : room.last_message || 'Inicia la conversación...'}
          </p>
          
          {room.unread > 0 && (
            <div className="bg-primary text-white text-[9px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-lg shadow-primary/20 border-2 border-background">
              {room.unread}
            </div>
          )}
          
          {!room.isJoined && type === 'event' && (
            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          )}
        </div>
      </div>
      
      {room.unread > 0 && (
        <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
      )}
    </button>
  );

  const LockedEventItem = ({ room }: { room: any }) => (
    <button
      onClick={() => handleJoinEventChat(room)}
      className="w-full flex items-center gap-4 bg-slate-50/50 rounded-[24px] p-4 border border-dashed border-slate-200 text-left transition-all hover:border-amber-200 hover:bg-amber-50/30 active:scale-[0.98] group opacity-80"
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 relative shadow-sm group-hover:border-amber-200">
        {room.events?.image_url ? (
           <img src={room.events.image_url} alt="" className="w-full h-full object-cover opacity-40 grayscale" />
        ) : (
          <Users className="w-6 h-6 text-slate-300" />
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <Lock className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[14px] text-slate-500 truncate mb-1">{room.events?.title || room.name}</p>
        <div className="flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Requiere ticket</p>
        </div>
      </div>
      <div className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-amber-200 group-hover:text-amber-500 transition-colors">
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );

  const LockedPrivateItem = ({ user: u }: { user: any }) => (
    <div className="w-full flex items-center gap-4 bg-slate-50/50 rounded-[24px] p-4 border border-dashed border-slate-200 opacity-80 group">
      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0 relative shadow-sm">
        {u.avatar_url ? (
          <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <User className="w-6 h-6 text-slate-300 m-auto mt-4" />
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <Lock className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[14px] text-slate-500 truncate mb-1">{u.full_name || 'Usuario'}</p>
        <div className="flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Síguelo de vuelta</p>
        </div>
      </div>
      <button
        onClick={() => navigate(`/profile/u/${u.id}`)}
        className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shrink-0 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
      >
        Seguir
      </button>
    </div>
  );

  const EmptyState = ({ type }: { type: 'event' | 'private' }) => (
    <div className="text-center py-20 px-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10 shadow-inner">
        {type === 'event' ? <Users className="w-10 h-10 text-primary/40" /> : <User className="w-10 h-10 text-primary/40" />}
      </div>
      <h3 className="font-black text-2xl text-foreground tracking-tight mb-3">
        {type === 'event' ? 'Sin chats de eventos' : 'Sin chats privados'}
      </h3>
      <p className="text-muted-foreground text-[14px] font-medium leading-relaxed mb-10 max-w-[240px] mx-auto">
        {type === 'event'
          ? 'Explora los eventos cercanos y obtén tu entrada para unirte a la conversación.'
          : 'Conecta con otros asistentes. Los chats se habilitan cuando ambos se siguen.'}
      </p>
      <button
        onClick={() => navigate(type === 'event' ? '/' : '/explore')}
        className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
      >
        {type === 'event' ? 'Explorar Eventos' : 'Descubrir Personas'}
      </button>
    </div>
  );

  return (
    <div className="pb-32 px-6 pt-safe min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <header className="pt-8 mb-8 flex justify-between items-end relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Mensajería</h1>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
          </div>
          <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.25em]">Comunidad y Amigos</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="h-10 px-4 rounded-[15px] bg-slate-900 text-white flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 group"
            >
              <UserPlus className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">Buscar Amigos</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-0 overflow-hidden bg-white">
            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-black tracking-tight">Buscar Personas</DialogTitle>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Encuentra amigos y organizadores</p>
              </DialogHeader>
              
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Escribe un nombre..."
                  className="w-full h-14 pl-11 pr-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buscando...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        navigate(`/profile/u/${user.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/5 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[13px] text-foreground truncate">{user.full_name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{user.role || 'Usuario'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">No se encontraron resultados</p>
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-40">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ingresa al menos 2 letras</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs defaultValue="eventos" className="w-full relative z-10">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/40 p-1.5 rounded-[24px] h-14 border border-border/50 backdrop-blur-sm">
          <TabsTrigger value="eventos" className="rounded-[18px] font-black text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 data-[state=active]:text-slate-900 transition-all duration-300">
            <Users className="w-4 h-4 mr-2" />
            Eventos
            {eventRooms.some(r => r.unread > 0) && (
              <span className="ml-2 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="personas" className="rounded-[18px] font-black text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 data-[state=active]:text-slate-900 transition-all duration-300">
            <User className="w-4 h-4 mr-2" />
            Privados
            {privateRooms.some(r => r.unread > 0) && (
              <span className="ml-2 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Event Chats Tab ─────────────────────── */}
        <TabsContent value="eventos" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          {eventRooms.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tus conversaciones</p>
                {eventRooms.filter(r => r.unread > 0).length > 0 && (
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                    {eventRooms.filter(r => r.unread > 0).length} nuevas
                  </span>
                )}
              </div>
              {eventRooms.map(room => (
                <ActiveChatItem key={room.id} room={room} type="event" />
              ))}
            </div>
          ) : (
             !loading && lockedEventRooms.length === 0 && <EmptyState type="event" />
          )}

          {lockedEventRooms.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-border mt-8">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Sugeridos para ti</p>
                </div>
                <button className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline" onClick={() => navigate('/')}>Ver todo</button>
              </div>
              <div className="space-y-3">
                {lockedEventRooms.map(room => (
                  <LockedEventItem key={room.id} room={room} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Private Chats Tab ───────────────────── */}
        <TabsContent value="personas" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          {privateRooms.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Chats Directos</p>
              </div>
              {privateRooms.map(room => (
                <ActiveChatItem key={room.id} room={room} type="private" />
              ))}
            </div>
          ) : (
            !loading && lockedPrivateUsers.length === 0 && <EmptyState type="private" />
          )}

          {lockedPrivateUsers.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-border mt-8">
              <div className="flex items-center gap-2 px-1">
                <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nuevas conexiones</p>
              </div>
              <div className="space-y-3">
                {lockedPrivateUsers.map(u => (
                  <LockedPrivateItem key={u.id} user={u} />
                ))}
              </div>
              <div className="bg-slate-50/50 rounded-[20px] p-4 border border-slate-100 mt-2">
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed text-center italic">
                   "Los chats privados se habilitan cuando ambos usuarios se siguen mutuamente."
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPage;

