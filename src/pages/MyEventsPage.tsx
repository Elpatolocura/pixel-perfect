import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { mockEvents } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const MyEventsPage = () => {
  const navigate = useNavigate();
  
  // En una app real, filtraríamos por organizer_id === user.id
  // Por ahora mostramos algunos mocks como si fueran nuestros
  const myEvents = mockEvents.slice(0, 2); 

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Mis Eventos</h1>
        </div>
        <Button size="sm" className="rounded-full gap-1.5 h-8 px-4" onClick={() => navigate('/create')}>
          <Plus className="w-4 h-4" /> Nuevo
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {myEvents.length > 0 ? (
          myEvents.map((event) => (
            <div key={event.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex group">
              <div className="w-32 h-32 bg-secondary flex items-center justify-center text-4xl border-r border-border shrink-0">
                {event.emoji}
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm truncate">{event.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-md hover:bg-secondary transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem className="gap-2 text-xs font-medium">
                        <Edit2 className="w-3.5 h-3.5" /> Editar Evento
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs font-medium">
                        <ExternalLink className="w-3.5 h-3.5" /> Ver Página
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs font-medium text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{event.attendees} / {event.maxAttendees} inscritos</span>
                  </div>
                </div>
                
                <div className="pt-2 flex gap-2">
                  <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-bold text-primary italic">
                    {Math.round((event.attendees / event.maxAttendees) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold">Aún no has creado eventos</h3>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Comparte tus experiencias con la comunidad de Eventia.</p>
            <Button onClick={() => navigate('/create')} variant="outline" className="rounded-full">Crear mi primer evento</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
