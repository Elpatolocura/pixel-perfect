import { Home, Heart, PlusSquare, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  // List of paths where the BottomNav should NOT be visible
  const hideOnPaths = [
    '/event',
    '/support',
    '/knowledge-base',
    '/checkout',
    '/auth',
    '/welcome',
    '/onboarding',
    '/chat/',
    '/settings',
    '/premium',
    '/subscribe',
    '/my-events',
    '/notifications',
    '/ticket',
    '/profile/following',
    '/profile/followers'
  ];

  // Check if current path starts with any of the hidden paths
  const shouldHide = hideOnPaths.some(p => path.startsWith(p));

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 pb-8">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/' ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home className={`w-6 h-6 ${path === '/' ? 'fill-slate-900' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
        </Link>
        
        <Link 
          to="/favorites" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/favorites' ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Heart className={`w-6 h-6 ${path === '/favorites' ? 'fill-slate-900' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Favoritos</span>
        </Link>

        <Link 
          to="/create" 
          className="flex items-center justify-center w-14 h-14 bg-slate-100 rounded-[22px] -mt-10 shadow-xl shadow-slate-200 border-4 border-white transition-all active:scale-90 hover:bg-slate-900 group"
        >
          <PlusSquare className="w-6 h-6 text-slate-900 group-hover:text-white" />
        </Link>

        <Link 
          to="/chat" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/chat' ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MessageCircle className={`w-6 h-6 ${path === '/chat' ? 'fill-slate-900' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
        </Link>

        <Link 
          to="/profile" 
          className={`flex flex-col items-center gap-1 transition-all ${path === '/profile' ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User className={`w-6 h-6 ${path === '/profile' ? 'fill-slate-900' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Perfil</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
