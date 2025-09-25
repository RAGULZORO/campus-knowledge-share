import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PendingUpload {
  id: string;
  title: string;
  subject: string;
  description?: string;
  department: string;
  type: string;
  uploaded_by: string;
  file_name: string;
  file_data: string;
  file_size: string;
  user_id?: string;
  created_at: string;
}

const AdminReviewDashboard = () => {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingUploads = async () => {
    try {
      console.log('Fetching pending uploads...');
      const { data, error } = await supabase
        .from('pending_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Pending uploads response:', { data, error });
      if (error) throw error;
      setPendingUploads(data || []);
    } catch (error) {
      console.error('Error fetching pending uploads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending uploads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const handleApprove = async (upload: PendingUpload) => {
    try {
      // Convert base64 back to file
      const binaryString = atob(upload.file_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const file = new File([bytes], upload.file_name);
      
      // Upload file to storage
      const fileExt = upload.file_name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${upload.type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // Insert approved resource to main table
      const { error: insertError } = await supabase
        .from('resources')
        .insert([
          {
            title: upload.title,
            subject: upload.subject,
            description: upload.description,
            department: upload.department,
            type: upload.type,
            uploaded_by: upload.uploaded_by,
            file_size: upload.file_size,
            file_url: urlData.publicUrl,
            user_id: upload.user_id,
            status: 'approved',
          },
        ]);

      if (insertError) throw insertError;

      // Remove from pending uploads
      const { error: deleteError } = await supabase
        .from('pending_uploads')
        .delete()
        .eq('id', upload.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "File approved and uploaded successfully.",
      });

      fetchPendingUploads();
    } catch (error) {
      console.error('Error approving upload:', error);
      toast({
        title: "Error",
        description: "Failed to approve upload.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (uploadId: string) => {
    try {
      const { error } = await supabase
        .from('pending_uploads')
        .delete()
        .eq('id', uploadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Upload rejected and removed.",
      });

      fetchPendingUploads();
    } catch (error) {
      console.error('Error rejecting upload:', error);
      toast({
        title: "Error",
        description: "Failed to reject upload.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading pending uploads...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pending File Reviews</h2>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingUploads.length} pending
        </Badge>
      </div>

      {pendingUploads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending uploads</p>
            <p className="text-muted-foreground">All uploads have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUploads.map((upload) => (
              <Card key={upload.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{upload.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{upload.department}</Badge>
                        <Badge variant="outline">{upload.type}</Badge>
                        <Badge variant="secondary">Pending Review</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span> {upload.subject}
                    </div>
                    <div>
                      <span className="font-medium">File:</span> {upload.file_name}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {upload.file_size}
                    </div>
                    <div>
                      <span className="font-medium">Uploaded by:</span> {upload.uploaded_by}
                    </div>
                    {upload.description && (
                      <div className="col-span-2">
                        <span className="font-medium">Description:</span> {upload.description}
                      </div>
                    )}
                   </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleApprove(upload)}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Upload
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Upload</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this upload? This action cannot be undone and the file will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleReject(upload.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewDashboard;