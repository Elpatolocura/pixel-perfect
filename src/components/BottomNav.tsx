import { Home, Search, MessageCircle, User, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/explore', icon: Search, label: 'Explorar' },
  { path: '/create', icon: Plus, label: 'Crear' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 pb-safe">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const isCreate = tab.path === '/create';
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isCreate
                  ? ''
                  : isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {isCreate ? (
                <div className="w-11 h-11 rounded-2xl bg-foreground flex items-center justify-center -mt-4 shadow-lg">
                  <Plus className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
