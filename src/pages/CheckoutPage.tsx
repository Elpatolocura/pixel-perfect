import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Ticket, CreditCard, ShieldCheck, 
  ChevronRight, Minus, Plus, Wallet, Lock,
  Info, Calendar, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedZone, setSelectedZone] = useState('General');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error(error);
        toast.error('Evento no encontrado');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id, navigate]);

  const zones = [
    { name: 'General', price: 15 },
    { name: 'VIP', price: 45 },
    { name: 'Platinum', price: 85 }
  ];

  const currentZone = zones.find(z => z.name === selectedZone) || zones[0];
  const total = currentZone.price * ticketCount;

  const handlePurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes iniciar sesión para comprar tickets');
        navigate('/auth');
        return;
      }

      const { error } = await supabase.from('tickets').insert({
        user_id: user.id,
        event_id: id,
        zone: selectedZone,
        quantity: ticketCount,
        total_price: total,
        status: 'active',
        purchase_date: new Date().toISOString()
      });

      if (error) throw error;

      toast.success('¡Compra realizada con éxito! Revisa tu email.');
      setTimeout(() => navigate(`/event/${id}`), 2000);
    } catch (error: any) {
      toast.error('Error al procesar la compra: ' + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-100 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Finalizar Compra</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Ticket Preview Card */}
        <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-lg leading-tight mb-2">{event.title}</h2>
              <div className="flex flex-col gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> 
                  {event.event_date} · {event.event_time}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> 
                  {event.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Selecciona tu Zona</h3>
          <div className="grid grid-cols-1 gap-3">
            {zones.map((zone) => (
              <button
                key={zone.name}
                onClick={() => setSelectedZone(zone.name)}
                className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                  selectedZone === zone.name 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-4 ${selectedZone === zone.name ? 'border-primary' : 'border-slate-200'}`}></div>
                  <span className="font-bold text-slate-700">{zone.name}</span>
                </div>
                <span className="font-black text-slate-900">${zone.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Cantidad</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Máximo 5 entradas</p>
          </div>
          <div className="flex items-center gap-5">
            <button 
              onClick={() => ticketCount > 1 && setTicketCount(prev => prev - 1)}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl font-black text-slate-900 w-4 text-center">{ticketCount}</span>
            <button 
              onClick={() => ticketCount < 5 && setTicketCount(prev => prev + 1)}
              className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Método de Pago</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {['Apple Pay', 'Google Pay', 'Visa •••• 4242'].map((method, idx) => (
              <button key={idx} className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-100 whitespace-nowrap font-bold text-slate-600 hover:border-primary transition-all">
                <Wallet className="w-4 h-4 text-slate-400" />
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Summary Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-between z-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Total a Pagar</span>
          <span className="text-2xl font-black text-slate-900">${total}</span>
        </div>
        <Button 
          onClick={handlePurchase}
          className="rounded-[24px] bg-slate-900 text-white px-10 h-14 font-black uppercase tracking-[0.15em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Pagar Ahora
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
