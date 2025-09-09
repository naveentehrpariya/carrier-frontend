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

export default function OrderPDF() {
   
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors, company} = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const pdfRef = useRef();
   const todaydate = new Date(); 

   const downloadPDF = async () => {
   setDownloadingPdf(true);
   window.scrollTo(0, 0);
   const element = pdfRef.current;
   const headerElement = document.getElementById("pdf-header-html");

   if (!element || !headerElement) {
      console.error("Missing content or header element.");
      setDownloadingPdf(false);
      return;
   }

   // Render header to canvas with maximum quality
   const headerCanvas = await html2canvas(headerElement, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      pixelRatio: window.devicePixelRatio || 1,
      dpi: 300,
      letterRendering: true,
   });
   // Optimize header image with better compression
   const headerImgData = headerCanvas.toDataURL("image/jpeg", 0.85);
   const headerHeight = ((headerCanvas.height * 210) / headerCanvas.width)-5; // A4 width scaling (210mm)

   const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
      precision: 2,
      userUnit: 1.0,
   });

   doc.html(element, {
      callback: function (doc) {
         const totalPages = doc.internal.getNumberOfPages();
         const watermarkImg = "/transparent-logo.png";
         for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            // doc.addImage(headerImgData, "PNG", 0, 0, 210, headerHeight);
            doc.addImage(headerImgData, "JPEG", 12.5, 0, 195, headerHeight, '', 'MEDIUM'); // x = 12.5mm, width = 185mm to match content
            doc.addImage(watermarkImg, "PNG", 50, 100, 100, 38, '', 'FAST');
            // doc.addImage(watermarkImg, "PNG", 50, 180, 100, 38, '', 'FAST');
         }
         doc.save(`Order_CMC${order?.serial_no || ''}_Rate_Confirmation.pdf`);
         setDownloadingPdf(false);
      },
      x: 12.5,
      y: 0,
      html2canvas: {
         scale: 0.235,
         useCORS: true,
         allowTaint: true,
         backgroundColor: null,
         logging: false,
         imageTimeout: 15000,
         removeContainer: true,
         pixelRatio: 1,
         foreignObjectRendering: false,
         onclone: function(clonedDoc) {
            // Optimize fonts and elements for smaller size
            clonedDoc.querySelectorAll('*').forEach(el => {
               const style = el.style;
               if (style.fontWeight === 'bold' || style.fontWeight === '700' || style.fontWeight === '900') {
                  style.fontWeight = '600'; // Lighter bold for smaller file
               }
            });
         }
      },
      autoPaging: 'text',
      width: 185,
      windowWidth: 185,
      margin: [headerHeight, 0, 20, 0],
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
      {loading ? <Loading /> : 
         <div className='bg-white p-[30px]'>
            <div className=' max-w-[794px] mx-auto flex justify-between items-center mb-6'>
               <h1 className='text-xl font-bold text-black mb-6 mt-4'>Customer Order #{order?.serial_no}</h1>
               <div className='flex items-center'>
                  <button  button className='bg-main px-4 py-2 rounded-xl text-normal test' onClick={downloadPDF} >{downloadingPdf ? "Downloading..." : "Download PDF"}</button>
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

            <div ref={pdfRef} 
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
               
               {/* Hidden HTML header for PDF, off-screen */}
               <div id="pdf-header-html" 
                  style={{
                     position: "absolute",
                     top: "-9999px",
                     left: "-9999px",
                     width: "794px", // match PDF content width
                     padding: "10px",
                     fontSize: "12px",
                     boxSizing: "border-box",
                     backgroundColor: "white",
                  }}>
                  <div className="flex justify-between items-start border-b pb-4 mb-4">
                     <div>
                        <div className="font-semibold text-3xl text-start font-bold uppercase">Rate Confirmation</div>
                        <div className="font-bold text-xl mt-3">Cross Miles Carrier</div>
                        <div className='mt-1 text-[18px]'>{company?.address} </div>
                     </div>
                     <div className="text-right pe-6 ">
                        <Logotext black={true} />
                        <div className="text-gray-700 text-lg text-end">PRO # CMC{order?.serial_no}</div>
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
               
               {/* Employee Information Section */}
               {order?.created_by && (
                  <div className="border-b pb-4 mb-4">
                     <h3 className="text-blue-700 font-bold text-lg mb-2">PROCESSED BY</h3>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p><strong>Employee Name:</strong> 
                              {order?.created_by?.name ? 
                                 <Link to={`/employee/detail/${order.created_by._id}`} className='text-blue-600 hover:text-blue-700 font-semibold ml-1'>
                                    {order.created_by.name}
                                 </Link>
                                 : 'N/A'
                              }
                           </p>
                           <p><strong>Employee ID:</strong> {order?.created_by?.corporateID || 'N/A'}</p>
                        </div>
                        <div>
                           <p><strong>Email:</strong> {order?.created_by?.email}</p>
                           <p><strong>Phone:</strong> {order?.created_by?.phone || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               )}

               <div className='relative'>
                  {order && order.shipping_details && order.shipping_details.map((s, index) => {
                     return <>
                           <div className="grid grid-cols-2 gap-2 mb-4">
                              <p className='flex items-center'><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                              <p className='flex items-center'><strong>Commodity : </strong> {s?.commodity?.value || s?.commodity}</p>
                              {s?.reference && (
                                 <p className='flex items-center'><strong>Commodity Reference : </strong> {s.reference}</p>
                              )}
                              <p className='flex items-center'><strong>Total Distance : </strong> <DistanceInMiles d={order.totalDistance} /></p>
                              <p className='flex items-center'><strong>Equipments : </strong> {s?.equipment?.value}</p>
                              <p className='flex items-center'><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
                           </div>

                           <div className="mb-6">
                              <h3 className="font-semibold mb-2 mt-4 text-lg">Charges</h3>
                              <table cellPadding={8} align='center' className="w-full border text-normal table-collapse ">
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
                                          <td className='border text-left text-[15px] max-w-[200px]'>{r?.note}</td>
                                          <td className='border text-left'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</td>
                                          <td className='border text-left'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                       </tr>
                                    })}
                                    <tr>
                                       <td colSpan={2} align='left' className='border' ><strong style={{ color: "#111" }}></strong></td>
                                       <td  align='left' className='border bg-gray-100' ><strong style={{ color: "#111" }}>Total</strong></td>
                                       <td   align='left' className='border bg-gray-100'  style={{ fontWeight: 700, color: "#111" }}>
                                          <Currency amount={order.carrier_revenue_items.reduce((acc, item) => acc + (item.rate * item.quantity), 0)} currency={order?.revenue_currency || 'cad'} />
                                       </td>
                                    </tr>
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
                                                <p><TimeFormat time={false} date={l?.date} /> {l?.appointment ?  <b>(Appointment : {l?.appointment})</b>: ''} </p>
                                                <p>Ref #: {l?.referenceNo}</p>
                                             </div>
                                          </>
                                       </>
                                    } else {
                                       stopCount = stopCount+1;
                                       return <div className="mb-4 bg-blue-100 p-3 border rounded-md">
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
                  <div className="font-semibold mb-2">Carrier Signature:</div>
                  <div className="border-b-2 border-black w-64 h-12 mb-2"></div>
                  <div className="text-sm text-gray-600">Sign here</div>
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
