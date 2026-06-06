import React, { useContext, useState } from 'react';
import Popup from '../../common/Popup';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';
import { UserContext } from '../../../context/AuthProvider';
import { HiOutlineUserCircle } from 'react-icons/hi2';
import GoogleAddressInput from '../../common/GoogleAddressInput';

export default function AddDriver({ text = "Add Driver", classes = "", fetchLists, item = null }) {
  const { Errors } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item?.name || "");
  const [email, setEmail] = useState(item?.email || "");
  const [phone, setPhone] = useState(item?.phone || "");
  const [country, setCountry] = useState(item?.country || "");
  const [address, setAddress] = useState(item?.address || "");
  const [ratePerMileSolo, setRatePerMileSolo] = useState(item?.driverProfile?.ratePerMileSolo ?? item?.driverProfile?.ratePerMile ?? "");
  const [ratePerMileTeam, setRatePerMileTeam] = useState(item?.driverProfile?.ratePerMileTeam ?? item?.driverProfile?.ratePerMile ?? "");
  const [cityHoursRate, setCityHoursRate] = useState(item?.driverProfile?.cityHoursRate ?? "");
  const [licenseNumber, setLicenseNumber] = useState(item?.driverProfile?.licenseNumber || "");
  const [licenseIssueDate, setLicenseIssueDate] = useState(
    item?.driverProfile?.licenseIssueDate ? String(item.driverProfile.licenseIssueDate).slice(0, 10) : ""
  );
  const [licenseExpiry, setLicenseExpiry] = useState(
    item?.driverProfile?.licenseExpiry ? String(item.driverProfile.licenseExpiry).slice(0, 10) : ""
  );
  const [licenseState, setLicenseState] = useState(item?.driverProfile?.licenseState || "");
  const [notes, setNotes] = useState(item?.driverProfile?.notes || "");
  const [licenseDocs, setLicenseDocs] = useState([]);
  
  const initialEmails = Array.isArray(item?.driverProfile?.emails)
    ? item.driverProfile.emails.filter((e) => !e.is_primary).map((e) => e.email).filter(Boolean)
    : [];
  const initialPhones = Array.isArray(item?.driverProfile?.phones)
    ? item.driverProfile.phones.filter((p) => !p.is_primary).map((p) => p.phone).filter(Boolean)
    : [];
  const [emails, setEmails] = useState(initialEmails);
  const [phones, setPhones] = useState(initialPhones);
  const [showExtraEmails, setShowExtraEmails] = useState(initialEmails.length > 0);
  const [showExtraPhones, setShowExtraPhones] = useState(initialPhones.length > 0);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setCountry(""); setAddress("");
    setRatePerMileSolo(""); setRatePerMileTeam(""); setCityHoursRate("");
    setLicenseNumber(""); setLicenseIssueDate(""); setLicenseExpiry(""); setLicenseState("");
    setNotes(""); setLicenseDocs([]);
    setEmails([]); setPhones([]);
    setShowExtraEmails(false); setShowExtraPhones(false);
  };
  
  const addEmailField = () => {
    setShowExtraEmails(true);
    setEmails((prev) => (prev.length ? [...prev, ""] : [""]));
  };
  const removeEmailField = (idx) => {
    const updated = emails.filter((_, i) => i !== idx);
    setEmails(updated);
    if (updated.length === 0) setShowExtraEmails(false);
  };
  const changeEmailField = (idx, val) => setEmails(emails.map((e, i) => i === idx ? val : e));
  
  const addPhoneField = () => {
    setShowExtraPhones(true);
    setPhones((prev) => (prev.length ? [...prev, ""] : [""]));
  };
  const removePhoneField = (idx) => {
    const updated = phones.filter((_, i) => i !== idx);
    setPhones(updated);
    if (updated.length === 0) setShowExtraPhones(false);
  };
  const changePhoneField = (idx, val) => setPhones(phones.map((p, i) => i === idx ? val : p));
  
  const submit = async () => {
    if (!name || !email || !phone || !country || !address) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const body = {
        name, email, phone, country, address,
        ratePerMileSolo, ratePerMileTeam, cityHoursRate,
        licenseNumber, licenseIssueDate, licenseExpiry, licenseState,
        notes,
        emails: emails.filter(Boolean),
        phones: phones.filter(Boolean)
      };
      const endpoint = item ? `/driver/edit/${item._id}` : '/driver/add';
      const resp = await Api.post(endpoint, body);
      if (resp.data.status) {
        const newUser = resp.data.user;
        if (Array.isArray(licenseDocs) && licenseDocs.length > 0 && newUser?._id) {
          for (const file of licenseDocs) {
            const fdata = new FormData();
            fdata.append('attachment', file);
            try {
              const up = await Api.post(`/upload/employee/doc/${newUser._id}`, fdata);
              if (!up.data.status) {
                toast.error(up.data.message || 'Failed to upload document');
              }
            } catch (e) {
              Errors && Errors(e);
              toast.error('Failed to upload document');
            }
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
                Driver Info
                {activeTab === "general" && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400'></div>}
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
              <div className='animate-fadeIn'>
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
                    <label className='label text-gray-300'>Complete Address</label>
                    <GoogleAddressInput value={address} onChange={setAddress} placeholder="Complete address" className="input-sm" />
                  </div>
                </div>

                <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='label text-gray-300'>License Number</label>
                    <input className='input-sm' value={licenseNumber} onChange={(e)=>setLicenseNumber(e.target.value)} placeholder='License number' />
                  </div>
                  <div>
                    <label className='label text-gray-300'>Province</label>
                    <input className='input-sm' value={licenseState} onChange={(e)=>setLicenseState(e.target.value)} placeholder='Province' />
                  </div>
                  <div>
                    <label className='label text-gray-300'>License Issue Date</label>
                    <input className='input-sm' type='date' value={licenseIssueDate} onChange={(e)=>setLicenseIssueDate(e.target.value)} />
                  </div>
                  <div>
                    <label className='label text-gray-300'>License Expiry Date</label>
                    <input className='input-sm' type='date' value={licenseExpiry} onChange={(e)=>setLicenseExpiry(e.target.value)} />
                  </div>
                </div>

                <div className='mt-6 grid grid-cols-1 md:grid-cols-1 gap-4'>
                  <div>
                    <label className='label text-gray-300 w-full'>Additional Emails</label>
                    {showExtraEmails ? (
                      <> 
                        {emails.map((e, idx)=>(
                          <div key={`em-${idx}`} className='flex items-center gap-2 mb-2'>
                            <input className='input-sm flex-1' type='email' value={e} onChange={(ev)=>changeEmailField(idx, ev.target.value)} placeholder='Email' />
                            <button className='btn xs text-white bg-red-700' onClick={()=>removeEmailField(idx)}>Remove</button>
                          </div>
                        ))}
                        <button className='btn xs text-black text-[13px] px-4 py-1' onClick={addEmailField}>Add Email</button>
                      </>
                    ) : (
                      <button className='btn xs text-black text-[13px] px-4 py-1 ms-3' onClick={addEmailField}>Add Another Email</button>
                    )}
                  </div>

                  <div>
                    <label className='label text-gray-300 w-full '>Additional Phones</label>
                    {showExtraPhones ? (
                      <>
                        {phones.map((p, idx)=>(
                          <div key={`ph-${idx}`} className='flex items-center gap-2 mb-2'>
                            <input className='input-sm flex-1' value={p} onChange={(ev)=>changePhoneField(idx, ev.target.value)} placeholder='Phone' />
                            <button className='btn xs text-white bg-red-700' onClick={()=>removePhoneField(idx)}>Remove</button>
                          </div>
                        ))}
                        <button className='btn xs text-black text-[13px] px-4 py-1' onClick={addPhoneField}>Add Phone</button>
                      </>
                    ) : (
                      <button className='btn xs text-black text-[13px] px-4 py-1 ms-3' onClick={addPhoneField}>Add Another Phone</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Profile Tab */}
            {activeTab === "payment" && (
              <div className='animate-fadeIn'>
                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='label text-gray-300 font-semibold'>Rate per Mile (Solo) ($)</label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
                      <input className='input-sm ps-8' type='number' step='0.01' value={ratePerMileSolo} onChange={(e)=>setRatePerMileSolo(e.target.value)} placeholder='e.g., 0.75' />
                    </div>
                    <p className='text-[10px] text-gray-500 mt-1'>Applied when an order has a single driver.</p>
                  </div>

                  <div>
                    <label className='label text-gray-300 font-semibold'>Rate per Mile (Team) ($)</label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
                      <input className='input-sm ps-8' type='number' step='0.01' value={ratePerMileTeam} onChange={(e)=>setRatePerMileTeam(e.target.value)} placeholder='e.g., 0.85' />
                    </div>
                    <p className='text-[10px] text-gray-500 mt-1'>Applied when an order has multiple drivers.</p>
                  </div>

                  <div>
                    <label className='label text-gray-300 font-semibold'>City Hours Rate ($/hour)</label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
                      <input className='input-sm ps-8' type='number' step='0.01' value={cityHoursRate} onChange={(e)=>setCityHoursRate(e.target.value)} placeholder='e.g., 25.00' />
                    </div>
                    <p className='text-[10px] text-gray-500 mt-1'>Used when adding city hours in payslip generation.</p>
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
                        onChange={(e)=>setLicenseDocs(Array.from(e.target.files || []))} 
                      />
                      <label htmlFor="driver-files" className='cursor-pointer flex flex-col items-center'>
                        <div className='w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 text-rose-400'>
                          <HiOutlineUserCircle size={24} />
                        </div>
                        <span className='text-sm text-gray-300 font-medium'>Click to upload files</span>
                        <span className='text-xs text-gray-500 mt-1'>PDF, Images, or Documents</span>
                      </label>
                      {licenseDocs.length > 0 && (
                        <div className='mt-4 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2'>
                          <span className='text-xs text-rose-300 truncate max-w-[220px]'>
                            {licenseDocs.map((f) => f.name).join(', ')}
                          </span>
                          <button onClick={() => setLicenseDocs([])} className='text-rose-500 hover:text-rose-400'>&times;</button>
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
