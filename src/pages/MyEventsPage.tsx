import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Plus, Users, Calendar, MoreVertical, Edit2, Trash2, ExternalLink, Rocket, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/profile');
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAllAccess, setIsAllAccess] = useState(false);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          
          setIsAllAccess(sub?.plan_id === 'Acceso Total');

          // Fetch events created by user
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('organizer_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Supabase error fetching events:", error);
            throw error;
          }
          
          console.log("Fetched events for user:", user.id, data);
          setMyEvents(data || []);
        }
      } catch (error) {
        console.error("Error fetching my events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Cargando tus eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Mis Eventos</h1>
        </div>
        {isAllAccess && (
          <Button size="sm" className="rounded-full gap-1.5 h-8 px-4" onClick={() => navigate('/create')}>
            <Plus className="w-4 h-4" /> Nuevo
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {myEvents.length > 0 ? (
          myEvents.map((event) => (
            <div key={event.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex group h-32">
              <div className="w-32 h-full bg-secondary overflow-hidden shrink-0 border-r border-border">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {event.emoji || '📅'}
                  </div>
                )}
              </div>

              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm truncate">{event.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-md hover:bg-secondary transition-colors shrink-0">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem className="gap-2 text-xs font-medium" onClick={() => navigate(`/event/${event.id}`)}>
                        <ExternalLink className="w-3.5 h-3.5" /> Ver Página
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs font-medium">
                        <Edit2 className="w-3.5 h-3.5" /> Editar Evento
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs font-medium text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{event.event_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{event.attendees_count || 0} asistirán</span>
                  </div>
                </div>

                <div className="pt-1 flex gap-2 items-center">
                  <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, ((event.attendees_count || 0) / (event.max_attendees || 100)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-bold text-primary">
                    {Math.round(((event.attendees_count || 0) / (event.max_attendees || 100)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : isAllAccess ? (
          <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">No hay eventos todavía</h3>
            <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
              ¡Ya tienes Acceso Total! Es hora de crear tu primer evento y compartirlo con el mundo.
            </p>
            <Button
              onClick={() => navigate('/create')}
              className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Crear mi primer evento
            </Button>
          </div>
        ) : (
          <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] rotate-6 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] -rotate-3 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 bg-foreground text-background rounded-full p-2.5 shadow-lg animate-bounce">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">Conviértete en Organizador</h3>
            <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
              Para poder crear y administrar tus propios eventos, necesitas tener la membresía <span className="font-bold text-primary">Acceso Total</span>.
            </p>

            <Button
              onClick={() => navigate('/premium')}
              className="w-full h-14 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest shadow-xl shadow-foreground/10 active:scale-95 transition-all hover:opacity-90"
            >
              Ver Planes de Membresía
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
