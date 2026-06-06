import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import AddEmployee from './AddEmployee';
import EmployeeDocuments from './EmployeeDocuments';
import EmployeeCard from '../../../components/employees/EmployeeCard';
import { EmployeeGridSkeleton } from '../../../components/employees/EmployeeCardSkeleton';
import EmptyEmployeeState from '../../../components/employees/EmptyEmployeeState';
import ManageUserModulesModal from '../../../components/ManageUserModulesModal';
import { useAuth } from '../../../context/MultiTenantAuthProvider';

export default function EmployeesLists() {

   const { user: currentUser } = useAuth();
   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [showDocuments, setShowDocuments] = useState(false);
   const [showPermissions, setShowPermissions] = useState(false);
   const [selectedEmployee, setSelectedEmployee] = useState(null);
   const {Errors} = useContext(UserContext);

   const sortEmployees = (employees = []) => {
      return [...employees].sort((a, b) => {
         const aInactive = (a?.status || '').toLowerCase() === 'inactive' ? 1 : 0;
         const bInactive = (b?.status || '').toLowerCase() === 'inactive' ? 1 : 0;

         if (aInactive !== bInactive) {
            return aInactive - bInactive;
         }

         const aCreatedAt = new Date(a?.createdAt || 0).getTime();
         const bCreatedAt = new Date(b?.createdAt || 0).getTime();
         return bCreatedAt - aCreatedAt;
      });
   };

   const handleOpenDocuments = (employee) => {
      setSelectedEmployee(employee);
      setShowDocuments(true);
   };

   const handleCloseDocuments = () => {
      setShowDocuments(false);
      // Keep selectedEmployee for potential caching benefits
   };

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/user/employeesLisiting`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(sortEmployees(res.data.lists || []));
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
            <div className="flex gap-2">
               {(currentUser?.isTenantAdmin || currentUser?.is_admin === 1 || currentUser?.permissions?.includes('subadmin')) && (
                  <button 
                     onClick={() => setShowPermissions(true)}
                     className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                     </svg>
                     Manage Permissions
                  </button>
               )}
               {(currentUser?.is_admin === 1 || currentUser?.permissions?.includes('employees') || currentUser?.permissions?.includes('subadmin')) && (
                 <AddEmployee fetchLists={fetchLists} />
               )}
            </div>
         </div>

         <div className='mt-8'>
            {loading ? (
               <EmployeeGridSkeleton />
            ) : lists && lists.length > 0 ? (
               <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {lists.map((employee, index) => (
                     <EmployeeCard
                        key={`employee-${employee._id || index}`}
                        employee={employee}
                        onOpenDocuments={handleOpenDocuments}
                        fetchLists={fetchLists}
                     />
                  ))}
               </div>
            ) : (
               <EmptyEmployeeState fetchLists={fetchLists} />
            )}
         </div>

         {/* Conditionally render EmployeeDocuments modal */}
         {showDocuments && selectedEmployee && (
            <EmployeeDocuments 
               employee={selectedEmployee} 
               isOpen={showDocuments}
               onClose={handleCloseDocuments}
            />
         )}

         {/* Conditionally render ManageUserModulesModal */}
         {showPermissions && (
            <ManageUserModulesModal 
               isOpen={showPermissions} 
               onClose={() => {
                  setShowPermissions(false);
                  fetchLists(); // refresh lists in case permissions affected visibility
               }} 
               tenant={{ tenantId: currentUser?.tenantId, name: currentUser?.company?.name || 'Company' }}
            />
         )}
      </AuthLayout>
  )
}
