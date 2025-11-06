/**
 * Safe storage wrapper that handles browser security restrictions
 * Falls back to in-memory storage when localStorage/sessionStorage are not available
 */

// In-memory storage fallback
let memoryStorage = {};
let sessionMemoryStorage = {};

const safeStorage = {
  // Check if localStorage is available
  isLocalStorageAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Check if sessionStorage is available
  isSessionStorageAvailable: () => {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Backward compatibility
  isAvailable: () => {
    return safeStorage.isLocalStorageAvailable();
  },

  getItem: (key) => {
    try {
      if (safeStorage.isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      } else {
        return memoryStorage[key] || null;
      }
    } catch (e) {
      console.warn('LocalStorage access denied, using memory storage:', e.message);
      return memoryStorage[key] || null;
    }
  },

  setItem: (key, value) => {
    try {
      if (safeStorage.isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    } catch (e) {
      console.warn('LocalStorage access denied, using memory storage:', e.message);
      memoryStorage[key] = value;
    }
  },

  removeItem: (key) => {
    try {
      if (safeStorage.isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      } else {
        delete memoryStorage[key];
      }
    } catch (e) {
      console.warn('LocalStorage access denied, using memory storage:', e.message);
      delete memoryStorage[key];
    }
  },

  clear: () => {
    try {
      if (safeStorage.isLocalStorageAvailable()) {
        localStorage.clear();
      } else {
        memoryStorage = {};
      }
    } catch (e) {
      console.warn('LocalStorage access denied, using memory storage:', e.message);
      memoryStorage = {};
    }
  }
};

// Safe sessionStorage wrapper
const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (safeStorage.isSessionStorageAvailable()) {
        return sessionStorage.getItem(key);
      } else {
        return sessionMemoryStorage[key] || null;
      }
    } catch (e) {
      console.warn('SessionStorage access denied, using memory storage:', e.message);
      return sessionMemoryStorage[key] || null;
    }
  },

  setItem: (key, value) => {
    try {
      if (safeStorage.isSessionStorageAvailable()) {
        sessionStorage.setItem(key, value);
      } else {
        sessionMemoryStorage[key] = value;
      }
    } catch (e) {
      console.warn('SessionStorage access denied, using memory storage:', e.message);
      sessionMemoryStorage[key] = value;
    }
  },

  removeItem: (key) => {
    try {
      if (safeStorage.isSessionStorageAvailable()) {
        sessionStorage.removeItem(key);
      } else {
        delete sessionMemoryStorage[key];
      }
    } catch (e) {
      console.warn('SessionStorage access denied, using memory storage:', e.message);
      delete sessionMemoryStorage[key];
    }
  },

  clear: () => {
    try {
      if (safeStorage.isSessionStorageAvailable()) {
        sessionStorage.clear();
      } else {
        sessionMemoryStorage = {};
      }
    } catch (e) {
      console.warn('SessionStorage access denied, using memory storage:', e.message);
      sessionMemoryStorage = {};
    }
  }
};

export default safeStorage;
export { safeSessionStorage };
