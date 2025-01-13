import React, { useContext, useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AddDriver from './AddDriver';
import TimeFormat from '../../common/TimeFormat';
export default function Drivers() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/driver/listings`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.drivers);
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
            <h2 className='text-white text-2xl'>Carriers</h2>
            <AddDriver fetchLists={fetchLists} />
         </div>

         {loading ? <p>Loading..</p>
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
                                    <p>{c.driverID}</p>
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
