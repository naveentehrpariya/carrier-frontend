import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Api from '../api/Api';
import Popup from '../pages/common/Popup';
import { ShieldCheckIcon, MagnifyingGlassIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/MultiTenantAuthProvider';

// Permissions organized into clear, user-friendly groups.
// `key` must match the permission strings used across the app (sidebar, routes, backend).
const PERMISSION_GROUPS = [
  {
    title: 'Order Modules',
    description: 'Which order types this user can work with',
    items: [
      { key: 'regular',     label: 'Regular Orders',     hint: 'Trucking & own drivers' },
      { key: 'outsourcing', label: 'Outsourcing Orders', hint: 'Carrier-based loads' },
    ],
  },
  {
    title: 'Customers',
    description: 'View is read-only. Manage allows add / edit / delete.',
    items: [
      { key: 'customers',       label: 'View Customers',   hint: 'See customer list (read-only)' },
      { key: 'customers_write', label: 'Manage Customers', hint: 'Add, edit & delete customers' },
    ],
  },
  {
    title: 'Carriers',
    description: 'View is read-only. Manage allows add / edit / delete.',
    items: [
      { key: 'carriers',       label: 'View Carriers',   hint: 'See carrier list (read-only)' },
      { key: 'carriers_write', label: 'Manage Carriers', hint: 'Add, edit & delete carriers' },
    ],
  },
  {
    title: 'Other Features',
    description: 'Additional sections this user can open',
    items: [
      { key: 'accounting', label: 'Accounting', hint: 'Invoices, payments & settlements' },
      { key: 'employees',  label: 'Employees',  hint: 'Manage staff (admin only)', adminOnly: true },
      { key: 'subadmin',   label: 'Sub-Admin',  hint: 'Full access except editing main admin', adminOnly: true },
    ],
  },
];

// One-click role presets — selecting one auto-checks the permissions below.
const PRESETS = [
  {
    key: 'staff',
    label: 'Staff',
    hint: 'Work on orders, view customers & carriers',
    permissions: ['regular', 'outsourcing', 'customers', 'carriers'],
  },
  {
    key: 'accountant',
    label: 'Accountant',
    hint: 'Accounting + view customers & carriers',
    permissions: ['accounting', 'customers', 'carriers'],
  },
  {
    key: 'subadmin',
    label: 'Sub-Admin',
    hint: 'Full access (cannot edit main admin)',
    adminOnly: true,
    permissions: ['regular', 'outsourcing', 'accounting', 'customers', 'customers_write', 'carriers', 'carriers_write', 'employees', 'subadmin'],
  },
];

const ALL_KEYS = PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.key));
const emptyModules = () => ALL_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {});

