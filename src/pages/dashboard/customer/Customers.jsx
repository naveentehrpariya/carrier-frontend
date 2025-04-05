import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import TimeFormat from '../../common/TimeFormat';
import AddCustomer from './AddCustomer';
import Loading from '../../common/Loading';
import Nocontent from '../../common/NoContent';
import RemoveCustomer from './RemoveCustomer';
export default function Customers() {

  const {user}  = useContext(UserContext);
   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);

   const fetchLists = (search) => {
      setLoading(true);
      const resp = Api.get(`/customer/listings?${search ?`search=${search}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.customers);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }

   useEffect(() => {
      fetchLists();
   }, []);

   const debounceRef = useRef(null);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value && value.length;
      if (wordCount > 1) {
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };

  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Customers</h2>
            <div className='flex items-center'>
               <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search by name or code' className='text-white min-w-[250px] bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
               {user?.role === 3 ? <div className='ms-4'></div> : ''}
               {user?.role === 3 ? <AddCustomer fetchLists={fetchLists} /> : ''}
            </div>
         </div>
         {loading ? <Loading /> :
         <>
         {lists && lists.length > 0 ?
            <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
               <table className='w-full p-2' cellPadding={'20'}>
                  <tr>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Email</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Phone</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Address</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Assigned To</th>
                     {user?.is_admin === 1 ? <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th> : ''}
                  </tr>
                  {lists && lists.map((c, index) => {
                     return <tr key={`carriew-${index}`}>
                        <td className='text-sm text-start  capitalize border-b border-gray-900'>
                           <p className='text-white font-bold'>{c?.name || ''}</p>
                           <p className='text-gray-400'>MC{c?.mc_code || ''}</p>
                        </td>
                        <td className='text-sm text-start text-gray-200  border-b border-gray-900'>
                           <p>{c?.email || "--"}</p>
                           <p className=''>{c?.secondary_email || ""}</p>
                        </td>
                        <td className='text-sm text-start text-gray-200  border-b border-gray-900'>
                           <p>{c?.phone || "--"}</p>
                           <p className=''>{c?.secondary_phone || ""}</p>
                        </td>
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <div class='has-tooltip line-clamp-1 max-w-[200px]'>
                              <span class='tooltip rounded shadow-xl p-2 bg-gray-100 text-black -mt-8'>{c?.address || ""} {c?.city || ""} {c?.state || ""} {c?.country || ""} {c?.zipcode || ""}</span>
                              {c?.address || ""} {c?.city || ""} {c?.state || ""} {c?.country || ""} {c?.zipcode || ""}
                           </div>
                        </td>
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='whitespace-nowrap'>{c?.assigned_to?.name || ""}({c?.assigned_to?.phone || ""})</p>
                           <p><TimeFormat date={c?.createdAt || "--"} /> </p>
                        </td>
                        {user?.is_admin === 1 ?
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <AddCustomer classes="text-main" text={"Update"} item={c} fetchLists={fetchLists} />
                           <RemoveCustomer classes="text-red-600 mt-2" text={"Remove"} item={c} fetchLists={fetchLists} />
                        </td> : '' }
                     </tr>
                  })}
               </table>
            </div>
            :  <Nocontent />}
         </>
         }
         
      </AuthLayout>
  )
}
