import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, FileText, Check, X, Eye, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminReviewDashboard = () => {
  const [pendingResources, setPendingResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id, title, subject, description, department, type, uploaded_by,
          file_size, file_url, created_at, ai_analysis, status
        `)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending resources:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending resources.",
          variant: "destructive",
        });
        return;
      }

      setPendingResources(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (resourceId: string, action: 'approve' | 'reject') => {
    setIsReviewing(true);
    
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        })
        .eq('id', resourceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Resource ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      // Refresh the list
      await fetchPendingResources();
      setSelectedResource(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error reviewing resource:', error);
      toast({
        title: "Error",
        description: "Failed to update resource status.",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const parseAIAnalysis = (analysisText: string | null) => {
    if (!analysisText) return null;
    
    try {
      return JSON.parse(analysisText);
    } catch {
      return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question-paper':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'study-material':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'lab-manual':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'question-paper':
        return 'Question Paper';
      case 'study-material':
        return 'Study Material';
      case 'lab-manual':
        return 'Lab Manual';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FileText className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pending resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold">Pending Review</h2>
          <p className="text-muted-foreground">
            {pendingResources.length} files waiting for admin review
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Files Awaiting Review</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingResources.length}</div>
          <p className="text-xs text-muted-foreground">
            Flagged by AI content analysis
          </p>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Files Pending Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files pending review</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>AI Analysis</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingResources.map((resource) => {
                    const analysis = parseAIAnalysis(resource.ai_analysis);
                    
                    return (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{resource.title}</div>
                            {resource.description && (
                              <div className="text-sm text-muted-foreground">{resource.description}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Size: {resource.file_size || 'Unknown'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(resource.type)}>
                            {getCategoryLabel(resource.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{resource.department}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {resource.uploader_display_name || resource.uploaded_by}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {resource.uploader_email || 'No email'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {analysis ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                Study-related: {analysis.isStudyRelated ? '✅' : '❌'}
                              </div>
                              <div className="text-sm">
                                Confidence: {analysis.confidence}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {analysis.summary?.substring(0, 50)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No analysis</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(resource.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedResource(resource)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {resource.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(resource.file_url, '_blank')}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Resource</DialogTitle>
          </DialogHeader>
          
          {selectedResource && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">File Details</h4>
                  <p className="text-sm">{selectedResource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedResource.department} • {getCategoryLabel(selectedResource.type)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Uploader</h4>
                  <p className="text-sm">{selectedResource.uploader_display_name || selectedResource.uploaded_by}</p>
                  <p className="text-xs text-muted-foreground">{selectedResource.uploader_email}</p>
                </div>
              </div>

              {selectedResource.ai_analysis && (
                <div>
                  <h4 className="font-semibold mb-2">AI Analysis</h4>
                  <div className="bg-muted p-3 rounded-md">
                    {(() => {
                      const analysis = parseAIAnalysis(selectedResource.ai_analysis);
                      if (!analysis) return <p>Failed to parse analysis</p>;
                      
                      return (
                        <div className="space-y-2">
                          <div>
                            <strong>Study-related:</strong> {analysis.isStudyRelated ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <strong>Confidence:</strong> {analysis.confidence}%
                          </div>
                          <div>
                            <strong>Summary:</strong> {analysis.summary}
                          </div>
                          <div>
                            <strong>Reasoning:</strong> {analysis.reasoning}
                          </div>
                          {analysis.categories && analysis.categories.length > 0 && (
                            <div>
                              <strong>Categories:</strong> {analysis.categories.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Review Notes (Optional)</h4>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleReview(selectedResource.id, 'reject')}
                  variant="destructive"
                  disabled={isReviewing}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject & Delete
                </Button>
                <Button
                  onClick={() => handleReview(selectedResource.id, 'approve')}
                  disabled={isReviewing}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Publish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviewDashboard;