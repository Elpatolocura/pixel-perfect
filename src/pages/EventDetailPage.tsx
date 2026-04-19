import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Users, Share2, 
  Heart, MessageSquare, Info, ShieldCheck, Star,
  Clock, Ticket, Map as MapIcon, ChevronRight,
  Wifi, Snowflake, Tv, Car, Coffee, Accessibility, 
  GlassWater, Music, Sparkles, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAmenity, setSelectedAmenity] = useState<number | null>(null);

  const eventsData: Record<string, any> = {
    "1": {
      title: "Festival de Jazz en el Parque",
      category: "Música",
      date: "Viernes, 24 de Abril",
      time: "20:00 - 23:30",
      location: "Parque Metropolitano, Sector Central",
      price: "$15.00",
      attendees: 142,
      organizer: "Jazz Society",
      description: "Disfruta de una noche mágica bajo las estrellas con los mejores exponentes del jazz contemporáneo. Un evento para toda la familia con áreas de comida y zonas de relax.",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
      amenities: [
        { icon: <Wifi className="w-5 h-5 text-blue-600" />, label: "WiFi Gratis", color: "bg-blue-50", info: "Red: EVENTIA_GUEST | Pass: jazz2024" },
        { icon: <Snowflake className="w-5 h-5 text-sky-500" />, label: "Aire Acond.", color: "bg-sky-50", info: "Climatización 22°C garantizada" },
        { icon: <GlassWater className="w-5 h-5 text-pink-500" />, label: "Bar Libre", color: "bg-pink-50", info: "Cocktails y bebidas sin alcohol incluidas" },
        { icon: <Music className="w-5 h-5 text-indigo-600" />, label: "Sonido Hi-Fi", color: "bg-indigo-50", info: "Sistema Dolby Atmos 7.1" },
        { icon: <Car className="w-5 h-5 text-amber-600" />, label: "Parking VIP", color: "bg-amber-50", info: "Zona E-4 reservada para asistentes" },
        { icon: <Accessibility className="w-5 h-5 text-emerald-600" />, label: "Accesible", color: "bg-emerald-50", info: "Rampas y ascensores disponibles" }
      ]
    },
    "2": {
      title: "Workshop de Pintura Óleo",
      category: "Arte",
      date: "Sábado, 25 de Abril",
      time: "10:00 - 14:00",
      location: "Estudio Creativo, Calle 45",
      price: "$25.00",
      attendees: 45,
      organizer: "Arte Vivo",
      description: "Aprende las técnicas maestras de la pintura al óleo en este taller intensivo para principiantes y niveles intermedios. Materiales incluidos.",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60",
      amenities: [
        { icon: <Tv className="w-5 h-5 text-purple-600" />, label: "Pantallas 4K", color: "bg-purple-50", info: "Transmisión en vivo de la técnica del maestro" },
        { icon: <Coffee className="w-5 h-5 text-orange-600" />, label: "Coffee Break", color: "bg-orange-50", info: "Café artesanal y snacks incluidos" },
        { icon: <Wifi className="w-5 h-5 text-blue-600" />, label: "WiFi Fibra", color: "bg-blue-50", info: "Red de alta velocidad para streaming" },
        { icon: <Snowflake className="w-5 h-5 text-sky-500" />, label: "Climatizado", color: "bg-sky-50", info: "Control de humedad para las pinturas" }
      ]
    },
    "3": {
      title: "Ruta del Taco Gourmet",
      category: "Gastronomía",
      date: "Domingo, 26 de Abril",
      time: "12:00 - 18:00",
      location: "Plaza Gastronómica Sur",
      price: "$10.00",
      attendees: 89,
      organizer: "Foodies Unidos",
      description: "Explora los sabores más innovadores de la cocina urbana mexicana. Más de 20 puestos de tacos gourmet y bebidas artesanales.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60",
      amenities: [
        { icon: <Utensils className="w-5 h-5 text-red-500" /> , label: "Degustación", color: "bg-red-50", info: "3 mini-tacos de bienvenida incluidos" },
        { icon: <Car className="w-5 h-5 text-amber-600" />, label: "Parking", color: "bg-amber-50", info: "Parking público con descuento" },
        { icon: <Tv className="w-5 h-5 text-purple-600" />, label: "Música TV", color: "bg-purple-50", info: "Pantallas gigantes para eventos deportivos" },
        { icon: <Wifi className="w-5 h-5 text-blue-600" />, label: "WiFi", color: "bg-blue-50", info: "Acceso libre en zona de mesas" }
      ]
    }
  };

  const event = eventsData[id || "1"] || eventsData["1"];

  const handleAmenityClick = (idx: number, info: string) => {
    setSelectedAmenity(idx);
    toast.info(info, {
      icon: <Info className="w-4 h-4 text-primary" />,
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24 animate-fade-in">
      {/* Hero Image Section */}
      <div className="relative h-[400px]">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-12 left-6 right-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <button className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white" onClick={() => toast.success('Copiado!')}>
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 right-6">
          <Badge className="bg-primary text-white border-none px-4 py-1.5 mb-4 font-black text-[10px] uppercase tracking-widest">{event.category}</Badge>
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
              <p className="text-[13px] font-black text-slate-900 leading-tight">{event.date}</p>
            </div>
            
            <div className="flex flex-col justify-center p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Clock className="w-4 h-4" /></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Horario</p>
              </div>
              <p className="text-[13px] font-black text-slate-900 leading-tight">{event.time}</p>
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
        </div>

        {/* Description */}
        <div className="px-1">
          <h2 className="text-lg font-black text-slate-900 tracking-tight mb-3">Sobre el evento</h2>
          <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{event.description}</p>
        </div>

        {/* Organizer Section */}
        <div className="flex items-center justify-between p-2 pl-4 pr-2 bg-slate-50 rounded-full border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm border-2 border-white">
               <img src={`https://i.pravatar.cc/150?u=${event.organizer}`} alt={event.organizer} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Organizador</p>
              <h4 className="text-sm font-black text-slate-900">{event.organizer}</h4>
            </div>
          </div>
          <button onClick={() => navigate(`/chat/${id}`)} className="h-12 px-5 rounded-full bg-primary text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
        </div>

        {/* Amenities Section */}
        <div className="px-1 pb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4">Servicios Incluidos</h2>
          <div className="flex flex-wrap gap-2.5">
            {event.amenities.map((item: any, idx: number) => {
              // Extract the text color class from the icon to use it or override it
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

        {/* Floating Bottom Bar (Spacing buffer) */}
        <div className="h-4"></div>

        {/* Floating Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-between z-50">
          <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Precio Final</span><span className="text-2xl font-black text-slate-900">{event.price}</span></div>
          <Button onClick={() => navigate(`/checkout/${id}`)} className="rounded-[24px] bg-slate-900 text-white px-10 h-14 font-black uppercase tracking-[0.15em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all">Comprar Entrada</Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
