import React, { useContext, useEffect, useRef, useState } from 'react'
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import Badge from '../../common/Badge';
import Currency from '../../common/Currency';
import UpdatePaymentStatus from './UpdatePaymentStatus';
import UpdateOrderStatus from './UpdateOrderStatus';
import Loading from '../../common/Loading';
import Dropdown from '../../common/Dropdown';
import { Link } from 'react-router-dom';
import OrderView from '../order/OrderView';
import { FaLockOpen } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { UserContext } from '../../../context/AuthProvider';
import LockOrder from '../order/LockOrder';
import Nocontent from '../../common/NoContent';
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { FiSearch } from "react-icons/fi";
import { LuMapPin, LuPackageCheck } from "react-icons/lu";
import DistanceInMiles from '../../common/DistanceInMiles';
import { getOrderNumber } from '../../../utils/orderPrefix';

const ORDER_TYPE_META = {
   outsourcing: {
      label: 'Outsourcing',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      accent: '#818cf8',
   },
   owner: {
      label: 'Owner Operated',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      accent: '#fb923c',
   },
   regular: {
      label: 'Regular',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      accent: '#34d399',
   },
};

const getOrderTypeMeta = (order) => {
   if (order?.order_type === 'outsourcing') return ORDER_TYPE_META.outsourcing;
   if (order?.isOwnerOperatedTruck) return ORDER_TYPE_META.owner;
   return ORDER_TYPE_META.regular;
};

const getRoutePoints = (order) => {
   const shipments = order?.shipping_details || [];
   let firstPickup = null;
   let lastDelivery = null;
   for (const s of shipments) {
      for (const loc of (s.locations || [])) {
         if (!firstPickup && loc.type === 'pickup') firstPickup = loc.location;
         if (loc.type === 'delivery') lastDelivery = loc.location;
      }
   }
   return { firstPickup, lastDelivery };
};

