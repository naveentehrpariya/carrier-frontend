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
  const [activeTab, setActiveTab] = useState("general");
  
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
      const endpoint = item ? `/driver/edit/${item._id}` : '/driver/add';
      const resp = await Api.post(endpoint, body);
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
                <h3 className='text-white text-xl font-bold'>{item ? 'Edit Driver Profile' : 'Add Driver'}</h3>
                <p className='text-gray-400 text-xs'>{item ? 'Update driver rates, documents and background details' : 'Create a driver profile with contacts and compliance docs'}</p>
              </div>
            </div>
          </div>
          
          <div className='p-6'>
            {/* Tab Header */}
            <div className='flex gap-4 border-b border-gray-800 mb-6'>
              <button 
                onClick={() => setActiveTab("general")}
                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "general" ? "text-rose-400" : "text-gray-500 hover:text-gray-300"}`}
              >
                General Info
                {activeTab === "general" && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400'></div>}
              </button>
              <button 
                onClick={() => setActiveTab("contacts")}
                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "contacts" ? "text-rose-400" : "text-gray-500 hover:text-gray-300"}`}
              >
                Contacts
                {activeTab === "contacts" && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400'></div>}
              </button>
              <button 
                onClick={() => setActiveTab("payment")}
                className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "payment" ? "text-rose-400" : "text-gray-500 hover:text-gray-300"}`}
              >
                Payment Profile
                {activeTab === "payment" && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400'></div>}
              </button>
            </div>

            {/* General Info Tab */}
            {activeTab === "general" && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn'>
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
            )}
            
            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div className='animate-fadeIn'>
                <div className=''>
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
                
                <div className='mt-6'>
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
              </div>
            )}

            {/* Payment Profile Tab */}
            {activeTab === "payment" && (
              <div className='animate-fadeIn'>
                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='label text-gray-300 font-semibold'>Rate per Mile ($)</label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
                      <input className='input-sm ps-8' type='number' step='0.01' value={ratePerMile} onChange={(e)=>setRatePerMile(e.target.value)} placeholder='e.g., 0.75' />
                    </div>
                    <p className='text-[10px] text-gray-500 mt-1'>This rate will be used to calculate salary for trips assigned to this driver.</p>
                  </div>
                  
                  <div className='mt-2'>
                    <label className='label text-gray-300 font-semibold'>Background Details & Notes</label>
                    <textarea 
                      className='input-sm min-h-[120px] py-3' 
                      value={notes} 
                      onChange={(e)=>setNotes(e.target.value)} 
                      placeholder='Add any background information, history, or special payment notes...'
                    />
                  </div>

                  <div className='mt-2'>
                    <label className='label text-gray-300 font-semibold'>Files & Documents</label>
                    <div className='border-2 border-dashed border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-900/50 hover:bg-gray-900 transition-colors'>
                      <input 
                        id="driver-files"
                        className='hidden' 
                        type='file' 
                        multiple 
                        accept=".pdf,image/*,.doc,.docx" 
                        onChange={(e)=>setLicenseDoc(e.target.files[0])} 
                      />
                      <label htmlFor="driver-files" className='cursor-pointer flex flex-col items-center'>
                        <div className='w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 text-rose-400'>
                          <HiOutlineUserCircle size={24} />
                        </div>
                        <span className='text-sm text-gray-300 font-medium'>Click to upload files</span>
                        <span className='text-xs text-gray-500 mt-1'>PDF, Images, or Documents</span>
                      </label>
                      {licenseDoc && (
                        <div className='mt-4 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2'>
                          <span className='text-xs text-rose-300 truncate max-w-[200px]'>{licenseDoc.name}</span>
                          <button onClick={() => setLicenseDoc(null)} className='text-rose-500 hover:text-rose-400'>&times;</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          
            <div className='flex justify-end gap-2 mt-10 pt-6 border-t border-gray-800'>
              <button className='btn sm bg-gray-800 text-gray-200' onClick={()=>setOpen(false)}>Cancel</button>
              <button className='btn sm main-btn text-black font-semibold px-8' disabled={loading} onClick={submit}>{loading ? 'Saving...' : 'Save Driver Profile'}</button>
            </div>
          </div>
        </div>
      </Popup>
    </>
  );
}
