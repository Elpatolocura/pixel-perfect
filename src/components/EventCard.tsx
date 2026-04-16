import { EventData } from '@/types';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: EventData;
  variant?: 'large' | 'small';
}

const EventCard = ({ event, variant = 'large' }: EventCardProps) => {
  const navigate = useNavigate();

  if (variant === 'small') {
    return (
      <button
        onClick={() => navigate(`/event/${event.id}`)}
        className="bg-card rounded-2xl p-3.5 border border-border text-left min-w-[150px] flex-shrink-0 transition-shadow hover:shadow-md"
      >
        <div className="text-2xl mb-2">{event.emoji}</div>
        <p className="font-semibold text-foreground text-sm leading-tight">{event.title}</p>
        <p className="text-muted-foreground text-xs mt-1">
          {new Date(event.date).toLocaleDateString('es', { weekday: 'short' })}, {event.time}
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/event/${event.id}`)}
      className="bg-card rounded-2xl overflow-hidden border border-border text-left w-full transition-shadow hover:shadow-md"
    >
      <div className="h-40 bg-gradient-to-br from-foreground/80 to-foreground/40 flex items-center justify-center text-5xl relative">
        {event.emoji}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
          <Heart
            className={`w-4 h-4 ${event.isFavorite ? 'fill-destructive text-destructive' : 'text-foreground/60'}`}
          />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base leading-tight">{event.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date(event.date).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} · {event.time}
            </p>
          </div>
          <div className="bg-accent/10 text-accent px-2.5 py-1 rounded-lg text-xs font-semibold">
            {event.price === 0 ? 'Gratis' : `$${event.price}`}
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1.5">+{event.attendees} asistirán</span>
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
