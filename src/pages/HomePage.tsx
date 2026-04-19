import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, MapPin, Calendar, Users, 
  Music, Utensils, Palette, ChevronRight, 
  Star, Heart, LayoutGrid, Sparkles, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Invitado');

  const categories = [
    { name: 'Todos', icon: <LayoutGrid className="w-4 h-4" /> },
    { name: 'Música', icon: <Music className="w-4 h-4" /> },
    { name: 'Arte', icon: <Palette className="w-4 h-4" /> },
    { name: 'Gastronomía', icon: <Utensils className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          } else {
            setUserName('Usuario');
          }
        }

        // Fetch events
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (eventsData) setEvents(eventsData);
      } catch (error: any) {
        toast.error('Error al cargar la página');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, events]);

  const handleEventClick = (id: number) => {
    navigate(`/event/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 animate-fade-in relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/10 via-indigo-500/5 to-pink-500/10 pointer-events-none -z-10 blur-3xl rounded-b-[100px]" />
      <div className="absolute top-[-100px] right-[-50px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-[28px] font-black tracking-tight text-slate-900 leading-tight">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">{userName}</span> 👋
          </h1>
          <p className="text-slate-500 text-[13px] font-bold tracking-wide">Descubre eventos increíbles cerca de ti</p>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="p-3.5 rounded-[20px] bg-white shadow-sm border border-slate-100/50 relative hover:shadow-md active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-8 relative z-10">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
          <Input 
            placeholder="Buscar eventos, artistas..." 
            className="pl-14 h-14 rounded-[20px] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-visible:ring-4 focus-visible:ring-primary/10 text-[15px] font-medium transition-all group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-6 mb-8 overflow-x-auto flex gap-3 no-scrollbar py-2 relative z-10">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-[20px] text-[13px] font-black transition-all whitespace-nowrap active:scale-95 ${
              selectedCategory === cat.name 
                ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 border-none' 
                : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className={`${selectedCategory === cat.name ? 'text-white' : 'text-slate-400'}`}>
              {cat.icon}
            </div>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Featured Events */}
      <div className="px-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary fill-primary" />
            Populares hoy
          </h2>
          <Button variant="ghost" className="text-xs font-black text-primary uppercase tracking-widest p-0 h-auto hover:bg-transparent">
            Ver todo
          </Button>
        </div>

        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { data: userData } = await supabase.auth.getUser();
                          if (!userData.user) {
                            toast.error('Inicia sesión para guardar favoritos');
                            return;
                          }
                          const { error } = await supabase.from('favorites').insert({
                            user_id: userData.user.id,
                            event_id: event.id
                          });
                          if (error) {
                            if (error.code === '23505') {
                              toast.info('Este evento ya está en tus favoritos');
                            } else {
                              throw error;
                            }
                          } else {
                            toast.success('¡Añadido a favoritos!');
                          }
                        } catch(err) {
                          toast.error('Error al guardar en favoritos');
                        }
                      }}
                      className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-red-500 transition-all"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none px-3 py-1 font-black text-[10px]">
                      {event.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <span className="text-primary font-black text-sm">
                      {event.price && event.price !== '0' && event.price !== 'Gratis' ? `$${event.price}` : 'Gratis'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date} • {event.time}
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">+{event.attendees_count || 0} asistirán</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="rounded-xl bg-slate-900 text-white px-5 text-[10px] font-black uppercase tracking-widest h-9"
                    >
                      Ver más
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-6 px-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 rounded-[32px] rotate-3 opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-cyan-400 via-blue-500 to-indigo-600 rounded-[32px] -rotate-3 flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 bg-white text-blue-500 rounded-full p-2 shadow-lg animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-2">¡Ups! No hay resultados</h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[260px] mx-auto">
                  {searchQuery 
                    ? `No pudimos encontrar eventos que coincidan con "${searchQuery}".` 
                    : `No hay eventos disponibles en la categoría ${selectedCategory !== 'Todos' ? selectedCategory : ''} por ahora.`}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                }}
                className="mt-4 px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all hover:bg-primary hover:shadow-primary/30"
              >
                Ver todos los eventos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