export default function AccountOrders() {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors, user, company} = useContext(UserContext);

   const fetchLists = (search) => {
      setLoading(true);
      const resp = Api.get(`/account/order/listings?${search ?`search=${search}` : ''}`);
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

   const debounceRef = useRef(null);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value && value.length;
      if (wordCount > 1) {
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };

  return (
      <AuthLayout>
         <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div>
               <h2 className='text-white text-2xl font-semibold tracking-tight'>Account Orders</h2>
               <p className='text-gray-500 text-sm mt-1'>Payments, commissions and profit across every order.</p>
            </div>
            <div className='relative w-full md:w-[320px]'>
               <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
               <input
                  ref={debounceRef}
                  onChange={(e)=>{handleInputChange(e)}}
                  type='search'
                  placeholder='Search by order no'
                  className='text-white w-full bg-dark1 border border-gray-700 rounded-xl ps-11 pe-4 py-[11px] focus:border-gray-500 focus:outline-0 focus:ring-2 focus:ring-gray-700/50 transition'
               />
            </div>
         </div>

         {/* Type legend */}
         {!loading && lists && lists.length > 0 ? (
            <div className='flex items-center gap-2 flex-wrap mt-5'>
               {Object.values(ORDER_TYPE_META).map((t) => (
                  <span key={t.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${t.badge}`}>
                     <span className='w-1.5 h-1.5 rounded-full' style={{ background: t.accent }} />
                     {t.label}
                  </span>
               ))}
            </div>
         ) : null}

         {loading ? <Loading />
         :
         <>
            {lists && lists.length > 0 ? (
               <div className='space-y-7 mt-9'>
                  {lists.map((c, index) => {
                     const typeMeta = getOrderTypeMeta(c);
                     const isRegular = c?.order_type === 'regular';
                     const { firstPickup, lastDelivery } = getRoutePoints(c);
                     const hasRoute = firstPickup || lastDelivery;
                     const hasDistance = c?.totalDistance > 0;
                     return (
                        <div
                           key={`account-order-${c?._id || index}`}
                           className='relative bg-dark4 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 hover:ring-1 hover:ring-gray-700/50 transition shadow-[0_8px_24px_rgba(0,0,0,0.22)]'
                           style={{ borderLeft: `3px solid ${typeMeta.accent}` }}
                        >
                           {/* Row 1 — header strip */}
                           <div className='flex items-start justify-between gap-3 px-4 md:px-5 py-3 border-b border-gray-800/70 bg-gray-900/25'>
                              <div className='flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0'>
                                 <Link to={`/view/order/${c._id}`} className='text-main uppercase text-[15px] inline-flex items-center gap-2 font-semibold min-w-0'>
                                    {c.lock ? <FaLock className='text-red-600 shrink-0' size={14} /> : <FaLockOpen className='text-gray-400 shrink-0' size={14} />}
                                    <span className='truncate'>{getOrderNumber(c, user, company, null)}</span>
                                 </Link>
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full border text-[10px] font-semibold uppercase tracking-wide ${typeMeta.badge}`}>
                                    <span className='w-1.5 h-1.5 rounded-full' style={{ background: typeMeta.accent }} />
                                    {typeMeta.label}
                                 </span>
                                 <Badge classes={'p-0'} status={c.order_status} />
                                 <div className='text-[12px] text-gray-500 flex items-center gap-x-3 gap-y-1 flex-wrap w-full sm:w-auto'>
                                    <TimeFormat date={c.createdAt || "--"} />
                                    <span className='text-gray-600'>Docs: {c?.documents_count ?? 0}</span>
                                    <span className='text-gray-600'>Trips: <span className='text-gray-300 font-medium'>{c?.trips_count ?? 0}</span></span>
                                    {hasDistance && (
                                       <span className='text-gray-400 font-medium'><DistanceInMiles d={c?.totalDistance} /></span>
                                    )}
                                    {c?.customer_order_no && (
                                       <span className='text-gray-400'>Cust#: <span className='text-blue-400 font-medium'>{c.customer_order_no}</span></span>
                                    )}
                                 </div>
                                 {hasRoute && (
                                    <div className='flex items-center gap-1.5 text-[12px] w-full mt-0.5 flex-wrap'>
                                       {firstPickup && (
                                          <span className='inline-flex items-center gap-1 text-emerald-400'>
                                             <LuMapPin size={11} className='shrink-0' />
                                             <span className='truncate max-w-[160px]'>{firstPickup}</span>
                                          </span>
                                       )}
                                       {firstPickup && lastDelivery && <span className='text-gray-600'>→</span>}
                                       {lastDelivery && (
                                          <span className='inline-flex items-center gap-1 text-rose-400'>
                                             <LuPackageCheck size={11} className='shrink-0' />
                                             <span className='truncate max-w-[160px]'>{lastDelivery}</span>
                                          </span>
                                       )}
                                    </div>
                                 )}
                              </div>
                              <div className='flex items-center gap-2 shrink-0'>
                                 <Dropdown>
                                    {(user && user.is_admin === 1) || (user && user?.permissions?.includes('accounting')) ? (
                                       <>
                                          {c?.order_type === 'outsourcing' && (
                                             <li className={`list-none text-sm ${c.lock ? 'disabled' : ''}`}>
                                                <UpdatePaymentStatus
                                                   order={c}
                                                   pstatus={c.carrier_payment_status}
                                                   pmethod={c.carrier_payment_method}
                                                   pnotes={c.carrier_payment_notes}
                                                   text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Update Carrier Payment</>}
                                                   paymentType={2}
                                                   id={c.id}
                                                   type={2}
                                                   fetchLists={fetchLists}
                                                />
                                             </li>
                                          )}
                                          {user && user.is_admin === 1 ? (
                                             <li className='list-none text-sm'>
                                                <LockOrder order={c} fetchLists={fetchLists} />
                                             </li>
                                          ) : ''}
                                          <li className={`list-none text-sm ${c.lock ? 'disabled' : ''}`}>
                                             <UpdatePaymentStatus
                                                order={c}
                                                pstatus={c.customer_payment_status}
                                                pmethod={c.payment_method}
                                                pnotes={c.customer_payment_notes}
                                                text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Update Customer Payment</>}
                                                paymentType={1}
                                                id={c.id}
                                                type={1}
                                                fetchLists={fetchLists}
                                             />
                                          </li>
                                          <li className={`list-none text-sm ${c.lock ? 'disabled' : ''}`}>
                                             <UpdateOrderStatus text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Update Order Status </>} id={c.id} fetchLists={fetchLists} />
                                          </li>
                                       </>
                                    ) : ''}
                                    {(user?.is_admin === 1 || user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin') || user?.permissions?.includes('accounting')) && (
                                       <li className={`list-none text-sm ${c.lock ? "disabled" : ""}`}>
                                          <Link
                                             className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${c.lock ? 'opacity-50 pointer-events-none' : ''}`}
                                             to={`/edit/order/${c._id}`}
                                          >
                                             {c.lock ? <FaLock size={12} className='me-1 inline' /> : ""} Edit Order
                                          </Link>
                                       </li>
                                    )}
                                    {(user?.is_admin === 1 || !(user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin'))) && (
                                       <li className='list-none text-sm'>
                                          <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${c._id}`}>Download Customer Invoice</Link>
                                       </li>
                                    )}
                                    {c?.order_type === 'outsourcing' && (
                                       <li className='list-none text-sm'>
                                          <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Carrier Sheet</Link>
                                       </li>
                                    )}
                                 </Dropdown>
                                 <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>} order={c} fetchLists={fetchLists} />
                              </div>
                           </div>

                           {/* Row 2 — content columns */}
                           <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-5 px-4 md:px-5 py-4'>
                              {/* Customer */}
                              <div className='min-w-0'>
                                 <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Customer</div>
                                 <Link className='text-main capitalize text-sm font-medium' to={`/customer/detail/${c?.customer?._id}`}>
                                    {c?.customer?.name || '--'} ({c?.customer?.customerCode || '--'})
                                 </Link>
                                 <div className='mt-2 flex items-center gap-1 whitespace-nowrap text-sm'>
                                    <span className='text-gray-400'>Payment :</span>
                                    <UpdatePaymentStatus
                                       order={c}
                                       classes={`!p-0 ${c?.lock ? 'disabled-order' : ''}`}
                                       pstatus={c.customer_payment_status}
                                       pmethod={c.payment_method}
                                       pnotes={c.customer_payment_notes}
                                       text={<Badge
                                          tooltipcontent={c?.customer_payment_date && !c?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` : ''}
                                          approved={c?.customer_payment_approved_by_admin}
                                          date={c?.customer_payment_date || ''}
                                          title={false}
                                          status={c?.customer_payment_status}
                                          text={`${c?.customer_payment_status === 'paid' ? `(${c?.customer_payment_method})` : ''}`}
                                       />}
                                       paymentType={1}
                                       id={c.id}
                                       type={1}
                                       fetchLists={fetchLists}
                                    />
                                 </div>
                              </div>

                              {/* Carrier / Fleet */}
                              <div className='min-w-0 text-gray-200 text-sm'>
                                 <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Carrier / Fleet</div>
                                 {isRegular ? (
                                    <>
                                       <div className="capitalize">
                                          <span className='text-gray-400'>Driver:</span>{' '}
                                          {c?.driver?._id ? (
                                             <Link className="text-main" to={`/employee/detail/${c.driver._id}`}>{c?.driver?.name || 'Unassigned'}</Link>
                                          ) : (
                                             <span>{c?.driver?.name || 'Unassigned'}</span>
                                          )}
                                       </div>
                                       <div className="mt-1">
                                          <span className='text-gray-400'>Truck:</span>{' '}
                                          {c?.truck?._id ? (
                                             <Link className="text-main" to={`/truck/detail/${c.truck._id}`}>
                                                {[c?.truck?.make, c?.truck?.model].filter(Boolean).join(' ') || c?.truck?.unitNumber || '—'} {c?.truck?.plateNumber ? `(${c.truck.plateNumber})` : ''}
                                             </Link>
                                          ) : (
                                             <span>{[c?.truck?.make, c?.truck?.model].filter(Boolean).join(' ') || c?.truck?.unitNumber || '—'} {c?.truck?.plateNumber ? `(${c.truck.plateNumber})` : ''}</span>
                                          )}
                                       </div>
                                       <div className="mt-1">
                                          <span className='text-gray-400'>Trailer:</span>{' '}
                                          {c?.trailer?._id ? (
                                             <Link className="text-main" to={`/trailer/detail/${c.trailer._id}`}>
                                                {[c?.trailer?.make, c?.trailer?.model].filter(Boolean).join(' ') || c?.trailer?.type || '—'} {c?.trailer?.unitNumber ? `(${c.trailer.unitNumber})` : ''}
                                             </Link>
                                          ) : (
                                             <span>{[c?.trailer?.make, c?.trailer?.model].filter(Boolean).join(' ') || c?.trailer?.type || '—'} {c?.trailer?.unitNumber ? `(${c.trailer.unitNumber})` : ''}</span>
                                          )}
                                       </div>
                                    </>
                                 ) : (
                                    <>
                                       <Link className='text-main' to={`/carrier/detail/${c?.carrier?._id}`}>
                                          {c.carrier?.name || '--'} (MC{c?.carrier?.mc_code || '--'})
                                       </Link>
                                       <div className='mt-2 flex items-center gap-1 whitespace-nowrap'>
                                          <span className='text-gray-400'>Payment :</span>
                                          <UpdatePaymentStatus
                                             order={c}
                                             classes={`!p-0 ${c?.lock ? 'disabled-order' : ''}`}
                                             pstatus={c.carrier_payment_status}
                                             pmethod={c.carrier_payment_method}
                                             pnotes={c.carrier_payment_notes}
                                             text={<Badge
                                                approved={c?.carrier_payment_approved_by_admin}
                                                tooltipcontent={c?.carrier_payment_date && !c?.carrier_payment_approved_by_admin ? `Carrrier payment status currently in pending and not approve by admin yet.` : ''}
                                                date={c?.carrier_payment_date || ''}
                                                title={false}
                                                status={c?.carrier_payment_status}
                                                text={`${c?.carrier_payment_status === 'paid' ? `(${c?.carrier_payment_method})` : ''}`}
                                             />}
                                             paymentType={2}
                                             id={c.id}
                                             type={2}
                                             fetchLists={fetchLists}
                                          />
                                       </div>
                                    </>
                                 )}
                              </div>

                              {/* Employee */}
                              <div className='min-w-0 text-gray-200 text-sm'>
                                 <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Employee</div>
                                 <div className='capitalize'><span className='text-gray-400'>Added By:</span> {c.created_by?.name || '--'}</div>
                                 <div className='mt-1'>
                                    <span className='text-gray-400'>Commission:</span> <Currency amount={c?.order_type === 'outsourcing' ? c.commission : 0} currency={c.revenue_currency || 'usd'} /> ({c?.order_type === 'outsourcing' ? (c.created_by?.staff_commision || 0) : 0}%)
                                 </div>
                              </div>

                              {/* Amounts */}
                              <div className='min-w-0 text-sm xl:max-w-[260px] xl:ms-auto w-full'>
                                 <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Amounts</div>
                                 <div className='flex justify-between gap-2'>
                                    <span className='text-gray-400'>Amount</span>
                                    <span className='font-semibold text-white tabular-nums'><Currency amount={c?.input_total_amount > 0 ? c.input_total_amount : c.total_amount} currency={c?.input_total_amount > 0 ? (c?.input_currency || c?.revenue_currency || 'usd') : (c?.revenue_currency || 'usd')} /></span>
                                 </div>
                                 {!isRegular ? (
                                    <>
                                       <div className='flex justify-between gap-2 mt-1.5'>
                                          <span className='text-gray-400'>Sell</span>
                                          <span className='text-gray-200 tabular-nums'><Currency amount={c?.input_carrier_amount > 0 ? c.input_carrier_amount : c.carrier_amount} currency={c?.input_carrier_amount > 0 ? (c?.input_currency || c?.revenue_currency || 'usd') : (c?.revenue_currency || 'usd')} /></span>
                                       </div>
                                       <div className='flex justify-between gap-2 mt-1.5 pt-1.5 border-t border-gray-800/60'>
                                          <span className='text-gray-400'>Profit</span>
                                          <span className={`font-semibold tabular-nums ${Number(c.profit) < 0 ? 'text-red-400' : 'text-emerald-400'}`}><Currency amount={c.profit} currency={c.revenue_currency || 'usd'} /></span>
                                       </div>
                                    </>
                                 ) : null}
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               <Nocontent/>
            )}
         </>
         }
      </AuthLayout>
  )
}
