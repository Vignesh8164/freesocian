import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Instagram } from 'lucide-react';
import { loginUser, User as AppwriteUser } from './AppwriteService';
import { toast } from 'sonner@2.0.3';

interface LoginScreenProps {
  onLogin: (user: AppwriteUser) => void;
  onSignup: () => void;
  isModal?: boolean;
}

export function LoginScreen({ onLogin, onSignup, isModal = false }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await loginUser(email, password);
      toast.success('Login successful!');
      onLogin(user);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // TODO: Implement OAuth with Appwrite
    // For now, show a coming soon message
    setTimeout(() => {
      setIsLoading(false);
      toast.info('Google login coming soon! Please use email/password for now.');
    }, 1000);
  };

  const content = (
    <Card className={isModal ? "w-full" : "w-full max-w-md"}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Welcome to Freesocian</CardTitle>
          <CardDescription>
            Free Instagram automation for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="m12.017 22.012c2.698 0 4.957-.89 6.619-2.381l-3.045-2.36c-.81.549-1.846.84-3.574.84-2.728 0-5.051-1.837-5.875-4.331l-3.102 2.407c1.588 3.141 4.854 5.825 8.977 5.825z"
                fill="#34a853"
              />
              <path
                d="m12.017 9.927c1.557 0 2.629.672 3.236 1.231l2.415-2.357c-1.485-1.379-3.405-2.21-5.651-2.21-4.123 0-7.389 2.684-8.977 5.825l3.102 2.407c.824-2.494 3.147-4.331 5.875-4.331z"
                fill="#ea4335"
              />
              <path
                d="m3.938 12.012c0-.81.131-1.584.361-2.331l-3.102-2.407c-.698 1.379-1.084 2.937-1.084 4.738s.386 3.359 1.084 4.738l3.102-2.407c-.23-.747-.361-1.521-.361-2.331z"
                fill="#fbbc04"
              />
            </svg>
            Continue with Google
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button 
              onClick={onSignup}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </button>
          </p>
        </CardContent>
      </Card>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {content}
    </div>
  );
}