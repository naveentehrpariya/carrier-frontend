import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import AddCustomer from './AddEmployee';
import TimeFormat from '../../common/TimeFormat';
import AddEmployee from './AddEmployee';
import Loading from '../../common/Loading';
export default function EmployeesLists() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/user/employeesLisiting`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.lists);
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
            <h2 className='text-white text-2xl'>Employees</h2>
            <AddEmployee fetchLists={fetchLists} />
         </div>

         {loading ? <Loading />
         :
         <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Name</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Email/Corporate ID</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Staff Commision</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Employee Address</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Phone</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Created Date</th>
               </tr>
               {lists && lists.map((c, index) => {
                  return <tr key={`carriew-${index}`}>

                     <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                        <p>{c.name} </p>
                        <button className={` ${c.role == '2' ? "bg-main text-white" : "bg-blue-600 text-white"} text-[10px]  p-[1px] px-[10px] rounded-[20px] mt-2 `}>{c.role == '2' ? "Accountant" : "Staff"}</button>
                     </td>
                     <td className='text-sm text-start text-gray-200  border-b border-gray-900'>
                        <p>Email : {c.email || ""}</p>
                        <p>ID : {c.corporateID}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>{c.staff_commision ? `${c.staff_commision}%` : "N/A"}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                        <p>{c.country ? `Country : ${c.country}` : ""}</p>
                        <p>{c.address ? `Address : ${c.address}` : "N/A"}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                        <p>{c.phone ? `${c.phone}` : "N/A"}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        {/* <p>{c.created_by.name || "--"}</p> */}
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
