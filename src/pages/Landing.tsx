import { BookOpen, Users, Download, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const Landing = () => {
  const { signInWithGoogle, loading } = useAuth();

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Rich Resource Library",
      description: "Access thousands of question papers, study materials, and lab manuals across all departments"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Driven",
      description: "Share and discover resources contributed by students and faculty from your institution"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Easy Downloads",
      description: "Download resources instantly with our streamlined interface and organized categorization"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Quality Content",
      description: "All resources are verified and organized by subject, unit, and department for easy discovery"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EduShare</h1>
                <p className="text-sm text-muted-foreground">Academic Resource Hub</p>
              </div>
            </div>
            
            <Button 
              onClick={signInWithGoogle}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Loading...' : 'Sign In with Google'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Your Academic
              <span className="gradient-text block">Resource Hub</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access and share question papers, study materials, and lab manuals. 
              Join thousands of students building a collaborative learning community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={signInWithGoogle}
                disabled={loading}
                className="btn-primary text-lg px-8 py-6"
              >
                {loading ? 'Loading...' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose EduShare?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make EduShare the perfect platform for academic resource sharing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mx-auto mb-4">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="gradient-primary text-white border-0 shadow-glow">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Learning?
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join our community of learners and contributors. Access thousands of resources 
                and help others succeed in their academic journey.
              </p>
              <Button 
                size="lg"
                onClick={signInWithGoogle}
                disabled={loading}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
              >
                {loading ? 'Loading...' : 'Sign In with Google'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">EduShare</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 EduShare. Empowering academic collaboration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;