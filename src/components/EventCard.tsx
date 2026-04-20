import React, { useState, useEffect } from 'react';
import { EventData } from '@/types';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface EventCardProps {
  event: EventData;
  variant?: 'large' | 'small';
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
}

const EventCard = ({ event, variant = 'large', isFavorite: isFavProp, onFavoriteToggle }: EventCardProps) => {
  const navigate = useNavigate();

  const [followerAvatars, setFollowerAvatars] = useState<string[]>([]);
  const [liveEvent, setLiveEvent] = useState(event);

  const fetchFollowers = async () => {
    const { data } = await supabase
      .from('event_followers')
      .select(`
        profiles (
          avatar_url
        )
      `)
      .eq('event_id', event.id)
      .limit(3);
    
    if (data) {
      setFollowerAvatars(
        data
          .map((f: any) => f.profiles?.avatar_url as string | undefined)
          .filter((a): a is string => typeof a === 'string' && a.length > 0)
      );
    }
  };

  useEffect(() => {
    setLiveEvent(event);
    if (event.id) {
      fetchFollowers();

      // Realtime for followers
      const followersChannel = supabase
        .channel(`card-followers-${event.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_followers', filter: `event_id=eq.${event.id}` },
          () => fetchFollowers()
        )
        .subscribe();

      // Realtime for event data
      const eventChannel = supabase
        .channel(`card-event-${event.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events', filter: `id=eq.${event.id}` },
          (payload) => {
            setLiveEvent((prev: any) => ({ ...prev, ...payload.new }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(followersChannel);
        supabase.removeChannel(eventChannel);
      };
    }
  }, [event.id, event]);

  const displayEvent = liveEvent;

  if (variant === 'small') {
    return (
      <button
        onClick={() => navigate(`/event/${displayEvent.id}`)}
        className="bg-card rounded-2xl p-3.5 border border-border text-left min-w-[150px] flex-shrink-0 transition-shadow hover:shadow-md"
      >
        <div className="h-16 w-full bg-secondary rounded-xl overflow-hidden mb-2">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {event.emoji || '📅'}
            </div>
          )}
        </div>
        <p className="font-semibold text-foreground text-sm leading-tight truncate">{event.title}</p>
        <p className="text-muted-foreground text-[10px] mt-1">
          {event.event_date || event.date}
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/event/${displayEvent.id}`)}
      className="bg-card rounded-2xl overflow-hidden border border-border text-left w-full transition-shadow hover:shadow-md"
    >
      <div className="h-40 bg-secondary flex items-center justify-center text-5xl relative overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/80 to-foreground/40 text-white">
            {event.emoji || '📅'}
          </div>
        )}
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm">
            {event.category}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(e);
            }}
            className={`w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center transition-all border ${
              isFavProp 
                ? 'bg-red-500 border-red-500 text-white' 
                : 'bg-white/20 border-white/20 text-white hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isFavProp ? 'fill-current' : ''}`}
            />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight truncate">{event.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {event.event_date || event.date} · {event.event_time || event.time}
            </p>
          </div>
          <div className="bg-accent/10 text-accent px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ml-2">
            {!event.price || Number(event.price) === 0 ? 'Gratis' : `$${event.price}`}

          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {followerAvatars.length > 0 ? (
                followerAvatars.map((avatar, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-card overflow-hidden bg-muted">
                    <img src={avatar} alt="follower" className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card" />
                ))
              )}
            </div>
            <span className="text-xs text-muted-foreground ml-1.5">+{event.attendees || event.attendees_count || 0} asistirán</span>
          </div>
          <span className="text-xs font-semibold text-foreground bg-secondary px-3 py-1.5 rounded-lg">
            Ver más
          </span>
        </div>
      </div>
    </button>
  );
};

export default EventCard;
