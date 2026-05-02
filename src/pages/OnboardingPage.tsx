import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { allCategories, categoryEmojis } from '@/data/mockData';
import { Check, Sparkles, LayoutGrid, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingPage = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [entryType, setEntryType] = useState<'gratis' | 'pago' | 'ambas'>('ambas');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleComplete = async () => {
    if (selectedCategories.length < 3) {
      toast.error(t('onboarding.selected', { count: selectedCategories.length }));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const profileData = {
        id: user.id,
        preferences: selectedCategories,
        preferred_entry_type: entryType,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      toast.success(t('common.success'));
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(t('common.error'));
      // Fallback navigation
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 -z-10" />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -z-10"
      />
      
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2"
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">{t('onboarding.title')}</h1>
                <p className="text-muted-foreground text-lg">{t('onboarding.subtitle')}</p>
              </div>

              <Card className="p-8 border-none shadow-2xl bg-card/80 backdrop-blur-xl rounded-[32px] border border-border/50">
                <div className="space-y-6">
                  <Label className="text-lg font-bold text-foreground block text-center mb-6">
                    {t('onboarding.search_type')}
                  </Label>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'gratis', label: t('onboarding.free'), emoji: '🎁', desc: 'Eventos sin costo alguno' },
                      { id: 'pago', label: t('onboarding.paid'), emoji: '🎟️', desc: 'Experiencias exclusivas' },
                      { id: 'ambas', label: t('onboarding.both'), emoji: '✨', desc: 'Lo mejor de ambos mundos' }
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEntryType(option.id as any)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${entryType === option.id
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                            : 'border-border bg-background/50 hover:border-primary/30'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${entryType === option.id ? 'bg-primary text-white' : 'bg-secondary'}`}>
                          {option.emoji}
                        </div>
                        <div className="flex-1">
                          <span className={`font-bold block ${entryType === option.id ? 'text-primary' : 'text-foreground'}`}>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.desc}</span>
                        </div>
                        {entryType === option.id && <Check className="w-5 h-5 text-primary" />}
                      </motion.button>
                    ))}
                  </div>
                  
                  <Button
                    className="w-full h-14 text-lg font-black rounded-2xl mt-4 shadow-xl shadow-primary/20"
                    onClick={() => setStep(2)}
                  >
                    Continuar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-foreground">Tus Intereses</h1>
                <p className="text-muted-foreground text-lg">Elige al menos 3 categorías para personalizar tu feed</p>
              </div>

              <Card className="p-8 border-none shadow-2xl bg-card/80 backdrop-blur-xl rounded-[32px] border border-border/50">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allCategories.map((category) => (
                      <motion.button
                        key={category}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleCategory(category)}
                        className={`group relative flex flex-col items-center justify-center p-5 rounded-[24px] border-2 transition-all aspect-square ${selectedCategories.includes(category)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background/50 hover:border-primary/20'
                          }`}
                      >
                        <motion.span 
                          animate={{ scale: selectedCategories.includes(category) ? 1.2 : 1 }}
                          className="text-3xl mb-2"
                        >
                          {categoryEmojis[category]}
                        </motion.span>
                        <span className={`text-[11px] font-black uppercase tracking-widest text-center ${selectedCategories.includes(category) ? 'text-primary' : 'text-muted-foreground'}`}>
                          {category}
                        </span>
                        
                        <AnimatePresence>
                          {selectedCategories.includes(category) && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1 shadow-lg"
                            >
                              <Check className="w-3 h-3" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-muted-foreground font-medium">Categorías seleccionadas</span>
                      <span className={`font-black ${selectedCategories.length >= 3 ? 'text-green-500' : 'text-primary'}`}>
                        {selectedCategories.length} / 3
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((selectedCategories.length / 3) * 100, 100)}%` }}
                        className={`h-full ${selectedCategories.length >= 3 ? 'bg-green-500' : 'bg-primary'}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="h-14 px-6 rounded-2xl font-bold"
                      onClick={() => setStep(1)}
                    >
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 gap-2"
                      onClick={handleComplete}
                      disabled={loading || selectedCategories.length < 3}
                    >
                      {loading ? <LayoutGrid className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                      {loading ? 'Preparando...' : 'Comenzar Aventura'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;

