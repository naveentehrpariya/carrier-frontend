import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import Badge from '../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import { jsPDF } from "jspdf";
import Loading from '../../common/Loading';
import DistanceInMiles from '../../common/DistanceInMiles';

export default function OrderPDF() {
   
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors, company, user} = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const pdfRef = useRef();
   const todaydate = new Date(); 
   const downloadPDF = () => {
      setDownloadingPdf(true);
      window.scrollTo(0, 0);
      const element = pdfRef.current;
      if (!element) {
         console.error("PDF content element not found.");
         setDownloadingPdf(false);
         return;
      }
      const doc = new jsPDF({
         unit: 'mm',
         format: 'a4',
         orientation: 'portrait',
      });
      doc.html(element, {
         callback: function (doc) {
            const totalPages = doc.internal.getNumberOfPages();
            const watermarkImg = "/transparent-logo.png";
            for (let i = 1; i <= totalPages; i++) {
               doc.setPage(i);
               doc.addImage(watermarkImg, "PNG", 50, 60, 100, 38);
               doc.addImage(watermarkImg, "PNG", 50, 180, 100, 38);
            }
            doc.save(`CMC${order?.serial_no || ''}-order-carrier-sheet.pdf`);
            setDownloadingPdf(false);
         },
         x: 5,
         y: 5,
         html2canvas: {
            scale: 0.25,
            useCORS: true,
         },
         autoPaging: 'text',
         width: 1800,       
         windowWidth: 794,
      });
   };

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
   }, []);


   return <AuthLayout>
      <div className='flex justify-between items-center'>
         <h1 className='text-xl font-bold text-white mb-6 mt-4'>Customer Order #{order?.customer_order_no}</h1>
         
         <div className='flex items-center'>
           
            <button  button className='bg-main px-4 py-2 rounded-xl text-normal test' onClick={downloadPDF} >{downloadingPdf ? "Downloading..." : "Download PDF"}</button>
         </div>
      </div>

      
      {loading ? <Loading /> : 
         <div className='bg-white p-[30px]'>
            <div ref={pdfRef} className="relative max-w-[794px] mx-auto p-[20px] bg-white text-sm text-black shadow-md font-sans">
               <div className='relative z-1'> 
               <div className="flex justify-between items-start border-b pb-4 mb-4">
               <div>
                  <Logotext black={true} />
                  <div className="font-bold text-lg">Cross Miles Carrier</div>
                  <div>{company?.address}</div>
               </div>
               <div className="text-right pt-6 pe-6 ">
                  <div className="text-gray-700 text-lg text-end">PRO # CMC{order?.serial_no}</div>
                  <div className="font-semibold text-lg text-end">Rate Confirmation</div>
                  <div className="text-normal text-end"><TimeFormat date={todaydate} /> </div>
               </div>
               </div>

               <div className="grid grid-cols-2 gap-8 border-b pb-4 mb-4">
               <div>
                  <h3 className="text-blue-700 font-semibold">FROM</h3>
                  <p>{company?.name}</p>
                  <p className='block'>{company?.email}</p>
                  <p>{company?.phone}</p>
                  <p>{company?.address}</p>
               </div>

               <div>
                  <h3 className="text-blue-700 font-semibold">CARRIER</h3>
                  <p className='uppercase'>{order?.carrier?.name}(MC{order?.carrier?.mc_code})</p>
                  <p>{order?.carrier?.phone}{order?.carrier?.secondary_phone ? `, ${order?.carrier?.secondary_phone}` :''}</p>
                  <p>{order?.carrier?.email.trim()}</p>
                  <p>{order?.carrier?.location}</p>
               </div>
               </div>

               <div className='relative'>
                  {order && order.shipping_details && order.shipping_details.map((s, index) => {
                     return <>
                           <div className="grid grid-cols-3 gap-2 mb-4">
                              <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                              <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                              <p><strong>Total Distance : </strong> <DistanceInMiles d={order.totalDistance} /></p>
                              <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                              <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
                           </div>

                           <div className="mb-6">
                              <h3 className="font-semibold mb-2 text-lg">Charges</h3>
                              <table cellPadding={8} align='center' className="w-full border text-sm table-collapse ">
                                 <thead className="bg-gray-100">
                                    <tr>
                                       <th className="border text-left">Charge Type</th>
                                       <th className="border text-left">Comment</th>
                                       <th className="border text-left">Rate</th>
                                       <th className="border text-left">Total</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {order && order.carrier_revenue_items && order.carrier_revenue_items.map((r, index) => {
                                       return <tr>
                                          <td className='border'>{r?.revenue_item}</td>
                                          <td className='border text-left text-[12px] max-w-[200px]'>{r?.note}</td>
                                          <td className='border text-left'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</td>
                                          <td className='border text-left'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                       </tr>
                                    })}
                                 </tbody>
                              </table>
                           </div>

                           <div className="mb-6">

                           {s && s.locations && (() => {
                              let pickupCount = 0;
                              let stopCount = 0;
                              return s && s.locations && s.locations.map((l, index) => {
                                 if(l.type === 'pickup'){
                                    pickupCount = pickupCount+1;
                                    return <>
                                       <>
                                          <div className="mb-4">
                                             <h4 className="text-blue-700 font-bold">PICK {pickupCount}</h4>
                                             <p>{l?.location}</p>
                                             <p><TimeFormat date={l?.date} /> {l?.appointment ?  <b>(Appointment)</b>: ''} </p>
                                             <p>Ref #: {l?.referenceNo}</p>
                                          </div>
                                       </>
                                    </>
                                 } else {
                                    stopCount = stopCount+1;
                                    return <div className="mb-4 bg-blue-100 p-3 border rounded-md">
                                    <h4 className="text-red-700 font-bold">STOP {stopCount}</h4>
                                    <p>{l?.location}</p>
                                    <p><TimeFormat date={l?.date} /> </p>
                                    <p>Ref #: {l?.referenceNo}</p>
                                 </div>
                                 }
                              })
                           })()}
                           </div>

                           
                     </>
                  })}
               </div>


               {/* Terms & Notes */}
               <div className="text-sm leading-snug border-t pt-4">
                  <p>
                     Carrier is responsible to confirm the actual weight and count received from the shipper before transit.
                  </p>
                  <p className="mt-1">
                     Additional fees such as loading/unloading, pallet exchange, etc., are included in the agreed rate.
                  </p>
                  <p className="mt-1">
                     POD must be submitted within 5 days of delivery.
                  </p>
                  <p className="mt-1">
                     Freight charges include $100 for MacroPoint tracking. Non-compliance may lead to deduction.
                  </p>
                  <p className="mt-1">
                     Cross-border shipments require custom stamps or deductions may apply.
                  </p>
               </div>
               <div className="flex justify-between items-center mt-6">
               <div>
                  {/* <div className="font-semibold">Carrier Signature: -------------- </div> */}
               </div>
               <div className="text-right">
                  <div>Date: {todaydate.getDate()} / {(todaydate.getMonth()+1) > 9 ? (todaydate.getMonth()+1) : '0'+(todaydate.getMonth()+1)} / {todaydate.getFullYear()}</div>
                  <div className="text-xs mt-1">PRO# CMC{order?.serial_no} must appear on all invoices</div>
               </div>
               </div>
            </div>
            </div>
         </div>
      }
   </AuthLayout>
}
