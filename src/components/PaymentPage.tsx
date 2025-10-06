import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  PAYMENT_METHODS, 
  processPayment, 
  SubscriptionPlan,
  getUserSubscription,
  saveUserSubscription,
  getPlanExpiryDate
} from './SubscriptionUtils';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PaymentPageProps {
  plan: SubscriptionPlan;
  onBack: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentPage({ plan, onBack, onSuccess, onCancel }: PaymentPageProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    // Card details
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    // UPI details
    upiId: '',
    // Common
    email: '',
    phone: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }

    if (!paymentData.email || !paymentData.phone) {
      toast.error('Email and phone are required');
      return false;
    }

    const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
    
    if (selectedMethod?.type === 'card') {
      if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.cardholderName) {
        toast.error('Please fill all card details');
        return false;
      }
      
      // Basic card number validation (should be 16 digits)
      if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }
      
      // CVV validation
      if (paymentData.cvv.length !== 3) {
        toast.error('Please enter a valid 3-digit CVV');
        return false;
      }
    } else {
      if (!paymentData.upiId) {
        toast.error('Please enter your UPI ID');
        return false;
      }
      
      // Basic UPI ID validation
      if (!paymentData.upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g., username@paytm)');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      toast.info('Processing your payment...');
      
      const result = await processPayment(plan.id, selectedPaymentMethod, paymentData);
      
      if (result.success) {
        // Update user subscription
        const currentSubscription = getUserSubscription();
        const newSubscription = {
          ...currentSubscription,
          plan: 'pro' as const,
          planType: plan.id,
          expiresAt: getPlanExpiryDate(plan.id),
          isFirstTimeUser: false
        };
        
        saveUserSubscription(newSubscription);
        
        toast.success('Payment successful! Welcome to Pro!');
        onSuccess();
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      handleInputChange('cardNumber', formatted);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Complete Your Purchase</h1>
            <p className="text-muted-foreground">Secure payment powered by industry standards</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{method.icon}</span>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {selectedPaymentMethod && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.type === 'card' 
                      ? 'Card Details' 
                      : 'UPI Details'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={paymentData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={paymentData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Card Payment Form */}
                  {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.type === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          disabled={isProcessing}
                          maxLength={19}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name *</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Doe"
                          value={paymentData.cardholderName}
                          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                          disabled={isProcessing}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryMonth">Month *</Label>
                          <Input
                            id="expiryMonth"
                            placeholder="MM"
                            value={paymentData.expiryMonth}
                            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                            disabled={isProcessing}
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryYear">Year *</Label>
                          <Input
                            id="expiryYear"
                            placeholder="YY"
                            value={paymentData.expiryYear}
                            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                            disabled={isProcessing}
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                            disabled={isProcessing}
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Payment Form */}
                  {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.type === 'upi' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID *</Label>
                        <Input
                          id="upiId"
                          placeholder="yourname@paytm"
                          value={paymentData.upiId}
                          onChange={(e) => handleInputChange('upiId', e.target.value)}
                          disabled={isProcessing}
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter your UPI ID (e.g., 9876543210@paytm, username@ybl)
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-green-50 text-green-800 rounded-lg">
              <Shield className="h-5 w-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. We never store your card details.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{plan.name}</span>
                    <Badge variant="secondary">{plan.popular ? 'Popular' : 'Pro'}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan Price</span>
                      <span>
                        {plan.originalPrice ? (
                          <>
                            <span className="line-through text-muted-foreground mr-2">
                              {formatPrice(plan.originalPrice)}
                            </span>
                            {formatPrice(plan.price)}
                          </>
                        ) : (
                          formatPrice(plan.price)
                        )}
                      </span>
                    </div>
                    
                    {plan.discount && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({plan.discount}%)</span>
                        <span>-{formatPrice((plan.originalPrice || plan.price) - plan.price)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>GST (18%)</span>
                      <span>{formatPrice(Math.round(plan.price * 0.18))}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(Math.round(plan.price * 1.18))}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handlePayment}
                    disabled={!selectedPaymentMethod || isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay {formatPrice(Math.round(plan.price * 1.18))}
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    Cancel Payment
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}