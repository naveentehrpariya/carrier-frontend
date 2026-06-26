import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function getOrderLabel(o) {
  if (!o) return '';
  const serial = o.serial_no ? `#CMC${o.serial_no}` : '';
  const ext = o.customer_order_no ? ` • Cust: ${o.customer_order_no}` : '';
  return `${serial}${ext}`.trim();
}

export default function GlobalSearch() {
  const { Errors } = useContext(UserContext);
  const query = useQuery();
  const navigate = useNavigate();
  const q = String(query.get('q') || '').trim();
  const [text, setText] = useState(q);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const fetchResults = async (term) => {
    const t = String(term || '').trim();
    if (!t) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await Api.get(`/search/global?q=${encodeURIComponent(t)}&limit=8`);
      if (res.data.status) setResults(res.data.results || null);
      else setResults(null);
    } catch (e) {
      setResults(null);
      Errors && Errors(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setText(q);
    if (q) fetchResults(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const next = String(text || '').trim();
    if (!next) return;
    navigate(`/search?q=${encodeURIComponent(next)}`);
  };

  const blocks = [
    { key: 'orders', title: 'Orders', items: results?.orders || [] },
    { key: 'customers', title: 'Customers', items: results?.customers || [] },
    { key: 'carriers', title: 'Carriers', items: results?.carriers || [] },
    { key: 'trucks', title: 'Trucks', items: results?.trucks || [] },
    { key: 'trailers', title: 'Trailers', items: results?.trailers || [] },
    { key: 'drivers', title: 'Drivers', items: results?.drivers || [] }
  ];

  return (
    <AuthLayout heading="Search">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Search</h2>
          <p className="text-xs text-gray-400 mt-1">Search across orders, customers, carriers, fleet, and drivers</p>
        </div>
        <form onSubmit={submit} className="w-full lg:w-[520px]">
          <input
            className="input-sm w-full"
            placeholder="Type and press Enter…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>
      </div>

      {loading && <div className="text-gray-400 mt-6">Searching…</div>}

      {!loading && q && !results && <div className="text-gray-400 mt-6">No results</div>}

      {!loading && results && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
          {blocks.map((b) => (
            <div key={b.key} className="bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#12161d] flex items-center justify-between">
                <h3 className="text-white font-bold">{b.title}</h3>
                <span className="text-xs text-gray-400">{b.items.length}</span>
              </div>
              <div className="p-3">
                {b.items.length === 0 ? (
                  <div className="text-gray-500 text-sm px-2 py-3">No matches</div>
                ) : (
                  <div className="space-y-2">
                    {b.items.map((it) => {
                      if (b.key === 'orders') {
                        return (
                          <Link
                            key={it._id}
                            to={`/view/order/${it._id}`}
                            className="block bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:border-gray-700"
                          >
                            <div className="text-white font-semibold">{getOrderLabel(it) || String(it._id).slice(-6)}</div>
                            <div className="text-xs text-gray-400">
                              {it.company_name || ''} {it.order_type ? `• ${it.order_type}` : ''} {it.order_status ? `• ${it.order_status}` : ''}
                            </div>
                          </Link>
                        );
                      }
                      if (b.key === 'customers') {
                        return (
                          <Link
                            key={it._id}
                            to={`/customer/detail/${it._id}`}
                            className="block bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:border-gray-700"
                          >
                            <div className="text-white font-semibold">{it.name || 'Customer'}</div>
                            <div className="text-xs text-gray-400">
                              {(it.customerCode ? `${it.customerCode} • ` : '') + (it.email || '')} {it.phone ? `• ${it.phone}` : ''}
                            </div>
                          </Link>
                        );
                      }
                      if (b.key === 'carriers') {
                        return (
                          <Link
                            key={it._id}
                            to={`/carrier/detail/${it._id}`}
                            className="block bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:border-gray-700"
                          >
                            <div className="text-white font-semibold">{it.name || 'Carrier'}</div>
                            <div className="text-xs text-gray-400">
                              {(it.carrierID ? `${it.carrierID} • ` : '') + (it.email || '')} {it.phone ? `• ${it.phone}` : ''} {it.mc_code ? `• MC${it.mc_code}` : ''}
                            </div>
                          </Link>
                        );
                      }
                      if (b.key === 'trucks') {
                        return (
                          <Link
                            key={it._id}
                            to={`/trucks?search=${encodeURIComponent(q)}`}
                            className="block bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:border-gray-700"
                          >
                            <div className="text-white font-semibold">
                              {(it.truckNumber ? `${it.truckNumber} • ` : '') + (it.unitNumber ? `${it.unitNumber} • ` : '') + (it.plateNumber || 'Truck')}
                            </div>
                            <div className="text-xs text-gray-400">{[it.make, it.model, it.vin].filter(Boolean).join(' • ')}</div>
                          </Link>
                        );
                      }
                      if (b.key === 'trailers') {
                        return (
                          <Link
                            key={it._id}
                            to={`/trailers?search=${encodeURIComponent(q)}`}
                            className="block bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:border-gray-700"
                          >
                            <div className="text-white font-semibold">
                              {(it.unitNumber ? `${it.unitNumber} • ` : '') + (it.plateNumber || 'Trailer')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {[it.type, it.vin, it.licenseNumber].filter(Boolean).join(' • ')}
                            </div>
                          </Link>
                        );
                      }
                      return (
                        <Link
                          key={it._id}
                          to={`/employee/detail/${it._id}`}
                          className="block bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:border-gray-700"
                        >
                          <div className="text-white font-semibold">{it.name || 'Driver'}</div>
                          <div className="text-xs text-gray-400">
                            {(it.corporateID ? `${it.corporateID} • ` : '') + (it.email || '')} {it.phone ? `• ${it.phone}` : ''}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AuthLayout>
  );
}

