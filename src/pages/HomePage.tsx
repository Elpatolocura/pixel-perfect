import { useState } from 'react';
import { mockEvents, categoryEmojis, allCategories } from '@/data/mockData';
import EventCard from '@/components/EventCard';
import CategoryChip from '@/components/CategoryChip';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const featured = mockEvents.slice(0, 1)[0];
  const upcoming = mockEvents.slice(1, 5);
  const nearby = mockEvents.slice(3, 7);

  return (
    <div className="pb-24 px-5 pt-safe">
      {/* Header */}
      <div className="flex justify-between items-center pt-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hola, María</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Descubre eventos increíbles</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
          <span className="text-lg">🔔</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-border mb-6">
        <span className="text-muted-foreground">🔍</span>
        <span className="text-muted-foreground text-sm">Buscar eventos, artistas...</span>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        <CategoryChip
          label="Todos"
          active={activeCategory === 'todos'}
          onClick={() => setActiveCategory('todos')}
        />
        {allCategories.slice(0, 5).map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            emoji={categoryEmojis[cat]}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <div className="mb-6">
          <EventCard event={featured} variant="large" />
        </div>
      )}

      {/* Upcoming */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Próximamente</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} variant="small" />
          ))}
        </div>
      </div>

      {/* Nearby */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Cerca de ti</h2>
        <div className="space-y-4">
          {nearby.map((event) => (
            <EventCard key={event.id} event={event} variant="large" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
