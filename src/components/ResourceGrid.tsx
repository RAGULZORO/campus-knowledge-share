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
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('type', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Resource interface
      const transformedResources: Resource[] = data.map(item => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        unit: item.description || '', // Use description as unit or empty
        department: item.department,
        category: item.type as 'question-papers' | 'study-materials' | 'lab-manuals',
        uploadedBy: item.uploaded_by,
        uploadDate: new Date(item.created_at).toLocaleDateString(),
        downloads: item.download_count,
        fileSize: item.file_size || '',
        filePath: item.file_url || '',
        fileName: item.title, // Use title as filename
        userId: item.user_id,
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

  const filteredResources = resources.filter(resource => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Enhanced search across multiple fields
    const titleMatch = resource.title.toLowerCase().includes(searchTermLower);
    const subjectMatch = resource.subject.toLowerCase().includes(searchTermLower);
    const unitMatch = resource.unit?.toLowerCase().includes(searchTermLower);
    const departmentMatch = resource.department.toLowerCase().includes(searchTermLower);
    const categoryMatch = resource.category.toLowerCase().includes(searchTermLower);
    const uploaderMatch = resource.uploadedBy.toLowerCase().includes(searchTermLower);
    const fileNameMatch = resource.fileName?.toLowerCase().includes(searchTermLower);
    
    return titleMatch || subjectMatch || unitMatch || departmentMatch || categoryMatch || uploaderMatch || fileNameMatch;
  });

  const handleDownload = async (resource: Resource) => {
    try {
      // Update download count
      await supabase
        .from('resources')
        .update({ download_count: resource.downloads + 1 })
        .eq('id', resource.id);

      // Get public URL for file download
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl(resource.filePath!);

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = resource.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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

  const handleDelete = async (resource: Resource) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([resource.filePath!]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);

      if (dbError) throw dbError;

      // Update local state
      setResources(prev => prev.filter(r => r.id !== resource.id));

      toast({
        title: "Success",
        description: "Resource deleted successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredResources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;