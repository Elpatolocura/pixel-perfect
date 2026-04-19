import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Zap, Shield, Star, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PremiumPage = () => {
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = React.useState<string | null>('Pro');

  const plans = [
    {
      id: 'Basic',
      name: 'Básico',
      price: 'Gratis',
      icon: Zap,
      description: 'Ideal para empezar a descubrir eventos.',
      features: [
        'Explora eventos locales ilimitados',
        'Chat básico de eventos',
        'Hasta 2 eventos creados',
        'Notificaciones estándar'
      ],
      color: 'border-slate-200 bg-slate-50',
      textColor: 'text-slate-600'
    },
    {
      id: 'Pro',
      name: 'Pro',
      price: '$9.99',
      period: '/mes',
      icon: Crown,
      description: 'Para los verdaderos amantes de la comunidad.',
      features: [
        'Todo lo del plan Básico',
        'Eventos ilimitados',
        'Badge de usuario Pro verificado',
        'Sin anuncios publicitarios',
        'Acceso prioritario a tickets VIP',
        'Soporte prioritario 24/7'
      ],
      color: 'border-amber-400 bg-amber-50/50 shadow-amber-200/20',
      textColor: 'text-amber-700',
      popular: true
    },
    {
      id: 'Business',
      name: 'Business',
      price: '$29.99',
      period: '/mes',
      icon: Rocket,
      description: 'La mejor opción para organizadores profesionales.',
      features: [
        'Todo lo del plan Pro',
        'Estadísticas avanzadas de asistentes',
        'Eventos destacados en el mapa (Top)',
        'Personalización total de tickets',
        'API de integración para externos',
        'Manager de cuenta dedicado'
      ],
      color: 'border-indigo-400 bg-indigo-50/50',
      textColor: 'text-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-all active:scale-90">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Membresías</h1>
      </div>

      {/* Hero condensed */}
      <div className="px-6 py-6 text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Elige tu Nivel</h2>
        <p className="text-muted-foreground text-[11px] max-w-xs mx-auto">
          Pulsa en un plan para desbloquear todos sus beneficios exclusivos.
        </p>
      </div>

      {/* Interactive Plans */}
      <div className="px-6 space-y-3">
        {plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          return (
            <div 
              key={plan.id}
              onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
              className={`relative rounded-3xl border-2 p-5 transition-all duration-300 cursor-pointer ${
                isExpanded ? `${plan.color} scale-[1.02] shadow-lg shadow-black/5` : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl transition-colors ${isExpanded ? 'bg-white shadow-sm' : 'bg-secondary'}`}>
                    <plan.icon className={`w-5 h-5 ${isExpanded ? plan.textColor : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      {plan.name}
                      {plan.popular && !isExpanded && (
                        <span className="text-[8px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter">POPULAR</span>
                      )}
                    </h3>
                    {!isExpanded && <p className="text-[10px] text-muted-foreground line-clamp-1">{plan.description}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black transition-all ${isExpanded ? 'text-lg' : 'text-sm'}`}>
                    {plan.price}
                    {plan.period && <span className="text-[10px] font-normal text-muted-foreground">{plan.period}</span>}
                  </p>
                </div>
              </div>

              {/* Expanded Content with smooth transition */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-5 border-t border-black/5 pt-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Beneficios incluidos:</p>
                    <div className="grid gap-2.5">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                          <div className="bg-green-500/20 rounded-full p-0.5 shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-[11px] font-medium leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.id === 'Basic') {
                        toast.info('Ya tienes el plan básico');
                      } else {
                        navigate(`/checkout/${plan.id}`);
                      }
                    }}
                    className={`w-full h-12 rounded-2xl font-black shadow-lg shadow-black/5 transition-all active:scale-95 ${
                      plan.id === 'Pro' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 
                      plan.id === 'Business' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-800 text-white'
                    }`}
                  >
                    Seleccionar {plan.name}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="px-6 py-10 mt-8 grid grid-cols-2 gap-4">
        <div className="bg-card p-5 rounded-3xl border border-border flex flex-col items-center text-center gap-2 shadow-sm">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[10px] font-bold">Pago 100% Seguro</p>
          <p className="text-[8px] text-muted-foreground">Encriptación SSL de 256 bits</p>
        </div>
        <div className="bg-card p-5 rounded-3xl border border-border flex flex-col items-center text-center gap-2 shadow-sm">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] font-bold">Garantía Eventia</p>
          <p className="text-[8px] text-muted-foreground">Soporte VIP inmediato</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
