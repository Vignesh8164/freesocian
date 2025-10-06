// Subscription and payment utility functions

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  discount?: number;
}

export interface UserSubscription {
  plan: 'trial' | 'pro';
  planType?: 'monthly' | 'yearly';
  expiresAt?: Date;
  isFirstTimeUser: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card';
  icon: string;
  description: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: 999,
    duration: 'per month',
    features: [
      'Unlimited post scheduling',
      'Advanced analytics',
      'Multiple account management',
      'Priority support',
      'Custom hashtag suggestions',
      'Best time to post insights'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: 9999,
    duration: 'per year',
    popular: true,
    features: [
      'All Monthly Pro features',
      'Advanced team collaboration',
      'White-label reports',
      'API access',
      'Dedicated account manager',
      'Priority customer support'
    ]
  }
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    type: 'upi',
    icon: '📱',
    description: 'Pay with Google Pay UPI'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    type: 'upi',
    icon: '💜',
    description: 'Pay with PhonePe UPI'
  },
  {
    id: 'upi',
    name: 'Other UPI',
    type: 'upi',
    icon: '🏦',
    description: 'Pay with any UPI app'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'card',
    icon: '💳',
    description: 'Visa, Mastercard, RuPay'
  }
];

// Apply first-time user discount
export const applyFirstTimeDiscount = (plan: SubscriptionPlan, isFirstTime: boolean): SubscriptionPlan => {
  if (!isFirstTime) return plan;
  
  // Apply 30% discount only to yearly plan for first-time users
  if (plan.id === 'yearly') {
    const discountedPrice = 6999; // 30% off ₹9,999
    return {
      ...plan,
      originalPrice: plan.price,
      price: discountedPrice,
      discount: 30
    };
  }
  
  // Apply 5% discount to monthly plan for first-time users
  const discountedPrice = Math.round(plan.price * 0.95);
  return {
    ...plan,
    originalPrice: plan.price,
    price: discountedPrice,
    discount: 5
  };
};

// Get user subscription status
export const getUserSubscription = (): UserSubscription => {
  const stored = localStorage.getItem('user_subscription');
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined
    };
  }
  
  return {
    plan: 'trial',
    isFirstTimeUser: true
  };
};

// Save user subscription
export const saveUserSubscription = (subscription: UserSubscription): void => {
  localStorage.setItem('user_subscription', JSON.stringify(subscription));
};

// Process payment (mock implementation)
export const processPayment = async (
  planId: string,
  paymentMethodId: string,
  paymentData: any
): Promise<{ success: boolean; error?: string; transactionId?: string }> => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock validation
  if (paymentMethodId === 'card' && !paymentData.cardNumber) {
    return { success: false, error: 'Card number is required' };
  }
  
  if (paymentMethodId !== 'card' && !paymentData.upiId) {
    return { success: false, error: 'UPI ID is required' };
  }
  
  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    return { success: false, error: 'Payment failed. Please try again.' };
  }
  
  // Simulate successful payment
  const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
  
  return {
    success: true,
    transactionId
  };
};

// Check if plan is active
export const isPlanActive = (subscription: UserSubscription): boolean => {
  if (subscription.plan === 'trial') return true;
  if (!subscription.expiresAt) return false;
  return new Date() < subscription.expiresAt;
};

// Get plan expiry date
export const getPlanExpiryDate = (planType: 'monthly' | 'yearly'): Date => {
  const now = new Date();
  if (planType === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  } else {
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  }
};