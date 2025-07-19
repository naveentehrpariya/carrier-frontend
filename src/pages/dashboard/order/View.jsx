import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import Loading from './../../common/Loading';
import Badge from '../../common/Badge';
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa6";
import { FaTruckMoving } from "react-icons/fa6";
import OrderMap from './OrderMap';
import DistanceInMiles from '../../common/DistanceInMiles';
import OrderView from './OrderView';
import Dropdown from '../../common/Dropdown';
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import UpdatePaymentStatus from '../accounts/UpdatePaymentStatus';
import LockOrder from './LockOrder';
import UpdateOrderStatus from '../accounts/UpdateOrderStatus';
import { LuDownload } from "react-icons/lu";
import RemoveOrder from './RemoveOrder';

export default function ViewOrder() {
   
   const [order, setOrder] = useState([]);
   const [paymentLogs, setPaymentLogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const {Errors,user} = useContext(UserContext);
   const { id } = useParams();
   
   const fetchOrder = () => {
      setLoading(true);
      const resp = Api.get(`/order/detail/${id}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status) {
            setOrder(res.data.order);
            setPaymentLogs(res.data.paymentLogs);
         } else {
            setOrder(null);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }

   useEffect(() => {
      fetchOrder();
   },[]);

   return <AuthLayout>
      <div className='flex justify-between items-center'>
         <h1 className='text-2xl font-bold text-white mb-6 mt-4'> Order CMC{order?.serial_no}</h1>
         {/* <button className='bg-main px-4 py-2 rounded-xl'>Edit Order</button> */}
         <div className='flex items-center ps-3'>
            <Link to={`/order/detail/${order?._id}`} className='bg-main px-4 py-2 rounded-xl me-3 flex items-center'> <LuDownload className='me-2' size='20px' /> Carrier Sheet</Link>
            <Link to={`/order/customer/invoice/${order?._id}`} className='bg-main px-4 py-2 rounded-xl me-3 flex items-center'> <LuDownload className='me-2' size='20px' /> Invoice</Link>
            <Dropdown classes={'relative top-1'} iconsize={'30px '}>
               {(user && user.is_admin === 1) || (user && user.role === 2) ?
                  <>
                     <li className={`list-none text-sm  ${order?.lock ? "disabled" : ""}`}>
                        <UpdatePaymentStatus pstatus={order?.carrier_payment_status} pmethod={order?.carrier_payment_method} pnotes={order?.carrier_payment_notes} text={<>{order?.lock ? <FaLock size={12} className='me-1' /> : ""} Update Carrier Payment</>} paymentType={2} id={order?.id} type={2} fetchLists={fetchOrder} />
                     </li>
                     {user && user.is_admin === 1 ?
                        <>
                           <li className='list-none text-sm'>
                              <LockOrder order={order} fetchLists={fetchOrder} />
                              <RemoveOrder order={order} fetchLists={fetchOrder} />
                           </li>
                        </>
                     : ''}
                     <li className={`list-none text-sm  ${order?.lock ? "disabled" : ""}`}>
                        <UpdatePaymentStatus pstatus={order?.customer_payment_status} pmethod={order?.payment_method} pnotes={order?.customer_payment_notes} text={<>{order?.lock ? <FaLock size={12} className='me-1' /> : ""} Update Customer Payment</>} paymentType={1} id={order?.id} type={1} fetchLists={fetchOrder} />
                     </li>
                     <li className={`list-none text-sm  ${order?.lock ? "disabled" : ""}`}>
                        <UpdateOrderStatus text={<>{order?.lock ? <FaLock size={12} className='me-1' /> : ""} Update Order Status </>} id={order?.id} fetchLists={fetchOrder} />
                     </li>
                  </> 
               : '' }
               <li className='list-none text-sm'>
                  <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${order?._id}`}>Download Customer Invoice</Link>
               </li>
               <li className='list-none text-sm'>
                  <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${order?._id}`}>Download Carrier Sheet</Link>
               </li>
            </Dropdown>
            <div className='ms-3'>
               <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>}  order={order} fetchLists={fetchOrder} />
            </div>
         </div>
      
      </div> 
      {loading ? <Loading /> : 
         <div className='boltables' >
            <div  className='text-white m-auto'>
               <div className='py-3 mt-3 pt-4'>
                  <ul className='grid grid-cols-4 gap-2'>
                     <li className=''><strong className='text-gray-400 '> Order No. # :</strong> <p className='flex mt-1'>{order?.lock ? <FaLock className='me-1 text-red-500' /> : <FaLockOpen className='me-1' />} CMC{order?.serial_no}</p> </li>
                     <li className=''><strong className='text-gray-400'>Order Created Date :</strong> <p><TimeFormat date={order?.createdAt} /></p> </li>
                     <li className=''><strong className='text-gray-400'>Order Status :</strong> <p><Badge title={true} status={order?.order_status} /></p> </li>
                     <li className=''><strong className='text-gray-400'>Total Distance :</strong> <p><DistanceInMiles d={order.totalDistance} /></p> </li>
                  </ul>
               </div>

               <div className='orderFill py-3 mt-3 pt-4 grid grid-cols-2 gap-4'>
                  <div>
                     <div className='customerDetails mb-2 bg-dark1 border border-gray-700 p-4 rounded-xl'>
                        <p className='font-bold text-gray-400 text-xl mb-2'>Customer Details</p>
                        <ul className=''>
                           <li className='flex mb-2'> <p><strong className=' me-2 !text-gray-400'>Customer Name:</strong><Link className='text-main' to={`/customer/detail/${order?.customer?._id}`}>{order?.customer?.name || "--"}({order?.customer?.customerCode || "--"})</Link> </p> </li>
                           <li className='flex mb-2'> <p><strong className=' me-2 !text-gray-400'>Customer Phone :</strong>{order?.customer?.phone } {order?.customer?.phone ? `,${order?.customer?.secondary_phone}` :'' } </p> </li>
                           <li className='flex mb-2'> <p><strong className=' me-2 !text-gray-400'>Customer Email :</strong> {order?.customer?.email } {order?.customer?.email ? `,${order?.customer?.secondary_email}` :'' }</p> </li>
                           <li className='flex items-center'><p className=''><strong className=' !text-gray-400'>Payment Status:</strong> <Badge approved={order?.customer_payment_approved_by_admin} date={order?.customer_payment_date || ""} title={true} status={order?.customer_payment_status} text={`${order?.customer_payment_status === 'paid' ? `via ${order?.customer_payment_method}` :''} `} /></p> </li>
                        </ul>
                     </div>
                     <div className='customerDetails mb-2 bg-dark1 border border-gray-700 p-4 rounded-xl'>
                        <p className='font-bold text-gray-400 text-xl mb-2'>Carrier Details</p>
                        <ul className=''>
                           <li className=' flex mb-2'><strong className=' me-2 !text-gray-400'>Carrier Name:</strong> <p><Link className='text-main' to={`/carrier/detail/${order?.carrier?._id}`}>{order?.carrier?.name} (MC{order?.carrier?.mc_code})</Link> </p> </li>
                           <li className=' flex mb-2'> <p> <strong className=' me-2 !text-gray-400'>Carrier Phone :</strong> {order?.carrier?.phone}, {order?.carrier?.secondary_phone}</p> </li>
                           <li className=' flex mb-2'> <p className='break-all'><strong className=' me-2 !text-gray-400 '>Carrier Email :</strong> {order?.carrier?.email}, {order?.carrier?.secondary_email}</p> </li>
                           <li className=' flex items-center'><strong className=' !text-gray-400'>Payment Status:</strong> <p className='ps-2'><Badge approved={order?.carrier_payment_approved_by_admin} date={order?.carrier_payment_date || ""} title={true} status={order?.carrier_payment_status} text={`${order?.carrier_payment_status === 'paid' ? `via ${order?.carrier_payment_method}` :''} `} /></p> </li>
                     </ul>
                     </div>
                     <div className='customerDetails bg-dark1 border border-gray-700 p-4 rounded-xl'>
                        <p className='font-bold text-gray-400 text-xl mb-2'>Staff Details</p>
                        <ul className=''>
                           <li className=' flex items-center mb-2'><strong className=' !text-gray-400'>Staff Name:</strong> <p className='ps-2'>{order?.created_by?.name}</p> </li>
                           <li className=' flex items-center mb-2'><strong className=' me-1 !text-gray-400'>Email: </strong> <p>{order?.created_by?.email}</p> </li>
                           <li className=' flex items-center mb-2 '><strong className=' me-1 !text-gray-400'>Phone: </strong> <p>{order?.created_by?.phone}</p> </li>
                           <li className=' flex items-center capitalize'> <p> <strong className=' me-1 !text-gray-400'>Address : </strong> {order?.created_by?.address}</p> </li>
                        </ul>
                     </div>
                  </div>
                  <OrderMap order={order} />
               </div>

                
               {order && order.shipping_details && order.shipping_details.map((s, index) => {
                  return <>
                     <div className='orderFill bg-dark2 p-6 rounded-xl border border-gray-800 mt-4'>
                        <ul className='grid grid-cols-6 gap-2 mb-4 p-3 pb-0'>
                           <li className=''><strong className='text-gray-400'>Shipment No.:</strong> <p>#{index+1}</p> </li>
                           <li className='capitalize '><strong className='text-gray-400'>Commodity :</strong> <p>{ s?.commodity?.value || s?.commodity}</p> </li>
                           <li className='capitalize '><strong className='text-gray-400'>Equipments :</strong> <p>{s?.equipment?.value}</p> </li>
                           <li className=''><strong className='text-gray-400'>Weight :</strong> <p>{s?.weight || 'N/A'} {s?.weight_unit || s?.weight_unit || ''}</p> </li>
                        </ul>

                         <div className='block'>
                           <div className=' mt-2'>
                              {s.locations && s.locations.length && s.locations.map((p, i) => {
                                 return <>
                                 <div className='flex mt-[45px] items-center'>
                                    <div className='relative me-4 w-[70px] h-[70px]  min-w-[70px] min-h-[70px]  flex justify-center items-center bg-dark1 border border-gray-700 rounded-full'>
                                       <FaTruckMoving size={25} />
                                       {i > 0 ? <div className='absolute left-[20px] top-[-45px]'>
                                          <p className='text-gray-400 m-0 p-0 ms-3'>|</p>
                                          <p className='text-gray-400 m-0 p-0 ms-3'>|</p>
                                       </div> : ''}
                                    </div>
                                    {p.type === 'pickup' ? 
                                       <div>
                                          <p className='flex pb-[7px]'> <p ><strong className='pe-2 text-gray-300' >Pickup Location :</strong>  {p?.location} </p> </p>
                                          <div className='grid grid-cols-4 gap-4'>
                                             <p className='flex pb-[7px]'><strong className=' text-gray-300 '>Pickup Reference No. :</strong> <p className='ps-2'>{p?.referenceNo}</p> </p>
                                             <p className='flex pb-[7px]'><strong className=' text-gray-300 '>Pickup Appointement : </strong> <p className='ps-2'>{p?.appointment ? "Yes" : "No"}</p> </p>
                                             <p className='flex pb-[7px]'><strong className=' text-gray-300 '>Pickup Date :</strong> 
                                             <p className='ps-2' ><TimeFormat time={false} date={p?.date} /></p> </p>
                                          </div>
                                       </div>
                                       :
                                       <div>
                                          <p className='flex pb-[7px]'> <p ><strong className='pe-2 text-gray-300' >Delivery Location :</strong>  {p?.location} </p> </p>
                                          <div className='grid grid-cols-4 gap-4'>
                                             <p className='flex pb-[7px]'><strong className=' text-gray-300 '>Delivery Reference No. :</strong> <p className='ps-2'>{p?.referenceNo}</p> </p>
                                             <p className='flex pb-[7px]'><strong className=' text-gray-300 '>Delivery Appointement : </strong> <p className='ps-2'>{p?.appointment ? "Yes" : "No"}</p> </p>
                                             <p className='flex pb-[7px]'><strong className=' text-gray-300 '>Delivery Date :</strong> 
                                             <p className='ps-2' ><TimeFormat time={false} date={p?.date} /></p> </p>
                                          </div>
                                       </div>
                                    }
                                 </div>
                                 
                                </>
                              })}
                           </div>
                        </div> 
                     </div>
                  </>
               })}

            
               {order && order.revenue_items &&
                  <div id='revanue' className='orderFill py-3 mt-3 pt-4'>
                     <p className='font-bold  text-xl mb-2'>Customer Revenue Items</p>
                     {order && order.revenue_items && order.revenue_items.map((r, index) => {
                        return <div className='mt-4 mb-4 pb-2'>
                           <div className='flex justify-between   '>
                              <p className='flex items-center w-[32%]'><strong>Revenue Item:</strong> <p className='ps-2'>{r.revenue_item}</p> </p>
                              <p className='flex items-center w-[32%]'><strong>Rate : </strong  > <p className='capitalize ps-2'><Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} /> * {r.quantity}</p> </p>
                              <p className='flex items-center w-[32%]'><strong>Sub Total : </strong> <p className='ps-2'><Currency amount={r?.rate*r.quantity || 0} currency={order?.revenue_currency || 'cad'} /></p> </p>
                           </div>
                           <p className='flex items-center text-gray-400 mt-1 '><strong>Note/Comment : </strong> <p className='ps-2'>{r?.note}</p> </p>
                        </div>
                     })}
                  </div>
               }

               {order && order.carrier_revenue_items &&
                  <div id='revanue' className='orderFill border-t border-gray-700 pb-3 mt-1 pt-6'>
                     <p className='font-bold  text-xl mb-2'>Carrier Revenue Items</p>
                     {order && order.carrier_revenue_items && order.carrier_revenue_items.map((r, index) => {
                        return <div className='mt-4 mb-4 pb-2' >
                           <div className='flex justify-between  '>
                              <p className='flex items-center w-[32%]'><strong>Revenue Item:</strong> <p className='ps-2'>{r.revenue_item}</p> </p>
                              <p className='flex items-center w-[32%]'><strong>Rate  :   </strong  > <p className='capitalize ps-2'><Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} /> * {r.quantity}</p> </p>
                              <p className='flex items-center w-[32%]'><strong>Sub Total :   </strong> <p className='ps-2'><Currency amount={r?.rate*r.quantity || 0} currency={order?.revenue_currency || 'cad'} /></p> </p>
                           </div>
                              <p className='flex items-center text-gray-400 mt-1'><strong>Note/Comment :   </strong> <p className='ps-2'>{r?.note}</p> </p>
                        </div>
                     })}
                  </div>
               }
               
               <div className='flex justify-between bg-dark3 p-3 rounded-xl'>
                     <h2 className='font-bold  text-xl text-right'>Total : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /> </h2>
                     <h2 className='font-bold  text-xl text-right'>Sell Amount : <Currency amount={order?.carrier_amount || 0} currency={order?.revenue_currency || 'cad'} /> </h2>
               </div>
            </div>
         </div>
      }
   </AuthLayout>
}
