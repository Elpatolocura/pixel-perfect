import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Rocket, Check, CreditCard, ShieldCheck, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const SubscriptionCheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Record<string, any> = {
    'all_access': {
      name: 'Acceso Total',
      price: 9.99,
      icon: Crown,
      color: 'bg-indigo-600',
      gradient: 'from-indigo-500 to-indigo-700',
      features: t('premium.plans.all_access.features', { returnObjects: true })
    }
  };

  const plan = plans[planId || 'all_access'] || plans['all_access'];
  const price = billingCycle === 'monthly' ? plan.price : (plan.price * 10).toFixed(2);
  const Icon = plan.icon;

  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('checkout.login_required'));
        navigate('/auth');
        return;
      }

      // Insert subscription into database
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: plan.name,
          status: 'active',
          price_paid: parseFloat(price as string),
          billing_period: billingCycle,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      localStorage.setItem('user_membership', plan.name);
      toast.success(`¡Felicidades! Ahora eres miembro ${plan.name}.`);
      
      // Si el plan es Acceso Total, ir a crear evento, si no al inicio
      setTimeout(() => {
        if (plan.name === 'Acceso Total') {
          navigate('/create-event');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(t('checkout.error'));
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in font-sans">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-background border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-foreground tracking-tight">{t('subscription.title')}</h1>
        <div className="w-9"></div>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-8">
        {/* Subscription Plan Summary */}
        <div className={`rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl bg-gradient-to-br ${plan.gradient}`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 backdrop-blur-md">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-black text-2xl leading-tight">Plan {plan.name}</h2>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{t('subscription.premium_membership')}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {plan.features.map((feat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="bg-white/20 rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{feat}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-white/20 flex items-end justify-between">
              <span className="text-sm font-medium opacity-80">{t('checkout.total_to_pay')}</span>
              <div className="text-right">
                <span className="text-3xl font-black">${price}</span>
                <span className="text-sm opacity-80 font-medium">/{billingCycle === 'monthly' ? t('subscription.billing.per_month') : t('subscription.billing.per_year')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="bg-card rounded-3xl p-2 border border-border flex shadow-sm">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${billingCycle === 'monthly' ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            {t('subscription.billing.monthly')}
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${billingCycle === 'yearly' ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            {t('subscription.billing.yearly')} <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">{t('subscription.billing.save')}</span>
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-card rounded-[32px] p-6 border border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-foreground">{t('subscription.payment_data')}</h3>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">{t('subscription.card_name')}</label>
              <input type="text" placeholder="Ej. Juan Pérez" className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">{t('subscription.card_number')}</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">{t('subscription.expiry')}</label>
                <input type="text" placeholder="MM/AA" className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-foreground" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">{t('subscription.cvc')}</label>
                <input type="text" placeholder="123" className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-foreground" />
              </div>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-muted-foreground mt-4 px-4 leading-relaxed">
            {t('subscription.auto_renew')}
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/90 backdrop-blur-xl border-t border-border z-50 flex justify-center">
        <Button 
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className={`w-full max-w-lg rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 disabled:opacity-50`}
        >
          {isSubscribing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t('subscription.subscribe_for', { price })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionCheckoutPage;
