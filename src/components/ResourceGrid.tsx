import ResourceCard, { Resource } from './ResourceCard';

interface ResourceGridProps {
  resources: Resource[];
  onDownload: (resource: Resource) => void;
}

const ResourceGrid = ({ resources, onDownload }: ResourceGridProps) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2">No resources found</h3>
        <p className="text-muted-foreground">Try adjusting your search or browse different categories.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;