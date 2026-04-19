import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Share2, 
  Download, MoreHorizontal, Info, ShieldCheck, 
  QrCode, Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const TicketDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*, events (*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTicketData(data);
      } catch (error) {
        console.error(error);
        toast.error('Ticket no encontrado');
        navigate('/tickets');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicketDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando tu ticket...</p>
      </div>
    );
  }

  if (!ticketData) return null;

  const event = ticketData.events;
  const qrCodeData = `EVENTIA-TICKET-${ticketData.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200/50 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="font-bold text-slate-900">Mi Ticket</h1>
        <button className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200/50">
          <Share2 className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="px-6 mt-4 max-w-lg mx-auto">
        {/* Main Ticket Card */}
        <div className="relative group">
          {/* Top Section */}
          <div className="bg-white rounded-t-[32px] p-8 border-x border-t border-slate-200/50 shadow-xl shadow-slate-200/20">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {ticketData.zone || 'General'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight pt-2">
                  {event.title}
                </h2>
              </div>
              <Avatar className="w-12 h-12 rounded-2xl border-2 border-slate-50 shadow-sm">
                <AvatarImage src="https://i.pravatar.cc/150?u=jazz" />
                <AvatarFallback>EV</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(event.event_date || event.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hora</p>
                  <p className="text-sm font-bold text-slate-700">{event.event_time || event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lugar</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Divider (Dashed Line with circles on sides) */}
          <div className="relative h-8 flex items-center bg-white border-x border-slate-200/50">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-slate-50 border-r border-slate-200/50"></div>
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-slate-50 border-l border-slate-200/50"></div>
            <div className="w-full border-t-2 border-dashed border-slate-100 mx-4"></div>
          </div>

          {/* Bottom Section - QR Area */}
          <div className="bg-white rounded-b-[32px] p-8 border-x border-b border-slate-200/50 shadow-xl shadow-slate-200/20 text-center">
            <div className="relative inline-block group">
              <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto relative z-10 p-2 bg-white rounded-2xl border-2 border-slate-100"
              />
            </div>
            
            <div className="mt-6 space-y-1">
              <p className="text-sm font-black text-slate-900 tracking-[0.3em]">#EV-{ticketData.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-[11px] text-slate-400 font-bold">Presenta este código en la entrada</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
              <div className="text-left">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Cantidad</p>
                <p className="text-sm font-black text-slate-900">x{ticketData.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Valor</p>
                <p className="text-sm font-black text-slate-900">${ticketData.total_price}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl border-slate-200 gap-2 font-bold text-slate-700 bg-white"
            onClick={() => toast.success('Guardado en Apple Wallet')}
          >
            <Wallet className="w-5 h-5" /> Wallet
          </Button>
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl border-slate-200 gap-2 font-bold text-slate-700 bg-white"
            onClick={() => toast.info('Descargando PDF...')}
          >
            <Download className="w-5 h-5" /> PDF
          </Button>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-blue-50/50 rounded-[24px] p-6 border border-blue-100/50 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900">Entrada Protegida</h4>
            <p className="text-[11px] text-blue-700/70 leading-relaxed">
              Este ticket es personal e intransferible. Asegúrate de que el brillo de tu pantalla esté al máximo al escanear.
            </p>
          </div>
        </div>

        {/* Support Link */}
        <button 
          onClick={() => navigate('/support')}
          className="w-full mt-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
        >
          ¿Tienes problemas con tu ticket? <span className="text-primary underline">Contactar soporte</span>
        </button>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
