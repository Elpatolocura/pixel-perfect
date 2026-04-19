import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, MapPin, Star } from 'lucide-react';
import { mockEvents } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';

const FavoritesPage = () => {
  const navigate = useNavigate();
  
  // En una app real, filtraríamos los eventos que el usuario marcó en Supabase
  const favoriteEvents = mockEvents.filter(e => e.isFavorite);

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Favoritos</h1>
      </div>

      <div className="p-4 space-y-4">
        {favoriteEvents.length > 0 ? (
          favoriteEvents.map((event) => (
            <Card 
              key={event.id} 
              className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <div className="flex">
                <div className="w-32 h-32 bg-secondary flex items-center justify-center text-4xl shrink-0">
                  {event.emoji}
                </div>
                
                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm line-clamp-1">{event.title}</h3>
                      <Heart className="w-4 h-4 text-destructive fill-destructive" />
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span>{new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold">4.8</span>
                    </div>
                    <p className="text-xs font-bold text-primary">
                      {event.price === 0 ? 'Gratis' : `${event.price} ${event.currency}`}
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-32 space-y-4 px-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">Tu lista está vacía</h3>
            <p className="text-muted-foreground text-sm">Explora eventos y guarda los que más te gusten pulsando el icono del corazón.</p>
            <button 
              onClick={() => navigate('/explore')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg shadow-primary/20"
            >
              Descubrir eventos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
