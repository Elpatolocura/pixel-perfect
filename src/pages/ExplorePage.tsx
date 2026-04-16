import { useState } from 'react';
import { mockEvents, categoryEmojis, allCategories } from '@/data/mockData';
import EventCard from '@/components/EventCard';
import CategoryChip from '@/components/CategoryChip';
import { Search } from 'lucide-react';

const ExplorePage = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const filtered = mockEvents.filter((e) => {
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.tags.some(t => t.includes(query.toLowerCase()));
    const matchCategory = activeCategory === 'todos' || e.category === activeCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="pb-24 px-5 pt-safe">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Explorar</h1>
        <div className="bg-card rounded-2xl px-4 py-3 flex items-center gap-3 border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar eventos, artistas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        <CategoryChip label="Todos" active={activeCategory === 'todos'} onClick={() => setActiveCategory('todos')} />
        {allCategories.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            emoji={categoryEmojis[cat]}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted-foreground text-sm">No se encontraron eventos</p>
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
