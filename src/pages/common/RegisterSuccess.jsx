import React, { useEffect, useState } from 'react';
import Api from '../../api/Api';
import HomeLayout from '../../layout/HomeLayout';

export default function RegisterSuccess() {
  const [state, setState] = useState({ confirming: true, tenantUrl: '', message: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const mock = params.get('mock');
    const email = params.get('email');

    const confirm = async () => {
      try {
        const res = await Api.post('/api/landing/confirm-signup', {
          sessionId: sessionId || undefined,
          email: email || undefined
        });
        const url = res?.data?.data?.tenantUrl;
        setState({ confirming: false, tenantUrl: url || '', message: 'Signup confirmed. Tenant activated.' });
      } catch (err) {
        setState({ confirming: false, tenantUrl: '', message: err?.response?.data?.message || 'Confirmation failed' });
      }
    };

    // In dev mock mode, we still confirm using email
    if (sessionId || mock) {
      confirm();
    } else {
      // Fallback confirm to be safe
      confirm();
    }
  }, []);

  return (
    <HomeLayout title="Register Success">
      <section className="min-h-screen bg-[#0B0E1A] text-white">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold">Thank you! Payment received.</h2>
          {state.confirming ? (
            <p className="text-gray-300 mt-4">Finalizing your tenant setup…</p>
          ) : (
            <>
              <p className="text-gray-300 mt-4">{state.message}</p>
              {state.tenantUrl ? (
                <div className="mt-6">
                  <a href={state.tenantUrl} className="px-5 py-3 rounded-md bg-red-600 hover:bg-red-700 font-medium">Go to your tenant</a>
                </div>
              ) : (
                <div className="mt-6">
                  <a href="/login" className="px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 font-medium">Go to login</a>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </HomeLayout>
  );
}