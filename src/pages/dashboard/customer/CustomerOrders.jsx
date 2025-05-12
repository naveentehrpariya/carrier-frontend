import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import OrderItem from '../order/OrderItem';
import Nocontent from '../../common/NoContent';
import Currency from '../../common/Currency';
import Badge from '../../common/Badge';

export default function CustomerOrders({isRecent, customer, carrier, sortby, title}) {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors, user} = useContext(UserContext);

   const fetchLists = (value) => {
      setLoading(true);
      const resp = Api.get(`/order/listings?${value ?`search=${value}` : ''}${customer ?`&customer_id=${customer}` : ''} ${sortby ?`&sortby=${sortby}` : ''}`);
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


   const [loadingPayments, setLoadingPayments] = useState(true);
   const fetchPayments = () => {
      setLoading(true);
      const resp = Api.get(`/payments/listings?${customer ?`&customer_id=${customer}` : ''}${carrier ?`&carrier_id=${carrier}` : ''}`);
      resp.then((res) => {
         setLoadingPayments(false);
         if (res.data.status === true) {
            let orderslists = res.data.orders || [];
            setLists(orderslists);
         } else {
            setLists([]);
         }
         setLoadingPayments(false);
      }).catch((err) => {
         setLoadingPayments(false);
         Errors(err);
      });
   }

   useEffect(() => {
      fetchLists();
      fetchPayments();
   },[customer, carrier]);

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
                  <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search order' className='text-white min-w-[250px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
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

            {/* Payments status */}
            <div className='md:flex justify-between items-center mt-12 '>
               <h2 className='text-white text-2xl mb-4 md:mb-0'>Customer Order Payment</h2>
            </div>
            <div className='bg-white mt-4 !rounded-xl overflow-x-auto'>
               <table className='w-full '>
                  <thead>
                     <tr>
                        <th className='p-2 border border-gray-200 text-black'>#</th>
                        <th className='p-2 border border-gray-200 text-black text-start'>Order No.</th>
                        <th className='p-2 border border-gray-200 text-black text-start'>Amount</th>
                        <th className='p-2 border border-gray-200 text-black text-start'>Status</th>
                        <th className='p-2 border border-gray-200 text-black text-start'>Method</th>
                        <th className='p-2 border border-gray-200 text-black text-start'>Note</th>
                     </tr>
                  </thead>
                     {loadingPayments ? <Loading />
                        :
                        <>
                        {lists && lists.length > 0 ? 
                           lists.map((item, index) => {
                              return (
                                 <tr key={index}>
                                    <td className='p-2 border border-gray-200 text-black text-center'>{index + 1}</td>
                                    <td className='p-2 border border-gray-200 text-black text-start'>CMC{item.serial_no}</td>
                                    <td className='p-2 border border-gray-200 text-black text-start'><Currency amount={item?.total_amount} currency={item?.revenue_currency || 'cad'} /></td>
                                    <td className='p-2 border border-gray-200 text-black text-start '> <Badge title={true} status={item?.customer_payment_status} text={``} /></td>
                                    <td className='p-2 border border-gray-200 text-black text-start'>{item.customer_payment_method || 'N/A'}</td>
                                    <td className='p-2 border border-gray-200 text-black text-start'>{item.customer_payment_date || 'N/A'}</td>
                                 </tr>
                              )
                           })
                           :
                           <Nocontent text="No payments found" />
                        }
                        </>
                     }
               </table>
            </div>

         </>
   )
}
