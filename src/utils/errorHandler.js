/**
 * Global error handler to suppress browser extension localStorage errors
 * This prevents browser extensions from breaking the application
 */

// Suppress localStorage/sessionStorage errors from browser extensions
window.addEventListener('error', function(event) {
  // Check if error is from a browser extension
  if (event.filename && event.filename.includes('chrome-extension://')) {
    // Check if it's a localStorage/sessionStorage error
    if (event.error && 
        (event.error.message.includes('localStorage') || 
         event.error.message.includes('sessionStorage') ||
         event.error.message.includes('Access is denied'))) {
      
      console.warn('🚫 Browser extension storage error suppressed:', {
        extension: event.filename,
        error: event.error.message,
        line: event.lineno
      });
      
      // Prevent the error from showing in console/UI
      event.preventDefault();
      return true;
    }
  }
  
  // Let other errors through
  return false;
});

// Also handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && 
      typeof event.reason === 'object' && 
      event.reason.stack &&
      event.reason.stack.includes('chrome-extension://')) {
    
    // Check if it's a storage-related promise rejection
    if (event.reason.message && 
        (event.reason.message.includes('localStorage') || 
         event.reason.message.includes('sessionStorage') ||
         event.reason.message.includes('Access is denied'))) {
      
      console.warn('🚫 Browser extension promise rejection suppressed:', {
        reason: event.reason.message,
        stack: event.reason.stack.split('\n')[0]
      });
      
      // Prevent unhandled rejection
      event.preventDefault();
      return true;
    }
  }
  
  return false;
});

console.log('✅ Extension error handler loaded');

export default function suppressExtensionErrors() {
  // This function can be called to manually initialize if needed
  console.log('🛡️ Extension error suppression active');
}