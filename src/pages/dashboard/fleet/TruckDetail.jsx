import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import TimeFormat from '../../common/TimeFormat';
import OrderItem from '../order/OrderItem';

export default function TruckDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [truck, setTruck] = useState(null);
  const [docs, setDocs] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, dRes] = await Promise.all([
        Api.get(`/fleet/trucks/detail/${id}`),
        Api.get(`/fleet/docs/truck/${id}`)
      ]);
      if (tRes.data?.status) setTruck(tRes.data.truck || null);
      else setTruck(null);
      if (dRes.data?.status) setDocs(dRes.data.documents || []);
      else setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (search) => {
    setOrdersLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('truck_id', id);
      qs.set('limit', '50');
      if (search) qs.set('search', search);
      const res = await Api.get(`/order/listings?${qs.toString()}`);
      if (res.data?.status) setOrders(res.data.orders || []);
      else setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AuthLayout>
      {loading ? <Loading /> : (
        <div className="text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-gray-400 text-xs">Truck Details</div>
              <h2 className="text-2xl font-bold">
                {(truck?.make || '')} {(truck?.model || '')}
              </h2>
              <div className="text-gray-400 text-sm mt-1">
                Plate: {truck?.plateNumber || '—'}{truck?.unitNumber ? ` • Unit: ${truck.unitNumber}` : ''}
              </div>
            </div>
            <Link to="/trucks" className="btn bg-gray-800 text-white rounded-2xl px-4 py-2">Back</Link>
          </div>

          {!truck ? (
            <div className="mt-6 text-gray-400">Truck not found</div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark4 border border-gray-900 rounded-2xl p-5">
                  <div className="text-xs text-gray-500 uppercase font-bold">Information</div>
                  <div className="mt-3 space-y-2 text-gray-200">
                    <div>Year: {truck?.year || '—'}</div>
                    <div>VIN: {truck?.vin || '—'}</div>
                    <div>Capacity: {truck?.capacity || '—'}</div>
                    <div>Owner Operated: {truck?.ownerOperated ? 'Yes' : 'No'}</div>
                    {truck?.ownerOperated && (
                      <div>Owner Operator: {truck?.ownerOperator?.fullName || '—'}</div>
                    )}
                    <div>Notes: {truck?.notes || '—'}</div>
                  </div>
                </div>
                <div className="bg-dark4 border border-gray-900 rounded-2xl p-5">
                  <div className="text-xs text-gray-500 uppercase font-bold">Meta</div>
                  <div className="mt-3 space-y-2 text-gray-200">
                    <div>Created: {truck?.createdAt ? <TimeFormat date={truck.createdAt} /> : '—'}</div>
                    <div>Updated: {truck?.updatedAt ? <TimeFormat date={truck.updatedAt} /> : '—'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-dark4 border border-gray-900 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 uppercase font-bold">Documents</div>
                  <Link to="/trucks" className="text-main text-sm">Manage in Trucks</Link>
                </div>
                {docs.length === 0 ? (
                  <div className="mt-3 text-gray-400 text-sm">No documents</div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-900/40">
                        <tr>
                          <th className="px-4 py-3 text-start text-gray-400 uppercase tracking-wide">File</th>
                          <th className="px-4 py-3 text-start text-gray-400 uppercase tracking-wide">Added</th>
                          <th className="px-4 py-3 text-start text-gray-400 uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docs.map((d) => (
                          <tr key={d._id} className="border-t border-gray-900">
                            <td className="px-4 py-3 text-gray-200">{d.name || d.filename || '—'}</td>
                            <td className="px-4 py-3 text-gray-400">{d.createdAt ? <TimeFormat date={d.createdAt} /> : '—'}</td>
                            <td className="px-4 py-3">
                              {d.url ? (
                                <a className="text-main" href={d.url} target="_blank" rel="noreferrer">Open</a>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-dark4 border border-gray-900 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 uppercase font-bold">Orders Using This Truck</div>
                </div>
                <div className="mt-4">
                  {ordersLoading ? (
                    <Loading />
                  ) : orders.length ? (
                    <OrderItem lists={orders} fetchLists={(v) => fetchOrders(v)} />
                  ) : (
                    <div className="text-gray-400 text-sm">No orders found for this truck</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
