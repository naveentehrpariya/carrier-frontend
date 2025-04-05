import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import TimeFormat from '../../common/TimeFormat';
import { Link } from 'react-router-dom';
import Nocontent from '../../common/NoContent';
import Badge from '../../common/Badge';
import Currency from '../../common/Currency';
import Loading from '../../common/Loading';
import AddNotes from '../accounts/AddNotes';
import OrderView from './OrderView';
import Dropdown from '../../common/Dropdown';
import UpdatePaymentStatus from '../accounts/UpdatePaymentStatus';
import UpdateOrderStatus from '../accounts/UpdateOrderStatus';

export default function Orders() {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors, user} = useContext(UserContext);

   const fetchLists = (value) => {
      setLoading(true);
      const resp = Api.get(`/order/listings?${value ?`search=${value}` : ''}`);
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
   },[]);

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
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Orders</h2>
            <div className='flex items-center'>
               <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search order' className='text-white min-w-[250px] bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
               {user?.role !== 2 ? <div className='ms-4'></div> : ''}
               <Link to="/order/add" className={"btn md text-black font-bold"} >+ New Order</Link>
            </div>
         </div>

         {loading ? <Loading />
            :
            <>
            {lists && lists.length > 0 ? 
               <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
                  <table className='w-full p-2' cellPadding={'20'}>
                     <tr>
                        <th className='text-sm text-start text-gray-400 uppercase whitespace-nowrap border-b border-gray-900'>Sr. No</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Order</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer Details </th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier Details</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Docs</th>
                     </tr>
                     {lists && lists.map((c, index) => {
                        return <tr key={`carriew-${index}`}>

                           <td className='text-sm text-start text-gray-300 uppercase border-b border-gray-900'>
                              <Link to={`/view/order/${c._id}`} className=' text-main uppercase text-[14px] m-auto d-table    rounded-[20px]'  >CMC{c.serial_no || "--"}</Link>
                              <p className='text-gray-500'>Created by : {c.created_by?.name || "--"}</p>
                              <p className='text-gray-500 text-[12px]'><TimeFormat date={c.createdAt || "--"} /></p>
                           </td>

                           <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>
                              <p className='whitespace-nowrap'>Order No  : {c?.customer_order_no || "--"}</p>
                              <p className='my-1 whitespace-nowrap'>Status : <Badge title={true} status={c?.order_status} /></p>
                              <p className='my-1 whitespace-nowrap'>Total Distance : {c?.totalDistance} Miles</p>
                           </td>
                          
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p>Customer : {c?.customer?.name || "--"}(MC{c?.customer?.mc_code || "--"})</p>
                              <p className='mt-1 whitespace-nowrap'>Payment  : <Badge title={true} status={c?.payment_status} text={`${c?.payment_status === 'paid' ? `via ${c?.payment_method}` :''}`} /></p>
                              <p className='mt-1 whitespace-nowrap'>Order Amount : <Currency amount={c?.total_amount} currency={c?.revenue_currency || 'usd'} /></p>
                              {c?.payment_status_date ? <p className='text-[13px] text-gray-400 mt-1'>Payment at <TimeFormat date={c?.payment_status_date || ""} /></p> : ''}
                           </td>
                         
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p className='mt-1'>Carrier :  {c.carrier?.name || "--"}(MC{c?.carrier?.mc_code || "--"})</p>
                              <p className='mt-1 whitespace-nowrap'>Payment : <Badge title={true} status={c?.carrier_payment_status} text={`${c?.carrier_payment_status === 'paid' ? `via ${c?.carrier_payment_method}` :''}`} /></p>
                              <p className='mt-1 whitespace-nowrap'>Sell Amount : <Currency amount={c?.carrier_amount} currency={c?.revenue_currency || 'usd'} /></p>
                              {c?.carrier_payment_date ? <p className='text-[13px] text-gray-400 mt-1'>Updated at <TimeFormat date={c?.carrier_payment_date || ""} /></p> : ''}
                           </td>
                          
                            
                           {/* <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <OrderView order={c} fetchLists={fetchLists} />
                           </td> */}
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                                 <Dropdown>
                                    {user && user.is_admin === 1 ?
                                    <>
                                    <li className='list-none text-sm'>
                                       <UpdatePaymentStatus pstatus={c.carrier_payment_status} pmethod={c.carrier_payment_method} pnotes={c.carrier_payment_notes} text="Update Carrier Payment" paymentType={2} id={c.id} type={2} fetchLists={fetchLists} />
                                    </li>
                                    <li className='list-none text-sm'>
                                       <UpdatePaymentStatus pstatus={c.payment_status} pmethod={c.payment_method} pnotes={c.customer_payment_notes} text="Update Customer Payment" paymentType={1} id={c.id} type={1} fetchLists={fetchLists} />
                                    </li>
                                    <li className='list-none text-sm'>
                                       <UpdateOrderStatus  text={<>Update Order Status </>}  id={c.id} fetchLists={fetchLists} />
                                    </li>
                                    <li className='list-none text-sm'>
                                       <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${c._id}`}>Download Customer Invoice</Link>
                                    </li>
                                    <li className='list-none text-sm' >
                                       <OrderView btnclasses={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block`} order={c} fetchLists={fetchLists} />
                                    </li>
                                    </> 
                                    : '' }
                                    <li className='list-none text-sm'>
                                       <AddNotes note={c.notes} id={c.id} type={2} fetchLists={fetchLists} />
                                    </li>
                                    <li className='list-none text-sm'>
                                       <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Carrier Sheet</Link>
                                    </li>
                                    
                                    
                                 </Dropdown>
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
