import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Api from '../api/Api';
import { useMultiTenant } from './MultiTenantProvider';
import { useAuth } from './MultiTenantAuthProvider';

const SidebarCountsContext = createContext(null);

export function SidebarCountsProvider({ children }) {
  const { tenant, isSuperAdmin } = useMultiTenant();
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState({ orders: 0, customers: 0, carriers: 0, employees: 0 });
  const [loadingCounts, setLoadingCounts] = useState(false);
  const refreshingRef = useRef(false);

  const api = useMemo(() => {
    // Use tenant-aware API to ensure header injection and consistent paths
    try {
      // getTenantApi appends a request interceptor that adds X-Tenant-ID
      // It is okay to call once per provider mount
      const { getTenantApi } = require('./MultiTenantProvider');
    } catch {}
    return Api; // fallback; we'll still rely on MultiTenantProvider's exported getTenantApi via context
  }, []);

  const { getTenantApi } = useMultiTenant();
  const tenantApi = useMemo(() => (getTenantApi ? getTenantApi() : api), [getTenantApi, tenant?.id, isSuperAdmin]);

  const fetchCounts = async () => {
    if (refreshingRef.current) return; // Prevent concurrent refreshes
    refreshingRef.current = true;
    try {
      setLoadingCounts(true);

      const [overviewRes, customersRes, carriersRes, employeesRes] = await Promise.all([
        tenantApi.get('/overview'),
        tenantApi.get('/customer/listings?limit=1'),
        tenantApi.get('/carriers/listings?limit=1'),
        tenantApi.get('/user/staff-listing?limit=1'),
      ]);

      setCounts({
        orders: overviewRes?.data?.lists?.[0]?.data || 0,
        customers: customersRes?.data?.totalDocuments || 0,
        carriers: carriersRes?.data?.totalDocuments || 0,
        employees: employeesRes?.data?.totalDocuments || 0,
      });
    } catch (err) {
      // Keep last known counts on error; only log
      console.error('SidebarCounts fetch failed:', err);
    } finally {
      setLoadingCounts(false);
      refreshingRef.current = false;
    }
  };

  useEffect(() => {
    // Initial load and on tenant change (only when authenticated)
    if (!isSuperAdmin && isAuthenticated) {
      fetchCounts();
    }
  }, [tenantApi, isSuperAdmin, isAuthenticated]);

  useEffect(() => {
    // Listen for global refresh events emitted after mutations
    const onRefreshEvent = () => {
      if (!isSuperAdmin) fetchCounts();
    };
    window.addEventListener('sidebar-counts:refresh', onRefreshEvent);
    return () => window.removeEventListener('sidebar-counts:refresh', onRefreshEvent);
  }, [isSuperAdmin, tenantApi]);

  const value = useMemo(() => ({ counts, loadingCounts, refreshCounts: fetchCounts }), [counts, loadingCounts]);
  return (
    <SidebarCountsContext.Provider value={value}>
      {children}
    </SidebarCountsContext.Provider>
  );
}

export function useSidebarCounts() {
  const ctx = useContext(SidebarCountsContext);
  if (!ctx) throw new Error('useSidebarCounts must be used within SidebarCountsProvider');
  return ctx;
}