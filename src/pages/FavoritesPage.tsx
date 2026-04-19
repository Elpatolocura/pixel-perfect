import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, MapPin, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('favorites')
          .select(`
            id,
            event_id,
            events (*)
          `)
          .eq('user_id', userData.user.id);

        if (error) throw error;
        
        // Filter out null events in case an event was deleted
        const validFavorites = data?.filter(f => f.events) || [];
        setFavorites(validFavorites);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar favoritos');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e: React.MouseEvent, favoriteId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast.success('Eliminado de favoritos');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando tus favoritos...</p>
      </div>
    );
  }

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
        {favorites.length > 0 ? (
          favorites.map((favorite) => {
            const event = favorite.events;
            const priceDisplay = event.price && event.price !== '0' && event.price !== 'Gratis' ? `$${event.price}` : 'Gratis';

            return (
              <Card 
                key={favorite.id} 
                className="overflow-hidden border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <div className="flex h-32">
                  <div className="w-32 h-full shrink-0 relative">
                    <img src={event.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase text-slate-900">{event.category}</span>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight">{event.title}</h3>
                        <button 
                          onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                          className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
                          <Calendar className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-slate-700">5.0</span>
                      </div>
                      <p className="text-xs font-black text-primary">
                        {priceDisplay}
                      </p>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-32 space-y-5 px-6">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-primary via-indigo-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 animate-pulse">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">¡Aún no hay favoritos!</h3>
              <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                Descubre un mundo lleno de eventos increíbles y guarda aquí los que más te llamen la atención.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all w-full hover:bg-primary hover:shadow-primary/30"
            >
              ¡Comenzar a explorar!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
