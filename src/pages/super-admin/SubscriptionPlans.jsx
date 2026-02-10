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
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

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

  const startEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      isActive: plan.isActive,
      limits: {
        maxUsers: plan.limits?.maxUsers || 10,
        maxOrders: plan.limits?.maxOrders || 1000,
        maxCustomers: plan.limits?.maxCustomers || 1000,
        maxCarriers: plan.limits?.maxCarriers || 500
      },
      featuresInput: Array.isArray(plan.features) ? plan.features.join(', ') : ''
    });
  };

  const updatePlan = async (e) => {
    e && e.preventDefault();
    if (!editingPlan) return;
    
    setSubmitting(true);
    setError('');
    try {
      const features = form.featuresInput
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        isActive: form.isActive,
        limits: {
          maxUsers: Number(form.limits.maxUsers),
          maxOrders: Number(form.limits.maxOrders),
          maxCustomers: Number(form.limits.maxCustomers),
          maxCarriers: Number(form.limits.maxCarriers)
        },
        features
      };

      console.log('Frontend: Updating plan with payload:', payload);
      console.log('Frontend: Plan ID:', editingPlan._id);
      
      const res = await Api.put(`/api/super-admin/subscription-plans/${editingPlan._id}`, payload);
      console.log('Frontend: Update response:', res.data);
      if (res.data.status) {
        setEditingPlan(null);
        resetForm();
        await fetchPlans();
        toast.success('Plan updated successfully');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update plan');
    } finally {
      setSubmitting(false);
    }
  };

  const startDelete = (plan) => {
    setDeletingPlan(plan);
    setDeleteConfirmInput('');
  };

  const deletePlan = async () => {
    if (!deletingPlan || deleteConfirmInput !== deletingPlan.slug) {
      setError('Please type the plan slug to confirm deletion');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await Api.delete(`/api/super-admin/subscription-plans/${deletingPlan._id}`);
      setDeletingPlan(null);
      setDeleteConfirmInput('');
      await fetchPlans();
      toast.success('Plan deleted successfully');
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 'Failed to delete plan';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    resetForm();
    setError('');
  };

  const cancelDelete = () => {
    setDeletingPlan(null);
    setDeleteConfirmInput('');
    setError('');
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p._id || p.slug} className="rounded-2xl bg-dark2 border border-gray-800 p-6 hover:border-gray-700 transition-all">
                <div className="flex items-start justify-between">
                  <div> 
                    <div className="text-white font-semibold text-lg uppercase">{p.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{p.slug}</div>
                    {p.description && <div className="mt-2 text-gray-300 text-sm">{p.description}</div>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="text-center flex items-center p-3 justify-center bg-gray-800/60 text-gray-200 rounded-xl py-3">
                    <div className="text-sm pe-2  text-gray-400">Users : </div>
                    <div className="text-sm  font-semibold">{p?.limits?.maxUsers ?? '—'}</div>
                  </div>
                  <div className="text-center flex items-center p-3 justify-center bg-gray-800/60 text-gray-200 rounded-xl py-3">
                    <div className="text-sm pe-2  text-gray-400">Orders : </div>
                    <div className="text-sm  font-semibold">{p?.limits?.maxOrders ?? '—'}</div>
                  </div>
                  <div className="text-center flex items-center p-3 justify-center bg-gray-800/60 text-gray-200 rounded-xl py-3">
                    <div className="text-sm pe-2  text-gray-400">Customers : </div>
                    <div className="text-sm  font-semibold">{p?.limits?.maxCustomers ?? '—'}</div>
                  </div>
                  <div className="text-center flex items-center p-3 justify-center bg-gray-800/60 text-gray-200 rounded-xl py-3">
                    <div className="text-sm pe-2  text-gray-400">Carriers : </div>
                    <div className="text-sm  font-semibold">{p?.limits?.maxCarriers ?? '—'}</div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-between">
                  <button onClick={() => startEdit(p)} className="w-full rounded-xl btn px-4 text-xs py-2">Edit</button>
                  <button onClick={() => startDelete(p)} className="w-full px-4 py-2 bg-red-600 text-xs text-white rounded-xl hover:bg-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingPlan && (
          <Popup open={!!editingPlan} onClose={cancelEdit} showTrigger={false} bg={'bg-gray-900'} size={'md:max-w-2xl'}>
            <div className="rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-semibold">Edit Plan: {editingPlan.name}</h3>
              </div>
              {error && (<div className="mb-4 text-red-400 text-sm">{error}</div>)}
              <form onSubmit={updatePlan}>
                <div className="space-y-4">
                  <Field label="Name">
                    <input className="input-sm" value={form.name} onChange={e => onChange('name', e.target.value)} required />
                  </Field>
                  <Field label="Slug">
                    <input className="input-sm" value={form.slug} onChange={e => onChange('slug', e.target.value)} required />
                    <p className="text-xs text-gray-400 mt-1">Changing slug may affect URLs and integrations</p>
                  </Field>
                  <Field label="Description">
                    <textarea className="input-sm" value={form.description} onChange={e => onChange('description', e.target.value)} rows={3} />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Max Users">
                      <input type="number" className="input-sm" value={form?.limits?.maxUsers ?? ''} onChange={e => onLimitChange('maxUsers', e.target.value)} min="0" />
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
                  </div>
                  <Field label="Features (comma-separated)">
                    <input className="input-sm" value={form.featuresInput} onChange={e => onChange('featuresInput', e.target.value)} placeholder="analytics, priority-support, custom-reports" />
                  </Field>
                  <div className="flex gap-4">
                    <Toggle label="Active" checked={form.isActive} onChange={(checked) => onChange('isActive', checked)} />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn">{submitting ? 'Updating…' : 'Update Plan'}</button>
                </div>
              </form>
            </div>
          </Popup>
        )}

        {deletingPlan && (
          <Popup open={!!deletingPlan} onClose={cancelDelete} showTrigger={false} bg={'bg-gray-900'} size={'md:max-w-md'}>
            <div className="rounded-lg p-6 w-full">
              <div className="mb-4">
                <h3 className="text-white text-xl font-semibold mb-2">Delete Plan</h3>
                <p className="text-gray-300 mb-2">Are you sure you want to delete <strong className="text-white">{deletingPlan.name}</strong>?</p>
                <p className="text-red-400 text-sm mb-4">This action cannot be undone.</p>
                <Field label={`Type "${deletingPlan.slug}" to confirm:`}>
                  <input className="input-sm" value={deleteConfirmInput} onChange={e => setDeleteConfirmInput(e.target.value)} placeholder={deletingPlan.slug} />
                </Field>
                {error && (<div className="mt-2 text-red-400 text-sm">{error}</div>)}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={cancelDelete} className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                <button onClick={deletePlan} disabled={submitting || deleteConfirmInput !== deletingPlan.slug} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Deleting…' : 'Delete Plan'}</button>
              </div>
            </div>
          </Popup>
        )}
         
      </div>
    </SuperAdminLayout>
  );
}
