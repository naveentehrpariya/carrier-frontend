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

export default function OrdersFetch({hideExportOrder, hideFilter, sidebtn, isRecent, customer, sortby, hideAddOrder, title, hideSearch}) {
  const navigate = useNavigate();

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors, user} = useContext(UserContext);

   // get search query param from url
   const [searchParams] = useSearchParams();
   const status = searchParams.get('status');
   const [orderStatus, setOrderStatus] = useState(status || null);
   const fetchLists = (value) => {
      setLoading(true);
      const resp = Api.get(`/order/listings?${orderStatus ?`status=${orderStatus}` : ''}${payementStatus ?`&paymentStatus=${payementStatus}` : ''}${value ?`&search=${value}` : ''}${customer ?`&customer_id=${customer}` : ''} ${sortby ?`&sortby=${sortby}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            let orderslists = res.data.orders || [];
            if(isRecent){
               orderslists  = orderslists.slice(0, 5);
            }
            setLists(orderslists);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }
   const [payementStatus, setPaymentStatus] = useState(null)

   useEffect(() => {
      fetchLists();
   },[customer, orderStatus, payementStatus]);

   const handleFilter = (e) => {
    setOrderStatus(e);
    const params = new URLSearchParams();
    if (e) params.set('status', e);
    if (payementStatus) params.set('paymentStatus', payementStatus);
    navigate(`/orders?${params.toString()}`);
  };

   const handlePaymentFilter = (e) => {
    setPaymentStatus(e);
    const params = new URLSearchParams();
    if (orderStatus) params.set('status', orderStatus);
    if (e) params.set('paymentStatus', e);
    navigate(`/orders?${params.toString()}`);
  };
    

   const debounceRef = useRef(null);
   const [searching, setSearching] = useState(false);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value &&value.length;
      if (wordCount > 1) {
         setSearching(true);
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };

   return (
         <> 
            <div className='md:flex justify-between items-center'>
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

            {loading ? <Loading />
               :
               <>
               {lists && lists.length > 0 ? 
                  <OrderItem lists={lists} fetchLists={fetchLists} />
                  : 
                  <Nocontent text="No orders found" />
               }
               </>
            }
         </>
   )
}
