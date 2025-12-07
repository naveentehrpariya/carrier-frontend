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
      setPdfProgress('Preparing PDF generation...');
      window.scrollTo(0, 0);
      const element = pdfRef.current;
      const headerElement = document.getElementById("pdf-header-html");
      if (!element || !headerElement) {
         console.error("Missing content or header element.");
         setDownloadingPdf(false);
         setPdfProgress('');
         return;
      }
      try {
         setPdfProgress('Rendering header...');
         // Render header to canvas with balanced compression
         const headerCanvas = await html2canvas(headerElement, {
            scale: 4, // Good scale for crisp but not oversized header
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            pixelRatio: 1.0, // Full pixel ratio for clarity
            quality: 100, // Good quality for clear header
         });
         
         // Better header compression for clarity
         const headerImgData = headerCanvas.toDataURL("image/jpeg", 1); // Good quality
         // Calculate proper header height to maintain aspect ratio
         const headerHeight = Math.min(((headerCanvas.height * 185) / headerCanvas.width), 45); // Proper aspect ratio

         setPdfProgress('Generating PDF with content...');
         const doc = new jsPDF({
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
            precision: 1,
            userUnit: 1.0,
         });

         doc.html(element, {
            callback: async function (doc) {
               try {
                  setPdfProgress('Adding headers to all pages...');
                  const totalPages = doc.internal.getNumberOfPages();
                  
                  // Add header to all pages for consistency
                  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                     doc.setPage(pageNum);
                     doc.addImage(headerImgData, "JPEG", 12.5, 5, 185, Math.min(headerHeight, 40), '', 'FAST'); // Full width header
                     
                     // Add logo image watermark to each page
                     try {
                        // Create watermark from logo element in the header
                        const logoElement = headerElement.querySelector('img, [class*="logo"], .logotext');
                        if (logoElement) {
                           // Render the logo as watermark
                           const logoCanvas = await html2canvas(logoElement, {
                              scale: 2,
                              useCORS: true,
                              allowTaint: true,
                              backgroundColor: null,
                              logging: false
                           });
                           
                           // Create a semi-transparent version for watermark
                           const watermarkCanvas = document.createElement('canvas');
                           const watermarkCtx = watermarkCanvas.getContext('2d');
                           watermarkCanvas.width = logoCanvas.width;
                           watermarkCanvas.height = logoCanvas.height;
                           
                           // Set low opacity for watermark effect
                           watermarkCtx.globalAlpha = 0.15; // Light watermark
                           watermarkCtx.drawImage(logoCanvas, 0, 0);
                           
                           const logoWatermarkData = watermarkCanvas.toDataURL('image/png');
                           
                           // Add logo watermark at multiple positions
                           const logoSize = 60; // Size in mm
                           doc.addImage(logoWatermarkData, 'PNG', 30, 120, logoSize, logoSize * 0.5, '', 'FAST');
                           doc.addImage(logoWatermarkData, 'PNG', 120, 160, logoSize, logoSize * 0.5, '', 'FAST');
                           doc.addImage(logoWatermarkData, 'PNG', 30, 200, logoSize, logoSize * 0.5, '', 'FAST');
                        } else {
                           // Fallback to text watermark if no logo found
                           doc.setTextColor(230, 230, 230);
                           doc.setFontSize(35);
                           doc.text('CROSS MILES CARRIER', 105, 150, {
                              angle: 45,
                              align: 'center'
                           });
                        }
                     } catch (watermarkError) {
                        console.log('Logo watermark failed, using text fallback:', watermarkError);
                        // Text fallback
                        doc.setTextColor(230, 230, 230);
                        doc.setFontSize(35);
                        doc.text('CROSS MILES CARRIER', 105, 150, {
                           angle: 45,
                           align: 'center'
                        });
                     }
                  }
                  
                  setPdfProgress('Compressing PDF...');
                  
                  // Get PDF as ArrayBuffer for post-compression
                  const pdfArrayBuffer = doc.output('arraybuffer');
                  
                  // Load PDF with pdf-lib for compression
                  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
                  
                  // Apply enhanced compression settings
                  const compressedPdfBytes = await pdfDoc.save({
                     useObjectStreams: true,
                     addDefaultPage: false,
                     objectsPerTick: 2000, // Higher compression
                     updateFieldAppearances: false,
                     compress: true,
                     // Additional optimization flags
                     linearize: false, // Disable linearization for smaller size
                     normalizeWhitespace: true // Remove extra whitespace
                  });
                  
                  setPdfProgress('Finalizing download...');
                  
                  // Create blob and download
                  const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Order_CMC${order?.serial_no || ''}_Rate_Confirmation.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  setPdfProgress('PDF downloaded successfully!');
                  setTimeout(() => setPdfProgress(''), 3000);
                  setDownloadingPdf(false);
                  
               } catch (compressionError) {
                  console.error('PDF compression failed:', compressionError);
                  // Fallback to original PDF if compression fails
                  doc.save(`Order_CMC${order?.serial_no || ''}_Rate_Confirmation.pdf`);
                  setPdfProgress('PDF downloaded (compression skipped)');
                  setTimeout(() => setPdfProgress(''), 3000);
                  setDownloadingPdf(false);
               }
            },
            x: 12.5,
            y: 0,
            html2canvas: {
               scale: 0.23, // Slightly larger scale to show full text
               useCORS: true,
               allowTaint: true,
               backgroundColor: null,
               logging: false,
               imageTimeout: 12000,
               removeContainer: true,
               pixelRatio: 0.8, // Better pixel ratio
               quality: 0.5, // Better quality for readability
               foreignObjectRendering: false,
               onclone: function(clonedDoc) {
                  // Ultra-aggressive compression with proper styling fixes
                  clonedDoc.querySelectorAll('*').forEach(el => {
                     const style = el.style;
                     // Simplify fonts but keep structure
                     style.fontFamily = 'Arial, sans-serif';
                     style.fontSize = '16px';
                     // Keep bold text for headings but reduce excessive weights
                     if (style.fontWeight === '900' || style.fontWeight === 'black') {
                        style.fontWeight = '700';
                     } else if (style.fontWeight === '800') {
                        style.fontWeight = '600';
                     }
                     // Font sizes optimized to prevent cutting
                     if (el.tagName === 'H1') {
                        style.fontSize = '18px';
                        style.fontWeight = '700';
                     } else if (el.tagName === 'H2' || el.tagName === 'H3') {
                        style.fontSize = '16px';
                        style.fontWeight = '600';
                     } else if (el.tagName === 'TH' || el.tagName === 'TD') {
                        style.padding = '3px';
                        style.fontSize = '15px';
                        style.fontWeight = '600';
                     } else {
                        style.fontSize = '15px';
                     }
                     // Ensure proper line height for all elements
                     style.lineHeight = '1.6';
                     // Remove visual effects
                     style.textShadow = 'none';
                     style.boxShadow = 'none';
                     style.backgroundImage = 'none';
                     style.borderRadius = '0';
                     // Preserve table borders and full-width layout
                     if (el.tagName === 'TABLE') {
                        el.setAttribute('cellpadding', '4');
                        el.setAttribute('cellspacing', '0');
                        style.border = '1px solid #999';
                        style.borderCollapse = 'collapse';
                        style.width = '100%';
                        style.tableLayout = 'auto'; // Allow flexible column widths
                     } else if (el.tagName === 'TD' || el.tagName === 'TH') {
                        style.border = '1px solid #ccc';
                        style.padding = '3px';
                        style.textAlign = 'left';
                        style.verticalAlign = 'top';
                        style.wordBreak = 'break-word';
                        style.height = '30px';
                        style.lineHeight = '30px';
                     } else if (el.classList && el.classList.contains('border-b')) {
                        style.borderBottom = '1px solid #ddd';
                     }
                     if (style.padding && parseInt(style.padding) > 12) {
                        style.padding = '3px';
                     }
                     if (style.margin && parseInt(style.margin) > 12) {
                        style.margin = '2px';
                     }
                     // Control container elements width
                     if (el.classList && (el.classList.contains('grid') || el.classList.contains('flex'))) {
                        style.width = '100%';
                        style.maxWidth = '100%';
                        style.overflow = 'hidden';
                     }
                     // Remove effects
                     style.transform = 'none';
                     style.transition = 'none';
                  });
                  // Remove ALL images to save maximum space
                  clonedDoc.querySelectorAll('img, svg, .icon, canvas').forEach(el => {
                     el.style.display = 'none';
                  });
               } 
            },
            autoPaging: 'text',
            width: 185, // A4 width minus margins
            windowWidth: 700, // Constrain to prevent overflow
            margin: [headerHeight + 2, 0, 15, 0], // Reduce margins to prevent text cutting
         });
         
      } catch (error) {
         console.error('PDF generation failed:', error);
         setPdfProgress('PDF generation failed');
         setTimeout(() => setPdfProgress(''), 3000);
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
                  <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "2rem", marginBottom: "1rem" }}  >
                     <h3 className="text-blue-700 font-bold text-lg mb-2">PROCESSED BY</h3>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className='capitalize pb-3'><strong>Employee Name: </strong> {order?.created_by?.name ? order.created_by.name: 'N/A' } </p>
                           <p className='pb-3'><strong>Employee ID:</strong> {order?.created_by?.corporateID || 'N/A'}</p>
                        </div>
                        <div className='ps-[100px]'>
                           <p className='pb-3'><strong>Email:</strong> {order?.created_by?.email}</p>
                           <p className='pb-3'><strong>Phone:</strong> {order?.created_by?.phone || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               )}
                

               <div className='relative mt-6'>
                  {order && order.shipping_details && order.shipping_details.map((s, index) => {
                     return <>
                           <div className="grid grid-cols-2 gap-2 mb-4">
                              <p className='capitalize pb-2'><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                              <p className=' pb-2'><strong>Commodity : </strong> {s?.commodity?.value || s?.commodity}</p>
                              {s?.reference && (
                                 <p className=''><strong>Commodity Reference : </strong> {s.reference}</p>
                              )}
                              <p className=' pb-2'><strong>Total Distance : </strong> <DistanceInMiles d={order.totalDistance} /></p>
                              <p className=' pb-2'><strong>Equipments : </strong> {s?.equipment?.value}</p>
                              <p className=' pb-2'><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
                           </div>

                           <div className="mb-6">
                              <h3 className="font-semibold mb-2 mt-4 text-lg">Charges</h3>
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