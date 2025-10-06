import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { SystemStatus, getNextSetupSteps, performHealthCheck } from './SystemIntegration';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Database,
  Image,
  Instagram,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: SystemStatus | null;
}

export function SystemStatusModal({ isOpen, onClose, systemStatus }: SystemStatusModalProps) {
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  if (!systemStatus) {
    return null;
  }

  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await performHealthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const getStatusIcon = (status: 'ready' | 'demo' | 'error') => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'demo':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: 'ready' | 'demo' | 'error') => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Production</Badge>;
      case 'demo':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Demo Mode</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const nextSteps = getNextSetupSteps(systemStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status & Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall System Status</span>
                <Badge 
                  className={
                    systemStatus.overall.mode === 'production' 
                      ? 'bg-green-100 text-green-800'
                      : systemStatus.overall.mode === 'demo'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {systemStatus.overall.mode.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                {systemStatus.overall.mode === 'production' && 'All core services are connected and ready for production use.'}
                {systemStatus.overall.mode === 'demo' && 'Running in full demo mode with simulated backends. All features work perfectly for testing.'}
                {systemStatus.overall.mode === 'mixed' && 'Some services are in production mode, others in demo mode.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {systemStatus.overall.productionServices.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Production Services</h4>
                    <ul className="space-y-1">
                      {systemStatus.overall.productionServices.map((service) => (
                        <li key={service} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {systemStatus.overall.demoServices.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Demo Services</h4>
                    <ul className="space-y-1">
                      {systemStatus.overall.demoServices.map((service) => (
                        <li key={service} className="flex items-center gap-2 text-sm">
                          <Settings className="h-3 w-3 text-blue-500" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Individual Service Status */}
          <div className="space-y-4">
            <h3 className="font-semibold">Service Details</h3>
            
            {/* Appwrite */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Appwrite Backend</h4>
                      <p className="text-sm text-muted-foreground">{systemStatus.appwrite.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(systemStatus.appwrite.status)}
                    {getStatusIcon(systemStatus.appwrite.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unsplash */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Unsplash API</h4>
                      <p className="text-sm text-muted-foreground">{systemStatus.unsplash.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(systemStatus.unsplash.status)}
                    {getStatusIcon(systemStatus.unsplash.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div>
                      <h4 className="font-medium">Instagram API</h4>
                      <p className="text-sm text-muted-foreground">{systemStatus.instagram.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(systemStatus.instagram.status)}
                    {getStatusIcon(systemStatus.instagram.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment System */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Payment System</h4>
                      <p className="text-sm text-muted-foreground">{systemStatus.payment.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(systemStatus.payment.status)}
                    {getStatusIcon(systemStatus.payment.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Instructions */}
          {nextSteps.length > 0 && nextSteps[0] !== 'All services configured! System ready for production.' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Next Steps for Production
                </CardTitle>
                <CardDescription>
                  Follow these steps to enable production features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Health Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Health Check</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runHealthCheck}
                  disabled={isCheckingHealth}
                >
                  {isCheckingHealth ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Check Health
                </Button>
              </CardTitle>
            </CardHeader>
            {healthStatus && (
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {healthStatus.healthy ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      System {healthStatus.healthy ? 'Healthy' : 'Issues Detected'}
                    </span>
                  </div>
                  
                  {healthStatus.issues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {healthStatus.issues.map((issue: string, index: number) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <Separator />

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/API_CONFIGURATION.md" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Guide
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/APPWRITE_SETUP.md" target="_blank" rel="noopener noreferrer">
                <Database className="h-4 w-4 mr-2" />
                Appwrite Setup
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/UNSPLASH_SETUP.md" target="_blank" rel="noopener noreferrer">
                <Image className="h-4 w-4 mr-2" />
                Unsplash Setup
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/INSTAGRAM_SETUP.md" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram Setup
              </a>
            </Button>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}