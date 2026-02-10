import React, { useContext, useState } from 'react';
import Popup from '../../common/Popup';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';
import { UserContext } from '../../../context/AuthProvider';
import { HiOutlineUserCircle } from 'react-icons/hi2';

export default function AddDriver({ text = "Add Driver", classes = "", fetchLists, item = null }) {
  const { Errors } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item?.name || "");
  const [email, setEmail] = useState(item?.email || "");
  const [phone, setPhone] = useState(item?.phone || "");
  const [country, setCountry] = useState(item?.country || "");
  const [address, setAddress] = useState(item?.address || "");
  const [ratePerMile, setRatePerMile] = useState(item?.driverProfile?.ratePerMile || "");
  const [notes, setNotes] = useState(item?.driverProfile?.notes || "");
  const [licenseDoc, setLicenseDoc] = useState(null);
  
  const [emails, setEmails] = useState(item?.driverProfile?.emails?.filter(e => !e.is_primary).map(e => e.email) || [""]);
  const [phones, setPhones] = useState(item?.driverProfile?.phones?.filter(p => !p.is_primary).map(p => p.phone) || [""]);
  
  const [loading, setLoading] = useState(false);
  
  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setCountry(""); setAddress("");
    setRatePerMile(""); setNotes(""); setLicenseDoc(null);
    setEmails([""]); setPhones([""]);
  };
  
  const addEmailField = () => setEmails([...emails, ""]);
  const removeEmailField = (idx) => setEmails(emails.filter((_, i) => i !== idx));
  const changeEmailField = (idx, val) => setEmails(emails.map((e, i) => i === idx ? val : e));
  
  const addPhoneField = () => setPhones([...phones, ""]);
  const removePhoneField = (idx) => setPhones(phones.filter((_, i) => i !== idx));
  const changePhoneField = (idx, val) => setPhones(phones.map((p, i) => i === idx ? val : p));
  
  const submit = async () => {
    if (!name || !email || !phone || !country || !address) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const body = {
        name, email, phone, country, address,
        ratePerMile, notes,
        emails: emails.filter(Boolean),
        phones: phones.filter(Boolean)
      };
      const resp = await Api.post('/driver/add', body);
      if (resp.data.status) {
        const newUser = resp.data.user;
        // If a license document is selected, upload it as employee document
        if (licenseDoc && newUser?._id) {
          const fdata = new FormData();
          fdata.append('attachment', licenseDoc);
          try {
            const up = await Api.post(`/upload/employee/doc/${newUser._id}`, fdata);
            if (up.data.status) {
              toast.success('License document uploaded');
            } else {
              toast.error(up.data.message || 'Failed to upload license');
            }
          } catch (e) {
            Errors && Errors(e);
            toast.error('Failed to upload license');
          }
        }
        toast.success(resp.data.message || 'Driver added');
        setOpen(false);
        resetForm();
        fetchLists && fetchLists();
      } else {
        toast.error(resp.data.message || 'Failed to add driver');
      }
    } catch (err) {
      Errors && Errors(err);
      toast.error('Failed to add driver');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <button className={classes} onClick={() => setOpen(true)}>{text}</button>
      <Popup open={open} onClose={() => setOpen(false)} showTrigger={false} size="md:max-w-2xl" space="p-0" bg="bg-black">
        <div className='w-full'>
          <div className='p-6 border-b border-gray-800 bg-gradient-to-r from-rose-700/40 to-pink-700/20 rounded-t-[35px]'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-rose-600/30 flex items-center justify-center'>
                <HiOutlineUserCircle className='text-rose-300' size={22} />
              </div>
              <div>
                <h3 className='text-white text-xl font-bold'>Add Driver</h3>
                <p className='text-gray-400 text-xs'>Create a driver profile with contacts and compliance docs</p>
              </div>
            </div>
          </div>
          
          <div className='p-6'>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='label text-gray-300'>Name</label>
              <input className='input-sm' value={name} onChange={(e)=>setName(e.target.value)} placeholder='Driver name' />
            </div>
            <div>
              <label className='label text-gray-300'>Primary Email</label>
              <input className='input-sm' type='email' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Primary email' />
            </div>
            <div>
              <label className='label text-gray-300'>Primary Phone</label>
              <input className='input-sm' value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder='Primary phone' />
            </div>
            <div>
              <label className='label text-gray-300'>Country</label>
              <input className='input-sm' value={country} onChange={(e)=>setCountry(e.target.value)} placeholder='Country' />
            </div>
            <div className='md:col-span-2'>
              <label className='label text-gray-300'>Address</label>
              <input className='input-sm' value={address} onChange={(e)=>setAddress(e.target.value)} placeholder='Address' />
            </div>
          </div>
          
          <div className='mt-4'>
            <label className='label text-gray-300'>Additional Emails</label>
            {emails.map((e, idx)=>(
              <div key={`em-${idx}`} className='flex items-center gap-2 mb-2'>
                <input className='input-sm flex-1' type='email' value={e} onChange={(ev)=>changeEmailField(idx, ev.target.value)} placeholder='Email' />
                {emails.length > 1 && (
                  <button className='btn xs text-white bg-red-700' onClick={()=>removeEmailField(idx)}>Remove</button>
                )}
              </div>
            ))}
            <button className='btn xs text-black' onClick={addEmailField}>Add Email</button>
          </div>
          
          <div className='mt-4'>
            <label className='label text-gray-300'>Additional Phones</label>
            {phones.map((p, idx)=>(
              <div key={`ph-${idx}`} className='flex items-center gap-2 mb-2'>
                <input className='input-sm flex-1' value={p} onChange={(ev)=>changePhoneField(idx, ev.target.value)} placeholder='Phone' />
                {phones.length > 1 && (
                  <button className='btn xs text-white bg-red-700' onClick={()=>removePhoneField(idx)}>Remove</button>
                )}
              </div>
            ))}
            <button className='btn xs text-black' onClick={addPhoneField}>Add Phone</button>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
            <div>
              <label className='label text-gray-300'>Rate per Mile</label>
              <input className='input-sm' type='number' step='0.01' value={ratePerMile} onChange={(e)=>setRatePerMile(e.target.value)} placeholder='e.g., 0.75' />
            </div>
            <div className='md:col-span-2'>
              <label className='label text-gray-300'>Notes</label>
              <input className='input-sm' value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder='Optional notes' />
            </div>
          </div>
          
          <div className='mt-4'>
            <label className='label text-gray-300'>License Document</label>
            <input className='input-sm' type='file' accept=".pdf,image/*" onChange={(e)=>setLicenseDoc(e.target.files[0])} />
            <p className='text-xs text-gray-400 mt-2'>Upload license or compliance doc. It will attach to this driver only.</p>
          </div>
          
          <div className='flex justify-end gap-2 mt-6'>
            <button className='btn sm bg-gray-800 text-gray-200' onClick={()=>setOpen(false)}>Cancel</button>
            <button className='btn sm main-btn text-black font-semibold' disabled={loading} onClick={submit}>{loading ? 'Saving...' : 'Save Driver'}</button>
          </div>
          </div>
        </div>
      </Popup>
    </>
  );
}
