import { useParams, useNavigate } from 'react-router-dom';
import { mockEvents } from '@/data/mockData';
import { ArrowLeft, Heart, MapPin, Calendar, Clock, Users, Share2 } from 'lucide-react';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-safe">
      {/* Hero */}
      <div className="relative h-56 bg-gradient-to-br from-foreground/80 to-foreground/40 flex items-center justify-center text-7xl">
        {event.emoji}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center">
            <Heart className={`w-4 h-4 ${event.isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6 relative">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-xl font-bold text-foreground flex-1 pr-3">{event.title}</h1>
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
              {event.price === 0 ? 'Gratis' : `$${event.price}`}
            </span>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{event.attendees}/{event.maxAttendees} asistentes</span>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl mb-5">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div>
              <p className="text-sm font-semibold text-foreground">{event.organizer.name}</p>
              <p className="text-xs text-muted-foreground">Organizador</p>
            </div>
          </div>

          <h2 className="font-semibold text-foreground mb-2">Acerca del evento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{event.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="bg-secondary text-foreground/70 px-3 py-1 rounded-lg text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Buy button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5">
        <button className="w-full bg-foreground text-primary-foreground py-4 rounded-2xl font-semibold text-base shadow-lg">
          {event.price === 0 ? 'Reservar gratis' : `Comprar ticket · $${event.price}`}
        </button>
      </div>
    </div>
  );
};

export default EventDetailPage;
