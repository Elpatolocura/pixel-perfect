interface CategoryChipProps {
  label: string;
  emoji?: string;
  active?: boolean;
  onClick?: () => void;
}

const CategoryChip = ({ label, emoji, active, onClick }: CategoryChipProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
      active
        ? 'bg-foreground text-primary-foreground'
        : 'bg-card text-foreground border border-border'
    }`}
  >
    {emoji && <span>{emoji}</span>}
    <span className="capitalize">{label}</span>
  </button>
);

export default CategoryChip;
