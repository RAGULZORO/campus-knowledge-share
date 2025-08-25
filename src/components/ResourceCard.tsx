import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, User, Building, Trash2 } from 'lucide-react';

export interface Resource {
  id: string;
  title: string;
  subject: string;
  unit?: string;
  department: string;
  category: 'question-papers' | 'study-materials' | 'lab-manuals';
  uploadedBy: string;
  uploadDate: string;
  downloads: number;
  fileSize: string;
  filePath?: string;
  fileName?: string;
}

interface ResourceCardProps {
  resource: Resource;
  onDownload: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'question-papers':
      return 'bg-primary text-primary-foreground';
    case 'study-materials':
      return 'bg-secondary text-secondary-foreground';
    case 'lab-manuals':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'question-papers':
      return 'Question Paper';
    case 'study-materials':
      return 'Study Material';
    case 'lab-manuals':
      return 'Lab Manual';
    default:
      return 'Resource';
  }
};

const ResourceCard = ({ resource, onDownload, onDelete }: ResourceCardProps) => {
  return (
    <Card className="card-hover shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{resource.title}</h3>
          <Badge className={getCategoryColor(resource.category)}>
            {getCategoryLabel(resource.category)}
          </Badge>
        </div>
        <p className="text-xl font-bold text-primary">{resource.subject}</p>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="space-y-2">
          {resource.unit && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">Unit:</span>
              <span className="text-sm">{resource.unit}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span className="text-sm">{resource.department}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">Uploaded by {resource.uploadedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{resource.uploadDate}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">
            <span>{resource.downloads} downloads</span>
            <span className="mx-2">•</span>
            <span>{resource.fileSize}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => onDownload(resource)}
              className="btn-primary"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={() => onDelete(resource)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;