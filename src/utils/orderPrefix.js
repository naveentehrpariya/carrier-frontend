export const getOrderPrefix = (user, company, tenant, order) => {
  // Priority 1: Admin-configured prefix on company record
  if (company?.order_prefix) {
    return company.order_prefix.toUpperCase();
  }

  // Priority 2: order's own company code
  if (order?.company?.code) {
    return order.company.code.toUpperCase();
  }

  // Priority 3: company context code or name initials
  if (company?.code) {
    return company.code.toUpperCase();
  }
  if (company?.name) {
    const words = company.name.split(/\s+/).filter(w => w.length > 0);
    const initials = words.map(w => w.charAt(0).toUpperCase()).join('');
    return initials.length >= 2 ? initials : company.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  }

  // Priority 4: tenant ID
  if (tenant?.tenantId && tenant.tenantId !== 'admin') {
    if (tenant.tenantId.includes('-') || tenant.tenantId.includes('_') || tenant.tenantId.includes(' ')) {
      const words = tenant.tenantId.split(/[-_\s]+/).filter(w => w.length > 0);
      const initials = words.map(w => w.charAt(0).toUpperCase()).join('');
      return initials.length >= 2 ? initials : tenant.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    }
    const p = tenant.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return p.length >= 3 ? p.substring(0, 4) : p;
  }

  if (user?.tenantId && user.tenantId !== 'admin') {
    if (user.tenantId.includes('-') || user.tenantId.includes('_') || user.tenantId.includes(' ')) {
      const words = user.tenantId.split(/[-_\s]+/).filter(w => w.length > 0);
      const initials = words.map(w => w.charAt(0).toUpperCase()).join('');
      return initials.length >= 2 ? initials : user.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    }
    const p = user.tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return p.length >= 3 ? p.substring(0, 4) : p;
  }

  return 'CMC';
};

export const getOrderNumber = (order, user, company, tenant) => {
  const prefix = getOrderPrefix(user, company, tenant, order);
  if (!order || typeof order !== 'object') {
    return `${prefix}-000000`;
  }
  const serialNo = order?.serial_no ?? order?._id?.slice(-6) ?? '000000';
  return `${prefix}-${serialNo}`;
};
