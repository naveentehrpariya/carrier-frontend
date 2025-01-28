import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import AddEmployee from '../employees/AddEmployee';
import Badge from '../../common/Badge';
import Currency from '../../common/Currency';
export default function AccountOrders() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/account/order/listings`);
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

         {loading ? <p>Loading..</p>
         :
         <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Order No.</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer Payment</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Amount/Profit</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier Payment</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Added By</th>
               </tr>
               {lists && lists.map((c, index) => {
                  return <tr key={`carriew-${index}`}>
                     <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                        <p>{c.customer_order_no}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>{c?.customer.name}</p>
                        <p>{c.customer.phone}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>{c?.carrier.name}</p>
                        <p>{c.carrier.email}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p><Badge status={c.payment_status} /> | {c.payment_method}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Amount : <Currency amount={c.gross_amount} currency={c.revenue_currency || 'usd'} /></p>
                        <p>Profit : <Currency amount={c.profit} currency={c.revenue_currency || 'usd'} /> </p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Carrier Amount :<Currency amount={c.carrier_amount} currency={c.revenue_currency || 'usd'} /> </p>
                        <p><Badge status={c.carrier_payment_status} /> | {c.carrier_payment_method}</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Created By {c.created_by.name || "--"}</p>
                        <p><TimeFormat date={c.createdAt || "--"} /> </p>
                     </td>
                  </tr>
               })}
            </table>
         </div>
         }
      </AuthLayout>
  )
}
