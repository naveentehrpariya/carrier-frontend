import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Api from '../api/Api';
import Popup from '../pages/common/Popup';
import { ShieldCheckIcon, MagnifyingGlassIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/MultiTenantAuthProvider';

export default function ManageUserModulesModal({ isOpen, onClose, tenant }) {
  const { user: currentUser } = useAuth();
  const adminAllowedModules = Array.isArray(currentUser?.permissions) ? currentUser.permissions : ['outsourcing', 'regular'];
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modules, setModules] = useState({ outsourcing: false, regular: false });

  const roleLabel = (role, isAdmin) => {
    if (isAdmin === 1) return 'Admin';
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
      setModules({ outsourcing: false, regular: false });
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
    const allowed = Array.isArray(user.permissions) ? user.permissions.filter(p => ['regular', 'outsourcing'].includes(p)) : [];
    setModules({
      outsourcing: allowed.includes('outsourcing'),
      regular: allowed.includes('regular')
    });
  };

  const toggleModule = (key) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveModules = async () => {
    if (!selectedUser) {
      toast.error('Select a user first');
      return;
    }
    const allowedModules = Object.entries(modules)
      .filter(([k, v]) => v)
      .map(([k]) => k);
    if (!allowedModules.length) {
      toast.error('Select at least one module');
      return;
    }
    try {
      setLoading(true);
      const url = `/api/tenant-admin/users/${selectedUser._id}/modules?tenant=${encodeURIComponent(tenant.tenantId)}`;
      const res = await Api.patch(url, { allowedModules });
      if (res.data?.status) {
        toast.success('Permissions updated');
        // reflect change locally
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, allowedModules } : u));
        setSelectedUser(prev => prev ? { ...prev, allowedModules } : prev);
      } else {
        toast.error(res.data?.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Update modules error:', err);
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
            <div className="border border-gray-200 rounded-xl max-h-80 overflow-auto divide-y">
              {loading && <div className="p-4 text-sm text-gray-500">Loading users…</div>}
              {!loading && users.length === 0 && <div className="p-4 text-sm text-gray-500">No users found</div>}
              {!loading && users.map(user => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => selectUser(user)}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-gray-100' : ''}`}
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

          <div className="border border-gray-200 rounded-xl p-4">
            {selectedUser ? (
              <>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Selected User</div>
                  <div className="font-medium text-gray-900">{selectedUser.name}</div>
                  <div className="text-xs text-gray-500">{selectedUser.email}</div>
                </div>
                <div className="space-y-3">
                  {adminAllowedModules.includes('outsourcing') && (
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={modules.outsourcing}
                        onChange={() => toggleModule('outsourcing')}
                      />
                      <span className="text-sm text-gray-800">Outsourcing (Carriers)</span>
                    </label>
                  )}
                  {adminAllowedModules.includes('regular') && (
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={modules.regular}
                        onChange={() => toggleModule('regular')}
                      />
                      <span className="text-sm text-gray-800">Regular (Trucking, driver etc)</span>
                    </label>
                  )}
                  {adminAllowedModules.length === 0 && (
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
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white"
                      onClick={saveModules}
                      disabled={loading}
                    >
                      {loading ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Select a user to manage permissions</div>
            )}
          </div>
        </div>
      </div>
    </Popup>
  );
}
