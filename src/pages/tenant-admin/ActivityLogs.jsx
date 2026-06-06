import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Api from '../../api/Api';
import AuthLayout from '../../layout/AuthLayout';
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

// ── helpers ────────────────────────────────────────────────────────────────

const ACTION_COLORS = {
  CREATE: 'bg-green-900/40 text-green-300 border border-green-700/40',
  UPDATE: 'bg-blue-900/40 text-blue-300 border border-blue-700/40',
  DELETE: 'bg-red-900/40 text-red-300 border border-red-700/40',
  STATUS_CHANGE: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/40',
  LOGIN: 'bg-purple-900/40 text-purple-300 border border-purple-700/40',
  LOGOUT: 'bg-gray-700/60 text-gray-300 border border-gray-600/40',
  PAYMENT: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40',
  UPLOAD: 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/40',
  EXPORT: 'bg-orange-900/40 text-orange-300 border border-orange-700/40',
  OTHER: 'bg-gray-700/60 text-gray-300 border border-gray-600/40',
};

const MODULE_ICONS = {
  order: '📦',
  customer: '👤',
  carrier: '🚚',
  employee: '👷',
  company: '🏢',
  payment: '💳',
  file: '📎',
  auth: '🔐',
  settings: '⚙️',
};

function ActionBadge({ action }) {
  const cls = ACTION_COLORS[action] || ACTION_COLORS.OTHER;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {action.replace('_', ' ')}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── main component ─────────────────────────────────────────────────────────

const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'UPLOAD', 'EXPORT'];
const MODULES = ['', 'order', 'customer', 'carrier', 'employee', 'company', 'payment', 'file', 'auth', 'settings'];
const LIMITS  = [20, 50, 100];

