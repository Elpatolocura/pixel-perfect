import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { allCategories, categoryEmojis } from '@/data/mockData';
import { Check, User, Users } from 'lucide-react';

const OnboardingPage = () => {
  const [loading, setLoading] = useState(false);
  const [entryType, setEntryType] = useState<'gratis' | 'pago' | 'ambas'>('ambas');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();

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
      toast.error('Por favor, selecciona al menos 3 categorías');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Intentamos guardar los datos en la tabla profiles
      const { error } = await supabase.from('profiles').update({
        role: 'user', // Rol por defecto
        preferences: selectedCategories,
        // Aquí podríamos guardar el tipo de entrada si añadimos la columna, 
        // por ahora lo manejaremos como metadatos o lo ignoramos si la tabla no tiene la columna
      }).eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Error: Asegúrate de haber creado las tablas en Supabase con el SQL Editor.');
      } else {
        toast.success('¡Perfil completado!');
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center animate-fade-in pb-24">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Personaliza tu Experiencia</h1>
          <p className="text-muted-foreground">Queremos conocerte mejor para mostrarte los mejores eventos</p>
        </div>

        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle>Paso Final</CardTitle>
            <CardDescription>Completa tu información para empezar</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Entry Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-foreground">¿Qué tipo de eventos buscas?</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'gratis', label: 'Gratis', emoji: '🎁' },
                  { id: 'pago', label: 'De pago', emoji: '🎟️' },
                  { id: 'ambas', label: 'Ambas', emoji: '✨' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setEntryType(option.id as any)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      entryType === option.id 
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                        : 'border-border bg-background hover:border-primary/50 text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span className="font-bold text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-base font-semibold text-foreground">Tus intereses</Label>
                <span className={`text-[10px] font-medium ${selectedCategories.length >= 3 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {selectedCategories.length} seleccionados (mín. 3)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      selectedCategories.includes(category)
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {selectedCategories.includes(category) && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <span className="text-2xl mb-1">{categoryEmojis[category]}</span>
                    <span className="text-[10px] capitalize">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-muted/30 border-t border-border">
            <Button 
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20" 
              onClick={handleComplete}
              disabled={loading || selectedCategories.length < 3}
            >
              {loading ? 'Guardando...' : 'Comenzar mi aventura'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
