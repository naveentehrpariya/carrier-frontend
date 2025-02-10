import React, { useContext, useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import TimeFormat from '../../common/TimeFormat';
import { Link } from 'react-router-dom';
import Nocontent from '../../common/NoContent';
import Badge from '../../common/Badge';
import Currency from '../../common/Currency';
import Loading from '../../common/Loading';
export default function Orders() {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/order/listings`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.orders);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }

   useEffect(() => {
      fetchLists();
   }, []);


  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Orders</h2>
            <Link to="/order/add" className={"btn md text-black font-bold"} >Add New Order</Link>
         </div>

         {loading ? <Loading />
            :
            <>
            {lists && lists.length > 0 ? 
               <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
                  <table className='w-full p-2' cellPadding={'20'}>
                     <tr>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Order ID</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer / Carrier </th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer Payment</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier Payment</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Created Date</th>
                     </tr>
                     {lists && lists.map((c, index) => {
                        return <tr key={`carriew-${index}`}>

                           <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>
                              <p className='whitespace-nowrap'>Order No. : {c.customer_order_no || "--"}</p>
                              <p>{c.company_name || "--"}</p>
                           </td>
                          
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p>Customer : {c.customer?.name || "--"}</p>
                              <p className='mt-1'>Carrier : {c.carrier?.name || "--"}</p>
                           </td>

                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p className='mt-1'>Payment Status : <Badge status={c.payment_status} /></p>
                              {c.payment_status === 'paid' && <p className='mt-1'>Payment method : {c.payment_method}</p>}
                              {c.payment_status_date ? <p className='text-[12px] text-gray-400 mt-1'>Updated at <TimeFormat date={c.payment_status_date || ""} /></p> : ''}
                           </td>
                         
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p className='mt-1'>Payment Status : <Badge status={c.carrier_payment_status} /></p>
                              <p className='mt-1'>Carrier Amount : <Currency amount={c.carrier_amount} currency={c.revenue_currency || 'usd'} /></p>
                              {c.carrier_payment_status === 'paid' && <p className='mt-1'>Payment method : {c.carrier_payment_method}</p>}
                              {c.carrier_payment_date ? <p className='text-[12px] text-gray-400 mt-1'>Updated at <TimeFormat date={c.carrier_payment_date || ""} /></p> : ''}
                           </td>
                          
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p className='mb-2'>
                                 <Link href={`/order/detail/${c._id}`} className=' bg-blue-800 text-[12px] m-auto d-table !text-white p-2 px-3 rounded-[20px]'  >View Details</Link>
                              </p>
                              <p><TimeFormat date={c.createdAt || "--"} /></p>
                           </td>

                        </tr>
                     })}
                     
                  </table>
               
               </div>
               : 
               <Nocontent text="No orders found" />
             }
            </>
         }
      </AuthLayout>
  )
}
