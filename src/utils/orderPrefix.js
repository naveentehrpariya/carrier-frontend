/**
 * Utility function to generate tenant-specific order prefix
 * @param {Object} user - User object from context
 * @param {Object} company - Company object from context
 * @param {Object} tenant - Tenant object from MultiTenantContext (if available)
 * @param {Object} order - Order object (may contain tenant-specific info)
 * @returns {string} Tenant-specific prefix using initials (e.g., 'ATL' for 'Acme Transport LLC', default: 'CMC')
 */
export const getOrderPrefix = (user, company, tenant, order) => {
  // Priority 1: Check if order has tenant-specific company information
  if (order?.company?.code) {
    return order.company.code.toUpperCase();
  }
  
  // Priority 2: Check company data from context
  if (company?.code) {
    return company.code.toUpperCase();
  }
  
  if (company?.name) {
    // Generate prefix from company name initials (e.g., "Acme Transport LLC" -> "ATL")
    const words = company.name.split(/\s+/).filter(word => word.length > 0);
    const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
    return initials.length >= 2 ? initials : company.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  }
  
  // Priority 3: Check tenant information
  if (tenant?.tenantId && tenant.tenantId !== 'admin') {
    // Generate prefix from tenant ID initials if it contains separators, otherwise first 3-4 characters
    if (tenant.tenantId.includes('-') || tenant.tenantId.includes('_') || tenant.tenantId.includes(' ')) {
      const words = tenant.tenantId.split(/[-_\s]+/).filter(word => word.length > 0);
      const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      return initials.length >= 2 ? initials : tenant.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    } else {
      const tenantPrefix = tenant.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return tenantPrefix.length >= 3 ? tenantPrefix.substring(0, 4) : tenantPrefix;
    }
  }
  
  // Priority 4: Check user tenant information
  if (user?.tenantId && user.tenantId !== 'admin') {
    // Generate prefix from user tenant ID initials if it contains separators, otherwise first 3-4 characters
    if (user.tenantId.includes('-') || user.tenantId.includes('_') || user.tenantId.includes(' ')) {
      const words = user.tenantId.split(/[-_\s]+/).filter(word => word.length > 0);
      const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      return initials.length >= 2 ? initials : user.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    } else {
      const userTenantPrefix = user.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return userTenantPrefix.length >= 3 ? userTenantPrefix.substring(0, 4) : userTenantPrefix;
    }
  }
  
  // Default fallback
  return 'CMC';
};

/**
 * Generate complete order number with tenant-specific prefix
 * @param {Object} order - Order object
 * @param {Object} user - User object from context
 * @param {Object} company - Company object from context
 * @param {Object} tenant - Tenant object from MultiTenantContext (if available)
 * @returns {string} Complete order number using initials (e.g., 'ATL1234' for 'Acme Transport LLC', 'CMC1234')
 */
export const getOrderNumber = (order, user, company, tenant) => {
  const prefix = getOrderPrefix(user, company, tenant, order);
  const serialNo = order.serial_no || order._id?.slice(-6) || "000000";
  return `${prefix}${serialNo}`;
};