export default function ActivityLogs() {
  const [logs, setLogs]         = useState([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]   = useState(true);
  const [users, setUsers]       = useState([]);
  const [summary, setSummary]   = useState(null);

  // filters
  const [search, setSearch]         = useState('');
  const [module, setModule]         = useState('');
  const [action, setAction]         = useState('');
  const [userId, setUserId]         = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(20);

  // expanded row
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page, limit,
        ...(search    && { search }),
        ...(module    && { module }),
        ...(action    && { action }),
        ...(userId    && { userId }),
        ...(startDate && { startDate }),
        ...(endDate   && { endDate }),
      });
      const res = await Api.get(`/api/tenant-admin/activity-logs?${params}`);
      if (res.data.status) {
        setLogs(res.data.data);
        setMeta(res.data.meta);
      }
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, module, action, userId, startDate, endDate]);

  const fetchUsers = async () => {
    try {
      const res = await Api.get('/api/tenant-admin/activity-logs/users');
      if (res.data.status) setUsers(res.data.data);
    } catch {}
  };

  const fetchSummary = async () => {
    try {
      const res = await Api.get('/api/tenant-admin/activity-logs/summary?days=30');
      if (res.data.status) setSummary(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterReset = () => {
    setSearch(''); setModule(''); setAction('');
    setUserId(''); setStartDate(''); setEndDate('');
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    const header = ['Date', 'Action', 'Module', 'Description', 'User', 'Resource', 'IP'];
    const rows = logs.map(l => [
      formatDate(l.createdAt),
      l.action,
      l.module,
      `"${(l.description || '').replace(/"/g, "'")}"`,
      `${l.userName} (${l.userEmail})`,
      l.resourceName || '',
      l.ipAddress || '',
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `activity-logs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = 'bg-[#11131A] border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500';
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <AuthLayout heading="Activity Logs">
      <div className="p-4 space-y-6">

        {/* ── Summary Cards ── */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.byAction.slice(0, 4).map(({ _id, count }) => (
              <div key={_id} className="bg-[#11131A] border border-white/5 rounded-2xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{_id?.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">last 30 days</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-[#11131A] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search description, user…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className={`${inputCls} pl-9 w-full`}
              />
            </div>
            {/* Module */}
            <select value={module} onChange={e => { setModule(e.target.value); setPage(1); }} className={`${selectCls} w-full`}>
              <option value="">All Modules</option>
              {MODULES.filter(Boolean).map(m => (
                <option key={m} value={m}>{MODULE_ICONS[m] || ''} {m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            {/* Action */}
            <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }} className={`${selectCls} w-full`}>
              <option value="">All Actions</option>
              {ACTIONS.filter(Boolean).map(a => (
                <option key={a} value={a}>{a.replace('_', ' ')}</option>
              ))}
            </select>
            {/* User */}
            <select value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }} className={`${selectCls} w-full`}>
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            {/* Date range */}
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} className={`${inputCls} w-full`} />
            <input type="date" value={endDate}   onChange={e => { setEndDate(e.target.value);   setPage(1); }} className={`${inputCls} w-full`} />
            {/* Limit */}
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className={`${selectCls} w-full`}>
              {LIMITS.map(l => <option key={l} value={l}>Show {l}</option>)}
            </select>
            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={handleFilterReset} className="flex-1 bg-[#1B1E27] hover:bg-[#22263a] text-gray-300 text-sm rounded-xl px-3 py-2 border border-white/5 transition-colors">
                Reset
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-1 bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 text-sm rounded-xl px-3 py-2 border border-purple-700/30 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                CSV
              </button>
              <button onClick={fetchLogs} className="flex items-center gap-1 bg-[#1B1E27] hover:bg-[#22263a] text-gray-300 text-sm rounded-xl px-3 py-2 border border-white/5 transition-colors">
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-white">
                Activity Logs
              </span>
              <span className="text-xs text-gray-500 ml-1">({meta.total} total)</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <ClipboardDocumentListIcon className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No activity logs found</p>
              <p className="text-xs mt-1">Actions taken in the dashboard will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Module</th>
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Resource</th>
                    <th className="px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map(log => (
                    <React.Fragment key={log._id}>
                      <tr
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                      >
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs capitalize whitespace-nowrap">
                          <span className="mr-1">{MODULE_ICONS[log.module] || '📄'}</span>
                          {log.module}
                        </td>
                        <td className="px-4 py-3 text-gray-200 text-xs max-w-[300px] truncate">
                          {log.description}
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          <p className="text-white font-medium">{log.userName || '—'}</p>
                          <p className="text-gray-500">{log.userEmail || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap max-w-[160px] truncate">
                          {log.resourceName || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {expanded === log._id ? '▲' : '▼'}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expanded === log._id && (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 bg-[#0D0F14]">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-gray-500 mb-0.5">Resource ID</p>
                                <p className="text-gray-300 font-mono break-all">{log.resourceId || '—'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-0.5">IP Address</p>
                                <p className="text-gray-300 font-mono">{log.ipAddress || '—'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-0.5">User Role</p>
                                <p className="text-gray-300">{log.userRole != null ? `Role ${log.userRole}` : '—'}</p>
                              </div>
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div className="col-span-full">
                                  <p className="text-gray-500 mb-1">Details</p>
                                  <pre className="text-gray-300 bg-[#11131A] rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.userAgent && (
                                <div className="col-span-full">
                                  <p className="text-gray-500 mb-0.5">User Agent</p>
                                  <p className="text-gray-400 truncate">{log.userAgent}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <span className="text-xs text-gray-500">
                Page {meta.page} of {meta.totalPages} &nbsp;·&nbsp; {meta.total} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg bg-[#1B1E27] border border-white/5 text-gray-400 disabled:opacity-30 hover:bg-[#22263a] transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>

                {/* page numbers */}
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, meta.totalPages - 4));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                        p === page
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-[#1B1E27] border-white/5 text-gray-400 hover:bg-[#22263a]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg bg-[#1B1E27] border border-white/5 text-gray-400 disabled:opacity-30 hover:bg-[#22263a] transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
