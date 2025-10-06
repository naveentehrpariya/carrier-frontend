// Clear all authentication data from localStorage and sessionStorage
console.log('🧹 Clearing all authentication data...');

const keys = [
  'token', 'user', 'company', 'admin', 'tenant', 'isSuperAdmin', 'tenantContext'
];

keys.forEach(key => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  console.log(`Cleared ${key}`);
});

console.log('✅ All authentication data cleared!');
console.log('Please refresh the page and try logging in again.');