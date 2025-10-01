import { Button } from '@/components/ui/button';
import { FileText, BookOpen, FlaskConical, Filter } from 'lucide-react';

export type ResourceCategory = 'all' | 'question-paper' | 'study-material' | 'lab-manual';

interface CategoryFilterProps {
  activeCategory: ResourceCategory;
  onCategoryChange: (category: ResourceCategory) => void;
}

const categories = [
  {
    id: 'all' as ResourceCategory,
    label: 'All Resources',
    icon: Filter,
    description: 'Browse everything'
  },
  {
    id: 'question-paper' as ResourceCategory,
    label: 'Question Papers',
    icon: FileText,
    description: 'Previous year exams'
  },
  {
    id: 'study-material' as ResourceCategory,
    label: 'Study Materials',
    icon: BookOpen,
    description: 'Notes & guides'
  },
  {
    id: 'lab-manual' as ResourceCategory,
    label: 'Lab Manuals',
    icon: FlaskConical,
    description: 'Practical guides'
  }
];

const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <section className="py-8 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                className={`h-auto p-3 sm:p-4 md:p-6 flex flex-col items-center gap-2 sm:gap-3 card-hover ${
                  isActive ? 'btn-primary' : 'hover:border-primary'
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                }`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-xs sm:text-sm md:text-base">{category.label}</div>
                  <div className="text-xs sm:text-sm opacity-80 hidden sm:block">{category.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;