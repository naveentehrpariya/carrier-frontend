import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import Loading from '../../common/Loading';
import { Link, useSearchParams } from 'react-router-dom';
import Nocontent from '../../common/NoContent';
import Currency from '../../common/Currency';
import Badge from '../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import CustomerPaymentExel from '../customer/CustomerPaymentExel';
import PaymentExelSheet from './PaymentExelSheet';

export default function PaymentLists() {
   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);
   const [searchParams] = useSearchParams();
   const type = searchParams.get('type');
   const status = searchParams.get('status');
   const title = searchParams.get('title');
   const [paymentStatus, setPaymentStatus] = useState(status || 'all');
   const [paymentType, setPaymentType] = useState(type || 'all');

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/all_payments_status?type=${paymentType}&status=${paymentStatus}`);
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
            <h2 className='text-white text-2xl'>{title || "Payments"}</h2>
            <PaymentExelSheet type={type} title={`${type}-${status}-${new Date().toDateString()}`} data={lists} />
         </div>
         {loading ? <Loading />
         :
         <div className='recent-orders overflow-x-auto mt-2 border border-gray-900 '>
            {loading ? <Loading /> :
               <>
               {lists && lists.length > 0 ? 
               <>
               <div className='bg-dark text-white border border-gray-700 mt-4 !rounded-xl overflow-x-auto'>
                  <table className='w-full '>
                  <thead>
                     <tr>
                        <th className='p-2 border border-gray-700 '>#</th>
                        <th className='p-2 border border-gray-700  text-start'>Order No.</th>
                        <th className='p-2 border border-gray-700  text-start capitalize'>{type}</th>
                        <th className='p-2 border border-gray-700  text-start'>Amount</th>
                        <th className='p-2 border border-gray-700  text-start'>Status</th>
                        <th className='p-2 border border-gray-700  text-start'>Method</th>
                        <th className='p-2 border border-gray-700  text-start'>Approval</th>
                        <th className='p-2 border border-gray-700  text-start'>Date</th>
                     </tr>
                  </thead>
                     {lists.map((item, index) => {
                        return (
                           <tr key={index}>
                              {type === 'carrier' ?
                              <>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-center'>{index + 1}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'><Link className='text-main' to={`/view/order/${item._id}`} >CMC{item.serial_no}</Link></td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.carrier?.name}(MC{item.carrier?.mc_code})</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'><Currency amount={item?.total_amount} currency={item?.revenue_currency || 'cad'} /></td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start '> <Badge title={true} status={item?.carrier_payment_status} text={``} /></td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.carrier_payment_method || 'N/A'}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.carrier_payment_approved_by_admin ? "Approved" : 'Un-Approved'}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item?.carrier_payment_date ? <TimeFormat date={item?.carrier_payment_date || "--"} /> : 'N/A'}</td>
                              </>
                              :
                              <>
                               <td className='p-2 border border-gray-700 !text-gray-400  text-center'>{index + 1}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>CMC{item.serial_no}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.customer?.name}(ref.{item.customer?.customerCode})</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'><Currency amount={item?.total_amount} currency={item?.revenue_currency || 'cad'} /></td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start '> <Badge title={true} status={item?.customer_payment_status} text={``} /></td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.customer_payment_method || 'N/A'}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item.customer_payment_approved_by_admin ? "Approved" : 'Un-Approved'}</td>
                                 <td className='p-2 border border-gray-700 !text-gray-400  text-start'>{item?.customer_payment_date ? <TimeFormat date={item?.customer_payment_date || "--"} /> : 'N/A'}</td>
                                 </>
                              }
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
         </div>
         }
      </AuthLayout>
  )
}
