import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import Popup from '../../common/Popup';
import GoogleAddressInput from '../../common/GoogleAddressInput';
import countries from '../../common/Countries';
import { HiOutlineIdentification } from 'react-icons/hi2';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, SelectInput, ModalFooter, ACCENTS } from '../../../components/modal/ModalKit';

const initialForm = {
  fullName: '',
  companyName: '',
  phone: '',
  email: '',
  address: '',
  country: '',
  state: '',
  city: '',
  zipcode: '',
  status: 'active',
  notes: '',
};

export default function OwnerOperators() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const [action, setAction] = useState();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const [docsOpen, setDocsOpen] = useState(false);
  const [docsOwner, setDocsOwner] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set('search', search.trim());
      if (statusFilter !== 'all') qs.set('status', statusFilter);
      qs.set('sortBy', 'createdAt');
      qs.set('sortOrder', sortOrder);
      const res = await Api.get(`/owner-operators/listings?${qs.toString()}`);
      if (res.data?.status) setLists(res.data.lists || []);
      else setLists([]);
    } catch {
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortOrder]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lists;
    return (lists || []).filter((item) =>
      [item.fullName, item.companyName, item.email, item.phone, item.ownerOperatorId].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [lists, search]);

  const onOpenAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setAction('open');
  };

  const onOpenEdit = (item) => {
    setEditing(item);
    setForm({
      fullName: item.fullName || '',
      companyName: item.companyName || '',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || '',
      country: item.country || '',
      state: item.state || '',
      city: item.city || '',
      zipcode: item.zipcode || '',
      status: item.status || 'active',
      notes: item.notes || '',
    });
    setAction('open');
  };

  // Autofill columns from a Google Place selection (street-only stays in `address`).
  const handleAddressSelect = (p) => {
    const match = countries.find((c) => c.countryCode === p.countryCode);
    setForm((prev) => ({
      ...prev,
      address: p.line1 || prev.address,
      country: match ? match.label : (p.country || prev.country),
      state: p.state || prev.state,
      city: p.city || prev.city,
      zipcode: p.zipcode || prev.zipcode,
    }));
  };

  const onSave = async () => {
    if (!form.fullName || !form.phone || !form.email) {
      toast.error('Full name, phone and email required');
      return;
    }
    setSaving(true);
    try {
      const req = editing
        ? Api.post(`/owner-operators/update/${editing._id}`, form)
        : Api.post('/owner-operators/add', form);
      const res = await req;
      if (res.data?.status) {
        toast.success(editing ? 'Owner operator updated' : 'Owner operator created');
        setAction('close');
        setForm(initialForm);
        setEditing(null);
        loadLists();
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const onRemove = async (item) => {
    if (!window.confirm(`Delete ${item.fullName}?`)) return;
    try {
      const res = await Api.get(`/owner-operators/remove/${item._id}`);
      if (res.data?.status) {
        toast.success('Owner operator removed');
        loadLists();
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  const openDocs = async (item) => {
    setDocsOwner(item);
    setDocsOpen(true);
    try {
      const res = await Api.get(`/fleet/docs/owner_operator/${item._id}`);
      setDocs(res.data?.documents || []);
    } catch {
      setDocs([]);
    }
  };

  const uploadDoc = async () => {
    if (!uploadFile || !docsOwner?._id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('attachment', uploadFile);
      const res = await Api.post(`/upload/owner-operator/doc/${docsOwner._id}`, fd);
      if (res.data?.status) {
        toast.success('Document uploaded');
        setUploadFile(null);
        openDocs(docsOwner);
      } else {
        toast.error(res.data?.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/5 bg-[#11131A] p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.22)]">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div className="max-w-[760px]">
              <h2 className="text-white text-2xl font-bold">Owner Operators</h2>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                Manage owner operator profiles, contact details, and documents. Salary generation and payout management are available in the Accounting tab.
              </p>
            </div>
            <Link className="btn sm bg-[#1f2937] text-white w-full sm:w-auto justify-center" to="/accounts/owner-operator-salary">
              Salary & Reports
            </Link>
          </div>

          <div>
            <input
              className="input-sm w-full h-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by owner name, company, email, phone, or ID..."
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
              <select className="input-sm !py-2 !px-4 text-start w-full sm:w-[150px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="input-sm !py-2 !px-4 text-start w-full sm:w-[150px]" onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}>
                Sort: {sortOrder === 'desc' ? 'Latest' : 'Oldest'}
              </button>
            </div>
            <button className="btn sm main-btn text-black font-bold w-full sm:w-auto" onClick={onOpenAdd}>
              Add New Owner Operator
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full text-sm text-white">
            <thead className="bg-[#12161d] text-[#8A8FA3]">
              <tr>
                <th className="px-4 py-3 text-left">Owner ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No owner operators found</td>
                </tr>
              )}
              {!loading &&
                filtered.map((item) => (
                  <tr key={item._id} className="border-t border-white/5">
                    <td className="px-4 py-3">{item.ownerOperatorId}</td>
                    <td className="px-4 py-3">{item.fullName}</td>
                    <td className="px-4 py-3">{item.companyName || '—'}</td>
                    <td className="px-4 py-3">{item.phone || '—'}</td>
                    <td className="px-4 py-3">{item.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-lg ${item.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="btn xs bg-blue-700 text-white" onClick={() => openDocs(item)}>Docs</button>
                        <button className="btn xs bg-yellow-600 text-black" onClick={() => onOpenEdit(item)}>Edit</button>
                        <button className="btn xs bg-red-700 text-white" onClick={() => onRemove(item)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Popup action={action} size="md:max-w-2xl" space="p-0" bg="bg-black" btntext="" showTrigger={false}>
        <ModalShell accent={ACCENTS.owner}>
          <ModalHeader
            icon={HiOutlineIdentification}
            accent={ACCENTS.owner}
            title={editing ? 'Edit Owner Operator' : 'Add Owner Operator'}
            subtitle={editing ? 'Update owner operator and contact details' : 'Register an owner operator and their company'}
          />
          <FormSection title="Operator details">
            <Field label="Full Name" required>
              <TextInput value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" />
            </Field>
            <Field label="Company Name">
              <TextInput value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Company name" />
            </Field>
            <Field label="Phone">
              <TextInput value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
            </Field>
            <Field label="Email">
              <TextInput value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email address" />
            </Field>
            <Field label="Status">
              <SelectInput value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="active" className="text-black">Active</option>
                <option value="inactive" className="text-black">Inactive</option>
              </SelectInput>
            </Field>
            <Field full label="Address">
              <GoogleAddressInput
                value={form.address}
                onChange={(value) => setForm((p) => ({ ...p, address: value }))}
                onAddressSelect={handleAddressSelect}
                placeholder="Search and select address"
                className="input-sm !mt-0"
              />
            </Field>
            <Field label="Country">
              <SelectInput value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}>
                <option value="" className="text-black">Choose country</option>
                {countries && countries.map((c, i) => (
                  <option key={`country-${i}`} value={c.label} className="text-black">{c.label}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="State">
              <TextInput value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} placeholder="State" />
            </Field>
            <Field label="City">
              <TextInput value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
            </Field>
            <Field label="Zipcode">
              <TextInput value={form.zipcode} onChange={(e) => setForm((p) => ({ ...p, zipcode: e.target.value }))} placeholder="Zipcode" />
            </Field>
            <Field full label="Notes">
              <TextInput value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            </Field>
          </FormSection>
          <ModalFooter
            accent={ACCENTS.owner}
            onCancel={() => setAction('close')}
            onSubmit={onSave}
            loading={saving}
            submitLabel={editing ? 'Save Changes' : 'Add Operator'}
          />
        </ModalShell>
      </Popup>

      <Popup open={docsOpen} onClose={() => setDocsOpen(false)} showTrigger={false} size="md:max-w-2xl" space="p-6" bg="bg-black">
        <div className="text-white">
          <h3 className="text-xl font-bold">Owner Operator Documents</h3>
          <p className="text-xs text-gray-400 mt-1">{docsOwner?.fullName || ''}</p>
          <div className="mt-4 flex gap-2">
            <input className="input-sm" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            <button className="btn sm main-btn text-black font-bold" onClick={uploadDoc} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {docs.length === 0 && <div className="text-gray-400 text-sm">No documents uploaded</div>}
            {docs.map((d) => (
              <div key={d._id} className="border border-gray-800 rounded-xl p-3 flex justify-between items-center">
                <div className="text-sm truncate">{d.name}</div>
                <a className="text-blue-400 text-xs" href={d.url} target="_blank" rel="noreferrer">Open</a>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </AuthLayout>
  );
}
