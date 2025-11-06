/**
 * Utility to clear all storage data - useful for debugging
 * Run this in browser console or import in components
 */

import safeStorage, { safeSessionStorage } from './safeStorage';

const clearAllStorage = () => {
  try {
    // Clear our safe storage
    safeStorage.clear();
    safeSessionStorage.clear();
    
    // Clear specific keys we know about
    const keys = [
      'token', 'user', 'company', 'admin', 
      'tenantContext', 'emulationBackup'
    ];
    
    keys.forEach(key => {
      safeStorage.removeItem(key);
      safeSessionStorage.removeItem(key);
    });
    
    console.log('✅ Storage cleared successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Error clearing storage:', error);
    return false;
  }
};

// Export for use in components
export default clearAllStorage;

// Make it available globally for browser console debugging
if (typeof window !== 'undefined') {
  window.clearAllStorage = clearAllStorage;
}