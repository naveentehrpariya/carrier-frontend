import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import AddEmployee from './AddEmployee';
import Loading from '../../common/Loading';
import Dropdown from '../../common/Dropdown';
import SuspandAccount from './SuspandAccount';
import Badge from '../../common/Badge';
import ChangePassword from './ChangePassword';
import EmployeeDocuments from './EmployeeDocuments';
export default function EmployeesLists() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [showDocuments, setShowDocuments] = useState(false);
   const [selectedEmployee, setSelectedEmployee] = useState(null);
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
         <div className='recent-orders overflow-x-auto mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Name</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Corporate ID</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Address</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Phone/Email</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Documents</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th>
               </tr>
               {lists && lists.map((c, index) => {
                  return <tr key={`carriew-${index}`}>

                     <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                        <p className='whitespace-nowrap flex'>{c.name} <Badge title={true} status={c.status} /> </p>
                        <p className='whitespace-nowrap text-[12px]'>Joined On : <TimeFormat date={c.createdAt || "--"} /> </p>
                        <button className={` ${c.role ===  '2' ? "bg-main text-white" : "bg-blue-600 text-white"} text-[10px]  p-[1px] px-[10px] rounded-[20px] mt-2 `}>{c.role === '2' ? "Accountant" : "Employee"} {c?.position ? `(${c.position})` : ""}</button>
                     </td>
                     
                     <td className='text-sm text-start text-gray-200  border-b border-gray-900'>
                        <p>ID : {c.corporateID}</p>
                        <p className='whitespace-nowrap'>Commision : {c.staff_commision ? `${c.staff_commision}%` : "N/A"}</p>
                     </td>
                    
                     <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                        <div class='has-tooltip line-clamp-2 min-w-[100px] max-w-[300px]'>
                              <span class='tooltip rounded shadow-xl p-2 bg-gray-100 text-black -mt-8 max-w-[200px] '>{c.country || ""} {c.address || ''}</span>
                              {c.country || ""} {c.address || ''}
                        </div>
                     </td>
                     
                     <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                        <p>{c?.phone ? <a href={`tel:${c?.phone}`}>{c?.phone}</a>  : ""}</p>
                        <p>{c?.email ? <a href={`mailto:${c?.email}`}>{c?.email}</a>  : ""}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                        <EmployeeDocuments employee={c} />
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <Dropdown>
                              <li className='list-none text-sm'>
                                 <AddEmployee text="Edit" classes="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block" item={c} fetchLists={fetchLists} />
                              </li>
                              <li className='list-none text-sm'>
                                 <SuspandAccount text="Change Account Status" item={c} fetchLists={fetchLists} />
                              </li>
                              <li className='list-none text-sm'>
                                 <ChangePassword text="Change Password" item={c} fetchLists={fetchLists} />
                              </li>
                           </Dropdown>
                     </td>
 

                  </tr>
               })}
            </table>
         
         </div>
         }
      </AuthLayout>
  )
}
