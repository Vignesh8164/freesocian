// ========================================
// SYSTEM INTEGRATION COORDINATOR
// ========================================
// This file coordinates all backend integrations and provides a unified interface
// for the application to interact with Appwrite, Unsplash, Instagram, and Payment services.

import { 
  getCurrentUser, 
  initializeDatabase as initAppwrite,
  checkAppwriteConnection as checkAppwrite,
  isAppwriteConfigured,
  User as AppwriteUser
} from './AppwriteService';

import { 
  initializeInstagramService,
  checkInstagramConfiguration,
  isInstagramConfigured 
} from './InstagramApiService';

import { 
  checkUnsplashConnection,
  isUnsplashConfigured 
} from './UnsplashService';

import { toast } from 'sonner@2.0.3';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface SystemStatus {
  appwrite: {
    configured: boolean;
    connected: boolean;
    status: 'ready' | 'demo' | 'error';
    message: string;
  };
  unsplash: {
    configured: boolean;
    connected: boolean;
    status: 'ready' | 'demo' | 'error';
    message: string;
  };
  instagram: {
    configured: boolean;
    status: 'ready' | 'demo' | 'error';
    message: string;
    missingFields: string[];
  };
  payment: {
    status: 'demo';
    message: string;
  };
  overall: {
    mode: 'production' | 'demo' | 'mixed';
    readyForProduction: boolean;
    demoServices: string[];
    productionServices: string[];
  };
}

export interface InitializationResult {
  success: boolean;
  systemStatus: SystemStatus;
  user: AppwriteUser | null;
  error?: string;
}

// ========================================
// SYSTEM INITIALIZATION
// ========================================

/**
 * Initialize all application services and return comprehensive status
 * This is the main entry point for app initialization
 */
export const initializeAllServices = async (): Promise<InitializationResult> => {
  console.log('🚀 Starting system initialization...');
  
  try {
    // Step 1: Initialize Appwrite (includes demo data cleanup)
    console.log('📦 Initializing Appwrite backend...');
    const appwriteStatus = await initializeAppwriteService();
    
    // Step 2: Initialize Instagram service (includes demo cleanup)
    console.log('📸 Initializing Instagram API service...');
    await initializeInstagramService();
    const instagramStatus = await checkInstagramService();
    
    // Step 3: Check Unsplash service
    console.log('🖼️ Checking Unsplash API service...');
    const unsplashStatus = await checkUnsplashService();
    
    // Step 4: Payment system (always demo mode for now)
    console.log('💳 Initializing payment system...');
    const paymentStatus = {
      status: 'demo' as const,
      message: 'Payment system running in demo mode with simulated transactions'
    };
    
    // Step 5: Check for authenticated user
    console.log('👤 Checking user authentication...');
    let currentUser: AppwriteUser | null = null;
    try {
      currentUser = await getCurrentUser();
    } catch (error) {
      // Expected when no user is logged in
      console.log('No authenticated user found (expected for fresh start)');
    }
    
    // Step 6: Determine overall system status
    const systemStatus: SystemStatus = {
      appwrite: appwriteStatus,
      unsplash: unsplashStatus,
      instagram: instagramStatus,
      payment: paymentStatus,
      overall: determineOverallStatus(appwriteStatus, unsplashStatus, instagramStatus)
    };
    
    // Step 7: Log system status
    logSystemStatus(systemStatus);
    
    console.log('✅ System initialization completed successfully!');
    
    return {
      success: true,
      systemStatus,
      user: currentUser
    };
    
  } catch (error) {
    console.error('❌ System initialization failed:', error);
    
    // Return safe demo status on error
    const fallbackStatus: SystemStatus = {
      appwrite: { configured: false, connected: false, status: 'demo', message: 'Running in demo mode' },
      unsplash: { configured: false, connected: false, status: 'demo', message: 'Using sample images' },
      instagram: { configured: false, status: 'demo', message: 'Simulated Instagram integration', missingFields: [] },
      payment: { status: 'demo', message: 'Demo payment system' },
      overall: { mode: 'demo', readyForProduction: false, demoServices: ['all'], productionServices: [] }
    };
    
    return {
      success: false,
      systemStatus: fallbackStatus,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown initialization error'
    };
  }
};

// ========================================
// SERVICE-SPECIFIC INITIALIZATION
// ========================================

/**
 * Initialize Appwrite backend service
 */
