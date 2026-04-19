-- Tabla de Eventos (events)
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL, -- Puede ser TIMESTAMP, pero usamos TEXT para el prototipo según HomePage
    time TEXT NOT NULL,
    price TEXT DEFAULT 'Gratis',
    location TEXT NOT NULL,
    description TEXT,
    image TEXT,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_name TEXT,
    attendees_count INTEGER DEFAULT 0,
    amenities JSONB DEFAULT '[]'::jsonb
);

-- Habilitar Seguridad a Nivel de Fila (RLS) para events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para events
-- Cualquiera puede ver los eventos
CREATE POLICY "Eventos son visibles para todos" 
ON public.events FOR SELECT USING (true);

-- Solo los usuarios autenticados pueden crear eventos
CREATE POLICY "Usuarios autenticados pueden crear eventos" 
ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Solo el organizador puede editar su evento
CREATE POLICY "Organizadores pueden editar sus propios eventos" 
ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

-- Solo el organizador puede eliminar su evento
CREATE POLICY "Organizadores pueden eliminar sus propios eventos" 
ON public.events FOR DELETE USING (auth.uid() = organizer_id);


-- Tabla de Favoritos (favorites)
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(user_id, event_id) -- Un usuario no puede guardar el mismo evento dos veces
);

-- RLS para favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propios favoritos" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden añadir favoritos" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden quitar favoritos" ON public.favorites FOR DELETE USING (auth.uid() = user_id);


-- Tabla de Tickets (tickets)
CREATE TABLE public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled'))
);

-- RLS para tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propios tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden comprar tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir a la base de datos almacenar el perfil (opcional, si no existe la tabla profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfiles publicos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios actualizan su perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insertar perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
