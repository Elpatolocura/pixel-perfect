import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Ticket, CreditCard, ShieldCheck, 
  ChevronRight, Minus, Plus, Wallet, Lock,
  Info, Calendar, MapPin, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        toast.error(t('checkout.not_found'));
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
        toast.error(t('checkout.login_required'));
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

      toast.success(t('checkout.success'));
      setTimeout(() => navigate(`/event/${id}`), 2000);
    } catch (error: any) {
      toast.error(t('checkout.error') + ': ' + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 bg-background border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-foreground tracking-tight">{t('checkout.title')}</h1>
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
              <h2 className="font-black text-lg leading-tight mb-2 text-white">{event.title}</h2>
              <div className="flex flex-col gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" /> 
                  <span className="text-slate-400">{event.event_date} · {event.event_time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" /> 
                  <span className="text-slate-400">{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest px-1">{t('checkout.select_zone')}</h3>
          <div className="grid grid-cols-1 gap-3">
            {zones.map((zone) => (
              <button
                key={zone.name}
                onClick={() => setSelectedZone(zone.name)}
                className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                  selectedZone === zone.name 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                  : 'border-border bg-card hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-4 ${selectedZone === zone.name ? 'border-primary' : 'border-border'}`}></div>
                  <span className="font-bold text-foreground/80">{zone.name}</span>
                </div>
                <span className="font-black text-foreground">${zone.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="bg-card rounded-[32px] p-6 border border-border shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-foreground">{t('common.quantity')}</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t('checkout.max_tickets')}</p>
          </div>
          <div className="flex items-center gap-5">
            <button 
              onClick={() => ticketCount > 1 && setTicketCount(prev => prev - 1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-secondary/80"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl font-black text-foreground w-4 text-center">{ticketCount}</span>
            <button 
              onClick={() => ticketCount < 5 && setTicketCount(prev => prev + 1)}
              className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background hover:opacity-90 shadow-lg shadow-black/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-foreground uppercase tracking-widest px-1">{t('checkout.payment_method')}</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {['Apple Pay', 'Google Pay', 'Visa •••• 4242'].map((method, idx) => (
              <button key={idx} className="flex items-center gap-3 px-6 py-4 bg-card rounded-2xl border border-border whitespace-nowrap font-bold text-foreground/60 hover:border-primary transition-all">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Summary Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-between z-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{t('checkout.total_to_pay')}</span>
          <span className="text-2xl font-black text-foreground">${total}</span>
        </div>
        <Button 
          onClick={handlePurchase}
          className="rounded-[24px] bg-foreground text-background px-10 h-14 font-black uppercase tracking-[0.15em] shadow-2xl shadow-black/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          {t('checkout.pay_now')}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
