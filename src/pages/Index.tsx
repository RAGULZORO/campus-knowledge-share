import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryFilter, { ResourceCategory } from '@/components/CategoryFilter';
import ResourceGrid from '@/components/ResourceGrid';
import UploadModal from '@/components/UploadModal';
import { Resource } from '@/components/ResourceCard';
import { mockResources } from '@/data/mockResources';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredResources = useMemo(() => {
    let filtered = mockResources;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.subject.toLowerCase().includes(query) ||
        resource.department.toLowerCase().includes(query) ||
        resource.uploadedBy.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeCategory]);

  const handleDownload = (resource: Resource) => {
    toast({
      title: "Download started",
      description: `Downloading "${resource.title}"`,
    });
    // In a real app, this would trigger the actual download
    console.log('Downloading resource:', resource);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={handleUploadClick}
      />
      
      <Hero />
      
      <CategoryFilter 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {activeCategory === 'all' ? 'All Resources' : 
             activeCategory === 'question-papers' ? 'Question Papers' :
             activeCategory === 'study-materials' ? 'Study Materials' : 'Lab Manuals'}
          </h2>
          <p className="text-muted-foreground">
            {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
        
        <ResourceGrid 
          resources={filteredResources}
          onDownload={handleDownload}
        />
      </main>
      
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Index;
