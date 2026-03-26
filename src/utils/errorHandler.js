window.addEventListener('error', function (event) {
  try {
    const fromExtension = typeof event.filename === 'string' && event.filename.indexOf('chrome-extension://') !== -1;
    if (fromExtension) {
      const msg = event && event.error && event.error.message ? event.error.message : '';
      if (
        msg.includes('localStorage') ||
        msg.includes('sessionStorage') ||
        msg.includes('Access is denied') ||
        msg.includes('Document not ready') ||
        msg.includes('no body')
      ) {
        event.preventDefault();
        return true;
      }
    }
  } catch (e) {}
  return false;
});

window.addEventListener('unhandledrejection', function (event) {
  try {
    const stack = event && event.reason && event.reason.stack ? event.reason.stack : '';
    const msg = event && event.reason && event.reason.message ? event.reason.message : '';
    const fromExtension = typeof stack === 'string' && stack.indexOf('chrome-extension://') !== -1;
    if (fromExtension) {
      if (
        msg.includes('localStorage') ||
        msg.includes('sessionStorage') ||
        msg.includes('Access is denied') ||
        msg.includes('Document not ready') ||
        msg.includes('no body')
      ) {
        event.preventDefault();
        return true;
      }
    }
  } catch (e) {}
  return false;
});

export default function suppressExtensionErrors() {}
