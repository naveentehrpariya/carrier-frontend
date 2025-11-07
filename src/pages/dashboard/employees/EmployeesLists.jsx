import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import AddEmployee from './AddEmployee';
import EmployeeDocuments from './EmployeeDocuments';
import EmployeeCard from '../../../components/employees/EmployeeCard';
import { EmployeeGridSkeleton } from '../../../components/employees/EmployeeCardSkeleton';
import EmptyEmployeeState from '../../../components/employees/EmptyEmployeeState';
export default function EmployeesLists() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [showDocuments, setShowDocuments] = useState(false);
   const [selectedEmployee, setSelectedEmployee] = useState(null);
   const {Errors} = useContext(UserContext);

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
      </AuthLayout>
  )
}
