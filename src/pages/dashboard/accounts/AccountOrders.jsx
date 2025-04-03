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
            {/* <AddEmployee fetchLists={fetchLists} /> */}
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
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th>
               </tr>

               {lists && lists.map((c, index) => {
                  return <tr key={`carriew-${index}`}>
                     <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                        <Link to={`/view/order/${c._id}`} className=' text-main uppercase text-[14px] m-auto d-table  rounded-[20px]'  >CMC{c.serial_no}</Link>
                        <p className='my-1 whitespace-nowrap'>Order Status : <Badge title={true} status={c.order_status} /></p>
                        <p><TimeFormat date={c.createdAt || "--"} /> </p>
                     </td> 
                    
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p className=' text-white  uppercase text-[14px] m-auto d-table  rounded-[20px]'  >Order No. {c.customer_order_no}</p>
                        <p>{c?.customer.name} (MC{c?.customer.mc_code}) </p>
                        <p className='mt-1 whitespace-nowrap'>Payment : <Badge title={true} status={c.payment_status} text={`${c.payment_status == 'paid' ? `(${c.payment_method})` :''}`} /></p> 
                     </td>
                     
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p className='mt-1'>{c.carrier?.name} (MC{c.carrier?.mc_code})</p>
                        <p className='mt-1 whitespace-nowrap'>Payment : <Badge title={true} status={c.carrier_payment_status} text={`${c.carrier_payment_status === 'paid' ? `(${c.carrier_payment_method})` :'' }`} /> </p>
                     </td> 
                     
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Staff : {c.created_by.name}</p>
                        <p>Commision : <Currency amount={c.commission} currency={c.revenue_currency || 'usd'} /> ({c.created_by.staff_commision || 0})%</p>
                     </td>

                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Amount : <Currency amount={c.total_amount} currency={c.revenue_currency || 'usd'} /></p>
                        <p>Sell Amount : <Currency amount={c.carrier_amount} currency={c.revenue_currency || 'usd'} /></p>
                        <p>Profit : <Currency amount={c.profit} currency={c.revenue_currency || 'usd'} /> </p>
                     </td>

                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <Dropdown>
                           <li className='list-none text-sm'>
                              <UpdatePaymentStatus pstatus={c.carrier_payment_status} pmethod={c.carrier_payment_method} pnotes={c.carrier_payment_notes} text="Update Carrier Payment" paymentType={2} id={c.id} type={2} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <UpdatePaymentStatus pstatus={c.payment_status} pmethod={c.payment_method} pnotes={c.customer_payment_notes} text="Update Customer Payment" paymentType={1} id={c.id} type={1} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <AddNotes note={c.notes} id={c.id} type={2} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <UpdateOrderStatus  text={<>Update Order Status </>}  id={c.id} fetchLists={fetchLists} />
                           </li>
                           <li className='list-none text-sm'>
                              <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Carrier Sheet</Link>
                           </li>
                           <li className='list-none text-sm'>
                              <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${c._id}`}>Download Customer Invoice</Link>
                           </li>
                           <li className='list-none text-sm' >
                              <OrderView btnclasses={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block`} order={c} fetchLists={fetchLists} />
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
