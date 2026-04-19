import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageSquare, Ticket, Star, Info } from 'lucide-react';
import { mockNotifications } from '@/data/mockData';

const NotificationsPage = () => {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Star className="w-4 h-4 text-amber-500" />;
      case 'ticket': return <Ticket className="w-4 h-4 text-green-500" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Notificaciones</h1>
        </div>
        <button className="text-xs font-medium text-primary px-3 py-1 rounded-full hover:bg-primary/5">Marcar todo como leído</button>
      </div>

      <div className="divide-y divide-border">
        {mockNotifications.length > 0 ? (
          mockNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 flex gap-4 transition-colors hover:bg-secondary/30 ${!notif.read ? 'bg-primary/5' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                !notif.read ? 'bg-background shadow-sm border border-border/50' : 'bg-secondary'
              }`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-bold leading-tight ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {notif.message}
                </p>
              </div>
              
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-32 space-y-4 px-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">Todo al día</h3>
            <p className="text-muted-foreground text-sm">No tienes notificaciones pendientes por ahora.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
