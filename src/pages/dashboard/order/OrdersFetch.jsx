import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import { Link, useSearchParams } from 'react-router-dom';
import Nocontent from '../../common/NoContent';
import Loading from '../../common/Loading';
import OrderItem from './OrderItem';
import OrderExel from './OrderExel';
import { useNavigate } from 'react-router-dom';
import OrderStats from '../../../components/orders/OrderStats';
import EmptyOrderState from '../../../components/orders/EmptyOrderState';
import Pagination from '../../common/Pagination';

export default function OrdersFetch({hideExportOrder, hideFilter, sidebtn, isRecent, customer, sortby, hideAddOrder, title, hideSearch}) {
  const navigate = useNavigate();

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const {Errors, user} = useContext(UserContext);

   // get search query param from url
   const [searchParams] = useSearchParams();
   const status = searchParams.get('status');
   const [orderStatus, setOrderStatus] = useState(status || null);
   const fetchLists = (value, page = 1) => {
      setLoading(true);
      const limit = isRecent ? 5 : 20; // 20 orders per page, or 5 for recent view
      const resp = Api.get(`/order/listings?page=${page}&limit=${limit}${orderStatus ?`&status=${orderStatus}` : ''}${payementStatus ?`&paymentStatus=${payementStatus}` : ''}${value ?`&search=${value}` : ''}${customer ?`&customer_id=${customer}` : ''} ${sortby ?`&sortby=${sortby}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.orders || []);
            setCurrentPage(res.data.page || 1);
            setTotalPages(res.data.totalPages || 1);
         } else {
            setLists([]);
            setCurrentPage(1);
            setTotalPages(1);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }
   const [payementStatus, setPaymentStatus] = useState(null)

   useEffect(() => {
      setCurrentPage(1); // Reset to first page when filters change
      fetchLists();
   },[customer, orderStatus, payementStatus]);

   // Handle pagination
   const handlePageChange = (page) => {
      setCurrentPage(page);
      fetchLists(searchTerm, page);
   };

   const handleFilter = (e) => {
    setOrderStatus(e);
    setCurrentPage(1); // Reset to first page when filter changes
    const params = new URLSearchParams();
    if (e) params.set('status', e);
    if (payementStatus) params.set('paymentStatus', payementStatus);
    navigate(`/orders?${params.toString()}`);
  };

   const handlePaymentFilter = (e) => {
    setPaymentStatus(e);
    setCurrentPage(1); // Reset to first page when filter changes
    const params = new URLSearchParams();
    if (orderStatus) params.set('status', orderStatus);
    if (e) params.set('paymentStatus', e);
    navigate(`/orders?${params.toString()}`);
  };
    

   const debounceRef = useRef(null);
   const [searching, setSearching] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      const wordCount = value &&value.length;
      if (wordCount > 1) {
         setSearching(true);
         setCurrentPage(1); // Reset to first page when searching
         fetchLists(value, 1);
      }
      if (e.target.value === '') {
         setSearching(false);
         setSearchTerm('');
         setCurrentPage(1);
         fetchLists('', 1);
      }
   };

   return (
         <> 
            <div className='md:flex justify-between items-center mb-6'>
               <h2 className='text-white text-2xl mb-4 md:mb-0'>{title ? title : "Orders"}</h2>
               <div className='sm:flex items-center justify-between md:justify-end'>
                  {hideFilter ? '' :
                  <>
                  <div className='relative me-3'>
                     {orderStatus ? <button onClick={()=>setOrderStatus()} className='bg-blue-600 p-1 text-2xl text-white absolute top-[3px] right-2 hover:text-red-500'>&times;</button> :""}
                     <select 
                     defaultValue={orderStatus}
                     onChange={(e) => {handleFilter(e.target.value)}}
                     className={`appearance-none ${orderStatus ? "bg-blue-600 border border-blue-500" : 'bg-dark1 border border-gray-600'} text-white text-sm min-w-[160px] max-w-[170px] w-full md:w-auto  rounded-xl px-4 py-[13px]  focus:shadow-0 focus:outline-0`}>
                     <option value={''}>All Orders</option>
                     <option value={'added'}>Added Orders</option>
                     <option value={'intransit'}>In-transit</option>
                     <option value={'completed'}>Completed Orders</option>
                     </select>
                  </div>

                  <div className='relative me-3'>
                     {payementStatus ? <button onClick={()=>setPaymentStatus()} className='bg-blue-600 p-1 text-2xl text-white absolute top-[3px] right-2 hover:text-red-500'>&times;</button> :""}
                     <select 
                        defaultValue={payementStatus}
                        onChange={(e) => {handlePaymentFilter(e.target.value)}}
                        className={`${payementStatus ? "bg-blue-600 border border-blue-500" : 'bg-dark1 border border-gray-600'} appearance-none text-white text-sm min-w-[140px] max-w-[170px] w-full md:w-auto  rounded-xl px-4 py-[13px] focus:shadow-0 focus:outline-0`}>
                        <option value={''}>All Payments</option>
                        <option value={'paid'}>Completed Payments</option>
                        <option value={'pending'}>Pending Payments</option>
                        <option value={'initiated'}>Initiated Payments</option>
                        <option value={'failed'}>Failed Payments</option>
                     </select>
                  </div>

                  </>
                  }
                  {hideSearch ? ' ': <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search order' className='text-white min-w-[200px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />}
                     <OrderExel data={lists} orderStatus={orderStatus} />
                  {/* {hideExportOrder ? '' : <Link to="/order/add" className={"ms-4 btn md text-black font-bold w-full md:w-auto block md:flex mt-3 md:mt-0"} >+ New Order</Link>} */}
                  {sidebtn}

               </div>
            </div>

            {/* Order Statistics - only show if not a recent orders view */}
            {!isRecent && !loading && lists && lists.length > 0 && (
               <OrderStats 
                  orders={lists}
                  isSearching={searching}
                  searchTerm={searchTerm}
                  orderStatus={orderStatus}
                  paymentStatus={payementStatus}
               />
            )}

            {loading ? 
               <OrderItem loading={true} />
               :
               <>
               {lists && lists.length > 0 ? 
                  <OrderItem lists={lists} fetchLists={fetchLists} />
                  : 
                  <EmptyOrderState 
                     isFiltering={orderStatus || payementStatus || searching}
                     searchTerm={searchTerm}
                     onClearFilters={() => {
                        setOrderStatus(null);
                        setPaymentStatus(null);
                        setSearching(false);
                        setSearchTerm('');
                        setCurrentPage(1);
                        if (debounceRef.current) debounceRef.current.value = '';
                        navigate('/orders');
                        fetchLists('', 1);
                     }}
                  />
               }
               </>
            }
            
            {/* Pagination - only show if not recent view and has orders */}
            {!isRecent && !loading && lists && lists.length > 0 && totalPages > 1 && (
               <Pagination 
                  total={totalPages}
                  currentPage={currentPage}
                  fetch={handlePageChange}
                  setPage={setCurrentPage}
               />
            )}
         </>
   )
}
