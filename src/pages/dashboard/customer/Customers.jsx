import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AddCustomer from './AddCustomer';
import CustomerListItem from '../../../components/customers/CustomerListItem';
import { CustomerListSkeleton } from '../../../components/customers/CustomerListSkeleton';
import EmptyCustomerState from '../../../components/customers/EmptyCustomerState';
import CustomerStats from '../../../components/customers/CustomerStats';
export default function Customers() {

  const {user}  = useContext(UserContext);
   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');

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
      setSearchTerm(value);
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
         <div className='md:flex justify-between items-center'>
            <h2 className='text-white text-2xl mb-4 md:mb-0'>Customers</h2>
            <div className='sm:flex items-center justify-between md:justify-end'>
               <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search by name or code' className='text-white min-w-[250px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
               {user?.role === 3 ? <div className='ms-4'></div> : ''}
               {user?.role === 3  ? <AddCustomer classes={`btn md text-black font-bold w-full md:w-auto block md:flex mt-3 md:mt-0`} fetchLists={fetchLists} /> : ''}
            </div>
         </div>
         <div className='mt-8'>
            {loading ? (
               <CustomerListSkeleton />
            ) : (
               <>
                  <CustomerStats 
                     totalCustomers={lists.length}
                     isSearching={searchTerm.length > 0}
                     searchTerm={searchTerm}
                     customers={lists}
                  />
                  {lists && lists.length > 0 ? (
                     <div className='space-y-4'>
                        {lists.map((customer, index) => (
                          <CustomerListItem 
                            key={`customer-${customer.id || index}`}
                            customer={customer}
                            fetchLists={fetchLists}
                            user={user}
                          />
                        ))}
                     </div>
                  ) : (
                     <EmptyCustomerState fetchLists={fetchLists} user={user} />
                  )}
               </>
            )}
         </div>
         
      </AuthLayout>
  )
}
