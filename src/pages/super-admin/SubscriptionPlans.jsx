import React, { useEffect, useState } from 'react';
import Api from '../../api/Api';
import SuperAdminLayout from '../../layout/SuperAdminLayout';
import Popup from '../common/Popup';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import Nocontent from '../common/NoContent';

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm mb-2">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="text-gray-300">{label}</span>
    </label>
  );
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    limits: { maxUsers: 10, maxOrders: 1000, maxCustomers: 1000, maxCarriers: 500 },
    featuresInput: ''
  });

  const [action, setAction] = useState();
  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await Api.get('/api/super-admin/subscription-plans');
      const data = res?.data?.data?.plans || [];
      setPlans(data);
      setAction("close")
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const onLimitChange = (key, value) => setForm(prev => ({ ...prev, limits: { ...prev.limits, [key]: value } }));

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      limits: { maxUsers: 10, maxOrders: 1000, maxCustomers: 1000, maxCarriers: 500 },
      featuresInput: ''
    });
  };

  const createPlan = async (e) => {
    e && e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const features = form.featuresInput
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        isActive: form.isActive,
        limits: {
          ...(form?.limits?.maxUsers ? { maxUsers: Number(form.limits.maxUsers) } : {}),
          ...(form?.limits?.maxOrders ? { maxOrders: Number(form.limits.maxOrders) } : {}),
          ...(form?.limits?.maxCustomers ? { maxCustomers: Number(form.limits.maxCustomers) } : {}),
          ...(form?.limits?.maxCarriers ? { maxCarriers: Number(form.limits.maxCarriers) } : {})
        },
        features
      };

      const res = await Api.post('/api/super-admin/subscription-plans', payload);
      const created = res?.data?.data?.plan;
      if (created) {
        setAction("close")
        window.location.reload();
        setTimeout(() => {
          resetForm();
        }, 1000);
        await fetchPlans();
        toast.success('Plan created successfully');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
      setAction("close")
    }
  };

   

  return (
    <SuperAdminLayout>
      <div className="">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-white font-semibold mb-2">Pricing Plans</h2>
            <p className="text-sm text-gray-400">Manage public plans displayed on register page</p>
          </div>
          <div className="flex gap-2">
            <Popup action={action} btntext='New Plan' btnclasses={'btn'} bg={'bg-gray-900'} >
                <div className="bg-gray-900 w-full  p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-xl md:text-2xl font-semibold">Create New Plan</h3>
                  </div>
                  <form onSubmit={createPlan}>
                    <div className="">
                      <Field label="Name">
                        <input className="input-sm mb-3" value={form.name} onChange={e => onChange('name', e.target.value)} required />
                      </Field>
                      {/* <Field label="Slug (optional)">
                        <input className="input-sm" value={form.slug} onChange={e => onChange('slug', e.target.value)} placeholder="auto-generated from name" />
                        </Field> */}
                      <Field label="Description">
                        <input className="input-sm" value={form.description} onChange={e => onChange('description', e.target.value)} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <Field label="Max Users">
                        <input type="number" className="input-sm" value={form?.limits?.maxUsers ?? ''} onChange={e => onLimitChange('maxUsers', e.target.value)} min="1" />
                      </Field>
                      <Field label="Max Orders">
                        <input type="number" className="input-sm" value={form?.limits?.maxOrders ?? ''} onChange={e => onLimitChange('maxOrders', e.target.value)} min="0" />
                      </Field>
                      <Field label="Max Customers">
                        <input type="number" className="input-sm" value={form?.limits?.maxCustomers ?? ''} onChange={e => onLimitChange('maxCustomers', e.target.value)} min="0" />
                      </Field>
                      <Field label="Max Carriers">
                        <input type="number" className="input-sm" value={form?.limits?.maxCarriers ?? ''} onChange={e => onLimitChange('maxCarriers', e.target.value)} min="0" />
                      </Field>

                      {/* <Field label="Features (comma-separated)">
                        <input className="input-sm" value={form.featuresInput} onChange={e => onChange('featuresInput', e.target.value)} placeholder="orders, customers, carriers" />
                      </Field> */}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                      <button type="submit" disabled={submitting} className="btn">
                        {submitting ? 'Creating…' : 'Create Plan'}
                      </button>
                    </div>
                  </form>
                </div>
            </Popup>

            <button
              className="btn bg-gray-700 text-white"
              onClick={fetchPlans}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <Loading/>
        ) : plans.length === 0 ? (
          <Nocontent />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div key={p._id || p.slug} className="rounded-[30px] bg-gray-700/10 border border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold text-xl">{p.name}</div>
                    {/* <div className="text-gray-400 text-xs">{p.slug}</div> */}
                  </div>
                  {p.isPopular && <span className="text-xs px-2 py-1 bg-yellow-600 text-black rounded">Popular</span>}
                </div>
                <div className="mt-3 text-indigo-300 text-xl">Max Users: {p?.limits?.maxUsers ?? '-'}</div>
                {p.description && <div className="mt-2 text-gray-300 text-sm">{p.description}</div>}

                <div className="mt-3 flex flex-wrap text-gray-300 text-sm">
                  <div className='me-2 mt-2'>Max Orders: {p?.limits?.maxOrders ?? '—'}</div>
                  <div className='me-2 mt-2'>Max Customers: {p?.limits?.maxCustomers ?? '—'}</div>
                  <div className='me-2 mt-2'>Max Carriers: {p?.limits?.maxCarriers ?? '—'}</div>
                </div>

                <div className="mt-3 flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-[30px] ${p.isActive ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  {/* <span className={`px-2 py-1 rounded ${p.isPublic ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'}`}>{p.isPublic ? 'Public' : 'Private'}</span> */}
                </div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul className="mt-3 text-sm text-gray-300 list-disc list-inside">
                    {p.features.slice(0, 5).map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

         
      </div>
    </SuperAdminLayout>
  );
}