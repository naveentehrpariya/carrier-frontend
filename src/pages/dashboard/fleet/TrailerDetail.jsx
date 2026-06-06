import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import TimeFormat from '../../common/TimeFormat';

export default function TrailerDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);
  const [docs, setDocs] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, dRes] = await Promise.all([
        Api.get(`/fleet/trailers/detail/${id}`),
        Api.get(`/fleet/docs/trailer/${id}`)
      ]);
      if (tRes.data?.status) setTrailer(tRes.data.trailer || null);
      else setTrailer(null);
      if (dRes.data?.status) setDocs(dRes.data.documents || []);
      else setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AuthLayout>
      {loading ? <Loading /> : (
        <div className="text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-gray-400 text-xs">Trailer Details</div>
              <h2 className="text-2xl font-bold">
                {trailer?.type || trailer?.make || trailer?.model || trailer?.unitNumber || 'Unnamed Trailer'}
              </h2>
              <div className="text-gray-400 text-sm mt-1">
                Plate: {trailer?.plateNumber || '—'}{trailer?.unitNumber ? ` • Unit: ${trailer.unitNumber}` : ''}
              </div>
            </div>
            <Link to="/trailers" className="btn bg-gray-800 text-white rounded-2xl px-4 py-2">Back</Link>
          </div>

          {!trailer ? (
            <div className="mt-6 text-gray-400">Trailer not found</div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark4 border border-gray-900 rounded-2xl p-5">
                  <div className="text-xs text-gray-500 uppercase font-bold">Information</div>
                  <div className="mt-3 space-y-2 text-gray-200">
                    <div>Status: {trailer?.isActive === false ? <span className='text-red-400'>Disabled</span> : <span className='text-green-400'>Active</span>}</div>
                    <div>Type: {trailer?.type || '—'}</div>
                    <div>VIN: {trailer?.vin || '—'}</div>
                    <div>License: {trailer?.licenseNumber || '—'}</div>
                    <div>Length: {trailer?.length || '—'}</div>
                    <div>Make/Model: {[trailer?.make, trailer?.model].filter(Boolean).join(' ') || '—'}</div>
                    <div>Notes: {trailer?.notes || '—'}</div>
                  </div>
                </div>
                <div className="bg-dark4 border border-gray-900 rounded-2xl p-5">
                  <div className="text-xs text-gray-500 uppercase font-bold">Meta</div>
                  <div className="mt-3 space-y-2 text-gray-200">
                    <div>Created: {trailer?.createdAt ? <TimeFormat date={trailer.createdAt} /> : '—'}</div>
                    <div>Updated: {trailer?.updatedAt ? <TimeFormat date={trailer.updatedAt} /> : '—'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-dark4 border border-gray-900 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 uppercase font-bold">Documents</div>
                  <Link to="/trailers" className="text-main text-sm">Manage in Trailers</Link>
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
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
}

