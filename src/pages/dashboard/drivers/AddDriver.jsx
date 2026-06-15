import React, { useContext, useState } from 'react';
import Popup from '../../common/Popup';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';
import { UserContext } from '../../../context/AuthProvider';
import { HiOutlineUserCircle } from 'react-icons/hi2';
import GoogleAddressInput from '../../common/GoogleAddressInput';
import { ModalShell, ModalHeader, Field, TextInput, TextArea, ModalFooter, ACCENTS } from '../../../components/modal/ModalKit';

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
      setActiveTab('general');
      return toast.error('Please fill all required fields');
    }
    // Pay rates are mandatory — all three must be set. Bounce to the Payment
    // Profile tab so the user can fill them.
    const ratesFilled = [ratePerMileSolo, ratePerMileTeam, cityHoursRate]
      .every((r) => String(r).trim() !== '' && !isNaN(Number(r)) && Number(r) > 0);
    if (!ratesFilled) {
      setActiveTab('payment');
      return toast.error('Please enter all pay rates before saving the driver profile.');
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
        // Pass the created driver so callers (e.g. AddOrder) can auto-select it.
        fetchLists && fetchLists(newUser);
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
        <ModalShell accent={ACCENTS.driver}>
          <ModalHeader
            icon={HiOutlineUserCircle}
            accent={ACCENTS.driver}
            title={item ? 'Edit Driver Profile' : 'Add Driver'}
            subtitle={item ? 'Update driver rates, documents and background details' : 'Create a driver profile with contacts and compliance docs'}
          />

          {/* Tab Header */}
          <div className='flex gap-6 border-b border-white/10 px-7 pt-4'>
            {[
              { id: 'general', label: 'Driver Info' },
              { id: 'payment', label: 'Payment Profile' },
            ].map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="pb-3 px-1 text-sm font-semibold transition-colors relative"
                  style={{ color: active ? ACCENTS.driver : '#6b7280' }}
                >
                  {t.label}
                  {active && <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-full' style={{ background: ACCENTS.driver }} />}
                </button>
              );
            })}
          </div>

          {/* General Info Tab */}
          {activeTab === "general" && (
            <div className='modal-kit-section px-7 py-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4'>
                <Field label="Name" required>
                  <TextInput value={name} onChange={(e)=>setName(e.target.value)} placeholder='Driver name' />
                </Field>
                <Field label="Primary Email" required>
                  <TextInput type='email' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Primary email' />
                </Field>
                <Field label="Primary Phone" required>
                  <TextInput value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder='Primary phone' />
                </Field>
                <Field label="Country" required>
                  <TextInput value={country} onChange={(e)=>setCountry(e.target.value)} placeholder='Country' />
                </Field>
                <Field full label="Complete Address" required>
                  <GoogleAddressInput value={address} onChange={setAddress} placeholder="Complete address" className="input-sm !mt-0" />
                </Field>
                <Field label="License Number">
                  <TextInput value={licenseNumber} onChange={(e)=>setLicenseNumber(e.target.value)} placeholder='License number' />
                </Field>
                <Field label="Province">
                  <TextInput value={licenseState} onChange={(e)=>setLicenseState(e.target.value)} placeholder='Province' />
                </Field>
                <Field label="License Issue Date">
                  <TextInput type='date' value={licenseIssueDate} onChange={(e)=>setLicenseIssueDate(e.target.value)} />
                </Field>
                <Field label="License Expiry Date">
                  <TextInput type='date' value={licenseExpiry} onChange={(e)=>setLicenseExpiry(e.target.value)} />
                </Field>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-5'>
                <Field label="Additional Emails">
                  {showExtraEmails ? (
                    <>
                      {emails.map((e, idx)=>(
                        <div key={`em-${idx}`} className='flex items-center gap-2 mb-2'>
                          <TextInput className='flex-1' type='email' value={e} onChange={(ev)=>changeEmailField(idx, ev.target.value)} placeholder='Email' />
                          <button type="button" className='text-red-400 hover:text-red-300 px-3 py-2 text-sm shrink-0' onClick={()=>removeEmailField(idx)}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className='text-sm font-semibold' style={{ color: ACCENTS.driver }} onClick={addEmailField}>+ Add email</button>
                    </>
                  ) : (
                    <button type="button" className='h-[51px] w-full rounded-[15px] border border-dashed border-gray-700 text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5' onClick={addEmailField}><span className="text-base leading-none">+</span> Add another email</button>
                  )}
                </Field>

                <Field label="Additional Phones">
                  {showExtraPhones ? (
                    <>
                      {phones.map((p, idx)=>(
                        <div key={`ph-${idx}`} className='flex items-center gap-2 mb-2'>
                          <TextInput className='flex-1' value={p} onChange={(ev)=>changePhoneField(idx, ev.target.value)} placeholder='Phone' />
                          <button type="button" className='text-red-400 hover:text-red-300 px-3 py-2 text-sm shrink-0' onClick={()=>removePhoneField(idx)}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className='text-sm font-semibold' style={{ color: ACCENTS.driver }} onClick={addPhoneField}>+ Add phone</button>
                    </>
                  ) : (
                    <button type="button" className='h-[51px] w-full rounded-[15px] border border-dashed border-gray-700 text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5' onClick={addPhoneField}><span className="text-base leading-none">+</span> Add another phone</button>
                  )}
                </Field>
              </div>
            </div>
          )}

          {/* Payment Profile Tab */}
          {activeTab === "payment" && (
            <div className='modal-kit-section px-7 py-5'>
              <div className='grid grid-cols-1 gap-4'>
                <Field label="Rate per Mile (Solo) ($)" hint="Applied when an order has a single driver.">
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10'>$</span>
                    <TextInput className='ps-8' type='number' step='0.01' value={ratePerMileSolo} onChange={(e)=>setRatePerMileSolo(e.target.value)} placeholder='e.g., 0.75' />
                  </div>
                </Field>

                <Field label="Rate per Mile (Team) ($)" hint="Applied when an order has multiple drivers.">
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10'>$</span>
                    <TextInput className='ps-8' type='number' step='0.01' value={ratePerMileTeam} onChange={(e)=>setRatePerMileTeam(e.target.value)} placeholder='e.g., 0.85' />
                  </div>
                </Field>

                <Field label="City Hours Rate ($/hour)" hint="Used when adding city hours in payslip generation.">
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10'>$</span>
                    <TextInput className='ps-8' type='number' step='0.01' value={cityHoursRate} onChange={(e)=>setCityHoursRate(e.target.value)} placeholder='e.g., 25.00' />
                  </div>
                </Field>

                <Field label="Background Details & Notes">
                  <TextArea
                    className='min-h-[120px]'
                    value={notes}
                    onChange={(e)=>setNotes(e.target.value)}
                    placeholder='Add any background information, history, or special payment notes...'
                  />
                </Field>

                <Field label="Files & Documents">
                  <div className='border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-white/[0.03] hover:bg-white/[0.05] transition-colors'>
                    <input
                      id="driver-files"
                      className='hidden'
                      type='file'
                      multiple
                      accept=".pdf,image/*,.doc,.docx"
                      onChange={(e)=>setLicenseDocs(Array.from(e.target.files || []))}
                    />
                    <label htmlFor="driver-files" className='cursor-pointer flex flex-col items-center'>
                      <div className='w-12 h-12 rounded-full flex items-center justify-center mb-3' style={{ background: 'rgba(251,113,133,0.12)', color: ACCENTS.driver }}>
                        <HiOutlineUserCircle size={24} />
                      </div>
                      <span className='text-sm text-gray-300 font-medium'>Click to upload files</span>
                      <span className='text-xs text-gray-500 mt-1'>PDF, Images, or Documents</span>
                    </label>
                    {licenseDocs.length > 0 && (
                      <div className='mt-4 p-2 rounded-lg flex items-center gap-2' style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.25)' }}>
                        <span className='text-xs truncate max-w-[220px]' style={{ color: ACCENTS.driver }}>
                          {licenseDocs.map((f) => f.name).join(', ')}
                        </span>
                        <button type="button" onClick={() => setLicenseDocs([])} className='hover:opacity-80' style={{ color: ACCENTS.driver }}>&times;</button>
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            </div>
          )}

          <ModalFooter
            accent={ACCENTS.driver}
            onCancel={() => setOpen(false)}
            onSubmit={submit}
            loading={loading}
            submitLabel="Save Driver Profile"
          />
        </ModalShell>
      </Popup>
    </>
  );
}
