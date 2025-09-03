import React, { useContext, useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import EmployeeOrders from './EmployeeOrders';
import Loading from '../../common/Loading';
import Badge from '../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import EmployeeDocuments from './EmployeeDocuments';
import { UserContext } from '../../../context/AuthProvider';

export default function EmployeeDetail() {

   const [employee, setEmployee] = useState({});
   const [loadEmployee, setLoadEmployee] = useState(false);
   const { company } = useContext(UserContext);
   const { id } = useParams();
   
   const fetchEmployee = () => {
      setLoadEmployee(true);
      // Fetch from employee listing endpoint
      const resp = Api.get(`/user/employeesLisiting`);
      resp.then((res) => {
         if (res.data.status === true && res.data.lists) {
            // Find the specific employee from the list
            const foundEmployee = res.data.lists.find(emp => emp._id === id);
            if (foundEmployee) {
               setEmployee(foundEmployee);
            } else {
               setEmployee({ error: 'Employee not found' });
            }
         } else {
            setEmployee({ error: 'Failed to load employee data' });
         }
         setLoadEmployee(false);
      }).catch((err) => {
         setLoadEmployee(false);
         console.error('Error fetching employee:', err);
         setEmployee({ error: 'API Error: ' + err.message });
      });
   }

   useEffect(() => {
      fetchEmployee();
   }, [id]);

   const getRoleText = (role, position) => {
      if (role === '2' || role === 2) return `Accountant${position ? ` (${position})` : ''}`;
      if (role === '3' || role === 3) return `Administrator${position ? ` (${position})` : ''}`;
      return `Employee${position ? ` (${position})` : ''}`;
   }

  return (
      <AuthLayout> 
         {loadEmployee ? <Loading /> :
            <>
               <div id="profile" className="w-full mb-12">
                  <div className="text-center lg:text-left">
                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                           <h1 className="text-3xl text-white font-bold  pb-3  capitalize flex items-center gap-3">
                              {employee?.name} 
                              <Badge title={true} status={employee?.status} />
                           </h1>
                           <div className="mx-auto lg:mx-0 w-full pt-3 border-b-2 border-gray-500 opacity-25"></div>
                        </div>
                         
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-3">
                           <p className="pt-2 text-white flex items-center text-start">
                              <p className="text-start font-semibold w-32">Company:</p>
                              <span className="text-blue-400">
                                 {employee?.company_name || 
                                  employee?.companyName || 
                                  employee?.company?.name ||
                                  employee?.company?.company_name ||
                                  company?.name || 
                                  company?.company_name || 
                                  company?.companyName ||
                                  'N/A'}
                              </span>
                           </p>
                           <p className="pt-2 text-white flex items-center text-start">
                              <span className="font-semibold w-32">Role:</span>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                 employee?.role === 2 ? 'bg-orange-600' : 
                                 employee?.role === 3 ? 'bg-red-600' : 'bg-blue-600'
                              } text-white`}>
                                 {getRoleText(employee?.role, employee?.position)}
                              </span>
                           </p>
                           <p className="pt-2 text-white flex items-center text-start">
                              <span className="font-semibold w-32">Corporate ID:</span>
                              <span>{employee?.corporateID || 'N/A'}</span>
                           </p>
                           <p className="pt-2 text-white flex items-center text-start">
                              <span className="font-semibold w-32">Commission:</span>
                              <span>{employee?.staff_commision ? `${employee.staff_commision}%` : 'N/A'}</span>
                           </p>
                           <p className="pt-2 text-white flex items-center text-start">
                              <span className="font-semibold w-32">Joined:</span>
                              <span><TimeFormat date={employee?.createdAt || "--"} /></span>
                           </p>
                        </div>
                        
                        <div className="space-y-3">
                           <p className="pt-2 text-white flex items-center text-start">
                              <span className="font-semibold w-32">Phone:</span>
                              <span>
                                 {employee?.phone ? <a href={`tel:${employee.phone}`} className="text-blue-400 hover:text-blue-300">{employee.phone}</a> : 'N/A'}
                              </span>
                           </p>
                           <p className="pt-2 text-white flex items-center text-start">
                              <span className="font-semibold w-32">Email:</span>
                              <span>
                                 {employee?.email ? <a href={`mailto:${employee.email}`} className="text-blue-400 hover:text-blue-300">{employee.email}</a> : 'N/A'}
                              </span>
                           </p>
                           <p className="pt-2 text-white flex flex-col lg:flex-row lg:items-center">
                              <span className="font-semibold w-32">Address:</span>
                              <span className="lg:ml-0 break-all">
                                 {[employee?.address, employee?.country].filter(Boolean).join(', ') || 'N/A'}
                              </span>
                           </p>
                           <p className="pt-2 text-white flex flex-col lg:flex-row lg:items-center">
                              <span className="font-semibold w-32">Documents:</span>
                              <span className="lg:ml-0 break-all">
                                <EmployeeDocuments text="View Documents" employee={employee} />
                              </span>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
               
               {employee.error ? (
                  <div className="mt-8 p-4 bg-red-800 rounded-lg">
                     <h3 className="text-white text-lg mb-2">Error:</h3>
                     <p className="text-red-200">{employee.error}</p>
                     <div className="mt-4">
                        <button 
                           onClick={fetchEmployee}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                           Try Again
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className='orders-section'>
                     <EmployeeOrders employeeID={id} employee={employee} />
                  </div>
               )}
            </>
         }
      </AuthLayout>
  )
}
