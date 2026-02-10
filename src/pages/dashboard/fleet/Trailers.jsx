import React, { useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Popup from '../../common/Popup';
import { toast } from 'react-hot-toast';
import Api from '../../../api/Api';
import { FiBox } from 'react-icons/fi';

export default function Trailers() {
  const [lists, setLists] = useState([]);
  const [action, setAction] = useState();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plateNumber: '',
    type: '',
    length: '',
    make: '',
    model: '',
    notes: ''
  });
  const [docOpen, setDocOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const loadLists = async () => {
    try {
      const resp = await Api.get('/fleet/trailers/listings');
      if (resp.data.status) {
        setLists(resp.data.lists || []);
      } else {
        setLists([]);
      }
    } catch {
      setLists([]);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTrailer = () => {
    if (!form.plateNumber || !form.type) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    const resp = Api.post('/fleet/trailers/add', form);
    resp.then((res) => {
      setLoading(false);
      if (res.data.status) {
        toast.success('Trailer added');
        setAction('close');
        setTimeout(() => setAction(undefined), 500);
        setForm({ plateNumber: '', type: '', length: '', notes: '' });
        loadLists();
      } else {
        toast.error(res.data.message || 'Failed to add trailer');
      }
    }).catch(() => {
      setLoading(false);
      toast.error('Failed to add trailer');
    });
  };

  const removeTrailer = (id) => {
    Api.get(`/fleet/trailers/remove/${id}`).then(() => {
      toast.success('Trailer removed');
      loadLists();
    }).catch(() => toast.error('Failed to remove'));
  };

  const openDocs = async (item) => {
    setSelected(item);
    setDocOpen(true);
    try {
      const resp = await Api.get(`/fleet/docs/trailer/${item._id}`);
      if (resp.data.status) {
        setDocs(resp.data.documents || []);
      } else {
        setDocs([]);
      }
    } catch {
      setDocs([]);
    }
  };

  const uploadDoc = async () => {
    if (!file || !selected?._id) return;
    setUploading(true);
    const fdata = new FormData();
    fdata.append('attachment', file);
    try {
      const resp = await Api.post(`/upload/trailer/doc/${selected._id}`, fdata);
      if (resp.data.status) {
        toast.success('Document uploaded');
        const listResp = await Api.get(`/fleet/docs/trailer/${selected._id}`);
        setDocs(listResp.data.documents || []);
        setFile(null);
      } else {
        toast.error(resp.data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthLayout>
      <div className='flex justify-between items-center'>
        <h2 className='text-white text-2xl'>Trailers</h2>
        <Popup action={action} size="md:max-w-2xl" space='p-0' bg="bg-black" btnclasses="btn md text-black font-bold" btntext="Add Trailer">
          <div className='p-6 border-b border-gray-800 bg-gradient-to-r from-violet-700/40 to-purple-700/20 rounded-t-[35px]'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-violet-600/30 flex items-center justify-center'>
                <FiBox className='text-violet-300' size={22} />
              </div>
              <div>
                <h2 className='text-white text-xl font-bold'>Add Trailer</h2>
                <p className='text-gray-400 text-xs'>Record trailer specs and upload RC/ownership docs</p>
              </div>
            </div>
          </div>
          <div className='p-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Plate Number</label>
              <input name='plateNumber' value={form.plateNumber} onChange={updateForm} type='text' placeholder='TR-12345' className="input-sm" />
            </div>
            <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Type</label>
              <input name='type' value={form.type} onChange={updateForm} type='text' placeholder='Dry Van / Reefer / Flatbed' className="input-sm" />
            </div>
            <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Length (ft)</label>
              <input name='length' value={form.length} onChange={updateForm} type='number' placeholder='53' className="input-sm" />
            </div>
            <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Make</label>
              <input name='make' value={form.make} onChange={updateForm} type='text' placeholder='Utility' className="input-sm" />
            </div>
            <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Model</label>
              <input name='model' value={form.model} onChange={updateForm} type='text' placeholder='4000D-X Composite' className="input-sm" />
            </div>
          </div>
          <div className='input-item mb-4 '>
            <label className="mt-4 mb-0 block text-sm text-gray-400">Notes</label>
            <input name='notes' value={form.notes} onChange={updateForm} type='text' placeholder='Optional notes' className="input-sm" />
          </div>
          <div className='flex justify-center items-center'>
            <button onClick={addTrailer} className="btn md mt-2 px-[50px] main-btn text-black font-bold">{loading ? "Saving..." : "Save"}</button>
          </div>
          </div>
        </Popup>
      </div>

      <div className='mt-8'>
        {lists && lists.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {lists.map((t) => (
              <div key={t._id} className='bg-gray-900 border border-gray-800 rounded-[20px] p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-white font-bold'>{t.type}</h3>
                    <p className='text-gray-400 text-sm'>Plate: {t.plateNumber}</p>
                    {t.length && <p className='text-gray-400 text-sm'>Length: {t.length} ft</p>}
                  </div>
                  <div className='flex gap-2'>
                    <button onClick={() => openDocs(t)} className='text-xs px-3 py-1 rounded-[20px] bg-blue-700 text-white'>Docs</button>
                  <button onClick={() => { setDeleteItem(t); setDeleteOpen(true); }} className='text-xs px-3 py-1 rounded-[20px] bg-red-700 text-white'>Delete</button>
                  </div>
                </div>
                {t.notes && <p className='text-gray-500 text-xs mt-2'>{t.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12 text-gray-400'>No trailers added yet</div>
        )}
      </div>
      
      <Popup open={docOpen} onClose={() => setDocOpen(false)} showTrigger={false} size="md:max-w-2xl" space="p-8" bg="bg-black">
        <div className='w-full'>
          <h3 className='text-white text-2xl font-bold mb-6'>Trailer Documents</h3>
          <div className='mb-4'>
            <input className='input-sm' type='file' onChange={(e)=>setFile(e.target.files[0])} />
            <button className='btn xs text-black mt-2' disabled={uploading} onClick={uploadDoc}>{uploading ? 'Uploading...' : 'Upload Document'}</button>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {docs && docs.length > 0 ? docs.map((d)=>(
              <div key={d._id} className='bg-gray-800 rounded-xl p-4 text-gray-300 text-sm flex items-center justify-between'>
                <div className='truncate'>{d.name}</div>
                <div className='flex gap-2'>
                  <a href={d.url} target='_blank' rel='noreferrer' className='bg-green-600 text-white px-3 py-1 rounded text-xs'>Open</a>
                  <a href={d.url} download={d.name} className='bg-blue-600 text-white px-3 py-1 rounded text-xs'>Download</a>
                </div>
              </div>
            )) : <div className='text-gray-500'>No documents uploaded</div>}
          </div>
        </div>
      </Popup>
      <Popup open={deleteOpen} onClose={() => setDeleteOpen(false)} showTrigger={false} size="md:max-w-md" space="p-8" bg="bg-black">
        <div className='w-full'>
          <h3 className='text-white text-xl font-bold mb-3'>Delete Trailer</h3>
          <p className='text-gray-300 text-sm'>Are you sure you want to delete {deleteItem ? `${deleteItem.type}` : 'this trailer'} (Plate: {deleteItem?.plateNumber})?</p>
          <div className='flex justify-end gap-2 mt-6'>
            <button className='btn sm bg-gray-800 text-gray-200' onClick={() => setDeleteOpen(false)}>Cancel</button>
            <button className='btn sm bg-red-700 text-white' onClick={() => { if (deleteItem?._id) removeTrailer(deleteItem._id); setDeleteOpen(false); setDeleteItem(null); }}>Delete</button>
          </div>
        </div>
      </Popup>
    </AuthLayout>
  )
}
