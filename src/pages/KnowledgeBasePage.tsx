import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, BookOpen, CreditCard, User, 
  ShieldCheck, Zap, ChevronRight, Star, Bookmark, HelpCircle,
  FileText, Clock, ThumbsUp, MessageSquare, Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const KnowledgeBasePage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'category' | 'article'>('home');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const categories = [
    { 
      id: 'first-steps',
      icon: <Star className="w-6 h-6 text-amber-500" />, 
      title: "Primeros Pasos", 
      count: 12, 
      color: "bg-amber-500/10",
      articles: [
        { title: "¿Cómo crear mi cuenta?", content: "Para crear tu cuenta, pulsa en el botón de perfil y selecciona 'Registrarse'. Necesitarás un correo válido o una cuenta de Google." },
        { title: "Personaliza tu perfil", content: "Ve a Ajustes > Perfil para cambiar tu foto, nombre y preferencias de eventos." },
        { title: "Navegando por el mapa", content: "Usa la pestaña Explorar para ver eventos cerca de ti en tiempo real." }
      ]
    },
    { 
      id: 'payments',
      icon: <CreditCard className="w-6 h-6 text-emerald-500" />, 
      title: "Pagos y Reembolsos", 
      count: 8, 
      color: "bg-emerald-500/10",
      articles: [
        { title: "¿Cómo descargar mi ticket PDF?", content: "Una vez realizada la compra, ve a 'Mis Tickets' y pulsa en el botón de descarga. También lo recibirás en tu correo." },
        { title: "Métodos de pago aceptados", content: "Aceptamos tarjetas Visa, Mastercard, Apple Pay y Google Pay." },
        { title: "Política de reembolsos", content: "Los reembolsos se procesan automáticamente si el evento es cancelado. Para otros casos, contacta al organizador." }
      ]
    },
    { 
      id: 'account',
      icon: <User className="w-6 h-6 text-blue-500" />, 
      title: "Gestión de Cuenta", 
      count: 15, 
      color: "bg-blue-500/10",
      articles: [
        { title: "Cambiar contraseña", content: "En Ajustes > Seguridad puedes actualizar tu contraseña actual." },
        { title: "Vincular redes sociales", content: "Conecta tu Instagram o Spotify para recibir recomendaciones personalizadas." }
      ]
    },
    { 
      id: 'security',
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />, 
      title: "Seguridad y Privacidad", 
      count: 6, 
      color: "bg-rose-500/10",
      articles: [
        { title: "Verificación en dos pasos", content: "Añade una capa extra de seguridad vinculando tu número de teléfono." },
        { title: "¿Cómo reportar un evento?", content: "Si ves algo sospechoso, pulsa en los tres puntos del evento y selecciona 'Reportar'." }
      ]
    },
  ];

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    setView('category');
    window.scrollTo(0, 0);
  };

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => handleCategoryClick(cat)}
            className="bg-card p-6 rounded-[32px] border border-border shadow-sm hover:shadow-xl transition-all text-left group"
          >
            <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <h3 className="font-bold text-foreground text-sm mb-1">{cat.title}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{cat.count} Artículos</p>
          </button>
        ))}
      </div>

      {/* Popular Articles - Redesigned to be more attractive */}
      <section>
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary fill-primary animate-pulse" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Tendencias Ahora</h2>
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">Actualizado</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: "¿Cómo descargar mi ticket PDF?", icon: <FileText className="w-5 h-5" />, tag: "TOP", color: "text-blue-500 bg-blue-500/10" },
            { title: "¿Puedo transferir mi entrada?", icon: <Users className="w-5 h-5" />, tag: "POPULAR", color: "text-purple-500 bg-purple-500/10" },
            { title: "Métodos de pago aceptados", icon: <CreditCard className="w-5 h-5" />, tag: "INFO", color: "text-emerald-500 bg-emerald-500/10" },
          ].map((article, idx) => (
            <button 
              key={idx}
              onClick={() => handleArticleClick(categories[1].articles[idx % categories[1].articles.length])}
              className="group flex items-center gap-4 p-5 bg-card rounded-[32px] border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left animate-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${article.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                {article.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${article.color} uppercase tracking-wider`}>
                    {article.tag}
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-foreground/80 group-hover:text-primary transition-colors truncate">
                  {article.title}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30 group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCategory = () => (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
      <div className="space-y-3">
        {selectedCategory.articles.map((article: any, idx: number) => (
          <button 
            key={idx}
            onClick={() => handleArticleClick(article)}
            className="w-full flex items-center gap-4 p-5 bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <span className="flex-1 text-[14px] font-bold text-foreground/80 group-hover:text-foreground transition-colors">{article.title}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderArticle = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm space-y-8">
        <div className="flex items-center gap-4 py-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-secondary px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> 2 min
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-secondary px-3 py-1.5 rounded-full">
            <User className="w-3.5 h-3.5" /> Equipo Eventia
          </div>
        </div>

        <div className="prose prose-slate prose-sm max-w-none">
          <p className="text-muted-foreground leading-relaxed text-[15px] font-medium">
            {selectedArticle.content}
          </p>
          <p className="text-muted-foreground leading-relaxed text-[15px] font-medium mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[32px] p-8 space-y-6 text-center shadow-xl shadow-slate-900/10">
        <h4 className="font-bold text-white text-sm uppercase tracking-widest">¿Fue útil este artículo?</h4>
        <div className="flex justify-center gap-4">
          <Button variant="ghost" className="rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/10" onClick={() => toast.success('¡Gracias por tu feedback!')}>
            <ThumbsUp className="w-4 h-4 mr-2" /> Sí
          </Button>
          <Button variant="ghost" className="rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/10" onClick={() => toast.info('Contactando a soporte...')}>
            <MessageSquare className="w-4 h-4 mr-2" /> No
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      {/* Dynamic Header */}
      <div className="bg-slate-900 pt-12 pb-20 px-6 relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <button 
            onClick={() => view === 'home' ? navigate('/support') : setView('home')} 
            className="mb-8 p-2.5 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            {view === 'category' && (
              <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-primary/20 backdrop-blur-sm">
                <FileText className="w-3 h-3" />
                {selectedCategory.count} artículos
              </div>
            )}
            <h1 className="text-3xl font-black text-white mb-2 leading-tight">
              {view === 'home' ? 'Base de Conocimientos' : view === 'category' ? selectedCategory.title : selectedArticle.title}
            </h1>
            <p className="text-slate-400 text-sm font-medium mb-8">
              {view === 'home' ? 'Encuentra guías y tutoriales para usar Eventia.' : 
               view === 'category' ? 'Explora las soluciones y guías de esta sección.' : 
               'Detalles y pasos a seguir para resolver tu duda.'}
            </p>
          </div>
          
          {view === 'home' && (
            <div className="relative animate-in zoom-in-95 duration-500">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar guías, artículos..." 
                className="pl-12 h-16 rounded-[24px] border-none bg-card text-foreground shadow-2xl shadow-black/20"
                onChange={(e) => e.target.value.length > 2 && toast.info(`Buscando: ${e.target.value}...`)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-6 -mt-10 max-w-2xl mx-auto space-y-8 relative z-20">
        {view === 'home' && renderHome()}
        {view === 'category' && renderCategory()}
        {view === 'article' && renderArticle()}

        {/* Global Help Banner - Only on home/category */}
        {view !== 'article' && (
          <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 text-center space-y-4">
            <HelpCircle className="w-10 h-10 text-primary mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">¿No encuentras lo que buscas?</h3>
              <p className="text-[12px] text-muted-foreground font-medium">Nuestro equipo está disponible para ayudarte.</p>
            </div>
            <button 
              onClick={() => navigate('/support')}
              className="text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:underline"
            >
              Contactar ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
