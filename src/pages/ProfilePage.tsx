import { currentUser, mockTickets, mockEvents } from '@/data/mockData';
import { Settings, Ticket, Heart, CalendarDays, ChevronRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const ticketEvents = mockTickets
    .filter((t) => t.status === 'active')
    .map((t) => ({ ...t, event: mockEvents.find((e) => e.id === t.eventId)! }));

  const menuItems = [
    { icon: Ticket, label: 'Mis Tickets', count: mockTickets.length, path: '/tickets' },
    { icon: Heart, label: 'Favoritos', count: mockEvents.filter(e => e.isFavorite).length, path: '/favorites' },
    { icon: CalendarDays, label: 'Mis Eventos', count: 0, path: '/my-events' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <div className="pb-24 px-5 pt-safe">
      <div className="pt-6 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-2xl">👩</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground text-lg">{currentUser.name}</h2>
              {currentUser.role === 'premium' && (
                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{currentUser.ticketCount}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Tickets</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{mockEvents.filter(e => e.isFavorite).length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Favoritos</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{currentUser.eventsCreated}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Creados</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-secondary ${
              i < menuItems.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
            {item.count !== undefined && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{item.count}</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Active tickets preview */}
      {ticketEvents.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Tickets activos</h3>
          <div className="space-y-3">
            {ticketEvents.map(({ id, event, quantity }) => (
              <div
                key={id}
                className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {event.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })} · {quantity} ticket{quantity > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-lg">Activo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
