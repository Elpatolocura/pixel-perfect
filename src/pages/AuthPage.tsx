import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        // Para facilitar el uso del prototipo, si la cuenta no existe intentamos crearla
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          if (signUpError.message.includes('already registered') || signUpError.message.includes('User already exists')) {
            toast.error('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
          } else {
            toast.error('Error: Verifica tus credenciales o crea una cuenta nueva.');
          }
        } else if (signUpData.user) {
          toast.success('¡Cuenta creada automáticamente! Bienvenido.');
          navigate('/onboarding');
        }
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('¡Bienvenido de nuevo!');
      navigate('/profile');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Al registrarse, pasamos el nombre completo en los metadatos
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      // Intentamos crear el perfil manualmente por si el trigger falló
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
      });

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        // No bloqueamos el flujo, pero avisamos
      }
      
      toast.success('¡Cuenta creada! Personalicemos tu perfil.');
      navigate('/onboarding');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center animate-fade-in pb-24">

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">EVENTIA</h1>
          <p className="text-muted-foreground">Tu puerta a los mejores eventos locales</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Crear Cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Bienvenido</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder a tu perfil.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="tu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <button 
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Entrar'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Únete a Eventia</CardTitle>
                <CardDescription>
                  Crea tu cuenta para empezar a descubrir y crear eventos.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre Completo</Label>
                    <Input 
                      id="signup-name" 
                      placeholder="Juan Pérez" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Correo Electrónico</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="tu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Registrarse'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
