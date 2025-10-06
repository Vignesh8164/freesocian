import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { PrivacyPolicy } from './PrivacyPolicy';
import { ContactSupport } from './ContactSupport';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Calendar, 
  Camera, 
  Instagram, 
  Shield, 
  Zap, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { User as AppwriteUser } from './AppwriteService';

interface LandingPageProps {
  onLogin: (user: AppwriteUser) => void;
  onSignup: (user: AppwriteUser) => void;
}

type PageView = 'landing' | 'privacy' | 'contact';

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<PageView>('landing');

  useEffect(() => {
    // Set SEO meta tags for the landing page
    document.title = "Freesocian | Free Instagram Scheduler & Social Media Creative Flows";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Free Instagram posting and social scheduling with creative flows. Freesocian is always zero-cost, unlimited, and simple.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Free Instagram posting and social scheduling with creative flows. Freesocian is always zero-cost, unlimited, and simple.';
      document.head.appendChild(meta);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLoginSuccess = (user: AppwriteUser) => {
    setIsLoginModalOpen(false);
    onLogin(user);
  };

  const handleSignupSuccess = (user: AppwriteUser) => {
    setIsSignupModalOpen(false);
    onSignup(user);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleViewPrivacyPolicy = () => {
    setCurrentView('privacy');
  };

  const handleViewContactSupport = () => {
    setCurrentView('contact');
  };

  if (currentView === 'privacy') {
    return <PrivacyPolicy onBack={handleBackToLanding} />;
  }

  if (currentView === 'contact') {
    return <ContactSupport onBack={handleBackToLanding} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Instagram className="h-8 w-8 text-primary" />
              <span className="text-xl">Freesocian</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="hover:text-primary transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors">
                FAQ
              </button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">
                Contact
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={() => setIsLoginModalOpen(true)}>
                Sign In
              </Button>
              <Button onClick={() => setIsSignupModalOpen(true)}>
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('home')} className="text-left hover:text-primary transition-colors">
                  Home
                </button>
                <button onClick={() => scrollToSection('features')} className="text-left hover:text-primary transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-left hover:text-primary transition-colors">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-left hover:text-primary transition-colors">
                  FAQ
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-left hover:text-primary transition-colors">
                  Contact
                </button>
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsLoginModalOpen(true)} className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={() => setIsSignupModalOpen(true)} className="w-full">
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Forever Free
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 max-w-4xl mx-auto">
              Next-Gen Free Social Media Creative Flows
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Creative flows posting is costly. But with Freesocian, posting power is always free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => setIsSignupModalOpen(true)} className="text-lg px-8 py-6">
                Start Free Forever
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('features')} className="text-lg px-8 py-6">
                See Features
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-2xl mb-2">∞</div>
                <p className="text-sm text-muted-foreground">Unlimited Posts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">$0</div>
                <p className="text-sm text-muted-foreground">Zero Cost</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">1-Click</div>
                <p className="text-sm text-muted-foreground">Easy Posting</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Always Available</p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1550999280-b8a04844e8e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGF1dG9tYXRpb24lMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzU5NjQxODc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Freesocian social media creative flows dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Everything You Need, Nothing You Pay</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional social media creative flows tools that cost hundreds elsewhere are completely free here
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Unlimited Scheduling
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Schedule unlimited Instagram posts. No daily limits, no monthly caps, no hidden fees.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Camera className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Unsplash Integration
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access millions of high-quality, royalty-free images from Unsplash directly in your composer.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Instagram className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="flex items-center gap-2">
                  One-Click Posting
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect your Instagram account and post with a single click. Secure OAuth 2.0 authentication.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Secure Backend
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Powered by Appwrite for secure data storage and user management. Your content is always safe.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Smart Timing
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Schedule posts for optimal engagement times. Edit, reschedule, or delete anytime.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="flex items-center gap-2">
                  Instant Setup
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get started in minutes. No complex configurations, no payment setup, no subscriptions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">How Freesocian Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to streamline your Instagram posting forever, completely free
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl mb-2">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your free account in seconds. No credit card required, ever.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl mb-2">Connect Instagram</h3>
                <p className="text-muted-foreground">
                  Securely link your Instagram account with our OAuth 2.0 integration.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl mb-2">Create & Schedule</h3>
                <p className="text-muted-foreground">
                  Write your post, pick images from Unsplash, and schedule for the perfect time.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl mb-2">Streamline</h3>
                <p className="text-muted-foreground">
                  Sit back and watch your content post automatically, unlimited and free.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1759215524547-6aa9692ceea2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YWdyYW0lMjBwb3N0aW5nJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzU5NjQxODgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Instagram posting on mobile phone"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Loved by Content Creators</h2>
            <p className="text-xl text-muted-foreground">See what users say about Freesocian</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle>Sarah M.</CardTitle>
                <CardDescription>Content Creator</CardDescription>
              </CardHeader>
              <CardContent>
                <p>"I was paying $50/month for scheduling tools. Freesocian does everything I need for FREE. Incredible!"</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle>Mike R.</CardTitle>
                <CardDescription>Small Business Owner</CardDescription>
              </CardHeader>
              <CardContent>
                <p>"Finally, a tool that doesn't nickel and dime you. The Unsplash integration is genius!"</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle>Emma L.</CardTitle>
                <CardDescription>Digital Marketer</CardDescription>
              </CardHeader>
              <CardContent>
                <p>"Setup took 5 minutes. Been using it for months without paying a penny. This is the future!"</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about Freesocian</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger>Is Freesocian really completely free?</AccordionTrigger>
              <AccordionContent>
                Yes! Freesocian is 100% free forever. No hidden fees, no premium tiers, no subscription plans. 
                We believe social media creative flows should be accessible to everyone.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger>How do you make money if it's free?</AccordionTrigger>
              <AccordionContent>
                Freesocian exists to democratize social media creative flows. We keep costs low through efficient 
                architecture and believe in providing value to the community without monetization barriers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger>Is there a limit to how many posts I can schedule?</AccordionTrigger>
              <AccordionContent>
                No limits! Schedule as many posts as you want, whenever you want. Unlike other platforms that 
                cap your posts per month, Freesocian gives you unlimited scheduling.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger>How secure is my Instagram account?</AccordionTrigger>
              <AccordionContent>
                Very secure! We use Instagram's official OAuth 2.0 API, so you never share your password with us. 
                Your credentials are protected by Instagram's own security systems.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger>Can I use images from Unsplash commercially?</AccordionTrigger>
              <AccordionContent>
                Yes! All Unsplash images are free to use for any purpose, including commercial use. 
                No attribution required, though it's appreciated.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger>What happens to my data?</AccordionTrigger>
              <AccordionContent>
                Your data is stored securely using Appwrite, a trusted backend-as-a-service platform. 
                We never sell your data and you can delete your account anytime.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to Streamline Your Instagram?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who've discovered the power of free social media creative flows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => setIsSignupModalOpen(true)}
              className="text-lg px-8 py-6"
            >
              Start Free Forever
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Sign In
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">No credit card required • Free forever • No catch</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Instagram className="h-6 w-6 text-primary" />
                <span className="text-lg">Freesocian</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Freesocian exists so everyone can streamline Instagram posting without cost or complexity. 
                No payment modules. No locked content.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Unlimited Scheduling</li>
                <li>Unsplash Integration</li>
                <li>Instagram OAuth</li>
                <li>Secure Backend</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-primary transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors">FAQ</button></li>
                <li><button onClick={handleViewPrivacyPolicy} className="hover:text-primary transition-colors">Privacy Policy</button></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Unsplash API</li>
                <li>Instagram API</li>
                <li>Appwrite</li>
                <li><button onClick={handleViewContactSupport} className="hover:text-primary transition-colors">Contact Support</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Freesocian. Free Instagram creative flows for everyone.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In to Freesocian</DialogTitle>
            <DialogDescription>
              Welcome back! Sign in to access your free Instagram creative flows dashboard.
            </DialogDescription>
          </DialogHeader>
          <LoginScreen 
            onLogin={handleLoginSuccess} 
            onSignup={() => {
              setIsLoginModalOpen(false);
              setIsSignupModalOpen(true);
            }}
            isModal={true}
          />
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join Freesocian</DialogTitle>
            <DialogDescription>
              Create your free account and start streamlining your Instagram posts today.
            </DialogDescription>
          </DialogHeader>
          <SignupScreen 
            onSignup={handleSignupSuccess} 
            onBackToLogin={() => {
              setIsSignupModalOpen(false);
              setIsLoginModalOpen(true);
            }}
            isModal={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}