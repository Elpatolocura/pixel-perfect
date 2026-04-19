import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    avatar_url: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const user = session.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setFormData({
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || profile?.phone || '',
          location: user.user_metadata?.location || profile?.location || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Usar FileReader para mostrar y guardar la imagen en Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      toast.success('Foto actualizada (Recuerda guardar)');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      // 1. Intentamos guardar en profiles si es posible
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        });
      
      if (profileError && !profileError.message.includes('column')) {
        console.warn('Error saving to profiles:', profileError);
      }

      // 2. Guardamos TODO en user_metadata para evitar problemas de esquema con location/phone
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.full_name, 
          avatar_url: formData.avatar_url,
          phone: formData.phone,
          location: formData.location
        }
      });

      if (authError) throw authError;

      toast.success('Perfil actualizado correctamente');
      navigate(-1);
    } catch (error: any) {
      toast.error('Error al actualizar el perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Información Personal</h1>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="sm"
          className="rounded-xl px-4 gap-2 font-bold"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar
        </Button>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <input 
            type="file" 
            id="avatar-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
          <div 
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className="relative w-28 h-28 rounded-full bg-secondary border-4 border-background shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group"
          >
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 flex justify-center group-hover:bg-black/60 transition-colors">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium">Toca para cambiar la foto</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent text-muted-foreground cursor-not-allowed opacity-70"
              />
            </div>
            <p className="text-[10px] text-muted-foreground px-1">El correo no se puede cambiar por seguridad.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ubicación (Ciudad)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej. Ciudad de México"
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
