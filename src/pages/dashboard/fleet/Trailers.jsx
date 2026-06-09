import React, { useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Popup from '../../common/Popup';
import { toast } from 'react-hot-toast';
import Api from '../../../api/Api';
import { FiBox } from 'react-icons/fi';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, ModalFooter, ACCENTS } from '../../../components/modal/ModalKit';

export default function Trailers() {
  const [lists, setLists] = useState([]);
  const [action, setAction] = useState();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plateNumber: '',
    unitNumber: '',
    vin: '',
    licenseNumber: '',
    type: '',
    length: '',
    make: '',
    model: '',
    notes: '',
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [addDocs, setAddDocs] = useState([]);
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

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const closePopup = () => {
    setAction('close');
    setTimeout(() => {
      setAction(undefined);
      setIsEditing(false);
      setEditId(null);
      setForm({ plateNumber: '', unitNumber: '', vin: '', licenseNumber: '', type: '', length: '', make: '', model: '', notes: '', isActive: true });
      setAddDocs([]);
    }, 500);
  };

  const saveTrailer = () => {
    if (!form.plateNumber || !form.type) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);

    if (isEditing && editId) {
      Api.post(`/fleet/trailers/update/${editId}`, form)
        .then((res) => {
          setLoading(false);
          if (res.data.status) {
            toast.success('Trailer updated');
            closePopup();
            loadLists();
          } else {
            toast.error(res.data.message || 'Failed to update trailer');
          }
        }).catch(() => {
          setLoading(false);
          toast.error('Failed to update trailer');
        });
    } else {
      const resp = Api.post('/fleet/trailers/add', form);
      resp.then((res) => {
        setLoading(false);
        if (res.data.status) {
          toast.success('Trailer added');
          const newTrailerId = res.data?.trailer?._id;
          if (newTrailerId && Array.isArray(addDocs) && addDocs.length > 0) {
            (async () => {
              for (const f of addDocs) {
                const fdata = new FormData();
                fdata.append('attachment', f);
                try {
                  await Api.post(`/upload/trailer/doc/${newTrailerId}`, fdata);
                } catch {
                }
              }
            })();
          }
          closePopup();
          loadLists();
        } else {
          toast.error(res.data.message || 'Failed to add trailer');
        }
      }).catch(() => {
        setLoading(false);
        toast.error('Failed to add trailer');
      });
    }
  };

  const openEdit = (t) => {
    setIsEditing(true);
    setEditId(t._id);
    setForm({
      plateNumber: t.plateNumber || '',
      unitNumber: t.unitNumber || '',
      vin: t.vin || '',
      licenseNumber: t.licenseNumber || '',
      type: t.type || '',
      length: t.length || '',
      make: t.make || '',
      model: t.model || '',
      notes: t.notes || '',
      isActive: t.isActive !== false
    });
    setAction('open');
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
        <Popup action={action} onClose={closePopup} size="md:max-w-2xl" space='p-0' bg="bg-black" btnclasses="btn md text-black font-bold" btntext="Add Trailer">
          <ModalShell accent={ACCENTS.trailer}>
          <ModalHeader
            icon={FiBox}
            accent={ACCENTS.trailer}
            title={isEditing ? 'Edit Trailer' : 'Add Trailer'}
            subtitle="Record trailer specs and upload RC/ownership docs"
          />
          <FormSection title="Trailer details">
            <Field label="Plate Number"><TextInput name='plateNumber' value={form.plateNumber} onChange={updateForm} type='text' placeholder='TR-12345' /></Field>
            <Field label="Unit Number"><TextInput name='unitNumber' value={form.unitNumber} onChange={updateForm} type='text' placeholder='Unit number' /></Field>
            <Field label="Type"><TextInput name='type' value={form.type} onChange={updateForm} type='text' placeholder='Dry Van / Reefer / Flatbed' /></Field>
            <Field label="VIN"><TextInput name='vin' value={form.vin} onChange={updateForm} type='text' placeholder='Vehicle Identification Number' /></Field>
            <Field label="License Number"><TextInput name='licenseNumber' value={form.licenseNumber} onChange={updateForm} type='text' placeholder='License number' /></Field>
            <Field label="Length (ft)"><TextInput name='length' value={form.length} onChange={updateForm} type='number' placeholder='53' /></Field>
            <Field label="Make"><TextInput name='make' value={form.make} onChange={updateForm} type='text' placeholder='Utility' /></Field>
            <Field label="Model"><TextInput name='model' value={form.model} onChange={updateForm} type='text' placeholder='4000D-X Composite' /></Field>
          </FormSection>

          <FormSection title="Status, notes & documents" divider>
            <Field full label="Notes">
              <TextInput name='notes' value={form.notes} onChange={updateForm} type='text' placeholder='Optional notes' />
            </Field>
            <Field full>
              <label htmlFor='isActiveCheckbox' className="flex items-center gap-3 cursor-pointer select-none bg-white/[0.04] hover:bg-white/[0.07] px-4 py-3 rounded-xl border transition-colors"
                style={{ borderColor: form.isActive ? 'rgba(232,121,249,0.5)' : 'rgba(255,255,255,0.06)' }}>
                <input name='isActive' checked={form.isActive} onChange={updateForm} type='checkbox' id='isActiveCheckbox' className="sr-only" />
                <div className="w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0"
                  style={form.isActive ? { background: ACCENTS.trailer, borderColor: ACCENTS.trailer, color: '#000' } : { borderColor: 'rgba(255,255,255,0.25)' }}>
                  {form.isActive && <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>}
                </div>
                <span className="text-sm text-gray-200">Active <span className="text-gray-500">(Available for new assignments)</span></span>
              </label>
            </Field>
            <Field full label="Documents">
              <input className='input-sm !mt-0 w-full file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-gray-200' type='file' multiple onChange={(e)=>setAddDocs(Array.from(e.target.files || []))} />
            </Field>
          </FormSection>

          <ModalFooter
            accent={ACCENTS.trailer}
            onCancel={closePopup}
            onSubmit={saveTrailer}
            loading={loading}
            submitLabel={isEditing ? 'Save Changes' : 'Add Trailer'}
          />
          </ModalShell>
        </Popup>
      </div>

      <div className='mt-8'>
        {lists && lists.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {lists.map((t) => (
              <div key={t._id} className='bg-gray-900 border border-gray-800 rounded-[20px] p-4 flex flex-col h-full'>
                <div className='flex flex-wrap items-center gap-2 mb-3'>
                  <h3 className='text-white font-bold text-lg'>{t.type || t.make || t.model || t.unitNumber || 'Unnamed Trailer'}</h3>
                  {t.isActive === false && <span className='text-[10px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-800/50 uppercase font-bold tracking-wider'>Disabled</span>}
                </div>
                
                <div className='flex-1 mb-4'>
                  <p className='text-gray-400 text-sm'>Plate: <span className='text-gray-200'>{t.plateNumber}</span></p>
                  {t.unitNumber && <p className='text-gray-400 text-sm mt-1'>Unit: <span className='text-gray-200'>{t.unitNumber}</span></p>}
                  {t.length && <p className='text-gray-400 text-sm mt-1'>Length: <span className='text-gray-200'>{t.length} ft</span></p>}
                  {t.notes && <p className='text-gray-500 text-xs mt-2 line-clamp-2'>{t.notes}</p>}
                </div>
                
                <div className='flex gap-2 mt-auto pt-3 border-t border-gray-800/50'>
                  <button onClick={() => openEdit(t)} className='flex-1 text-xs py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors font-medium'>Edit</button>
                  <button onClick={() => openDocs(t)} className='flex-1 text-xs py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 transition-colors font-medium'>Docs</button>
                  <button onClick={() => { setDeleteItem(t); setDeleteOpen(true); }} className='flex-1 text-xs py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors font-medium'>Delete</button>
                </div>
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
