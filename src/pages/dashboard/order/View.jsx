import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import Loading from './../../common/Loading';
import Badge from '../../common/Badge';

export default function ViewOrder() {
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors} = useContext(UserContext);
   const { id } = useParams();
   
   const fetchOrder = () => {
      setLoading(true);
      const resp = Api.get(`/order/detail/${id}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status) {
            setOrder(res.data.order);
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
         <h1 className='text-2xl font-bold text-white mb-6 mt-4'>CMC Order #{order?.serial_no}</h1>
         {/* <button className='bg-main px-4 py-2 rounded-xl'>Edit Order</button> */}
         <Link to={`/order/detail/${order?._id}`} className='bg-main px-4 py-2 rounded-xl'>Download PDF</Link>
      </div>
      {loading ? <Loading /> : 
         <div className='boltables' >
            <div  className='text-white m-auto'>
               <div className='py-3 mt-3 pt-4'>
                  <ul className='grid grid-cols-4 gap-2'>
                     <li className=''><strong className='text-gray-400'>Customer Order # :</strong> <p>{order?.customer_order_no}</p> </li>
                     <li className=''><strong className='text-gray-400'>Order Created Date :</strong> <p><TimeFormat date={order?.createdAt} /></p> </li>
                     <li className=''><strong className='text-gray-400'>Order Status :</strong> <p><Badge title={true} status={order?.order_status} /></p> </li>
                     <li className=''><strong className='text-gray-400'>Total Distance :</strong> <p>{order.totalDistance} Miles</p> </li>
                  </ul>
               </div>

               <div className='orderFill py-3 mt-3 pt-4 grid grid-cols-3 gap-4'>
                  <div className='customerDetails bg-dark1 border border-gray-700 p-4 rounded-xl'>
                     <p className='font-bold text-gray-400 text-xl mb-2'>Customer Details</p>
                     <ul className=''>
                        <li className=' flex'><strong className=' me-2 !text-gray-400'>Customer Name:</strong> <p>Cross Miles Carrier</p> </li>
                        <li className=' flex'><strong className=' me-2 !text-gray-400'>Customer Phone :</strong> <p>+45 454524545</p> </li>
                        <li className=' flex'><strong className=' me-2 !text-gray-400'>Customer Email :</strong> <p>info@cpaitallogistics.com</p> </li>
                        <li className=' flex items-center'><strong className=' !text-gray-400'>Payment Status:</strong> <p className='ps-2'><Badge title={true} status={order?.payment_status} /></p> </li>
                     </ul>
                  </div>
                  <div className='customerDetails bg-dark1 border border-gray-700 p-4 rounded-xl'>
                     <p className='font-bold text-gray-400 text-xl mb-2'>Carrier Details</p>
                     <ul className=''>
                        <li className=' flex'><strong className=' me-2 !text-gray-400'>Carrier Name:</strong> <p>{order?.carrier?.name}</p> </li>
                        <li className=' flex'> <p> <strong className=' me-2 !text-gray-400'>Carrier Phone :</strong> {order?.carrier?.phone}, {order?.carrier?.secondary_phone}</p> </li>
                        <li className=' flex'> <p className='break-all'><strong className=' me-2 !text-gray-400 '>Carrier Email :</strong> {order?.carrier?.email}, {order?.carrier?.secondary_email}</p> </li>
                        <li className=' flex items-center'><strong className=' !text-gray-400'>Payment Status:</strong> <p className='ps-2'><Badge title={true} status={order?.carrier_payment_status} /></p> </li>
                    </ul>
                  </div>
                  <div className='customerDetails bg-dark1 border border-gray-700 p-4 rounded-xl'>
                     <p className='font-bold text-gray-400 text-xl mb-2'>Staff Details</p>
                     <ul className=''>
                        <li className=' flex items-center'><strong className=' !text-gray-400'>Staff Name:</strong> <p className='ps-2'>{order?.created_by?.name} ({order?.created_by?.email})</p> </li>
                        <li className=' flex items-center capitalize'><strong className=' me-1 !text-gray-400'>Email: </strong> <p>{order?.created_by?.email}</p> </li>
                        <li className=' flex items-center capitalize'><strong className=' me-1 !text-gray-400'>Phone: </strong> <p>{order?.created_by?.phone}</p> </li>
                        <li className=' flex items-center capitalize'> <p> <strong className=' me-1 !text-gray-400'>Address : </strong> {order?.created_by?.address}</p> </li>
                     </ul>
                  </div>
               </div>

               {order && order.shipping_details && order.shipping_details.map((s, index) => {
                  return <>
                     <div className='orderFill bg-dark1 p-4 rounded-xl border border-gray-700 mt-4'>
                        <ul className='grid grid-cols-6 gap-2'>
                           <li className=''><strong className='text-gray-400'>Shipment No.:</strong> <p>#{index+1}</p> </li>
                           <li className='capitalize '><strong className='text-gray-400'>Commudity :</strong> <p>{s?.community}</p> </li>
                           <li className='capitalize '><strong className='text-gray-400'>Equipments :</strong> <p>{s?.equipment?.value}</p> </li>
                           <li className=''><strong className='text-gray-400'>Weight :</strong> <p>{s?.weight || 'N/A'} {s?.weight_unit || ''}</p> </li>
                        </ul>

                        <div className='block'>
                           <div>
                              <p className='font-bold text-gray-400 pt-4 mb-2 text-xl'>Shipment Pickup Details</p>
                              <ul className='grid grid-cols-4 gap-4'>
                                 <li className='flex pb-[7px]'> <p ><strong className='pe-2' >Pickup Location :</strong>{s?.pickupLocation}</p> </li>
                                 <li className='flex pb-[7px]'><strong className=' '>Pickup Reference No. :</strong> <p className='ps-2'>{s?.pickupReferenceNo}</p> </li>
                                 <li className='flex pb-[7px]'><strong className=' '>Pickup Appointement : </strong> <p className='ps-2'>{s?.pickupAppointment ? "Yes" : "No"}</p> </li>
                                 <li className='flex pb-[7px]'><strong className=' '>Pickup Date :</strong> 
                                 <p className='ps-2' ><TimeFormat time={false} date={s?.pickupDate} /></p> </li>
                              </ul>
                           </div>
                           <div>
                              <p className='font-bold text-gray-400 pt-4 mb-2 text-xl'>Shipment Delivery Details</p>
                              <ul className='grid grid-cols-4 gap-4'>
                                 <li className='flex pb-[7px]'> <p  ><strong className='pe-2'>Delivery Location :</strong>{s?.deliveryLocation}</p> </li>
                                 <li className='flex pb-[7px]'><strong className=' '>Delivery Reference No. :</strong> <p className='ps-2' >{s?.deliveryReferenceNo}</p> </li>
                                 <li className='flex pb-[7px]'><strong className=' '>Delivery Appointement : </strong> <p className='ps-2' >{s?.deliveryAppointment?.value ? "Yes": "No"}</p> </li>
                                 <li className='flex pb-[7px]'><strong className=' '>Delivery Date :</strong> 
                                 <p className='ps-2'><TimeFormat time={false} date={s?.deliveryDate} /></p> </li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </>
               })}

               {order && order.revenue_items &&
                  <div id='revanue' className='orderFill py-3 mt-3 pt-4'>
                     <p className='font-bold  text-xl mb-2'>Revenue Items</p>
                     {order && order.revenue_items && order.revenue_items.map((r, index) => {
                        return <>
                           <ul className='flex justify-between mb-4  '>
                              <li className='flex items-center w-[32%]'><strong>Revenue Item:</strong> <p className='ps-2'>{r.revenue_item}</p> </li>
                              <li className='flex items-center w-[32%]'><strong>Rate method </strong  > <p className='capitalize ps-2'>{r.rate_method}</p> </li>
                              <li className='flex items-center w-[32%]'><strong>Rate </strong> <p className='ps-2'><Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} /></p> </li>
                           </ul>
                        </>
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