const initializeAppwriteService = async () => {
  try {
    // Clear all demo data first
    await initAppwrite();
    
    const isConfigured = isAppwriteConfigured();
    const isConnected = await checkAppwrite();
    
    if (isConfigured && isConnected) {
      return {
        configured: true,
        connected: true,
        status: 'ready' as const,
        message: 'Appwrite backend connected and ready'
      };
    } else if (isConfigured && !isConnected) {
      return {
        configured: true,
        connected: false,
        status: 'error' as const,
        message: 'Appwrite configured but connection failed'
      };
    } else {
      return {
        configured: false,
        connected: false,
        status: 'demo' as const,
        message: 'Running in demo mode with local storage'
      };
    }
  } catch (error) {
    console.error('Appwrite initialization error:', error);
    return {
      configured: false,
      connected: false,
      status: 'demo' as const,
      message: 'Fallback to demo mode due to initialization error'
    };
  }
};

/**
 * Check Unsplash API service status
 */
const checkUnsplashService = async () => {
  try {
    const isConfigured = isUnsplashConfigured();
    let connected = false;
    
    if (isConfigured) {
      try {
        connected = await checkUnsplashConnection();
      } catch (error) {
        console.warn('Unsplash connection check failed:', error);
      }
    }
    
    if (isConfigured && connected) {
      return {
        configured: true,
        connected: true,
        status: 'ready' as const,
        message: 'Unsplash API connected - access to 3M+ images'
      };
    } else if (isConfigured && !connected) {
      return {
        configured: true,
        connected: false,
        status: 'error' as const,
        message: 'Unsplash API configured but connection failed'
      };
    } else {
      return {
        configured: false,
        connected: false,
        status: 'demo' as const,
        message: 'Using curated sample images (8 high-quality photos)'
      };
    }
  } catch (error) {
    console.error('Unsplash service check error:', error);
    return {
      configured: false,
      connected: false,
      status: 'demo' as const,
      message: 'Fallback to sample images due to service error'
    };
  }
};

/**
 * Check Instagram API service status
 */
const checkInstagramService = async () => {
  try {
    const { isConfigured: configured, missingFields } = checkInstagramConfiguration();
    
    if (configured) {
      return {
        configured: true,
        status: 'ready' as const,
        message: 'Instagram API ready for real post publishing',
        missingFields: []
      };
    } else {
      return {
        configured: false,
        status: 'demo' as const,
        message: 'Simulated Instagram integration with full OAuth flow',
        missingFields
      };
    }
  } catch (error) {
    console.error('Instagram service check error:', error);
    return {
      configured: false,
      status: 'demo' as const,
      message: 'Fallback to demo mode due to service error',
      missingFields: ['all']
    };
  }
};

// ========================================
// STATUS DETERMINATION
// ========================================

/**
 * Determine overall system status based on individual services
 */
const determineOverallStatus = (appwrite: any, unsplash: any, instagram: any) => {
  const productionServices: string[] = [];
  const demoServices: string[] = [];
  
  // Check each service
  if (appwrite.status === 'ready') {
    productionServices.push('Appwrite Backend');
  } else {
    demoServices.push('Appwrite Backend');
  }
  
  if (unsplash.status === 'ready') {
    productionServices.push('Unsplash API');
  } else {
    demoServices.push('Unsplash API');
  }
  
  if (instagram.status === 'ready') {
    productionServices.push('Instagram API');
  } else {
    demoServices.push('Instagram API');
  }
  
  // Payment is always demo for now
  demoServices.push('Payment System');
  
  // Determine mode
  let mode: 'production' | 'demo' | 'mixed';
  if (productionServices.length === 0) {
    mode = 'demo';
  } else if (demoServices.length <= 1) { // Only payment system is demo
    mode = 'production';
  } else {
    mode = 'mixed';
  }
  
  return {
    mode,
    readyForProduction: productionServices.length >= 3, // All except payment
    demoServices,
    productionServices
  };
};

// ========================================
// LOGGING & USER FEEDBACK
// ========================================

/**
 * Log comprehensive system status to console
 */
