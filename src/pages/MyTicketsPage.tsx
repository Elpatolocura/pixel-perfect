import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Ticket, Calendar, MapPin, QrCode, MoreVertical, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { mockTickets, mockEvents } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeTickets = tickets.filter(t => t.status === 'active');
  const pastTickets = tickets.filter(t => t.status !== 'active');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('tickets')
            .select('*, events (*)')
            .eq('user_id', user.id)
            .order('purchase_date', { ascending: false });

          if (error) throw error;
          setTickets(data || []);
        }
      } catch (e) {
        console.error("Error fetching tickets", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const clearAllTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('tickets').delete().eq('user_id', user.id);
        if (error) throw error;
        setTickets([]);
        toast.success('Todos los tickets han sido eliminados');
      }
    } catch (e) {
      toast.error('No se pudieron borrar los tickets');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando tus tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Mis Tickets</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-secondary transition-all active:scale-90">
              <MoreVertical className="w-5 h-5 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
            <DropdownMenuItem
              onClick={clearAllTickets}
              className="gap-3 px-4 py-3 rounded-xl cursor-pointer font-bold text-[13px] text-rose-500 hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600"
            >
              <Trash2 className="w-4 h-4" /> Borrar todos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
            <TabsTrigger value="active">Próximos</TabsTrigger>
            <TabsTrigger value="past">Pasados</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeTickets.length > 0 ? (
              activeTickets.map(({ id, events, quantity, purchase_date }) => (
                <Card
                  key={id}
                  className="overflow-hidden border-none shadow-md bg-card group cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
                  onClick={() => navigate(`/ticket/${id}`)}
                >
                  <div className="flex">
                    <div className="w-24 bg-primary/10 flex flex-col items-center justify-center p-2 border-r border-dashed border-border relative">
                      {/* Notch effects for ticket look */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-background rounded-full"></div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-background rounded-full"></div>

                      <span className="text-2xl mb-1">{events.emoji}</span>
                      <QrCode className="w-8 h-8 text-primary/40" />
                    </div>

                    <CardContent className="flex-1 p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm line-clamp-1">{events.title}</h3>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">x{quantity}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px]">{new Date(events.event_date || events.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] line-clamp-1">{events.location}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between items-center">
                        <p className="text-[9px] text-muted-foreground italic">Comprado el {new Date(purchase_date).toLocaleDateString()}</p>
                        <button className="text-[10px] font-bold text-primary group-hover:underline">Ver QR</button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-400 via-fuchsia-500 to-rose-500 rounded-[32px] blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-gradient-to-br from-violet-500 via-fuchsia-600 to-rose-500 rounded-[35px] shadow-2xl shadow-fuchsia-500/40 flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-700 group cursor-pointer">
                    <Ticket className="w-14 h-14 text-white animate-bounce drop-shadow-lg" />
                    <Sparkles className="absolute -top-3 -right-3 w-10 h-10 text-yellow-300 animate-spin-slow" />
                    <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 rotate-12 group-hover:rotate-0 transition-transform">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">¿Aún sin planes?</h3>
                <p className="text-slate-500 text-[16px] font-medium leading-relaxed max-w-[280px] mx-auto mb-10">
                  No tienes tickets activos por ahora. ¡Descubre los eventos más emocionantes y consigue los tuyos!
                </p>

                <Button
                  onClick={() => navigate('/')}
                  className="w-full max-w-xs h-16 rounded-[24px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-fuchsia-500/30 active:scale-95 transition-all hover:shadow-fuchsia-500/50 group border-none"
                >
                  Explorar Eventos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastTickets.length > 0 ? (
              <div className="space-y-4 opacity-70 grayscale-[0.3]">
                {pastTickets.map(({ id, events, quantity, purchase_date }) => (
                  <Card key={id} className="overflow-hidden border-none shadow-sm bg-slate-50/50">
                    <CardContent className="p-0 flex h-32">
                      <div className="w-24 bg-slate-200 flex flex-col items-center justify-center gap-2 relative">
                        <span className="text-xl opacity-50">{events.emoji}</span>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Expirado</div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-600 line-clamp-1">{events.title}</h3>
                          <p className="text-[10px] text-slate-400">{new Date(events.event_date || events.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-[9px] text-slate-400 italic">ID: {id.slice(0,8)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 rounded-[32px] blur-2xl opacity-20"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[32px] flex items-center justify-center shadow-inner overflow-hidden border border-slate-200">
                    <Ticket className="w-10 h-10 text-slate-300 -rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-500/20 mix-blend-overlay"></div>
                    <Sparkles className="absolute top-2 right-2 w-6 h-6 text-amber-400/40" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sin historial</h3>
                <p className="text-slate-500 text-[15px] mt-3 font-medium max-w-[220px] leading-relaxed">Aquí aparecerán tus entradas de eventos que ya han finalizado.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTicketsPage;
