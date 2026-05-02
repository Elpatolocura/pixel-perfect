import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EventCard from '@/components/EventCard';
import CategoryChip from '@/components/CategoryChip';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/hooks/useLocation';

const ExplorePage = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(() => sessionStorage.getItem('explore_query') || '');
  const [activeCategory, setActiveCategory] = useState<string>(() => sessionStorage.getItem('explore_category') || 'todos');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude, calculateDistance } = useLocation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Save state
  useEffect(() => {
    sessionStorage.setItem('explore_query', query);
  }, [query]);

  useEffect(() => {
    sessionStorage.setItem('explore_category', activeCategory);
  }, [activeCategory]);

  // Restore scroll
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('explore_scroll');
    if (savedScroll && !loading && events.length > 0) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
    }
  }, [loading, events]);

  // Save scroll on change
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem('explore_scroll', window.scrollY.toString());
      }, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  let filtered = events.filter((e) => {
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase()) || (e.tags && e.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase())));
    const matchCategory = activeCategory === 'todos' || (e.category && e.category.toLowerCase() === activeCategory.toLowerCase());
    return matchQuery && matchCategory;
  });

  if (latitude && longitude) {
    filtered = filtered.map((e) => {
      if (e.latitude && e.longitude) {
        return { ...e, distance_km: calculateDistance(latitude, longitude, e.latitude, e.longitude) };
      }
      return { ...e, distance_km: 999999 };
    }).sort((a, b) => a.distance_km - b.distance_km);
  }

  const allCategories = [
    { id: 'música', label: t('home.categories.music'), emoji: '🎵' },
    { id: 'arte', label: t('home.categories.art'), emoji: '🎨' },
    { id: 'gastronomía', label: t('home.categories.food'), emoji: '🍕' },
    { id: 'deportes', label: t('home.categories.sports'), emoji: '⚽' },
    { id: 'tech', label: t('home.categories.tech'), emoji: '💻' },
    { id: 'cultura', label: t('home.categories.culture'), emoji: '📚' },
    { id: 'fiesta', label: t('home.categories.party'), emoji: '🎉' },
    { id: 'bienestar', label: t('home.categories.wellness'), emoji: '🧘' },
  ];

  return (
    <div className="pb-24 px-5 pt-safe">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t('explore.title')}</h1>
        <div className="bg-card rounded-2xl px-4 py-3 flex items-center gap-3 border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('home.search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        <CategoryChip label={t('home.categories.all')} active={activeCategory === 'todos'} onClick={() => setActiveCategory('todos')} />
        {allCategories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.label}
            emoji={cat.emoji}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm font-medium">{t('explore.loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted-foreground text-sm">{t('explore.no_events')}</p>
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard key={event.id} event={event} variant="large" />
          ))
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
