import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Users, Share2, 
  Heart, MessageSquare, Info, Lock,
  Clock, Map as MapIcon,
  Wifi, Snowflake, Tv, Car, Accessibility, 
  GlassWater, Music, Sparkles, Utensils, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const AMENITY_ICONS: Record<string, any> = {
  wifi: { icon: <Wifi className="w-5 h-5 text-blue-600" />, label: "WiFi", info: "Conexión a internet incluida" },
  parking: { icon: <Car className="w-5 h-5 text-amber-600" />, label: "Parking", info: "Estacionamiento disponible" },
  food: { icon: <Utensils className="w-5 h-5 text-red-500" />, label: "Comida", info: "Opciones de comida" },
  music: { icon: <Music className="w-5 h-5 text-indigo-600" />, label: "Música", info: "Música en vivo o ambiental" },
  ac: { icon: <Snowflake className="w-5 h-5 text-sky-500" />, label: "Clima", info: "Ambiente climatizado" },
  drinks: { icon: <GlassWater className="w-5 h-5 text-pink-500" />, label: "Bar", info: "Bebidas disponibles" },
  tv: { icon: <Tv className="w-5 h-5 text-purple-600" />, label: "Pantallas", info: "Pantallas de video" },
  access: { icon: <Accessibility className="w-5 h-5 text-emerald-600" />, label: "Accesible", info: "Apto para silla de ruedas" },
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAmenity, setSelectedAmenity] = useState<number | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchSecondaryData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check favorites
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (favData) {
            setIsFavorite(true);
            setFavoriteId(favData.id);
          }

          // Check following
          const { data: followData } = await supabase
            .from('event_followers')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          setIsFollowing(!!followData);
        }

        // Fetch some follower avatars
        const { data: followersData } = await supabase
          .from('event_followers')
          .select(`
            user_id,
            profiles (
              avatar_url
            )
          `)
          .eq('event_id', id)
          .limit(5);
        
        if (followersData) {
          setFollowers(followersData.map(f => (f as any).profiles?.avatar_url).filter(Boolean));
        }
      } catch (e) {
        console.error("Secondary data fetch failed:", e);
      }
    };

    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);
        fetchSecondaryData();

      } catch (error) {
        console.error("Main event fetch failed:", error);
        toast.error('Evento no encontrado');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // Realtime subscription for event updates
    const eventSubscription = supabase
      .channel(`event-updates-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `id=eq.${id}` },
        (payload) => {
          console.log('Event updated in real-time:', payload.new);
          setEvent((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    // Realtime subscription for followers
    const followersSubscription = supabase
      .channel(`followers-updates-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_followers', filter: `event_id=eq.${id}` },
        () => {
          console.log('Followers changed, refreshing...');
          fetchSecondaryData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventSubscription);
      supabase.removeChannel(followersSubscription);
    };
  }, [id, navigate]);

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Inicia sesión para guardar favoritos');
        return;
      }

      if (isFavorite && favoriteId) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId);
        
        if (error) throw error;
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success('Eliminado de favoritos');
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            event_id: id
          })
          .select()
          .single();
        
        if (error) throw error;
        setIsFavorite(true);
        setFavoriteId(data.id);
        toast.success('¡Añadido a favoritos!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const toggleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Inicia sesión para seguir este evento');
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from('event_followers')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsFollowing(false);
        toast.success('Ya no sigues este evento');
      } else {
        const { error } = await supabase
          .from('event_followers')
          .insert({
            user_id: user.id,
            event_id: id
          });
        
        if (error) throw error;
        setIsFollowing(true);
        toast.success('¡Ahora sigues este evento!');
        
        // Also add to event chat room if exists
        const { data: room } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('event_id', id)
          .eq('type', 'event')
          .maybeSingle();
        
        if (room) {
          await supabase.from('chat_room_members').upsert({
            room_id: room.id,
            user_id: user.id
          }, { onConflict: 'room_id,user_id' });
        }
      }
      
      // Refresh avatars
      const { data: followersData } = await supabase
        .from('event_followers')
        .select(`
          user_id,
          profiles (
            avatar_url
          )
        `)
        .eq('event_id', id)
        .limit(5);
      
      if (followersData) {
        setFollowers(followersData.map(f => (f as any).profiles?.avatar_url).filter(Boolean));
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al seguir el evento');
    }
  };

  const handleAmenityClick = (idx: number, info: string) => {
    setSelectedAmenity(idx);
    toast.info(info, {
      icon: <Info className="w-4 h-4 text-primary" />,
      duration: 3000
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  // Process amenities
  let eventAmenities = [];
  if (Array.isArray(event.amenities)) {
    eventAmenities = event.amenities.map((key: string) => AMENITY_ICONS[key]).filter(Boolean);
  } else if (typeof event.amenities === 'string') {
    try {
      const parsed = JSON.parse(event.amenities);
      if (Array.isArray(parsed)) {
         eventAmenities = parsed.map((key: string) => AMENITY_ICONS[key]).filter(Boolean);
      }
    } catch(e) {}
  }

  const priceDisplay = event.price && event.price !== '0' && event.price !== 'Gratis' ? `$${event.price}` : 'Gratis';

  const handleOrganizerChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Inicia sesión para chatear con el organizador');
        return;
      }

      if (user.id === event.organizer_id) {
        toast.error('No puedes chatear contigo mismo');
        return;
      }

      setLoading(true);

      // Step 1: Find all rooms where the current user is a member
      const { data: myMemberships, error: membersError } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (membersError) throw membersError;

      let targetRoomId = null;

      if (myMemberships && myMemberships.length > 0) {
        const roomIds = myMemberships.map(m => m.room_id);
        
        // Step 2: Find which of those rooms are 'private' AND have the organizer as a member
        const { data: existingRoom, error: lookupError } = await supabase
          .from('chat_room_members')
          .select(`
            room_id,
            chat_rooms!inner (
              type
            )
          `)
          .in('room_id', roomIds)
          .eq('user_id', event.organizer_id)
          .eq('chat_rooms.type', 'private')
          .maybeSingle();

        if (lookupError) throw lookupError;
        
        if (existingRoom) {
          targetRoomId = existingRoom.room_id;
        }
      }

      if (!targetRoomId) {
        // Step 3: Create a new private room
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            type: 'private',
            name: `Chat Privado`,
            participants_count: 2
          })
          .select()
          .single();

        if (roomError) throw roomError;
        targetRoomId = newRoom.id;

        // Step 4: Add both members
        const { error: joinError } = await supabase
          .from('chat_room_members')
          .insert([
            { room_id: targetRoomId, user_id: user.id },
            { room_id: targetRoomId, user_id: event.organizer_id }
          ]);

        if (joinError) {
          // Cleanup the room if we couldn't add members
          await supabase.from('chat_rooms').delete().eq('id', targetRoomId);
          throw joinError;
        }
      }

      navigate(`/chat/${targetRoomId}`);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(`Error: ${error.message || 'No se pudo iniciar el chat'}`);
    } finally {
      setLoading(false);
    }
  };

  const isFree = !event.price || event.price === 0 || event.price === '0' || event.price === 'Gratis';

  const handleFreeTicket = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Inicia sesión para obtener tu entrada');
        navigate('/auth');
        return;
      }

      setLoading(true);

      // Check if user already has a ticket
      const { data: existing } = await supabase
        .from('tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', id)
        .maybeSingle();

      if (existing) {
        toast.info('Ya tienes una entrada para este evento');
        navigate('/tickets');
        return;
      }

      // Create ticket with correct column names
      const { error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          event_id: id,
          status: 'active',
          quantity: 1,
          unit_price: 0,
          total_price: 0
        });

      if (error) throw error;

      toast.success('¡Entrada obtenida con éxito! 🎉');
      navigate('/tickets');
    } catch (error: any) {
      console.error("Error getting free ticket:", error);
      toast.error(`Error: ${error.message || 'No se pudo obtener la entrada'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 animate-fade-in">
      {/* Hero Image Section */}
      <div className="relative h-[400px]">
        <img src={event.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-12 left-6 right-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <button className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all" onClick={() => toast.success('¡Enlace copiado!')}>
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFollow}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-md border transition-all active:scale-95 ${
                isFollowing 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white/20 border-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
            </button>
            <button 
              onClick={toggleFavorite}
              className={`p-3 rounded-2xl backdrop-blur-md border transition-all ${
                isFavorite 
                  ? 'bg-red-500 border-red-500 text-white' 
                  : 'bg-white/20 border-white/20 text-white hover:bg-white/30 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex gap-2 items-center mb-4">
            <Badge className="bg-primary text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">{event.category}</Badge>
            {isFree && (
              <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gratis
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 bg-white rounded-t-[40px] pt-8 space-y-8">
        
        {/* Quick Info Grid */}
        <div className="flex flex-col gap-3">
          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-center p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Calendar className="w-4 h-4" /></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha</p>
              </div>
              <p className="text-[13px] font-black text-slate-900 leading-tight">{event.event_date}</p>
            </div>
            
            <div className="flex flex-col justify-center p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Clock className="w-4 h-4" /></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Horario</p>
              </div>
              <p className="text-[13px] font-black text-slate-900 leading-tight">{event.event_time}</p>
            </div>
          </div>
          
          {/* Location Full Width */}
          <div className="flex items-center justify-between p-5 bg-slate-900 rounded-[28px] text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0"><MapPin className="w-6 h-6 text-emerald-400" /></div>
              <div className="min-w-0 pr-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ubicación</p>
                <h3 className="text-[13px] font-black text-white truncate">{event.location}</h3>
              </div>
            </div>
            <button className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center"><MapIcon className="w-5 h-5" /></button>
          </div>

          {/* Attendees circles */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {followers.length > 0 ? (
                  followers.map((avatar, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-sm">
                      <img src={avatar} alt="Follower" className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-slate-300" />
                    </div>
                  ))
                )}
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900">+{event.attendees_count || 0} asistirán</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gente que conoces</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-1">
          <h2 className="text-lg font-black text-slate-900 tracking-tight mb-3">Sobre el evento</h2>
          <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{event.description}</p>
        </div>

        {/* Organizer Section */}
        <div className="flex items-center justify-between p-2 pl-4 pr-2 bg-slate-50 rounded-full border border-slate-100">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(`/profile/u/${event.organizer_id}`)}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
               <img src={event.organizer_avatar || `https://i.pravatar.cc/150?u=${event.organizer_id}`} alt={event.organizer_name || 'Organizador'} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Organizador</p>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{event.organizer_name || 'Organizador Anónimo'}</h4>
            </div>
          </div>
          <button 
            onClick={() => isFollowing ? handleOrganizerChat() : toast.error('Sigue el evento para habilitar el chat')} 
            className={`h-12 px-5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
              isFollowing 
                ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed grayscale'
            }`}
          >
            {isFollowing ? <MessageSquare className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            Chat
          </button>
        </div>

        {/* Amenities Section */}
        {eventAmenities.length > 0 && (
          <div className="px-1 pb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4">Servicios Incluidos</h2>
            <div className="flex flex-wrap gap-2.5">
              {eventAmenities.map((item: any, idx: number) => {
                const textColorClass = item.icon.props.className?.split(' ').find((c: string) => c.startsWith('text-')) || '';
                
                return (
                  <button 
                    key={idx} 
                    onClick={() => handleAmenityClick(idx, item.info)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all active:scale-95 ${
                      selectedAmenity === idx 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex items-center justify-center ${selectedAmenity === idx ? 'text-white' : textColorClass}`}>
                       {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${selectedAmenity === idx ? 'text-white' : 'text-slate-700'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Bottom Bar (Spacing buffer) */}
        <div className="h-4"></div>

        {/* Floating Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-between z-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              {isFree ? 'Acceso' : 'Precio Final'}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {isFree ? 'Gratis' : `$${event.price}`}
            </span>
          </div>
          <Button 
            onClick={() => isFree ? handleFreeTicket() : navigate(`/checkout/${id}`)} 
            className={`rounded-[24px] px-10 h-14 font-black uppercase tracking-[0.15em] shadow-2xl transition-all ${
              isFree 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 text-white'
            }`}
          >
            {isFree ? 'Obtener Entrada' : 'Comprar Entrada'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
