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
import { TbUser, TbBuildingWarehouse, TbRoute, TbReceipt2 } from "react-icons/tb";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { LuMapPin, LuPackage, LuPackageCheck } from "react-icons/lu";
import UpdatePaymentStatus from '../accounts/UpdatePaymentStatus';
import LockOrder from './LockOrder';
import UpdateOrderStatus from '../accounts/UpdateOrderStatus';
import { LuDownload } from "react-icons/lu";
import RemoveOrder from './RemoveOrder';
import { getOrderNumber } from '../../../utils/orderPrefix';

/* ── Small presentational helpers (local to this page) ───────────── */

const SectionCard = ({ title, icon, accent = '#a091ff', children, className = '', right = null }) => (
   <section className={`bg-dark1 border border-white/[0.06] rounded-2xl overflow-hidden ${className}`}>
      <header className='flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]'>
         <div className='flex items-center gap-2.5'>
            <span className='flex items-center justify-center w-7 h-7 rounded-lg' style={{ background: `${accent}1a`, color: accent }}>
               {icon}
            </span>
            <h3 className='text-[12px] font-bold uppercase tracking-[0.14em] text-gray-300'>{title}</h3>
         </div>
         {right}
      </header>
      <div className='p-5'>{children}</div>
   </section>
);

const Field = ({ label, children, className = '' }) => (
   <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <span className='text-[10px] font-semibold uppercase tracking-[0.13em] text-gray-500'>{label}</span>
      <span className='text-[13.5px] text-gray-100 leading-snug break-words'>{children ?? '—'}</span>
   </div>
);

const Stat = ({ label, children, accent = false }) => (
   <div className={`relative flex flex-col gap-1.5 px-4 py-3.5 rounded-xl border transition-colors
      ${accent ? 'border-[#a091ff]/30 bg-[#a091ff]/[0.07]' : 'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]'}`}>
      <span className='text-[10px] font-semibold uppercase tracking-[0.13em] text-gray-500'>{label}</span>
      <span className='text-[15px] font-bold text-white font-mona leading-none'>{children}</span>
   </div>
);

