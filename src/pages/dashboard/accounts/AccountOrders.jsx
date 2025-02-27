import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import AddEmployee from '../employees/AddEmployee';
import Badge from '../../common/Badge';
import Currency from '../../common/Currency';
import UpdatePaymentStatus from './UpdatePaymentStatus';
import UpdateOrderStatus from './UpdateOrderStatus';
import Loading from '../../common/Loading';
import AddNotes from './AddNotes';
import Dropdown from '../../common/Dropdown';
import { Link } from 'react-router-dom';
import OrderView from '../order/OrderView';
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
            <h2 className='text-white text-2xl'>Account Orders Lists</h2>
            <AddEmployee fetchLists={fetchLists} />
         </div>
         {loading ? <Loading />
         :
         <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Order No.</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier Payment</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Employee</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Amount/Profit</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>View Order</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th>
               </tr>
               {lists && lists.map((c, index) => {
                  return <tr key={`carriew-${index}`}>
                     <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                        <p className='text-white font-bold'>Order No. {c.customer_order_no}</p>
                        <p className='my-1'>Order Status : <Badge title={true} status={c.order_status} /></p>
                        <p><TimeFormat date={c.createdAt || "--"} /> </p>
                     </td> 
                    
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>{c?.customer.name}</p>
                        <p>{c.customer.phone}</p>
                        <p className='mt-1'>Payment Status : <Badge title={true} status={c.payment_status} /></p>
                        {c.payment_status === 'paid' && <p className='mt-1'>Payment method : {c.payment_method}</p>}
                     </td>
                     
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p className='mt-1'>Carrier : {c.carrier?.name}</p>
                        <p className='mt-1'>Payment Status : <Badge title={true} status={c.carrier_payment_status} /></p>
                        <p className='mt-1'>Sell Amount : <Currency amount={c.carrier_amount} currency={c.revenue_currency || 'usd'} /></p>
                        {c.carrier_payment_status === 'paid' && <p className='mt-1'>Payment method : {c.carrier_payment_method}</p>}
                     </td> 
                     
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Staff : {c.created_by.name}</p>
                        <p>Commision : <Currency amount={c.commission} currency={c.revenue_currency || 'usd'} /> ({c.created_by.staff_commision || 0})%</p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Amount : <Currency amount={c.total_amount} currency={c.revenue_currency || 'usd'} /></p>
                        <p>Profit : <Currency amount={c.profit} currency={c.revenue_currency || 'usd'} /> </p>
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                          <OrderView order={c} fetchLists={fetchLists} />
                     </td>
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <Dropdown>
                           <li className='list-none text-sm'>
                              <UpdatePaymentStatus text="Update Carrier Payment Status" paymentType={2}  id={c.id} type={2} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <AddNotes note={c.notes} id={c.id} type={2} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <UpdatePaymentStatus text="Update Payment Status" paymentType={1}  id={c.id} type={1} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <UpdateOrderStatus  text={<>Update Order Status </>}  id={c.id} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Invoice</Link>
                           </li>
                        </Dropdown>
                     </td> 

                  </tr>
               })}
            </table>
         </div>
         }
      </AuthLayout>
  )
}
