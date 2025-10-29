import React, { useEffect, useState } from 'react';
import Api from '../../api/Api';
import toast from 'react-hot-toast';
import HomeLayout from '../../layout/HomeLayout';

export default function Register() {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [form, setForm] = useState({
    companyName: '',
    subdomain: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    planSlug: '',
    billingCycle: 'monthly'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await Api.get('/api/landing/plans');
        const list = res?.data?.data?.plans || [];
        setPlans(list);
        if (list.length && !form.planSlug) {
          setForm(f => ({ ...f, planSlug: list[0].slug }));
        }
      } catch (e) {
        toast.error('Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.subdomain || !form.email || !form.planSlug) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await Api.post('/api/landing/signup', form);
      const url = res?.data?.data?.checkoutUrl;
      if (!url) throw new Error('Checkout URL not received');
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <HomeLayout title="Register">
      <section className="min-h-screen bg-[#0B0E1A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Register Your Company</h2>
            <p className="text-gray-300 mt-2">Choose a subscription plan and create your tenant.</p>
          </div>
          {loadingPlans ? (
            <p>Loading plans…</p>
          ) : (
            <form onSubmit={submit} className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name*</label>
                  <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="companyName" value={form.companyName} onChange={update} placeholder="Acme Logistics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subdomain*</label>
                  <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="subdomain" value={form.subdomain} onChange={update} placeholder="acme" />
                  <small className="text-gray-400">Will become subdomain like acme.yourapp.com</small>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Name</label>
                  <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="contactName" value={form.contactName} onChange={update} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email*</label>
                  <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="email" type="email" value={form.email} onChange={update} placeholder="john@acme.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="phone" value={form.phone} onChange={update} placeholder="+1 555 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="address" value={form.address} onChange={update} placeholder="123 Main St, City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plan*</label>
                  <select className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white" name="planSlug" value={form.planSlug} onChange={update}>
                    {plans.map(p => (
                      <option key={p.slug} value={p.slug}>{p.name} — {p.price}{p.currency ? ' ' + p.currency : ''}/mo</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Billing Cycle</label>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center space-x-2">
                      <input type="radio" name="billingCycle" value="monthly" checked={form.billingCycle === 'monthly'} onChange={update} />
                      <span>Monthly</span>
                    </label>
                    <label className="inline-flex items-center space-x-2">
                      <input type="radio" name="billingCycle" value="yearly" checked={form.billingCycle === 'yearly'} onChange={update} />
                      <span>Yearly</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button type="submit" disabled={submitting} className="px-5 py-3 rounded-md bg-red-600 hover:bg-red-700 font-medium">
                  {submitting ? 'Redirecting…' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </HomeLayout>
  );
}