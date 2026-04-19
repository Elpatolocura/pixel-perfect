import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Image as ImageIcon, Wifi, Car, Coffee, Music, Snowflake, Tv, Accessibility, Wine, Rocket, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { allCategories, categoryEmojis } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'food', label: 'Comida', icon: Coffee },
  { id: 'music', label: 'Música', icon: Music },
  { id: 'ac', label: 'Clima', icon: Snowflake },
  { id: 'drinks', label: 'Bar', icon: Wine },
  { id: 'tv', label: 'Pantallas', icon: Tv },
  { id: 'access', label: 'Accesible', icon: Accessibility },
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    price: '',
    maxAttendees: '',
    image: '',
    extraImages: [] as string[],
    amenities: [] as string[],
  });

  const [isBusiness, setIsBusiness] = useState<boolean | null>(null);

  useEffect(() => {
    const membership = localStorage.getItem('user_membership');
    setIsBusiness(membership === 'Business');
  }, []);

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (id: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      update('image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExtraImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          extraImages: [...prev.extraImages, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExtraImage = (indexToRemove: number) => {
    setForm(prev => ({
      ...prev,
      extraImages: prev.extraImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (isBusiness === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-indigo-100 rounded-[32px] flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 relative">
          <Rocket className="w-12 h-12 text-indigo-600" />
          <div className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-2 shadow-lg animate-bounce">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Acceso Restringido</h1>
        <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-xs mx-auto mb-8">
          La creación de eventos es una herramienta exclusiva para los organizadores profesionales con membresía Business.
        </p>
        
        <div className="space-y-3 w-full max-w-xs">
          <Button 
            onClick={() => navigate('/premium')}
            className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Ver Plan Business
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full h-12 rounded-2xl text-slate-500 font-bold hover:bg-slate-200"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (isBusiness === null) return null;

  return (
    <div className="pb-24 px-5 pt-safe">
      <div className="pt-6 mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Crear evento</h1>
      </div>

      <div className="space-y-4">
        {/* Foto del Evento Principal y Extra */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Fotos del Evento</label>
          <input 
            type="file" 
            id="event-image" 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
          <input 
            type="file" 
            id="event-extra-images" 
            className="hidden" 
            accept="image/*"
            multiple
            onChange={handleExtraImagesUpload}
          />
          
          {/* Main Photo */}
          <div 
            onClick={() => document.getElementById('event-image')?.click()}
            className="w-full h-40 bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative hover:bg-secondary/50 transition-colors mb-3"
          >
            {form.image ? (
              <>
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-xs font-bold">Cambiar portada</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Sube una portada atractiva</span>
              </>
            )}
          </div>

          {/* Extra Photos Gallery */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {form.extraImages.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-border group">
                <img src={img} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeExtraImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs font-bold leading-none">&times;</span>
                </button>
              </div>
            ))}
            
            <div 
              onClick={() => document.getElementById('event-extra-images')?.click()}
              className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Camera className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground font-medium">Añadir más</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Título</label>
          <input
            type="text"
            placeholder="Nombre del evento"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Descripción</label>
          <textarea
            placeholder="Describe tu evento..."
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => update('category', cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  form.category === cat
                    ? 'bg-foreground text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                }`}
              >
                {categoryEmojis[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Hora</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Ubicación</label>
          <input
            type="text"
            placeholder="Dirección o lugar"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        {/* Servicios Incluidos (Amenities) */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Servicios Incluidos</label>
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = form.amenities.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{amenity.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Precio (USD)</label>
            <input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Aforo máximo</label>
            <input
              type="number"
              placeholder="100"
              value={form.maxAttendees}
              onChange={(e) => update('maxAttendees', e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        <button className="w-full bg-foreground text-primary-foreground py-4 rounded-2xl font-semibold text-base mt-4 shadow-lg shadow-foreground/10 active:scale-95 transition-all">
          Crear evento
        </button>
      </div>
    </div>
  );
};

export default CreateEventPage;
