import { Search, Upload, BookOpen, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
}

const Header = ({ searchQuery, onSearchChange, onUploadClick }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card shadow-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EduShare</h1>
              <p className="text-sm text-muted-foreground">Academic Resource Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search resources, subjects, or departments..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button 
              onClick={onUploadClick}
              className="btn-accent whitespace-nowrap"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resource
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="whitespace-nowrap"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;