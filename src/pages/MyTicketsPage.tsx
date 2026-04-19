import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Calendar, MapPin, QrCode } from 'lucide-react';
import { mockTickets, mockEvents } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  
  // En una app real, esto vendría de Supabase
  const activeTickets = mockTickets
    .filter(t => t.status === 'active')
    .map(t => ({ ...t, event: mockEvents.find(e => e.id === t.eventId)! }));
    
  const pastTickets = mockTickets
    .filter(t => t.status !== 'active')
    .map(t => ({ ...t, event: mockEvents.find(e => e.id === t.eventId)! }));

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Mis Tickets</h1>
      </div>

      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
            <TabsTrigger value="active">Próximos</TabsTrigger>
            <TabsTrigger value="past">Pasados</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeTickets.length > 0 ? (
              activeTickets.map(({ id, event, quantity, purchaseDate }) => (
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
                      
                      <span className="text-2xl mb-1">{event.emoji}</span>
                      <QrCode className="w-8 h-8 text-primary/40" />
                    </div>
                    
                    <CardContent className="flex-1 p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm line-clamp-1">{event.title}</h3>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">x{quantity}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px]">{new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-between items-center">
                        <p className="text-[9px] text-muted-foreground italic">Comprado el {new Date(purchaseDate).toLocaleDateString()}</p>
                        <button className="text-[10px] font-bold text-primary group-hover:underline">Ver QR</button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Ticket className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No tienes tickets activos.</p>
                <button onClick={() => navigate('/explore')} className="text-primary font-bold">Explorar eventos</button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="opacity-60 grayscale-[0.5]">
             {/* Similar structure for past tickets */}
             <div className="text-center py-20">
               <p className="text-muted-foreground">No hay historial de tickets.</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTicketsPage;
