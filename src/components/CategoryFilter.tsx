import { Button } from '@/components/ui/button';
import { FileText, BookOpen, FlaskConical, Filter } from 'lucide-react';

export type ResourceCategory = 'all' | 'question-papers' | 'study-materials' | 'lab-manuals';

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
    id: 'question-papers' as ResourceCategory,
    label: 'Question Papers',
    icon: FileText,
    description: 'Previous year exams'
  },
  {
    id: 'study-materials' as ResourceCategory,
    label: 'Study Materials',
    icon: BookOpen,
    description: 'Notes & guides'
  },
  {
    id: 'lab-manuals' as ResourceCategory,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                className={`h-auto p-6 flex flex-col items-center gap-3 card-hover ${
                  isActive ? 'btn-primary' : 'hover:border-primary'
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold">{category.label}</div>
                  <div className="text-sm opacity-80">{category.description}</div>
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