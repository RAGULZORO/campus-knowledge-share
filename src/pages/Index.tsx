import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryFilter, { ResourceCategory } from '@/components/CategoryFilter';
import ResourceGrid from '@/components/ResourceGrid';
import UploadModal from '@/components/UploadModal';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
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
        </div>
        
        <ResourceGrid 
          searchTerm={searchQuery}
          selectedCategory={activeCategory}
          refreshTrigger={refreshTrigger}
        />
      </main>
      
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Index;