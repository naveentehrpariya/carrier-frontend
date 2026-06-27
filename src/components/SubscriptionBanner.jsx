import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';
import Api from '../api/Api';

/**
 * App-wide banner shown when the tenant has no active subscription (none/expired).
 * Admins get a link to manage billing; staff are told to contact their administrator.
 * Rendered once near the top of the authenticated layout.
 */
export default function SubscriptionBanner() {
  const { user } = useAuth();
  const [state, setState] = useState(null);

  useEffect(() => {
    let active = true;
    Api.get('/subscription/status')
      .then((res) => { if (active) setState(res.data?.data || null); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!state || state.active) return null;

  const isAdmin = user?.is_admin === 1 || Number(user?.role) === 3;
  const expired = state.subStatus === 'expired';

  return (
    <div
      className="mb-5 rounded-2xl px-5 py-3.5 flex items-center gap-3 flex-wrap"
      style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.4)' }}
    >
      <span className="text-lg">⚠️</span>
      <div className="flex-1 min-w-[200px]">
        <p className="text-white text-sm font-semibold">
          {expired ? 'Billing has expired' : 'No active subscription'}
        </p>
        <p className="text-gray-300 text-xs mt-0.5">
          {isAdmin
            ? 'Order creation is locked until you activate a plan.'
            : 'Order creation is locked. Please contact your administrator — billing has expired.'}
        </p>
      </div>
      {isAdmin && (
        <Link
          to="/billing"
          className="text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ background: '#a091ff', color: '#000' }}
        >
          {expired ? 'Renew plan' : 'Choose a plan'}
        </Link>
      )}
    </div>
  );
}