export default function ViewOrder() {

   const [order, setOrder] = useState(null);
   const [paymentLogs, setPaymentLogs] = useState([]);
   const [trips, setTrips] = useState([]);
   const [loading, setLoading] = useState(true);
   const [accessError, setAccessError] = useState(null);
   const {Errors,user, company} = useContext(UserContext);
   const { id } = useParams();

   const fetchOrder = () => {
      setLoading(true);
      setAccessError(null);
      const resp = Api.get(`/order/detail/${id}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status) {
            setOrder(res.data.order);
            setPaymentLogs(res.data.paymentLogs);
            // Fetch trips for this order
            Api.get(`/order/trips/${id}`).then(tripRes => {
               if (tripRes.data.status) setTrips(tripRes.data.trips);
            });
         } else {
            setOrder(null);
            setAccessError(res.data.message || "Order not found.");
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
         setOrder(null);
         if (err?.response?.status === 403) {
            setAccessError(err.response.data?.message || "You don't have permission to view this order.");
         } else {
            Errors(err);
         }
      });
   }

   useEffect(() => {
      fetchOrder();
   },[]);

   const cur = order?.input_currency || order?.revenue_currency || 'usd';
   const isOutsourcing = order?.order_type === 'outsourcing';
   const isRegular = order?.order_type === 'regular';

   // revenue_items rates are stored in base currency; back-convert to input currency for display
   // so line items match the input_* footer totals. Factor = 1 for legacy/same-currency orders.
   const revFactor = (order?.input_total_amount > 0 && order?.total_amount > 0)
      ? Number(order.input_total_amount) / Number(order.total_amount) : 1;
   const carrierFactor = (order?.input_carrier_amount > 0 && order?.carrier_amount > 0)
      ? Number(order.input_carrier_amount) / Number(order.carrier_amount) : 1;

   if (!loading && accessError) {
      return <AuthLayout>
         <div className='flex flex-col items-center justify-center text-center min-h-[60vh]'>
            <FaLock className='text-rose-500 text-4xl mb-4' />
            <h2 className='text-white text-2xl font-bold mb-2 font-mona'>Access denied</h2>
            <p className='text-gray-400 max-w-md mb-6'>{accessError}</p>
            <Link to='/orders' className='bg-main text-black font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity'>Back to Orders</Link>
         </div>
      </AuthLayout>;
   }

   return <AuthLayout>
      {/* ── Top bar: title + actions ─────────────────────────────── */}
      <div className='flex flex-wrap gap-4 justify-between items-start mb-6 mt-2'>
         <div>
            <div className='flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2'>
               <Link to='/orders' className='hover:text-gray-300 transition-colors'>Orders</Link>
               <span className='text-gray-700'>/</span>
               <span className='text-gray-400'>Detail</span>
            </div>
            <div className='flex items-center gap-3 flex-wrap'>
               <h1 className='text-3xl font-bold text-white font-mona flex items-center gap-2.5'>
                  {order?.lock ? <FaLock className='text-red-500 text-xl' /> : <FaLockOpen className='text-gray-500 text-xl' />}
                  Order {getOrderNumber(order, user, company, null)}
               </h1>
               {order && (
                  <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border
                     ${isOutsourcing ? 'text-amber-300 border-amber-400/30 bg-amber-400/10' : 'text-rose-300 border-rose-400/30 bg-rose-400/10'}`}>
                     {order?.order_type}
                  </span>
               )}
               {order && <Badge title={true} status={order?.order_status} />}
            </div>
         </div>

         <div className='flex items-center gap-3'>
            {isOutsourcing && (
              <Link to={`/order/detail/${order?._id}`} className='bg-main text-black font-semibold px-4 py-2.5 rounded-xl flex items-center hover:opacity-90 transition-opacity'> <LuDownload className='me-2' size='18px' /> Carrier Sheet</Link>
            )}
            {isRegular && (
              <Link to={`/order/trip-planning/${order?._id}`} className='bg-rose-500 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors'>
                <FaTruckMoving className='me-2' size='18px' /> Trip Planning
              </Link>
            )}
            {(user?.is_admin === 1 || (!user?.permissions?.includes('regular') && !user?.permissions?.includes('outsourcing') && !user?.permissions?.includes('subadmin'))) && (
              <Link to={`/order/customer/invoice/${order?._id}`} className='bg-main text-black font-semibold px-4 py-2.5 rounded-xl flex items-center hover:opacity-90 transition-opacity'> <LuDownload className='me-2' size='18px' /> Invoice</Link>
            )}
            <Dropdown classes={'relative top-1'} iconsize={'30px '}>
            {(user && user.is_admin === 1) || (user && user?.permissions?.includes('accounting')) ?
               <>
                  {isOutsourcing && (
                    <li className={`list-none text-sm  ${order?.lock ? "disabled" : ""}`}>
                       <UpdatePaymentStatus pstatus={order?.carrier_payment_status} pmethod={order?.carrier_payment_method} pnotes={order?.carrier_payment_notes} text={<>{order?.lock ? <FaLock size={12} className='me-1' /> : ""} Update Carrier Payment</>} paymentType={2} id={order?.id} type={2} fetchLists={fetchOrder} />
                    </li>
                  )}
                  {(user && (user.is_admin === 1 || Number(user.role) === 3 || user?.permissions?.includes('subadmin'))) ?
                     <>
                        <li className='list-none text-sm'>
                           <LockOrder order={order} fetchLists={fetchOrder} />
                        </li>
                        {order?.lock ?
                           <li className={`list-none text-sm  ${order?.lock ? "disabled" : ""}`}>
                              <Link className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order?.lock ? 'opacity-50 pointer-events-none' : ''}`} to={`/edit/order/${order?._id}`}>{order?.lock ? <FaLock size={12} className='me-1 inline' /> : ""} Delete Order</Link>
                           </li>
                           :

                           <li className='list-none text-sm'>
                              <RemoveOrder order={order} fetchLists={fetchOrder} />
                           </li>
                        }
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
            {(user?.is_admin === 1 || user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin') || user?.permissions?.includes('accounting')) && (
              <li className={`list-none text-sm  ${order?.lock ? "disabled" : ""}`}>
                <Link className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order?.lock ? 'opacity-50 pointer-events-none' : ''}`} to={`/edit/order/${order?._id}`}>{order?.lock ? <FaLock size={12} className='me-1 inline' /> : ""} Edit Order</Link>
              </li>
            )}
            {(user?.is_admin === 1 || (!user?.permissions?.includes('regular') && !user?.permissions?.includes('outsourcing') && !user?.permissions?.includes('subadmin'))) && (
              <li className='list-none text-sm'>
                <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${order?._id}`}>Download Customer Invoice</Link>
              </li>
            )}
            {isOutsourcing && (
              <li className='list-none text-sm'>
                 <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${order?._id}`}>Download Carrier Sheet</Link>
              </li>
            )}
            </Dropdown>
            <div className='ms-1'>
               <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>}  order={order} fetchLists={fetchOrder} />
            </div>
         </div>
      </div>

      {loading ? <Loading /> :
         <div className='text-white'>

            {/* ── Stat strip ─────────────────────────────────────── */}
            <div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-6'>
               <Stat label='Order No.'>
                  <span className='flex items-center gap-1.5'>{getOrderNumber(order, user, company, null)}</span>
               </Stat>
               {isRegular && order?.customer_order_no ? (
                  <Stat label='Customer Order No.'>{order.customer_order_no}</Stat>
               ) : null}
               <Stat label='Created'><span className='text-[13px]'><TimeFormat date={order?.createdAt} /></span></Stat>
               <Stat label='Status'><Badge title={true} status={order?.order_status} /></Stat>
               <Stat label='Total Distance'><span className='text-[12.5px] text-gray-200 font-normal font-sans'><DistanceInMiles d={order?.totalDistance || 0} /></span></Stat>
               <Stat label='Total Revenue' accent>
                  <span className='text-[#bcb1ff]'>
                     <Currency amount={order?.input_total_amount > 0 ? order.input_total_amount : (order?.total_amount || 0)} currency={order?.input_total_amount > 0 ? cur : (order?.revenue_currency || 'usd')} />
                  </span>
               </Stat>
            </div>

            {/* ── Main grid: details + map ───────────────────────── */}
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5'>
               <div className='lg:col-span-3 flex flex-col gap-5'>

                  {/* Customer */}
                  <SectionCard title='Customer Details' icon={<TbUser size={16} />} accent='#a091ff'
                     right={<Badge approved={order?.customer_payment_approved_by_admin} date={order?.customer_payment_date || ""} title={true} status={order?.customer_payment_status} text={`${order?.customer_payment_status === 'paid' ? `via ${order?.customer_payment_method}` :''} `} />}>
                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
                        <Field label='Customer Name'>
                           <Link className='text-main hover:underline font-medium' to={`/customer/detail/${order?.customer?._id}`}>{order?.customer?.name || "--"} ({order?.customer?.customerCode || "--"})</Link>
                        </Field>
                        <Field label='Phone'>{[order?.customer?.phone, order?.customer?.secondary_phone].filter(Boolean).join(', ') || '--'}</Field>
                        <Field label='Email' className='sm:col-span-2'>{[order?.customer?.email, order?.customer?.secondary_email].filter(Boolean).join(', ') || '--'}</Field>
                     </div>
                  </SectionCard>

                  {/* Carrier (outsourcing) OR Fleet (regular) */}
                  {isOutsourcing ? (
                     <SectionCard title='Carrier Details' icon={<TbBuildingWarehouse size={16} />} accent='#fbbf24'
                        right={<Badge approved={order?.carrier_payment_approved_by_admin} date={order?.carrier_payment_date || ""} title={true} status={order?.carrier_payment_status} text={`${order?.carrier_payment_status === 'paid' ? `via ${order?.carrier_payment_method}` :''} `} />}>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
                           <Field label='Carrier Name'>
                              <Link className='text-main hover:underline font-medium' to={`/carrier/detail/${order?.carrier?._id}`}>{order?.carrier?.name || "N/A"} (MC{order?.carrier?.mc_code || "N/A"})</Link>
                           </Field>
                           <Field label='Phone'>{order?.carrier?.phone || "N/A"}{order?.carrier?.secondary_phone ? `, ${order?.carrier.secondary_phone}` : ''}</Field>
                           <Field label='Email' className='sm:col-span-2'>{order?.carrier?.email || "N/A"}{order?.carrier?.secondary_email ? `, ${order?.carrier.secondary_email}` : ''}</Field>
                        </div>
                     </SectionCard>
                  ) : (
                     <SectionCard title='Fleet Assignments' icon={<FaTruckMoving size={14} />} accent='#fb7185'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
                           {order?.isOwnerOperatedTruck && (
                              <Field label='Owner Operator'><span className='text-orange-300'>{order?.ownerOperator?.fullName || "N/A"}</span></Field>
                           )}
                           {order?.isOwnerOperatedTruck && (
                              <Field label='Driver Assignment'>{order?.driver_assignment_mode === 'owner_driver' ? 'Owner Operator Driver' : 'Company Driver'}</Field>
                           )}
                           <Field label='Driver'>{order?.drivers && order.drivers.length > 0 ? order.drivers.map(d => d.name).join(', ') : (order?.driver?.name || "N/A")}</Field>
                           <Field label='Truck'>{order?.truck ? `${[order.truck.make, order.truck.model].filter(Boolean).join(' ') || order.truck.unitNumber || '—'} ${order.truck.plateNumber ? `(${order.truck.plateNumber})` : ''}` : "N/A"}</Field>
                           <Field label='Trailer'>{order?.trailer ? `${[order.trailer.make, order.trailer.model].filter(Boolean).join(' ') || order.trailer.type || '—'} ${order.trailer.unitNumber ? `(${order.trailer.unitNumber})` : ''}` : "N/A"}</Field>
                        </div>
                     </SectionCard>
                  )}

                  {/* Staff */}
                  <SectionCard title='Staff Details' icon={<TbUser size={16} />} accent='#34d399'>
                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
                        <Field label='Staff Name'>{order?.created_by?.name}</Field>
                        <Field label='Email'>{order?.created_by?.email}</Field>
                        <Field label='Phone'>{order?.created_by?.phone}</Field>
                        <Field label='Address'><span className='capitalize'>{order?.created_by?.address}</span></Field>
                     </div>
                  </SectionCard>

                  {/* Trip Segments */}
                  {trips && trips.length > 0 && (
                     <SectionCard title='Trip Segments (Split)' icon={<TbRoute size={16} />} accent='#fb7185'>
                        <div className='flex flex-col gap-3'>
                           {trips.map((trip, idx) => (
                              <div key={idx} className='relative rounded-xl border border-white/[0.06] bg-white/[0.015] p-4'>
                                 <div className='flex items-center justify-between mb-3'>
                                    <span className='text-[11px] font-bold uppercase tracking-[0.14em] text-rose-300'>Segment #{trip.trip_no}</span>
                                    {order?.order_type !== 'outsourcing' && (
                                       <span className='text-[13px] font-bold text-green-400 font-mona'>${trip.total_driver_pay?.toFixed(2)}</span>
                                    )}
                                 </div>
                                 <div className='grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3'>
                                    {order?.order_type !== 'outsourcing' && (
                                       <>
                                          <Field label='Drivers'>{trip.drivers && trip.drivers.length > 0 ? trip.drivers.map(d => d.name).join(', ') : (trip.driver?.name || 'Unassigned')}</Field>
                                          <Field label='Truck'>{trip.truck ? `${[trip.truck.make, trip.truck.model].filter(Boolean).join(' ') || trip.truck.unitNumber || '—'} ${trip.truck.plateNumber ? `(${trip.truck.plateNumber})` : ''}` : "N/A"}</Field>
                                          <Field label='Trailer'>{trip.trailer ? `${[trip.trailer.make, trip.trailer.model].filter(Boolean).join(' ') || trip.trailer.type || '—'} ${trip.trailer.unitNumber ? `(${trip.trailer.unitNumber})` : ''}` : "N/A"}</Field>
                                       </>
                                    )}
                                    <Field label='Miles'>{trip.miles}</Field>
                                    <Field label='Distance'>{(trip.total_km || (trip.miles * 1.60934)).toFixed ? (trip.total_km || (trip.miles * 1.60934)).toFixed(2) : (Number(trip.total_km || (trip.miles * 1.60934)).toFixed(2))} km</Field>
                                 </div>
                                 <p className='flex items-center gap-1.5 text-[11px] text-gray-500 mt-3 pt-3 border-t border-white/[0.05]'>
                                    <HiOutlineLocationMarker className='text-gray-600' /> {trip.start_location} <span className='text-gray-700'>→</span> {trip.end_location}
                                 </p>
                              </div>
                           ))}
                        </div>
                     </SectionCard>
                  )}
               </div>

               {/* Map */}
               <div className='lg:col-span-2'>
                  <div className='lg:sticky lg:top-[150px] rounded-2xl overflow-hidden border border-white/[0.06] bg-dark1 h-[420px] lg:h-[calc(100vh-200px)] lg:min-h-[480px]'>
                     <OrderMap order={order} />
                  </div>
               </div>
            </div>

            {/* ── Shipping / Route timeline ──────────────────────── */}
            {order && order.shipping_details && order.shipping_details.map((s, index) => {
               return (
                  <SectionCard key={index} title={`Shipment #${index + 1}`} icon={<LuPackage size={16} />} accent='#a091ff' className='mb-5'>
                     <div className='grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mb-6'>
                        <Field label='Commodity'><span className='capitalize'>{s?.commodity?.value || s?.commodity}</span></Field>
                        {s?.reference && <Field label='Commodity Reference'><span className='capitalize'>{s?.reference}</span></Field>}
                        <Field label='Equipment'><span className='capitalize'>{s?.equipment?.value}</span></Field>
                        <Field label='Weight'>{s?.weight || 'N/A'} {s?.weight_unit || ''}</Field>
                     </div>

                     {/* Route timeline */}
                     <div className='relative'>
                        {s.locations && s.locations.length && s.locations.map((p, i) => {
                           const isPickup = p.type === 'pickup';
                           const isLast = i === s.locations.length - 1;
                           return (
                              <div key={i} className='relative flex gap-4 pb-6 last:pb-0'>
                                 {/* connector line */}
                                 {!isLast && <span className='absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-white/20 to-white/5' />}
                                 {/* node */}
                                 <div className={`relative z-[1] flex items-center justify-center w-10 h-10 min-w-[40px] rounded-full border
                                    ${isPickup ? 'bg-emerald-500/10 border-emerald-400/40 text-emerald-400' : 'bg-rose-500/10 border-rose-400/40 text-rose-400'}`}>
                                    {isPickup ? <LuMapPin size={17} /> : <LuPackageCheck size={17} />}
                                 </div>
                                 {/* card */}
                                 <div className='flex-1 min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4'>
                                    <div className='flex items-center gap-2 mb-3'>
                                       <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-md
                                          ${isPickup ? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'}`}>
                                          {isPickup ? 'Pickup' : 'Delivery'}
                                       </span>
                                       <span className='text-[13.5px] text-white font-medium truncate'>{p?.location}</span>
                                    </div>
                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3'>
                                       <Field label='Reference No.'>{p?.referenceNo || '—'}</Field>
                                       <Field label='Appointment'>{p?.appointment || 'No'}</Field>
                                       <Field label='Date'><TimeFormat time={false} date={p?.date} /></Field>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </SectionCard>
               );
            })}

            {/* ── Revenue items ──────────────────────────────────── */}
            {order && order.revenue_items && order.revenue_items.length > 0 && (
               <SectionCard title='Customer Revenue Items' icon={<TbReceipt2 size={16} />} accent='#a091ff' className='mb-5'>
                  <RevenueTable items={order.revenue_items} cur={cur} order={order} factor={revFactor} />
               </SectionCard>
            )}

            {isOutsourcing && order?.carrier_revenue_items && order?.carrier_revenue_items.length > 0 && (
               <SectionCard title='Carrier Revenue Items' icon={<TbReceipt2 size={16} />} accent='#fbbf24' className='mb-5'>
                  <RevenueTable items={order.carrier_revenue_items} cur={cur} order={order} factor={carrierFactor} />
               </SectionCard>
            )}

            {/* ── Totals footer ──────────────────────────────────── */}
            <div className='rounded-2xl border border-[#a091ff]/20 bg-gradient-to-r from-[#a091ff]/[0.09] via-[#a091ff]/[0.03] to-transparent p-6'>
               <div className='flex flex-wrap items-stretch gap-x-10 gap-y-5'>
                  <TotalItem label='Total' primary>
                     <Currency amount={order?.input_total_amount > 0 ? order.input_total_amount : (order?.total_amount || 0)} currency={order?.input_total_amount > 0 ? cur : (order?.revenue_currency || 'usd')} />
                  </TotalItem>
                  {isOutsourcing && (
                     <TotalItem label='Sell Amount'>
                        <Currency amount={order?.input_carrier_amount > 0 ? order.input_carrier_amount : (order?.carrier_amount || 0)} currency={order?.input_carrier_amount > 0 ? cur : (order?.revenue_currency || 'usd')} />
                     </TotalItem>
                  )}
                  {isRegular && order?.isOwnerOperatedTruck && (
                     <>
                        <TotalItem label='Settle Amount'>
                           <Currency amount={order?.input_settle_amount > 0 ? order.input_settle_amount : (order?.settle_amount || 0)} currency={order?.input_settle_amount > 0 ? cur : (order?.revenue_currency || 'usd')} />
                        </TotalItem>
                        <TotalItem label='Owner Profit'>
                           <Currency amount={order?.owner_profit || 0} currency={order?.revenue_currency || 'usd'} />
                        </TotalItem>
                     </>
                  )}
               </div>
            </div>
         </div>
      }
   </AuthLayout>
}

/* ── Revenue table ───────────────────────────────────────────────── */
const RevenueTable = ({ items, cur, order, factor = 1 }) => (
   <div className='overflow-x-auto -mx-1'>
      <table className='w-full min-w-[560px] border-collapse'>
         <thead>
            <tr className='text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-gray-500'>
               <th className='font-semibold pb-3 pe-4'>Revenue Item</th>
               <th className='font-semibold pb-3 pe-4'>Rate × Qty</th>
               <th className='font-semibold pb-3 pe-4 text-right'>Sub Total</th>
            </tr>
         </thead>
         <tbody>
            {items.map((r, index) => (
               <tr key={index} className='border-t border-white/[0.05] align-top'>
                  <td className='py-3.5 pe-4'>
                     <div className='text-[13.5px] text-gray-100'>{r.revenue_item}</div>
                     {r?.note ? <div className='text-[11.5px] text-gray-500 mt-1'>{r.note}</div> : null}
                  </td>
                  <td className='py-3.5 pe-4 text-[13px] text-gray-300 whitespace-nowrap'>
                     <Currency amount={(r?.rate || 0) * factor} currency={cur} /> <span className='text-gray-600'>×</span> {r.quantity}
                  </td>
                  <td className='py-3.5 pe-1 text-[13.5px] font-semibold text-white text-right whitespace-nowrap font-mona'>
                     <Currency amount={(r?.rate * r.quantity || 0) * factor} currency={cur} />
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
   </div>
);

/* ── Total footer item ───────────────────────────────────────────── */
const TotalItem = ({ label, children, primary = false }) => (
   <div className='flex flex-col gap-1.5'>
      <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400'>{label}</span>
      <span className={`font-mona font-bold leading-none ${primary ? 'text-2xl text-white' : 'text-xl text-gray-200'}`}>{children}</span>
   </div>
);
