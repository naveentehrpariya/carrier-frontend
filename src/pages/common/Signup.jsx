import React, { useEffect, useState } from 'react';
import Api from '../../api/Api';
import toast from 'react-hot-toast';

export default function Signup() {
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
    <div className="container" style={{ maxWidth: 840, margin: '40px auto' }}>
      <h2>Sign Up Your Company</h2>
      <p>Choose a subscription plan and create your tenant.</p>
      {loadingPlans ? (
        <p>Loading plans…</p>
      ) : (
        <form onSubmit={submit}>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label>Company Name*</label>
              <input name="companyName" value={form.companyName} onChange={update} placeholder="Acme Logistics" />
            </div>
            <div>
              <label>Subdomain*</label>
              <input name="subdomain" value={form.subdomain} onChange={update} placeholder="acme" />
              <small>Will become subdomain like acme.yourapp.com</small>
            </div>
            <div>
              <label>Contact Name</label>
              <input name="contactName" value={form.contactName} onChange={update} placeholder="John Doe" />
            </div>
            <div>
              <label>Email*</label>
              <input name="email" type="email" value={form.email} onChange={update} placeholder="john@acme.com" />
            </div>
            <div>
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={update} placeholder="+1 555 123 4567" />
            </div>
            <div>
              <label>Address</label>
              <input name="address" value={form.address} onChange={update} placeholder="123 Main St, City" />
            </div>
            <div>
              <label>Plan*</label>
              <select name="planSlug" value={form.planSlug} onChange={update}>
                {plans.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name} — {p.price}{p.currency ? ' ' + p.currency : ''}/mo</option>
                ))}
              </select>
            </div>
            <div>
              <label>Billing Cycle</label>
              <div>
                <label style={{ marginRight: 16 }}>
                  <input type="radio" name="billingCycle" value="monthly" checked={form.billingCycle === 'monthly'} onChange={update} /> Monthly
                </label>
                <label>
                  <input type="radio" name="billingCycle" value="yearly" checked={form.billingCycle === 'yearly'} onChange={update} /> Yearly
                </label>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Redirecting…' : 'Continue to Payment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}