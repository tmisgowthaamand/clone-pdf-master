import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      {categories.map((category, index) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={`relative overflow-hidden rounded-full px-6 transition-all duration-300 hover:scale-110 hover:-translate-y-1 animate-slide-up-fade ${
            activeCategory === category 
              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg hover:shadow-2xl animate-gradient animate-glow-pulse" 
              : "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
          }`}
          style={{animationDelay: `${index * 0.08}s`}}
        >
          {activeCategory === category && (
            <span className="absolute inset-0 animate-shimmer"></span>
          )}
          <span className="relative z-10">{category}</span>
        </Button>
      ))}
    </div>
  );
};
