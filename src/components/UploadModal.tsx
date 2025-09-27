import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const departments = [
  'CSE',
  'IT', 
  'EEE',
  'ECE',
  'MECH',
  'AGREE',
  'BIO-TECH',
  'BIO-MED',
  'AIDS'
];

const UploadModal = ({ isOpen, onClose, onUploadSuccess }: UploadModalProps) => {
  const [formData, setFormData] = useState({
    subject: '',
    unit: '',
    department: '',
    category: '',
    uploadedBy: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !formData.subject || !formData.department || !formData.category || !formData.uploadedBy) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${formData.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // Insert resource metadata to database
      const { error: insertError } = await supabase
        .from('resources')
        .insert([
          {
            title: formData.subject, // Use subject as title
            subject: formData.subject,
            description: formData.unit || null, // Use unit as description
            department: formData.department,
            type: formData.category, // Use category as type
            uploaded_by: formData.uploadedBy,
            file_size: formatFileSize(file.size),
            file_url: urlData.publicUrl, // Store the public URL
            user_id: user?.id, // Add user_id for RLS
          },
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Resource uploaded successfully.",
      });

      // Reset form
      setFormData({
        subject: '',
        unit: '',
        department: '',
        category: '',
        uploadedBy: '',
      });
      setFile(null);
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Educational Resource
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Data Structures and Algorithms"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., Unit 1, Unit 2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question-paper">Question Papers</SelectItem>
                  <SelectItem value="study-material">Study Materials</SelectItem>
                  <SelectItem value="lab-manual">Lab Manuals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="uploader">Your Name *</Label>
            <Input
              id="uploader"
              value={formData.uploadedBy}
              onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
              placeholder="e.g., John Doe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Upload File *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                required
                className="hidden"
              />
              <label
                htmlFor="file"
                className="flex-1 flex items-center justify-center px-4 py-2 border border-dashed border-muted-foreground rounded-md cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : 'Choose file'}
              </label>
              {file && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Size: {formatFileSize(file.size)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (Max 10MB)
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="btn-primary flex-1" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;