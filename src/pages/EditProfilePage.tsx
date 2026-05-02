import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { allCategories, categoryEmojis } from '@/data/mockData';
import { Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: ''
  });

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

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
          bio: profile?.bio || user.user_metadata?.bio || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || ''
        });

        if (profile?.preferences) {
          setSelectedPreferences(profile.preferences);
        } else if (user.user_metadata?.preferences) {
          setSelectedPreferences(user.user_metadata.preferences);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const togglePreference = (category: string) => {
    if (selectedPreferences.includes(category)) {
      setSelectedPreferences(selectedPreferences.filter(c => c !== category));
    } else {
      setSelectedPreferences([...selectedPreferences, category]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      // 1. Save EVERYTHING to the profiles table (source of truth for ProfilePage)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          preferences: selectedPreferences,
          tags: selectedPreferences, // Keep tags in sync for backward compatibility
          location: formData.location,
          phone: formData.phone,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error('Error saving to profiles:', profileError);
        throw new Error('No se pudo actualizar el perfil en la base de datos');
      }

      // 2. Also update user_metadata for session consistency
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.full_name, 
          avatar_url: formData.avatar_url,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          preferences: selectedPreferences
        }
      });

      if (authError) throw authError;

      // Dispatch event for ProfilePage to refresh
      window.dispatchEvent(new Event('profile-updated'));

      toast.success('Perfil actualizado correctamente');
      
      // Force a small delay before navigating to allow DB to propagate (optional but helpful)
      setTimeout(() => navigate(-1), 500);
    } catch (error: any) {
      console.error('Save error:', error);
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

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Biografía</Label>
            <textarea 
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos un poco sobre ti..."
              rows={4}
              className="w-full p-4 rounded-xl bg-secondary/50 border-transparent focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none transition-all"
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Tus Intereses
            </Label>
            <span className="text-[10px] font-bold text-primary">Mín. 3</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {allCategories.map((category) => (
              <motion.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePreference(category)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedPreferences.includes(category)
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-lg">{categoryEmojis[category]}</span>
                <span className="text-[11px] font-bold capitalize">{category}</span>
                {selectedPreferences.includes(category) && (
                  <Check className="w-3.5 h-3.5 ml-auto" />
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="pt-2">
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${Math.min((selectedPreferences.length / 3) * 100, 100)}%` }}
                className={`h-full ${selectedPreferences.length >= 3 ? 'bg-green-500' : 'bg-primary'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
