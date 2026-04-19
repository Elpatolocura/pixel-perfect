import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Se ha enviado un enlace a tu correo electrónico.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center animate-fade-in pb-24">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-4 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">EVENTIA</h1>
          <p className="text-muted-foreground">Recupera el acceso a tu cuenta</p>
        </div>

        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetRequest}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
              <button 
                type="button"
                onClick={() => navigate('/auth')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
