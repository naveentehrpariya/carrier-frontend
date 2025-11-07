import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import OrderItem from '../order/OrderItem';
import Nocontent from '../../common/NoContent';
import Currency from '../../common/Currency';
import Badge from '../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import CarrierPaymentExel from './CarrierPaymentExel';

export default function CarrierOrders({isRecent, carrierID, customer, carrier, sortby, title}) {
   const [loadingOrders, setLoadingOrders] = useState(true);
   const [ordersList, setOrdersList] = useState([]);
   const [loadingPayments, setLoadingPayments] = useState(true);
   const [paymentsList, setPaymentsList] = useState([]);
   const {Errors, user} = useContext(UserContext);

   const fetchLists = (value) => {
      setLoadingOrders(true);
      // Build query string properly
      const qs = [
         value ? `search=${encodeURIComponent(value)}` : '',
         carrierID ? `carrier_id=${encodeURIComponent(String(carrierID).trim())}` : '',
         sortby ? `sort=${encodeURIComponent(sortby)}` : ''
      ].filter(Boolean).join('&');
      
      const resp = Api.get(`/order/listings?${qs}`);
      resp.then((res) => {
         setLoadingOrders(false);
         if (res.data.status === true) {
            let orderslists = res.data.orders || [];
            if(isRecent){
               orderslists = orderslists.slice(0, 5);
            }
            setOrdersList(orderslists);
         } else {
            setOrdersList([]);
         }
      }).catch((err) => {
         setLoadingOrders(false);
         Errors(err);
      });
   }

   const fetchPayments = () => {
      setLoadingPayments(true);
      const qs = [carrierID ? `carrier_id=${encodeURIComponent(String(carrierID).trim())}` : ''].filter(Boolean).join('&');
      
      const resp = Api.get(`/payments/listings?${qs}`);
      resp.then((res) => {
         setLoadingPayments(false);
         if (res.data.status === true) {
            let paymentslists = res.data.orders || [];
            setPaymentsList(paymentslists);
         } else {
            setPaymentsList([]);
         }
      }).catch((err) => {
         setLoadingPayments(false);
         Errors(err);
      });
   }

   useEffect(() => {
      fetchLists();
      fetchPayments();
   },[customer, carrier, carrierID]);

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
               <div>
                  <h2 className='text-white text-2xl mb-1 md:mb-0'>{title ? title : "Orders"}</h2>
                  {user && Number(user.role) === 1 && (
                     <p className='text-gray-400 text-sm mb-4 md:mb-0'>Showing only orders created by you</p>
                  )}
               </div>
               <div className='sm:flex items-center justify-between md:justify-end'>
                  <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search order' className='text-white min-w-[250px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
               </div>
            </div>
            {loadingOrders ? <Loading />
               :
               <>
               {ordersList && ordersList.length > 0 ? 
                  <OrderItem lists={ordersList} fetchLists={fetchLists} />
                  : 
                  <Nocontent text="No orders found" />
               }
               </>
            }

            {/* Payments status */}
            <div className='flex justify-between items-center mt-12 '>
               <div>
                  <h2 className='text-white text-2xl mb-1 md:mb-0'>Carrier Payments</h2>
                  {user && Number(user.role) === 1 && (
                     <p className='text-gray-400 text-sm mb-4 md:mb-0'>Showing only payments for orders created by you</p>
                  )}
               </div>
               <CarrierPaymentExel  carrier={carrier} data={paymentsList} />
            </div>
                     {loadingPayments ? <Loading />
                        :
                        <>
                        {paymentsList && paymentsList.length > 0 ?
                        <>
                        <div className='bg-dark text-white border border-gray-700 mt-4 !rounded-xl overflow-x-auto'>
                           <table className='w-full '>
                           <thead>
                              <tr>
                                 <th className='p-2 border border-gray-700 '>#</th>
                                 <th className='p-2 border border-gray-700  text-start'>Order No.</th>
                                 <th className='p-2 border border-gray-700  text-start'>Amount</th>
                                 <th className='p-2 border border-gray-700  text-start'>Status</th>
                                 <th className='p-2 border border-gray-700  text-start'>Method</th>
                                 <th className='p-2 border border-gray-700  text-start'>Note</th>
                              </tr>
                           </thead>
                              {paymentsList.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td className='p-2 border border-gray-700 !text-gray-400  text-center'>{index + 1}</td>
                                       <td className='p-2 border border-gray-700 !text-gray-400  text-start'><Link className='text-main' to={`/view/order/${item._id}`} >CMC{item.serial_no}</Link></td>
                                       <td className='p-2 border border-gray-700 !text-gray-400  text-start'><Currency amount={item?.carrier_amount} currency={item?.revenue_currency || 'cad'} /></td>
                                       <td className='p-2 border border-gray-700 !text-gray-400  text-start '> <Badge title={true} status={item?.carrier_payment_status} text={``} /></td>
                                       <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.carrier_payment_method || 'N/A'}</td>
                                       <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item?.carrier_payment_date ? <TimeFormat date={item?.carrier_payment_date || "--"} /> : 'N/A'}</td>
                                    </tr>
                                 )
                              })}
                           </table>
                        </div>
                           </>
                           :
                           <Nocontent text="No payments found" />
                        }
                        </>
                     }

         </>
   )
}
