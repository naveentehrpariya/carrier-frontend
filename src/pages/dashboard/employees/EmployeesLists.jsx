import React, { useContext, useEffect, useMemo, useState } from 'react'
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
import { HiOutlineUsers, HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const ACCENT = '#a091ff';

export default function EmployeesLists() {

   const { user: currentUser } = useAuth();
   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [search, setSearch] = useState('');
   const [showDocuments, setShowDocuments] = useState(false);
   const [showPermissions, setShowPermissions] = useState(false);
   const [selectedEmployee, setSelectedEmployee] = useState(null);
   const {Errors} = useContext(UserContext);

   const canManage = currentUser?.is_admin === 1 || currentUser?.permissions?.includes('employees') || currentUser?.permissions?.includes('subadmin');
   const canManagePermissions = currentUser?.isTenantAdmin || currentUser?.is_admin === 1 || currentUser?.permissions?.includes('subadmin');

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

   // Live search across name, email, phone, position and address (+ country).
   const term = search.trim().toLowerCase();
   const filtered = useMemo(() => {
      if (!term) return lists;
      return lists.filter((e) => {
         const haystack = [e?.name, e?.email, e?.phone, e?.position, e?.address, e?.country]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
         return haystack.includes(term);
      });
   }, [lists, term]);

   const hasEmployees = lists && lists.length > 0;

  return (
      <AuthLayout>
         {/* Header */}
         <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-3.5'>
               <div
                  className='h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border'
                  style={{ background: 'rgba(160,145,255,0.14)', color: ACCENT, borderColor: 'rgba(160,145,255,0.3)' }}
               >
                  <HiOutlineUsers size={24} />
               </div>
               <div>
                  <h2 className='text-white text-2xl font-bold font-mona leading-tight'>Employees</h2>
                  <p className='text-sm text-gray-500 mt-0.5'>
                     {loading
                        ? 'Loading team members…'
                        : term
                           ? `${filtered.length} of ${lists.length} ${lists.length === 1 ? 'member' : 'members'} match “${search.trim()}”`
                           : `${lists.length} team ${lists.length === 1 ? 'member' : 'members'}`}
                  </p>
               </div>
            </div>

            <div className="flex gap-2 shrink-0">
               {canManagePermissions && (
                  <button
                     onClick={() => setShowPermissions(true)}
                     className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 rounded-xl border border-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                     </svg>
                     <span className="hidden sm:inline">Manage Permissions</span>
                     <span className="sm:hidden">Permissions</span>
                  </button>
               )}
               {canManage && (
                 <AddEmployee fetchLists={fetchLists} />
               )}
            </div>
         </div>

         {/* Search bar */}
         <div className='mt-6 modal-kit' style={{ '--accent': ACCENT }}>
            <div className='relative max-w-2xl'>
               <HiOutlineMagnifyingGlass
                  size={20}
                  className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'
               />
               <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search by name, email, phone, position or address…'
                  className='input-sm !mt-0 w-full !pl-12 !pr-11'
                  aria-label='Search employees'
               />
               {search && (
                  <button
                     type='button'
                     onClick={() => setSearch('')}
                     className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 p-1 rounded-full hover:bg-white/10 transition-colors'
                     aria-label='Clear search'
                  >
                     <HiOutlineXMark size={18} />
                  </button>
               )}
            </div>
         </div>

         {/* Content */}
         <div className='mt-6'>
            {loading ? (
               <EmployeeGridSkeleton />
            ) : !hasEmployees ? (
               <EmptyEmployeeState fetchLists={fetchLists} />
            ) : filtered.length > 0 ? (
               <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {filtered.map((employee, index) => (
                     <EmployeeCard
                        key={`employee-${employee._id || index}`}
                        employee={employee}
                        onOpenDocuments={handleOpenDocuments}
                        fetchLists={fetchLists}
                     />
                  ))}
               </div>
            ) : (
               <div className='flex flex-col items-center justify-center text-center py-20 px-6 rounded-[30px] border border-white/10 bg-white/[0.02]'>
                  <div
                     className='h-14 w-14 rounded-2xl flex items-center justify-center mb-4'
                     style={{ background: 'rgba(160,145,255,0.12)', color: ACCENT }}
                  >
                     <HiOutlineMagnifyingGlass size={26} />
                  </div>
                  <h3 className='text-white text-lg font-semibold'>No matching employees</h3>
                  <p className='text-sm text-gray-500 mt-1 max-w-sm'>
                     No team members match “{search.trim()}”. Try a different name, email, phone, position or address.
                  </p>
                  <button
                     type='button'
                     onClick={() => setSearch('')}
                     className='mt-5 px-5 py-2.5 rounded-full text-sm font-bold text-black transition-all active:scale-95'
                     style={{ background: ACCENT }}
                  >
                     Clear search
                  </button>
               </div>
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
