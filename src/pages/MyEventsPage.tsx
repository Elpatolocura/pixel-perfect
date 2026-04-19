import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, MoreVertical, Edit2, Trash2, ExternalLink, Rocket, Lock } from 'lucide-react';
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
  // Por ahora mostramos un arreglo vacío para demostrar el estado
  const myEvents: any[] = [];

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
                    <span className="text-[10px] font-medium">{new Date(event.event_date || event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
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
          <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] rotate-6 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] -rotate-3 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 bg-white text-indigo-600 rounded-full p-2.5 shadow-lg animate-bounce">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-2">Conviértete en Organizador</h3>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
              Para poder crear y administrar tus propios eventos, necesitas tener una suscripción a la membresía <span className="font-bold text-indigo-600">Business</span>.
            </p>

            <Button
              onClick={() => navigate('/premium')}
              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/30"
            >
              Ver Planes de Membresía
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
