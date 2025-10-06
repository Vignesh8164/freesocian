import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { Toaster } from './components/ui/sonner';
import { 
  logoutUser,
  User as AppwriteUser
} from './components/AppwriteService';
import { 
  initializeAllServices,
  showSystemStatusToUser,
  SystemStatus,
  InitializationResult
} from './components/SystemIntegration';
import { toast } from 'sonner@2.0.3';

type AppScreen = 'landing' | 'login' | 'signup' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppwriteUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Initialize app and all services on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting Instagram Auto-Post App initialization...');
        
        // Initialize all services using the comprehensive system coordinator
        const initResult: InitializationResult = await initializeAllServices();
        
        // Store system status for potential debugging/admin views
        setSystemStatus(initResult.systemStatus);
        
        // Show user-friendly status message
        showSystemStatusToUser(initResult.systemStatus);
        
        if (initResult.success) {
          // Check if user is already authenticated
          if (initResult.user) {
            setCurrentUser(initResult.user);
            setIsAuthenticated(true);
            setCurrentScreen('dashboard');
          } else {
            // No authenticated user - show landing page
            setCurrentScreen('landing');
          }
          
          console.log('✅ App initialization completed successfully!');
          console.log('📚 Ready for new user onboarding - all demo data cleared');
          
        } else {
          // Initialization failed, but app can still work in demo mode
          console.warn('⚠️ App initialization had issues, but continuing in demo mode');
          console.warn('Error:', initResult.error);
          
          // Start fresh with landing page
          setCurrentScreen('landing');
          
          // Don't show error to user since demo mode still works
          toast.info('App ready in demo mode');
        }
        
      } catch (error) {
        console.error('❌ Critical app initialization error:', error);
        toast.error('Failed to initialize application');
        
        // On critical error, still show landing page
        setCurrentScreen('landing');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (user: AppwriteUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    
    toast.success('Welcome back!');
  };

  const handleSignup = (user: AppwriteUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    
    toast.success('Account created successfully! Welcome to Instagram Auto-Post!');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setCurrentScreen('landing');
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const handleGoToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const handleGoToLanding = () => {
    setCurrentScreen('landing');
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full">
      {currentScreen === 'landing' && !isAuthenticated && (
        <LandingPage onLogin={handleLogin} onSignup={handleSignup} />
      )}
      {currentScreen === 'dashboard' && isAuthenticated && currentUser && (
        <Dashboard 
          onLogout={handleLogout} 
          currentUser={currentUser}
        />
      )}
      {currentScreen === 'login' && !isAuthenticated && (
        <LoginScreen onLogin={handleLogin} onSignup={handleGoToSignup} />
      )}
      {currentScreen === 'signup' && !isAuthenticated && (
        <SignupScreen onSignup={handleSignup} onBackToLogin={handleBackToLogin} />
      )}
      
      <Toaster />
    </div>
  );
}