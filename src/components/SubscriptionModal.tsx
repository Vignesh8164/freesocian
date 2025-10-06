import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SUBSCRIPTION_PLANS, applyFirstTimeDiscount, SubscriptionPlan } from './SubscriptionUtils';
import { 
  Crown, 
  Check, 
  Sparkles,
  X,
  Clock,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isFirstTimeUser: boolean;
}

export function SubscriptionModal({ isOpen, onClose, onSelectPlan, isFirstTimeUser }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    const finalPlan = applyFirstTimeDiscount(plan, isFirstTimeUser);
    setSelectedPlan(plan.id);
    onSelectPlan(finalPlan);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Choose the perfect plan for your Instagram automation needs
          </DialogDescription>
          {isFirstTimeUser && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 text-green-700 rounded-lg">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                🎉 First-time user special: Get 30% off Yearly Pro or 5% off Monthly Pro!
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan: Trial</p>
                <p className="text-sm text-muted-foreground">
                  Limited features • Upgrade to unlock full potential
                </p>
              </div>
              <Badge variant="outline">Trial</Badge>
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const discountedPlan = applyFirstTimeDiscount(plan, isFirstTimeUser);
              const hasDiscount = discountedPlan.originalPrice && discountedPlan.originalPrice > discountedPlan.price;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all ${
                    plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
                  } ${selectedPlan === plan.id ? 'scale-[1.02] shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      {plan.id === 'yearly' ? (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                      {plan.name}
                    </CardTitle>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        {hasDiscount && (
                          <span className="text-lg text-muted-foreground line-through">
                            {formatPrice(discountedPlan.originalPrice!)}
                          </span>
                        )}
                        <span className="text-3xl font-bold">
                          {formatPrice(discountedPlan.price)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {plan.duration}
                      </p>
                      
                      {hasDiscount && (
                        <Badge variant="destructive" className="bg-green-600">
                          {discountedPlan.discount}% OFF
                        </Badge>
                      )}
                      
                      {plan.discount && !hasDiscount && (
                        <Badge variant="secondary">
                          Save {plan.discount}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      Choose {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Comparison */}
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Why Choose Pro?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Multiple Accounts</p>
                  <p className="text-muted-foreground">Manage unlimited Instagram accounts</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Advanced Analytics</p>
                  <p className="text-muted-foreground">Detailed performance insights</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-purple-500 mt-1" />
                <div>
                  <p className="font-medium">Smart Scheduling</p>
                  <p className="text-muted-foreground">AI-powered optimal timing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}