const logSystemStatus = (status: SystemStatus) => {
  console.log('📊 System Status Report:');
  console.log('========================');
  
  // Service statuses
  console.log(`🗄️  Appwrite Backend: ${status.appwrite.status.toUpperCase()} - ${status.appwrite.message}`);
  console.log(`🖼️  Unsplash API: ${status.unsplash.status.toUpperCase()} - ${status.unsplash.message}`);
  console.log(`📸 Instagram API: ${status.instagram.status.toUpperCase()} - ${status.instagram.message}`);
  console.log(`💳 Payment System: ${status.payment.status.toUpperCase()} - ${status.payment.message}`);
  
  console.log('========================');
  console.log(`🎯 Overall Mode: ${status.overall.mode.toUpperCase()}`);
  
  if (status.overall.productionServices.length > 0) {
    console.log(`✅ Production Services: ${status.overall.productionServices.join(', ')}`);
  }
  
  if (status.overall.demoServices.length > 0) {
    console.log(`🎮 Demo Services: ${status.overall.demoServices.join(', ')}`);
  }
  
  console.log('========================');
  
  if (status.overall.mode === 'demo') {
    console.log('🎮 Full Demo Mode: All features work with simulated backends');
    console.log('📖 See API_CONFIGURATION.md for production setup guide');
  } else if (status.overall.mode === 'production') {
    console.log('🚀 Production Ready: All services configured and connected');
  } else {
    console.log('🔧 Mixed Mode: Some services in production, others in demo');
    console.log('📖 See API_CONFIGURATION.md to configure remaining services');
  }
  
  console.log('========================');
};

/**
 * Show user-friendly system status in UI
 */
export const showSystemStatusToUser = (status: SystemStatus) => {
  if (status.overall.mode === 'production') {
    toast.success('All systems connected!', {
      description: 'Ready for live Instagram posting with full features'
    });
  } else if (status.overall.mode === 'demo') {
    toast.info('Running in demo mode', {
      description: 'All features work with simulated backends. See API_CONFIGURATION.md to go live.'
    });
  } else {
    toast.info('Mixed mode active', {
      description: `${status.overall.productionServices.length} services live, ${status.overall.demoServices.length - 1} in demo`
    });
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if system is ready for production use
 */
export const isSystemReadyForProduction = (status: SystemStatus): boolean => {
  return status.overall.readyForProduction;
};

/**
 * Get production readiness checklist
 */
export const getProductionChecklist = (status: SystemStatus) => {
  return {
    appwrite: status.appwrite.status === 'ready',
    unsplash: status.unsplash.status === 'ready', 
    instagram: status.instagram.status === 'ready',
    payment: false, // Always false for now
    overall: status.overall.readyForProduction
  };
};

/**
 * Get next steps for production setup
 */
export const getNextSetupSteps = (status: SystemStatus): string[] => {
  const steps: string[] = [];
  
  if (status.appwrite.status !== 'ready') {
    steps.push('Set up Appwrite backend (see APPWRITE_SETUP.md)');
  }
  
  if (status.unsplash.status !== 'ready') {
    steps.push('Configure Unsplash API (see UNSPLASH_SETUP.md)');
  }
  
  if (status.instagram.status !== 'ready') {
    steps.push('Set up Instagram API (see INSTAGRAM_SETUP.md)');
  }

  if (steps.length === 0) {
    steps.push('All services configured! System ready for production.');
  }
  
  return steps;
};

// ========================================
// HEALTH CHECK FUNCTIONS
// ========================================

/**
 * Perform runtime health check of all services  
 */
export const performHealthCheck = async (): Promise<{
  healthy: boolean;
  services: Record<string, boolean>;
  issues: string[];
}> => {
  const services: Record<string, boolean> = {};
  const issues: string[] = [];
  
  try {
    // Check Appwrite
    services.appwrite = await checkAppwrite();
    if (!services.appwrite && isAppwriteConfigured()) {
      issues.push('Appwrite connection lost');
    }
    
    // Check Unsplash
    if (isUnsplashConfigured()) {
      services.unsplash = await checkUnsplashConnection();
      if (!services.unsplash) {
        issues.push('Unsplash API connection issues');
      }
    } else {
      services.unsplash = true; // Demo mode is always "healthy"
    }
    
    // Instagram is connection-based, always healthy in terms of service
    services.instagram = true;
    
    // Payment is always healthy in demo mode
    services.payment = true;
    
  } catch (error) {
    issues.push(`Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  const healthy = Object.values(services).every(status => status === true) && issues.length === 0;
  
  return { healthy, services, issues };
};

/**
 * Auto-recover from service issues where possible
 */
export const attemptServiceRecovery = async (): Promise<{
  recovered: boolean;
  message: string;
}> => {
  try {
    console.log('🔄 Attempting service recovery...');
    
    // For now, just re-initialize the system
    const result = await initializeAllServices();
    
    if (result.success) {
      return {
        recovered: true,
        message: 'System services recovered successfully'
      };
    } else {
      return {
        recovered: false,
        message: result.error || 'Recovery failed'
      };
    }
  } catch (error) {
    return {
      recovered: false,
      message: error instanceof Error ? error.message : 'Recovery attempt failed'
    };
  }
};

// Export the main initialization function as default
export default initializeAllServices;