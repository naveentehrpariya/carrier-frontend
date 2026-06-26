import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import { useAuth } from '../../../context/MultiTenantAuthProvider';
import countries from './../../common/Countries';
import GoogleAddressInput from '../../common/GoogleAddressInput';
import { HiOutlineUserPlus } from 'react-icons/hi2';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, SelectInput, ModalFooter, ACCENTS } from '../../../components/modal/ModalKit';

export default function AddEmployee({fetchLists, item, text, classes, defaultRole}){
    
  const { user: currentUser } = useAuth();
    const adminAllowedModules = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
    const commisions = Array.from({ length: 100 }, (_, index) => (index + 1) * 1);
    const [staffType, setStaffType] = useState(0);
    const availablePermissions = [
      { id: 'regular',         label: 'Regular',                desc: 'Fleet management — trucks, trailers, drivers, trips, regular orders.' },
      { id: 'outsourcing',     label: 'Outsourcing',            desc: 'Carrier orders — create & manage outsourcing orders, carrier sheets.' },
      { id: 'accounting',      label: 'Accounting',             desc: 'Full financial access — payment updates, profit reports, all customers & carriers visible.' },
      { id: 'customers',       label: 'View Customers',         desc: 'See customers assigned to this user. Without this, customer pages are hidden.' },
      { id: 'customers_write', label: 'Manage Customers',       desc: 'Add and edit customers (requires View Customers).' },
      { id: 'carriers',        label: 'View Carriers',          desc: 'See carriers assigned to this user. Without this, carrier pages are hidden.' },
      { id: 'carriers_write',  label: 'Manage Carriers',        desc: 'Add and edit carriers (requires View Carriers).' },
      { id: 'employees',       label: 'Manage Employees',       desc: 'View and manage staff profiles, but cannot change admin settings.' },
      { id: 'subadmin',        label: 'Sub-Admin',              desc: 'All permissions above — sees everything an admin sees except billing and tenant settings.' },
    ];

    // Advanced permissions — sensitive grants kept out of the default staff set.
    const advancedPermissions = [
      { id: 'invoices',        label: 'Download Invoices',      desc: 'Open and download customer invoice PDFs. Without this, the invoice page and download buttons are hidden.' },
    ];

    // One-click presets — selecting one auto-fills the permissions below.
    const PRESETS = [
      { key: 'staff',      label: 'Staff',     permissions: ['regular', 'outsourcing', 'customers', 'carriers', 'invoices'] },
      { key: 'accountant', label: 'Accountant', permissions: ['accounting', 'customers', 'carriers', 'invoices'] },
      { key: 'subadmin',   label: 'Sub-Admin', permissions: ['regular', 'outsourcing', 'accounting', 'customers', 'customers_write', 'carriers', 'carriers_write', 'employees', 'subadmin', 'invoices'] },
    ];

    const [data, setData] = useState({
      name: item?.name || '',
      email: item?.email || '',
      phone: item?.phone || '',
      country: item?.country || '',
      address: item?.address || '',
      state: item?.state || '',
      city: item?.city || '',
      zipcode: item?.zipcode || '',
      position: item?.position || '',
      staff_commision: item?.staff_commision || '',
      password: '',
      permissions: item?.permissions || ['regular', 'outsourcing', 'invoices']
    });
    
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);
    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }

    // Autofill columns from a Google Place selection (street-only stays in `address`).
    const handleAddressSelect = (p) => {
      const match = countries.find((c) => c.countryCode === p.countryCode);
      setData((prev) => ({
        ...prev,
        address: p.line1 || prev.address,
        country: match ? match.label : (p.country || prev.country),
        state: p.state || prev.state,
        city: p.city || prev.city,
        zipcode: p.zipcode || prev.zipcode,
      }));
    }

    const togglePermission = (perm) => {
      setData(prev => {
        const current = prev.permissions || [];
        const updated = current.includes(perm)
          ? current.filter(p => p !== perm)
          : [...current, perm];
        return { ...prev, permissions: updated };
      });
    };

    const applyPreset = (preset) => {
      setData(prev => ({ ...prev, permissions: [...preset.permissions] }));
    };

    const activePresetKey = (() => {
      const cur = [...(data.permissions || [])].sort();
      const match = PRESETS.find(p => {
        const pk = [...p.permissions].sort();
        return pk.length === cur.length && pk.every((k, i) => k === cur[i]);
      });
      return match?.key;
    })();
    
    const [loading, setLoading] = useState(false);
    const addEmployee = () => {
      if(!item){
        const requiredFields = ['name', 'email', 'phone', 'country', 'address'];
        const missing = requiredFields.filter(f => !data[f] || String(data[f]).trim() === '');
        if (missing.length > 0) {
          toast.error("Please fill all the required fields");
          return false;
        }
        if (data.permissions?.includes('regular') || data.permissions?.includes('outsourcing') || data.permissions?.includes('subadmin')) {
          if (!data.staff_commision || String(data.staff_commision).trim() === '') {
            toast.error("Please choose staff commission");
            return false;
          }
        }
      }
      setLoading(true);
      let addEditStaff;
      if(item){
        addEditStaff = Api.post(`/user/edit_user/${item._id}`, {...data, permissions: data.permissions});
      } else { 
        addEditStaff = Api.post(`/user/create_user`, {...data, permissions: data.permissions, generateAutoPassword: data.password ? 0 : 1});
      }
      addEditStaff.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          fetchLists && fetchLists();
          setaction('close');
          setTimeout(() => {
            setaction();
          }, 1000);
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        Errors(err);
      });
    }

  const showCommission = data.permissions?.includes('regular') || data.permissions?.includes('outsourcing') || data.permissions?.includes('subadmin');

  return (
    <div>
      <Popup action={action} size="md:max-w-2xl" space='p-0' bg="bg-black" btnclasses={classes} btntext={text||"Add New Employee"} >
       <ModalShell accent={ACCENTS.employee}>
         <ModalHeader
           icon={HiOutlineUserPlus}
           accent={ACCENTS.employee}
           title={item ? 'Edit Employee' : 'Add New Employee'}
           subtitle={item ? 'Update contact details and access permissions' : 'Create a team member and assign their access'}
         />

         <FormSection title="Personal details">
            <Field label="Name" required>
               <TextInput defaultValue={item?.name} name='name' onChange={handleinput} type='text' placeholder="Full name" />
            </Field>
            <Field label="Email" required>
               <TextInput defaultValue={item?.email} name='email' onChange={handleinput} type='email' placeholder="Email address" />
            </Field>
            <Field label="Phone" required>
               <TextInput defaultValue={item?.phone} name='phone' onChange={handleinput} type='tel' placeholder="Phone number" />
            </Field>
            <Field label="Country" required>
               <SelectInput value={data.country || ''} onChange={handleinput} name='country'>
                <option className='text-black' value="">Choose country</option>
                  {countries && countries.map((c, i)=>(
                    <option key={`country-${i}`} value={c.label} className='text-black'>{c.label}</option>
                  ))}
               </SelectInput>
            </Field>
            {showCommission && (
              <Field label="Staff Commission" required>
                 <SelectInput defaultValue={item?.staff_commision} onChange={handleinput} name='staff_commision'>
                  <option className='text-black' value="">Choose commission</option>
                    {commisions && commisions.map((c, i)=>(
                      <option key={`comm-${i}`} value={c} className='text-black'>{c}% Commission</option>
                    ))}
                 </SelectInput>
              </Field>
            )}
            {!item && (
              <Field label="Password" hint="Leave empty to auto-generate a secure password.">
                <TextInput name='password' onChange={handleinput} type='text' placeholder="Set a password (optional)" />
              </Field>
            )}
            <Field label="Position">
              <TextInput defaultValue={item?.position} name='position' onChange={handleinput} type='text' placeholder="e.g. Senior Manager" />
            </Field>
            <Field label="Address" required full>
              <GoogleAddressInput
                value={data.address}
                onChange={(v) => setData((prev) => ({ ...prev, address: v }))}
                onAddressSelect={handleAddressSelect}
                placeholder="Enter address"
                className="input-sm !mt-0"
              />
            </Field>
            <Field label="State">
              <TextInput value={data.state || ''} name='state' onChange={handleinput} type='text' placeholder="State" />
            </Field>
            <Field label="City">
              <TextInput value={data.city || ''} name='city' onChange={handleinput} type='text' placeholder="City" />
            </Field>
            <Field label="Zipcode">
              <TextInput value={data.zipcode || ''} name='zipcode' onChange={handleinput} type='text' placeholder="Zipcode" />
            </Field>
         </FormSection>

         <FormSection title="Access & permissions" divider>
           <Field full label="Quick presets" hint="Pick a preset to auto-fill, then fine-tune the permissions below.">
             <div className="flex flex-wrap gap-2.5">
               {PRESETS.map(preset => {
                 const active = activePresetKey === preset.key;
                 return (
                   <button
                     key={preset.key}
                     type="button"
                     onClick={() => applyPreset(preset)}
                     className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors"
                     style={active
                       ? { background: ACCENTS.employee, borderColor: ACCENTS.employee, color: '#000' }
                       : { borderColor: 'rgba(255,255,255,0.18)', color: '#cbd5e1' }}
                   >
                     {preset.label}
                   </button>
                 );
               })}
             </div>
           </Field>

           <Field full label="Assign permissions">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
               {availablePermissions.map(p => {
                 const checked = !!data.permissions?.includes(p.id);
                 return (
                   <label
                     key={p.id}
                     className="flex items-start gap-3 cursor-pointer group select-none bg-white/[0.04] hover:bg-white/[0.07] px-3.5 py-3 rounded-xl border transition-colors"
                     style={{ borderColor: checked ? 'rgba(160,145,255,0.5)' : 'rgba(255,255,255,0.06)' }}
                   >
                     <input
                       type="checkbox"
                       className="sr-only"
                       checked={checked}
                       onChange={() => togglePermission(p.id)}
                     />
                     <div
                       className="w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5"
                       style={checked
                         ? { background: ACCENTS.employee, borderColor: ACCENTS.employee, color: '#000' }
                         : { borderColor: 'rgba(255,255,255,0.25)' }}
                     >
                       {checked && (
                         <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                       )}
                     </div>
                     <div className="min-w-0">
                       <span className="text-sm font-medium text-gray-200 block">{p.label}</span>
                       <span className="text-xs text-gray-500 leading-snug">{p.desc}</span>
                     </div>
                   </label>
                 );
               })}
             </div>
           </Field>

           <Field full label="Advanced permissions">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
               {advancedPermissions.map(p => {
                 const checked = !!data.permissions?.includes(p.id);
                 return (
                   <label
                     key={p.id}
                     className="flex items-start gap-3 cursor-pointer group select-none bg-white/[0.04] hover:bg-white/[0.07] px-3.5 py-3 rounded-xl border transition-colors"
                     style={{ borderColor: checked ? 'rgba(160,145,255,0.5)' : 'rgba(255,255,255,0.06)' }}
                   >
                     <input
                       type="checkbox"
                       className="sr-only"
                       checked={checked}
                       onChange={() => togglePermission(p.id)}
                     />
                     <div
                       className="w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5"
                       style={checked
                         ? { background: ACCENTS.employee, borderColor: ACCENTS.employee, color: '#000' }
                         : { borderColor: 'rgba(255,255,255,0.25)' }}
                     >
                       {checked && (
                         <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                       )}
                     </div>
                     <div className="min-w-0">
                       <span className="text-sm font-medium text-gray-200 block">{p.label}</span>
                       <span className="text-xs text-gray-500 leading-snug">{p.desc}</span>
                     </div>
                   </label>
                 );
               })}
             </div>
           </Field>
         </FormSection>

         <ModalFooter
           accent={ACCENTS.employee}
           onCancel={() => { setaction('close'); setTimeout(() => setaction(), 300); }}
           onSubmit={addEmployee}
           loading={loading}
           loadingLabel={item ? 'Saving…' : 'Creating…'}
           submitLabel={item ? 'Save Changes' : 'Create Account'}
         />
       </ModalShell>
      </Popup>
    </div>
  )
}
