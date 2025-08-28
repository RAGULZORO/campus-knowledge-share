import { Button } from '@/components/ui/button';
import { BookOpen, Download, Share2 } from 'lucide-react';

const Hero = () => {
  return (
    <section className="gradient-hero text-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Share Knowledge,
            <br />
            <span className="text-accent">Empower Learning</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
            Access thousands of question papers, study materials, and lab manuals 
            shared by students and departments across universities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 dark:hover:bg-white dark:hover:text-primary font-semibold">
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Resources
            </Button>
            <Button size="lg" variant="hero" className="font-semibold">
              <Share2 className="h-5 w-5 mr-2" />
              Share Materials
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">10,000+ Resources</h3>
              <p className="text-white/80">Question papers, notes, and lab manuals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Downloads</h3>
              <p className="text-white/80">No registration required</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
              <p className="text-white/80">Upload and organize materials</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;