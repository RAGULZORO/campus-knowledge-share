import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Download, Trash2, ArrowLeft, FileText, Users, HardDrive, Calendar, AlertTriangle } from 'lucide-react';
import AdminReviewDashboard from '@/components/AdminReviewDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';

interface AdminResource {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  department: string;
  type: string;
  uploaded_by: string;
  file_size: string | null;
  file_url: string | null;
  download_count: number;
  created_at: string;
  uploader_email: string | null;
  uploader_display_name: string | null;
  uploader_department: string | null;
  status?: string;
  [key: string]: any; // Allow additional properties from the view
}

const Admin = () => {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalUsers: 0,
    totalDownloads: 0,
    recentUploads: 0,
    pendingReview: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'pending'>('overview');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      return;
    }

    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, adminLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch resources with uploader details
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('admin_resources_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        toast({
          title: "Error",
          description: "Failed to fetch resources data.",
          variant: "destructive",
        });
        return;
      }

      setResources((resourcesData || []) as AdminResource[]);

      // Calculate stats
      const totalResources = resourcesData?.length || 0;
      const totalDownloads = resourcesData?.reduce((sum, resource) => sum + (resource.download_count || 0), 0) || 0;
      
      // Get unique users count
      const uniqueUploaders = new Set(resourcesData?.map(r => r.uploader_email).filter(Boolean));
      
      // Get recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUploads = resourcesData?.filter(r => new Date(r.created_at) > sevenDaysAgo).length || 0;
      
      // Get pending review count
      const pendingReview = resourcesData?.filter((r: any) => r.status === 'pending_review').length || 0;

      setStats({
        totalResources,
        totalUsers: uniqueUploaders.size,
        totalDownloads,
        recentUploads,
        pendingReview
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource deleted successfully.",
      });

      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource.",
        variant: "destructive",
      });
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

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage uploaded resources and users</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Button>
              <Button 
                variant={activeTab === 'pending' ? 'default' : 'outline'}
                onClick={() => setActiveTab('pending')}
                className="relative"
              >
                Pending Review
                {stats.pendingReview > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingReview}
                  </span>
                )}
              </Button>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUploads}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          
          <Card className={stats.pendingReview > 0 ? "border-amber-200 bg-amber-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.pendingReview > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">Files awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' ? (
          /* Resources Table */
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              All Uploaded Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.filter(r => r.status !== 'pending_review').map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{resource.title}</div>
                          {resource.description && (
                            <div className="text-sm text-muted-foreground">{resource.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(resource.type)}>
                          {getCategoryLabel(resource.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{resource.department}</TableCell>
                      <TableCell>
                        {resource.uploader_display_name || resource.uploaded_by}
                      </TableCell>
                      <TableCell className="text-sm">
                        {resource.uploader_email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resource.status === 'approved' ? 'default' : 'secondary'}>
                          {resource.status === 'approved' ? 'Published' : resource.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{resource.download_count}</TableCell>
                      <TableCell>{resource.file_size || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(resource.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {resource.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.file_url!, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(resource.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {resources.filter(r => r.status !== 'pending_review').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No approved/rejected resources found.
                </div>
              )}
            </div>
          </CardContent>
          </Card>
        ) : (
          /* Pending Review Dashboard */
          <AdminReviewDashboard />
        )}
      </div>
    </div>
  );
};

export default Admin;