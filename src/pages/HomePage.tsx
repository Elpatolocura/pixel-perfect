import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, MapPin, Calendar, Users, 
  Music, Utensils, Palette, ChevronRight, 
  Star, Heart, LayoutGrid, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Todos', icon: <LayoutGrid className="w-4 h-4" /> },
    { name: 'Música', icon: <Music className="w-4 h-4" /> },
    { name: 'Arte', icon: <Palette className="w-4 h-4" /> },
    { name: 'Gastronomía', icon: <Utensils className="w-4 h-4" /> },
  ];

  const allEvents = [
    {
      id: 1,
      title: "Festival de Jazz en el Parque",
      category: "Música",
      date: "vie, 24 abr · 20:00",
      price: "$15",
      attendees: 142,
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      title: "Workshop de Pintura Óleo",
      category: "Arte",
      date: "sáb, 25 abr · 10:00",
      price: "$25",
      attendees: 45,
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      title: "Ruta del Taco Gourmet",
      category: "Gastronomía",
      date: "dom, 26 abr · 12:00",
      price: "$10",
      attendees: 89,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60"
    }
  ];

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">María</span> 👋
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
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('¡Añadido a favoritos!');
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
                    <span className="text-primary font-black text-sm">{event.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date}
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">+{event.attendees} asistirán</span>
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
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">No encontramos eventos para "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