export default function ManageUserModulesModal({ isOpen, onClose, tenant }) {
  const { user: currentUser } = useAuth();
  const adminAllowedModules = Array.isArray(currentUser?.permissions) ? currentUser.permissions : ['outsourcing', 'regular'];
  const isAdmin = currentUser?.is_admin === 1 || currentUser?.role === 3;

  // Decide which permission keys the current admin is allowed to assign
  const canAssign = (item) => {
    if (item.adminOnly) return isAdmin;       // employees → admin only
    if (isAdmin) return true;                 // full admin can assign anything
    return adminAllowedModules.includes(item.key); // sub-admin can only grant what they have
  };

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modules, setModules] = useState(emptyModules());

  const roleLabel = (role, adminFlag) => {
    if (adminFlag === 1) return 'Admin';
    const r = Number(role);
    if (r === 3) return 'Administrator';
    if (r === 2) return 'Accountant';
    if (r === 1) return 'Employee/Staff';
    if (r === 0) return 'Driver';
    return 'User';
  };

  useEffect(() => {
    if (isOpen && tenant?.tenantId) {
      fetchUsers('');
    }
    if (!isOpen) {
      setUsers([]);
      setQuery('');
      setSelectedUser(null);
      setModules(emptyModules());
    }
  }, [isOpen, tenant?.tenantId]);

  const fetchUsers = async (q) => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (q && q.trim()) qs.set('search', q.trim());
      const url = `/api/tenant-admin/users?tenant=${encodeURIComponent(tenant.tenantId)}${qs.toString() ? `&${qs}` : ''}`;
      const res = await Api.get(url);
      if (res.data?.status) {
        setUsers(Array.isArray(res.data?.data?.users) ? res.data.data.users : []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error(err.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    const next = emptyModules();
    ALL_KEYS.forEach(k => { next[k] = perms.includes(k); });
    setModules(next);
  };

  const toggleModule = (key) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Apply a preset — only sets keys this admin is allowed to assign.
  const applyPreset = (preset) => {
    const next = emptyModules();
    PERMISSION_GROUPS.forEach(g => g.items.forEach(item => {
      if (preset.permissions.includes(item.key) && canAssign(item)) {
        next[item.key] = true;
      }
    }));
    setModules(next);
  };

  // Highlight a preset only when the current selection exactly matches it.
  const currentKeys = Object.entries(modules).filter(([, v]) => v).map(([k]) => k).sort();
  const activePresetKey = PRESETS.find(p => {
    const presetKeys = [...p.permissions].filter(k => ALL_KEYS.includes(k)).sort();
    return presetKeys.length === currentKeys.length && presetKeys.every((k, i) => k === currentKeys[i]);
  })?.key;

  const assignablePresets = PRESETS.filter(p => !p.adminOnly || isAdmin);

  const selectedCount = currentKeys.length;

  const saveModules = async () => {
    if (!selectedUser) {
      toast.error('Select a user first');
      return;
    }
    const permissions = Object.entries(modules)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!permissions.length) {
      toast.error('Select at least one permission');
      return;
    }
    try {
      setLoading(true);
      const url = `/api/tenant-admin/users/${selectedUser._id}/modules?tenant=${encodeURIComponent(tenant.tenantId)}`;
      const res = await Api.patch(url, { permissions });
      if (res.data?.status) {
        toast.success('Permissions updated');
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, permissions } : u));
        setSelectedUser(prev => prev ? { ...prev, permissions } : prev);
      } else {
        toast.error(res.data?.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Update permissions error:', err);
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Popup open={isOpen} onClose={onClose} showTrigger={false} bg={'bg-white'} size={'md:max-w-4xl'}>
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Manage User Permissions {tenant?.name ? `– ${tenant.name}` : ''}
            </h3>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: user list */}
          <div>
            <form onSubmit={onSearch} className="flex items-center mb-3">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, corporate ID"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="ml-2 px-4 py-2 rounded-xl bg-blue-600 text-white">
                Search
              </button>
            </form>
            <div className="border border-gray-200 rounded-xl max-h-96 overflow-auto divide-y">
              {loading && <div className="p-4 text-sm text-gray-500">Loading users…</div>}
              {!loading && users.length === 0 && <div className="p-4 text-sm text-gray-500">No users found</div>}
              {!loading && users.map(user => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => selectUser(user)}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <UserCircleIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {roleLabel(user.role, user.is_admin)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: grouped permission editor */}
          <div className="border border-gray-200 rounded-xl p-4">
            {selectedUser ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Selected User</div>
                    <div className="font-medium text-gray-900">{selectedUser.name}</div>
                    <div className="text-xs text-gray-500">{selectedUser.email}</div>
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-3 py-1">
                    {selectedCount} selected
                  </span>
                </div>

                {/* One-click role presets */}
                {assignablePresets.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">Quick Presets</div>
                    <div className="flex flex-wrap gap-2">
                      {assignablePresets.map(preset => {
                        const active = activePresetKey === preset.key;
                        return (
                          <button
                            key={preset.key}
                            type="button"
                            title={preset.hint}
                            onClick={() => applyPreset(preset)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              active
                                ? 'border-blue-500 bg-blue-600 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1.5">
                      Pick a preset to auto-fill permissions, then fine-tune below.
                    </div>
                  </div>
                )}

                <div className="space-y-5 pr-1">
                  {PERMISSION_GROUPS.map(group => {
                    const visibleItems = group.items.filter(canAssign);
                    if (visibleItems.length === 0) return null;
                    return (
                      <div key={group.title}>
                        <div className="mb-2">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">{group.title}</div>
                          <div className="text-[11px] text-gray-400">{group.description}</div>
                        </div>
                        <div className="space-y-2">
                          {visibleItems.map(item => {
                            const checked = !!modules[item.key];
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                                  checked ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{item.label}</div>
                                  {item.hint && <div className="text-[11px] text-gray-400">{item.hint}</div>}
                                </div>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600"
                                  checked={checked}
                                  onChange={() => toggleModule(item.key)}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {!isAdmin && adminAllowedModules.length === 0 && (
                    <div className="text-sm text-red-500">You do not have permission to assign any modules.</div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                    Changes apply immediately after saving
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl border border-gray-300"
                      onClick={onClose}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-60"
                      onClick={saveModules}
                      disabled={loading}
                    >
                      {loading ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <UserCircleIcon className="h-12 w-12 text-gray-300 mb-2" />
                <div className="text-sm text-gray-500">Select a user to manage permissions</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Popup>
  );
}
