import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import { useAuth } from '../../../context/MultiTenantAuthProvider';
import countries from './../../common/Countries';
import GoogleAddressInput from '../../common/GoogleAddressInput';

export default function AddEmployee({fetchLists, item, text, classes, defaultRole}){
    
  const { user: currentUser } = useAuth();
    const adminAllowedModules = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
    const commisions = Array.from({ length: 100 }, (_, index) => (index + 1) * 1);
    const [staffType, setStaffType] = useState(0);
    const availablePermissions = [
      // { id: 'driver', label: 'Driver' }, // Commented to prevent assigning driver role from here
      { id: 'regular', label: 'Regular (Trucking & Fleet)' },
      { id: 'outsourcing', label: 'Outsourcing (Carriers)' },
      { id: 'accounting', label: 'Accounting & Payments' },
      { id: 'customers', label: 'Manage Customers' },
      { id: 'employees', label: 'Manage Employees' },
      { id: 'carriers', label: 'Manage Carriers' },
      { id: 'subadmin', label: 'Subadmin' },
    ];

    const [data, setData] = useState({
      name: item?.name || '',
      email: item?.email || '',
      phone: item?.phone || '',
      country: item?.country || '',
      address: item?.address || '',
      position: item?.position || '',
      staff_commision: item?.staff_commision || '',
      password: '',
      permissions: item?.permissions || ['regular', 'outsourcing']
    });
    
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);
    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
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

  return (
    <div>
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={classes} btntext={text||"Add New Employee"} >
         <h2 className='text-white font-bold'>Add New Employee</h2>
         <div className='grid grid-cols-2 gap-4'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
               <input defaultValue={item?.name} required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Email</label>
               <input defaultValue={item?.email} required name='email' onChange={handleinput} type={'email'} placeholder={"Email address"} className="input-sm" />
            </div>
            {(data.permissions?.includes('regular') || data.permissions?.includes('outsourcing') || data.permissions?.includes('subadmin')) && (
              <div className='input-item'>
                 <label className="mt-4 mb-0 block text-sm text-gray-400">Staff Commission</label>
                 <select  defaultValue={item?.staff_commision} onChange={handleinput} name='staff_commision' className="input-sm" >
                  <option className='text-black' value="">Choose Commission</option>
                    {commisions && commisions.map((c, i)=>{
                      return <option key={`comm-${i}`} value={c} className='text-black'>{c}% Commision</option>
                    })}
                 </select>
              </div>
            )}
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Country</label>
               <select defaultValue={item?.country} onChange={handleinput} name='country' className="input-sm" >
                <option className='text-black' value="">Choose Country</option>
                  {countries && countries.map((c, i)=>{
                    return <option key={`country-${i}`} value={c.label} className='text-black'>{c.label}</option>
                  })}
               </select>
            </div> 

         </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
               <input defaultValue={item?.phone} required name='phone' onChange={handleinput} type={'phone'} placeholder={"Phone Number"} className="input-sm" />
            </div>
            {item ? "" :
              <>
                <div className='input-item'>
                  <label className="mt-4 mb-0 block text-sm text-gray-400">Password</label>
                  <input required name='password' onChange={handleinput} type={'text'} placeholder={"Enter password"} className="input-sm" />
                </div>
              </>
            }
          <div className='input-item mb-4 '>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Address</label>
              <GoogleAddressInput
                value={data.address}
                onChange={(v) => setData((prev) => ({ ...prev, address: v }))}
                placeholder="Enter address"
                className="input-sm"
              />
          </div>
          <div className='input-item mb-4 '>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Position</label>
              <input defaultValue={item?.position} required name='position' onChange={handleinput} type={'position'} placeholder={"eg. Senior Manger"} className="input-sm" />
          </div>

         <div className="mt-8 pt-6 border-t border-gray-800">
           <label className="mb-3 block text-sm text-gray-400 text-center font-medium">Assign Permissions</label>
           <div className="flex flex-wrap justify-center gap-4">
             {availablePermissions.map(p => (
               <label
                 key={p.id}
                 className="flex items-center gap-2 cursor-pointer group select-none bg-gray-900 px-4 py-2 rounded-xl"
               >
                 <input
                   type="checkbox"
                   className="sr-only"
                   checked={!!data.permissions?.includes(p.id)}
                   onChange={() => togglePermission(p.id)}
                 />
                 <div
                   className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                     data.permissions?.includes(p.id)
                       ? 'bg-main border-main text-black'
                       : 'border-gray-600 group-hover:border-gray-400'
                   }`}
                 >
                   {data.permissions?.includes(p.id) && (
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                   )}
                 </div>
                 <span className="text-sm text-gray-300 capitalize">
                   {p.label}
                 </span>
               </label>
             ))}
           </div>
         </div>

         <div className='flex justify-center items-center'>
            <button  onClick={addEmployee} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Creating..." : "Create Account"}</button>
         </div>
      </Popup>
    </div>
  )
}
