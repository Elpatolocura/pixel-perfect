import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Shield, FileText, Scale, AlertCircle } from 'lucide-react';

const LegalPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/settings');

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-border">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-secondary transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Aviso Legal</h1>
      </div>

      <div className="p-6 space-y-10">
        {/* Intro */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black">Términos y Condiciones</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Última actualización: 18 de Abril, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">1. Términos de Servicio</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Al utilizar la plataforma Eventia, aceptas cumplir con nuestras normas comunitarias. El uso de la cuenta es personal e intransferible. Nos reservamos el derecho de suspender cuentas que infrinjan nuestras políticas de respeto y veracidad en la creación de eventos.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">2. Política de Cancelación</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Las suscripciones Premium pueden ser canceladas en cualquier momento desde los ajustes de perfil. La cancelación tendrá efecto al final del periodo de facturación actual. No se realizan reembolsos proporcionales por meses ya iniciados.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider">3. Privacidad de Datos</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tus datos están protegidos bajo el estándar RGPD. Solo compartimos la información estrictamente necesaria con los organizadores de eventos para la gestión de tus entradas y asistencia.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-10 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Para cualquier duda legal, puedes contactarnos en <span className="text-primary font-medium">legal@eventia.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
