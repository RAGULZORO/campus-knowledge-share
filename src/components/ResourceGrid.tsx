import { useState, useEffect } from 'react';
import ResourceCard, { Resource } from './ResourceCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResourceGridProps {
  searchTerm: string;
  selectedCategory: string;
  refreshTrigger?: number;
}

const ResourceGrid = ({ searchTerm, selectedCategory, refreshTrigger }: ResourceGridProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('resources')
        .select('*')
        .order('upload_date', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Resource interface
      const transformedResources: Resource[] = data.map(item => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        department: item.department,
        category: item.category as 'question-papers' | 'study-materials' | 'lab-manuals',
        uploadedBy: item.uploaded_by,
        uploadDate: new Date(item.upload_date).toLocaleDateString(),
        downloads: item.downloads,
        fileSize: item.file_size,
        filePath: item.file_path,
        fileName: item.file_name,
      }));

      setResources(transformedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, refreshTrigger]);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (resource: Resource) => {
    try {
      // Update download count
      await supabase
        .from('resources')
        .update({ downloads: resource.downloads + 1 })
        .eq('id', resource.id);

      // Get signed URL for file download
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl(resource.filePath!);

      // Open file in new tab
      window.open(data.publicUrl, '_blank');

      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r
      ));

      toast({
        title: "Download started",
        description: `Downloading ${resource.fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2">No resources found</h3>
        <p className="text-muted-foreground">
          {searchTerm || selectedCategory !== 'all' 
            ? 'Try adjusting your search or browse different categories.' 
            : 'No resources available yet. Be the first to upload!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredResources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;