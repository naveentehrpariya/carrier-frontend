import React, { useContext, useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import TimeFormat from '../../common/TimeFormat';
import AddCustomer from './AddCustomer';
import Loading from '../../common/Loading';
export default function Customers() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/customer/listings`);
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


  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Customers</h2>
            <AddCustomer fetchLists={fetchLists} />
         </div>

         {loading ? <Loading />
         :
         <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
                           <tr>
                              <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier</th>
                              <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Phone/Email</th>
                              <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Added By</th>
                           </tr>
                           {lists && lists.map((c, index) => {
                              return <tr key={`carriew-${index}`}>
            
                                 <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                                    <p>{c.name}</p>
                                    <p>{c.customerID}</p>
                                 </td>
            
                                 <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                                    <p>{c.phone || "--"}</p>
                                    <p>{c.email || ""}</p>
                                 </td>
                                 <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                                    <p>{c.created_by.name || "--"}</p>
                                    <p><TimeFormat date={c.createdAt || "--"} /> </p>
            
                                 </td>
                              </tr>
                           })}
                           
                        </table>
         
         </div>
         }
      </AuthLayout>
  )
}
