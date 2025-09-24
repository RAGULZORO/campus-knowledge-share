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
import { z } from 'zod';

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
    year: '',
    semester: '',
    name: '', // For lab manual name
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

  // Validation schema
  const createValidationSchema = (category: string) => {
    const baseSchema = {
      subject: z.string().trim().min(1, "Subject is required").max(100, "Subject must be less than 100 characters"),
      department: z.string().trim().min(1, "Department is required"),
      category: z.string().min(1, "Category is required"),
      uploadedBy: z.string().trim().min(1, "Your name is required").max(50, "Name must be less than 50 characters"),
    };

    if (category === 'lab-manuals') {
      return z.object({
        ...baseSchema,
        year: z.string().trim().min(1, "Year is required"),
        semester: z.string().trim().min(1, "Semester is required"),
        name: z.string().trim().min(1, "Lab manual name is required").max(100, "Name must be less than 100 characters"),
      });
    }

    if (category === 'question-papers') {
      return z.object({
        ...baseSchema,
        year: z.string().trim().min(1, "Year is required"),
        semester: z.string().trim().min(1, "Semester is required"),
      });
    }

    // Study material schema
    return z.object({
      ...baseSchema,
      unit: z.string().trim().max(50, "Unit must be less than 50 characters").optional(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Validate form data based on category
    try {
      const schema = createValidationSchema(formData.category);
      schema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for temporary storage
      const fileBuffer = await file.arrayBuffer();
      const base64String = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

      // Create title based on category
      let title = formData.subject;
      if (formData.category === 'lab-manuals' && formData.name) {
        title = `${formData.subject} - ${formData.name}`;
      }
      if ((formData.category === 'question-papers' || formData.category === 'lab-manuals') && formData.year && formData.semester) {
        title += ` (${formData.year} - Sem ${formData.semester})`;
      }

      // Create description based on category
      let description = formData.unit || null;
      if (formData.category === 'question-papers' || formData.category === 'lab-manuals') {
        description = `Year: ${formData.year}, Semester: ${formData.semester}`;
        if (formData.unit) {
          description += `, Unit: ${formData.unit}`;
        }
      }

      // Store file temporarily in pending_uploads table (not in storage yet)
      const { error: insertError } = await supabase
        .from('pending_uploads')
        .insert([
          {
            title: title,
            subject: formData.subject,
            description: description,
            department: formData.department,
            type: formData.category,
            uploaded_by: formData.uploadedBy,
            file_name: file.name,
            file_data: base64String,
            file_size: formatFileSize(file.size),
            user_id: user?.id,
          },
        ]);

      if (insertError) throw insertError;

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-upload-notification', {
          body: {
            fileName: file.name,
            uploaderName: formData.uploadedBy,
            subject: formData.subject,
            department: formData.department,
            category: formData.category,
          }
        });
        console.log('Admin notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the upload if email fails
      }

      toast({
        title: "Success!",
        description: "File sent to admin for review. You'll be notified once it's approved.",
      });

      // Reset form
      setFormData({
        subject: '',
        unit: '',
        department: '',
        category: '',
        uploadedBy: '',
        year: '',
        semester: '',
        name: '',
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
              maxLength={100}
            />
          </div>
          
          {/* Conditional fields based on category */}
          {formData.category === 'lab-manuals' && (
            <div className="space-y-2">
              <Label htmlFor="name">Lab Manual Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Basic Programming Lab"
                required
                maxLength={100}
              />
            </div>
          )}

          {(formData.category === 'question-papers' || formData.category === 'lab-manuals') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select 
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select 
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Semester</SelectItem>
                    <SelectItem value="2">2nd Semester</SelectItem>
                    <SelectItem value="3">3rd Semester</SelectItem>
                    <SelectItem value="4">4th Semester</SelectItem>
                    <SelectItem value="5">5th Semester</SelectItem>
                    <SelectItem value="6">6th Semester</SelectItem>
                    <SelectItem value="7">7th Semester</SelectItem>
                    <SelectItem value="8">8th Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.category === 'study-materials' && (
            <div className="space-y-2">
              <Label htmlFor="unit">Unit (Optional)</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., Unit 1, Unit 2"
                maxLength={50}
              />
            </div>
          )}
          
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
                  <SelectItem value="question-papers">Question Papers</SelectItem>
                  <SelectItem value="study-materials">Study Materials</SelectItem>
                  <SelectItem value="lab-manuals">Lab Manuals</SelectItem>
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
              maxLength={50}
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