import { supabase } from '@/lib/supabase';
import { Loader2, MessageCircle, Users, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('eventos');
  const [eventRooms, setEventRooms] = useState<any[]>([]);
  const [privateRooms, setPrivateRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch rooms where user is member
          const { data, error } = await supabase
            .from('chat_room_members')
            .select(`
              room_id,
              unread_count,
              chat_rooms!inner (
                *,
                chat_room_members (user_id)
              )
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          // Collect all unique "other" user IDs for private chats
          const otherUserIds = new Set<string>();
          data?.forEach(m => {
            if (m.chat_rooms.type === 'private') {
              const other = m.chat_rooms.chat_room_members.find((rm: any) => rm.user_id !== user.id);
              if (other) otherUserIds.add(other.user_id);
            }
          });

          // Fetch profiles for those users
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', Array.from(otherUserIds));

          const profileMap = new Map(profiles?.map(p => [p.id, p]));

          const rooms = data?.map(m => {
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
            }

            return {
              ...room,
              name: displayName,
              avatar: displayAvatar,
              unread: m.unread_count
            };
          }) || [];

          setEventRooms(rooms.filter(r => r.type === 'event'));
          setPrivateRooms(rooms.filter(r => r.type === 'private'));
        }
      } catch (error) {
        console.error("Error fetching chats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Cargando tus mensajes...</p>
      </div>
    );
  }
  
  const ChatList = ({ rooms, type }: { rooms: any[], type: 'event' | 'person' }) => {
    if (rooms.length === 0) {
      return (
        <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-fuchsia-500/30 mb-6 relative">
            <MessageCircle className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 bg-white text-fuchsia-500 rounded-full p-1.5 shadow-lg animate-bounce">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-2">¡Comienza a conectar!</h3>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-8">
            {type === 'event' 
              ? 'Únete a eventos para chatear con otros asistentes y enterarte de todas las novedades.'
              : 'Conecta con otros usuarios y organizadores para hacer preguntas y compartir experiencias.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all hover:bg-primary hover:shadow-primary/30"
          >
            Explorar Eventos
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => navigate(`/chat/${room.id}`)}
            className="w-full flex items-center gap-3.5 bg-card rounded-2xl p-4 border border-border text-left transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border overflow-hidden ${
              type === 'event' 
                ? 'bg-primary/5 border-primary/10 text-primary' 
                : 'bg-secondary border-border text-muted-foreground'
            }`}>
              {room.avatar ? (
                <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                type === 'event' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-foreground text-sm truncate">{room.name}</p>
                <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                  {room.last_message_at ? (() => {
                    const date = new Date(room.last_message_at);
                    const now = new Date();
                    const diff = now.getTime() - date.getTime();
                    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
                    
                    if (dayDiff === 0 && date.getDate() === now.getDate()) {
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else if (dayDiff === 1 || (dayDiff === 0 && date.getDate() !== now.getDate())) {
                      return 'Ayer';
                    } else {
                      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                    }
                  })() : ''}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{room.last_message || 'No hay mensajes aún'}</p>
                {room.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                    {room.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-24 px-5 pt-safe min-h-screen bg-background">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mensajería</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gestiona todas tus conversaciones</p>
      </div>

      <Tabs defaultValue="eventos" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-2xl h-12">
          <TabsTrigger value="eventos" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Eventos
          </TabsTrigger>
          <TabsTrigger value="personas" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Personas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          <ChatList rooms={eventRooms} type="event" />
        </TabsContent>
        
        <TabsContent value="personas">
          <ChatList rooms={privateRooms} type="person" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPage;
