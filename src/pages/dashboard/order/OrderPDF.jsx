import   { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams, Link } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import { jsPDF } from "jspdf";
import Loading from '../../common/Loading';
import DistanceInMiles from '../../common/DistanceInMiles';
import html2canvas from "html2canvas";
import { PDFDocument, PDFName } from 'pdf-lib';

export default function OrderPDF() {
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors, company} = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const [pdfProgress, setPdfProgress] = useState('');
   const pdfRef = useRef();
   const todaydate = new Date();

   const downloadPDF = async () => {
      setDownloadingPdf(true);
      setPdfProgress('Preparing PDF...');
      window.scrollTo(0, 0);

      const element = pdfRef.current;
      if (!element) {
         setDownloadingPdf(false);
         setPdfProgress('');
         return;
      }

      try {
         setPdfProgress('Generating PDF...');
         
         // Convert absolute/relative image paths to full URLs if needed
         const clone = element.cloneNode(true);
         const imgs = clone.querySelectorAll('img');
         imgs.forEach(img => {
            if (img.src.startsWith('/')) {
               img.src = window.location.origin + img.getAttribute('src');
            }
         });

         const htmlContent = clone.outerHTML;

         const res = await Api.post('/order/generate-pdf', {
            html: htmlContent,
            filename: `CMC${order?.serial_no || ''}_RateConfirmation.pdf`
         }, { responseType: 'blob' });

         const blob = new Blob([res.data], { type: 'application/pdf' });
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `CMC${order?.serial_no || ''}_RateConfirmation.pdf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);
         
         setPdfProgress('PDF downloaded successfully!');
         setTimeout(() => setPdfProgress(''), 3000);
      } catch (error) {
         console.error('PDF generation failed:', error);
         setPdfProgress('PDF generation failed');
         setTimeout(() => setPdfProgress(''), 3000);
      } finally {
         setDownloadingPdf(false);
      }
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
      {loading ? <Loading /> : 
         <div className='bg-white p-[30px]'>
            <div className=' max-w-[794px] mx-auto flex justify-between items-center mb-6'>
               <h1 className='text-xl font-bold text-black mb-6 mt-4'>Customer Order #{order?.serial_no}</h1>
               <div className='text-right'>
                  <button className='bg-main px-4 py-2 rounded-xl text-normal' onClick={downloadPDF} disabled={downloadingPdf}>
                     {downloadingPdf ? "Generating..." : "Download PDF"}
                  </button>
                  {pdfProgress && (
                     <div className='text-xs text-blue-600 mt-1 max-w-[200px]'>
                        {pdfProgress}
                     </div>
                  )}
               </div>
            </div>
            <div className="relative max-w-[794px] mx-auto p-[40px] bg-white text-sm text-black shadow-md font-sans">
               {/* Header start */}
               <div className='relative z-1 '> 
                  <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <div>
                        <div className="font-semibold text-3xl text-start font-bold uppercase">Rate Confirmation</div>
                        <div className="font-bold text-lg">Cross Miles Carrier</div>
                        <div>{company?.address}</div>
                     </div>
                     <div className="text-right pe-6 ">
                        <Logotext black={true} />
                        <div className="text-gray-700 text-lg text-end">PRO # CMC{order?.serial_no}</div>
                        <div className="text-normal text-end"><TimeFormat date={todaydate} /></div>
                     </div>
               </div>
            </div>
            {/* Header end */}

            <div id="pdf-root" ref={pdfRef} 
            style={{
                     width: '794px',
                     minWidth: '794px',
                     maxWidth: '794px',
                     background: '#fff',
                     color: '#222',
                     fontFamily: 'sans-serif',
                     padding: '10px 10px 10px 10px'
                  }}
                  >
               
               <div id="pdf-header-html" 
                  style={{
                     width: "100%", // match PDF content width
                     padding: "10px 0",
                     fontSize: "12px",
                     boxSizing: "border-box",
                     backgroundColor: "white",
                  }}>
                  <div className="flex justify-between items-start border-b pb-4 mb-4">
                     <div style={{ flex: 1 }}>
                        <div className="font-semibold text-3xl text-start font-bold uppercase">Rate Confirmation</div>
                        <div className="font-bold text-xl mt-3">Cross Miles Carrier</div>
                        <div className='mt-1 text-[18px]'>{company?.address} </div>
                     </div>
                     <div className="text-right pe-6" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ maxWidth: '200px', display: 'flex', justifyContent: 'flex-end' }}>
                           <Logotext black={true} />
                        </div>
                        <div className="text-gray-700 text-lg text-end mt-2">PRO # CMC{order?.serial_no}</div>
                        <div className="text-normal text-end"><TimeFormat date={todaydate} /></div>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-8 border-b pb-4 mb-4">
                  <div>
                     <h3 className="text-blue-700 font-bold text-lg">FROM</h3>
                     <p>{company?.name}</p>
                     <p className='block'>{company?.email}</p>
                     <p>{company?.phone}</p>
                     <p>{company?.address}</p>
                  </div>

                  <div>
                     <h3 className="text-blue-700 font-bold text-lg">CARRIER</h3>
                     <p className='uppercase'>{order?.carrier?.name}(MC{order?.carrier?.mc_code})</p>
                     <p>{order?.carrier?.phone}{order?.carrier?.secondary_phone ? `, ${order?.carrier?.secondary_phone}` :''}</p>
                     <p>{order?.carrier?.email.trim()}</p>
                     <p>{order?.carrier?.location}</p>
                  </div>
               </div>
               
               

               <div className='relative mt-6'>
                  {order && order.shipping_details && order.shipping_details.map((s, index) => {
                     return <>
                           <div style={{flexWrap:"wrap"}} className="flex gap-5 mb-4 pb-6 w-full">
                              <p style={{display:"flex",}} className='capitalize '><p style={{ fontWeight: 700, color: "#111" }} >Order No : </p> #CMC{order?.serial_no ||''}</p>
                              {order?.order_type === 'regular' && order?.customer_order_no ? (
                                 <p style={{display:"flex"}} className='capitalize '><p style={{ fontWeight: 700, color: "#111" }} >Customer Order No : </p> {order.customer_order_no}</p>
                              ) : null}
                              <p style={{display:"flex"}} className=' '><p style={{ fontWeight: 700, color: "#111" }} >Commodity : </p> {s?.commodity?.value || s?.commodity}</p>
                              {s?.reference && (
                                 <p style={{display:"flex"}} className=''><p style={{ fontWeight: 700, color: "#111" }} >Commodity Reference : </p> {s.reference}</p>
                              )}
                              <p style={{display:"flex"}} className=' '><p style={{ fontWeight: 700, color: "#111" }} >Total Distance : </p> <DistanceInMiles d={order.totalDistance} /></p>
                              <p style={{display:"flex"}} className=' '><p style={{ fontWeight: 700, color: "#111" }} >Equipments : </p> {s?.equipment?.value}</p>
                              <p style={{display:"flex"}} className=' '><p style={{ fontWeight: 700, color: "#111" }} >Weight : </p> {s?.weight ||''}{s?.weight_unit ||''}</p>
                           </div>

                           <div className="mb-6">
                              <h3 style={{fontSize:"20px", fontWeight: 700, color: "#111"}}  >Charges</h3>
                              <table cellPadding={8} align='center' className="mt-2 w-full border text-normal table-collapse ">
                                 <thead className="bg-gray-100">
                                    <tr>
                                       <th className="font-bold border text-left">Charge Type</th>
                                       <th className="font-bold border text-left">Comment</th>
                                       <th className="font-bold border text-left">Rate</th>
                                       <th className="font-bold border text-left">Total</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {order && order.carrier_revenue_items && order.carrier_revenue_items.map((r, index) => {
                                       return <tr>
                                          <td className='border'>{r?.revenue_item}</td>
                                          <td className='border text-left text-[15px] max-w-[200px]'>{r?.note}</td>
                                          <td className='border text-left'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</td>
                                          <td className='border text-left'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                       </tr>
                                    })}
                                    <tr>
                                       <td   colSpan={3}  align='center' className='border bg-gray-100' ><strong style={{ color: "#111" }}>Total</strong></td>
                                       <td   align='left' className='border bg-gray-100'  style={{ fontWeight: 700, color: "#111" }}>
                                          <Currency amount={order.carrier_revenue_items.reduce((acc, item) => acc + (item.rate * item.quantity), 0)} currency={order?.revenue_currency || 'cad'} />
                                       </td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>

                           {order?.created_by && (
                              <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "2rem", marginBottom: "1rem" }}  >
                                 <h3 className="text-blue-700 font-bold text-lg mb-2">PROCESSED BY</h3>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <p style={{display:"flex"}} className='capitalize pb-3'><p style={{ fontWeight: 700, color: "#111" }} >Employee Name: </p> {order?.created_by?.name ? order.created_by.name: 'N/A' } </p>
                                       <p style={{display:"flex"}} className='pb-3'><p style={{ fontWeight: 700, color: "#111" }} >Employee ID:</p> {order?.created_by?.corporateID || 'N/A'}</p>
                                    </div>
                                    <div className='ps-[100px]'>
                                       <p style={{display:"flex"}} className='pb-3'><p style={{ fontWeight: 700, color: "#111" }} >Email:</p> {order?.created_by?.email}</p>
                                       <p style={{display:"flex"}} className='pb-3'><p style={{ fontWeight: 700, color: "#111" }} >Phone:</p> {order?.created_by?.phone || 'N/A'}</p>
                                    </div>
                                 </div>
                              </div>
                           )}
                


                           <div className="mb-6">
                              {s && s.locations && (() => {
                                 let pickupCount = 0;
                                 let stopCount = 0;
                                 return s && s.locations && s.locations.map((l, index) => {
                                    if(l.type === 'pickup'){
                                       pickupCount = pickupCount+1;
                                       return <>
                                          <>
                                             <div className="mb-4" style={{ background: "#e1eee8ff", padding: "1rem", borderRadius: "7px", marginBottom: '1rem', pageBreakInside: "avoid", breakInside: "avoid" }}>
                                                <h4 className="text-blue-700 font-bold">PICK {pickupCount}</h4>
                                                <p>{l?.location}</p>
                                                <p><TimeFormat time={false} date={l?.date} /> {l?.appointment ?  <b>(Appointment : {l?.appointment})</b>: ''} </p>
                                                <p>Ref #: {l?.referenceNo}</p>
                                             </div>
                                          </>
                                       </>
                                    } else {
                                       stopCount = stopCount+1;
                                       return <div className="mb-4 bg-blue-100 p-3 border rounded-md" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                                       <h4 className="text-red-700 font-bold">STOP {stopCount}</h4>
                                       <p>{l?.location}</p>
                                       <p><TimeFormat time={false} date={l?.date} /> {l?.appointment ?  <b>(Appointment : {l?.appointment})</b>: ''} </p>
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
               <div className=" leading-snug border-t pt-4">
                  {(() => {
                     const defaultTerms = `Carrier is responsible to confirm the actual weight and count received from the shipper before transit.
                           Additional fees such as loading/unloading, pallet exchange, etc., are included in the agreed rate.
                           POD must be submitted within 5 days of delivery.
                           Freight charges include $100 for MacroPoint tracking. Non-compliance may lead to deduction.
                           Cross-border shipments require custom stamps or deductions may apply.`;
                                                
                     const termsToDisplay = company?.rate_confirmation_terms || defaultTerms;
                     
                     return termsToDisplay.split('\n').map((line, index) => (
                        <p key={index} className={index === 0 ? '' : 'mt-1'}>
                           {line}
                        </p>
                     ));
                  })()}
               </div>
               <div className="flex justify-between items-center mt-6">
               <div>
                  <div className="font-semibold mb-2 pb-2">Carrier Signature:</div>
                  <div className="border-b-2 border-black w-64 h-12 mb-2"></div>
                  <div className="text-sm text-gray-600 pb-3">Sign here</div>
               </div>
               <div className="text-right">
                  <div>Date: {(todaydate.getMonth()+1) > 9 ? (todaydate.getMonth()+1) : '0'+(todaydate.getMonth()+1)} / {todaydate.getDate()} /  {todaydate.getFullYear()}  {todaydate.getHours()}:{todaydate.getMinutes().toString().padStart(2,'0')} {todaydate.getHours() >= 12 ? 'PM' : 'AM'}</div>
                  <div className="text-xs mt-1">PRO# CMC{order?.serial_no} must appear on all invoices</div>
               </div>
               </div>
            </div>
            </div>
         </div>
      }
   </AuthLayout>
}
