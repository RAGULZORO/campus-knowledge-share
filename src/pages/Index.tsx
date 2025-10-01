import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryFilter, { ResourceCategory } from '@/components/CategoryFilter';
import ResourceGrid from '@/components/ResourceGrid';
import UploadModal from '@/components/UploadModal';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUploadClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsUploadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
             activeCategory === 'question-paper' ? 'Question Papers' :
             activeCategory === 'study-material' ? 'Study Materials' : 'Lab Manuals'}
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