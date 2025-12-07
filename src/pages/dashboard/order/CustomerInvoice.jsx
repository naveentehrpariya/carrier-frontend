import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams, Link } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import Badge from './../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PDFDocument } from 'pdf-lib';
import Loading from './../../common/Loading';

export default function CustomerInvoice() {
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors, company} = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const [pdfProgress, setPdfProgress] = useState('');
   const pdfRef = useRef();
   const todaydate = new Date();

   const fetchOrder = () => {
      setLoading(true);
      Api.get(`/order/detail/${id}`)
         .then((res) => {
            setLoading(false);
            if (res.data.status) {
               setOrder(res.data.order);
               
               // Debug: Log company data to check remittance emails
               console.log('Company data in invoice:', company);
               console.log('Remittance emails available:', {
                  primary: company?.remittance_primary_email,
                  secondary: company?.remittance_secondary_email
               });
            } else {
               setOrder(null);
            }
         }).catch((err) => {
            setLoading(false);
            Errors(err);
         });
   }

   useEffect(() => {
      fetchOrder();
   }, []);

   const [invoiceNo, setInvoiceNo] = useState(``);
   useEffect(() => {
      if (order) {
         setInvoiceNo(`${order?.serial_no}-${todaydate.getMonth() + 1}${todaydate.getDate()}${Math.floor(Math.random() * 1000)}`);
      }
   }, [order]);

   const downloadPDF = async () => {
   setDownloadingPdf(true);
   setPdfProgress('Preparing invoice generation...');
   window.scrollTo(0,0);

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
      // Render header to canvas with extreme compression
      const headerCanvas = await html2canvas(headerElement, {
         scale: 3, // Ultra-small scale for tiny file size
         useCORS: true,
         allowTaint: true,
         backgroundColor: null,
         logging: false,
         pixelRatio: 1, // Very low pixel ratio
         quality: 50, // Very low quality for small size
      });
      
      // Ultra-aggressive header compression
      const headerImgData = headerCanvas.toDataURL("image/jpeg"); // Maximum compression
      const headerHeight = Math.min(((headerCanvas.height * 210) / headerCanvas.width), 35);

      setPdfProgress('Generating invoice content...');
      const doc = new jsPDF({
         unit: 'mm',
         format: 'a4',
         orientation: 'portrait',
         compress: true,
         precision: 2,
         userUnit: 1.0,
      });
      
      doc.html(pdfRef.current, {
         callback: async function (doc) {
            try {
               setPdfProgress('Adding headers to all pages...');
               const totalPages = doc.internal.getNumberOfPages();
               const pageHeight = doc.internal.pageSize.getHeight();
               
               // Add header to all pages for consistency
               for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                  doc.setPage(pageNum);
                  doc.addImage(headerImgData, "JPEG", 12.5, 5, 185, headerHeight, '', 'FAST');
                  
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
               const pdfArrayBuffer = doc.output('arraybuffer');
               const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
               const compressedPdfBytes = await pdfDoc.save({
                  useObjectStreams: true,
                  addDefaultPage: false,
                  objectsPerTick: 1000, 
                  updateFieldAppearances: false,
                  compress: true
               });
               
               setPdfProgress('Finalizing download...');
               
               // Create blob and download
               const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
               const url = URL.createObjectURL(blob);
               const link = document.createElement('a');
               link.href = url;
               link.download = `CMC${order?.serial_no || ''}_invoice-${invoiceNo}.pdf`;
               document.body.appendChild(link);
               link.click();
               document.body.removeChild(link);
               URL.revokeObjectURL(url);
               
               setPdfProgress('Invoice downloaded successfully!');
               setTimeout(() => setPdfProgress(''), 3000);
               setDownloadingPdf(false);
               
            } catch (compressionError) {
               console.error('PDF compression failed:', compressionError);
               doc.save(` CMC${order?.serial_no || ''}_invoice-${invoiceNo}.pdf`);
               setPdfProgress('Invoice downloaded (compression skipped)');
               setTimeout(() => setPdfProgress(''), 3000);
               setDownloadingPdf(false);
            }
         },
         x: 12.5,
         y: 0,
         html2canvas: {
            scale: 0.235, // Moderate scale for size control
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            imageTimeout: 12000,
            removeContainer: true,
            pixelRatio: 0.8, // Moderate pixel ratio
            quality: 0.5, // Moderate quality for size control
            foreignObjectRendering: false,
            onclone: function(clonedDoc) {
               // Apply page break styles to cloned document
               clonedDoc.querySelectorAll('.bank-details, .remittance-section, .table-section, .processed-by-section, .shipping-detail-item, .location-block, .bill-to-section').forEach(el => {
                  el.style.pageBreakInside = 'avoid';
                  el.style.breakInside = 'avoid';
                  el.style.display = 'block';
                  el.style.position = 'relative';
               });
               
               // Apply to table specifically
               clonedDoc.querySelectorAll('.pdf-content table').forEach(el => {
                  el.style.pageBreakInside = 'avoid';
                  el.style.breakInside = 'avoid';
               });
               
               // Moderate optimizations targeting 200-500KB file size
               clonedDoc.querySelectorAll('*').forEach(el => {
                  const style = el.style;
                  style.fontFamily = 'Arial, sans-serif';
                  if (style.fontWeight === '900' || style.fontWeight === 'black') {
                     style.fontWeight = '600';
                  } else if (style.fontWeight === '700' || style.fontWeight === 'bold') {
                     style.fontWeight = '500';
                  }
                  style.textShadow = 'none';
                  style.boxShadow = 'none';
                  style.backgroundImage = 'none';
                  style.borderRadius = '0';
                  if (style.border && style.border !== 'none') {
                     style.border = '1px solid #ccc';
                  }
                  if (style.padding && parseInt(style.padding) > 12) {
                     style.padding = '6px';
                  }
                  if (style.margin && parseInt(style.margin) > 12) {
                     style.margin = '4px';
                  }
                  style.transform = 'none';
                  style.transition = 'none';
               });

               clonedDoc.querySelectorAll('img, svg, .icon, canvas').forEach(el => {
                  el.style.display = 'none';
               });
            }
         },
         autoPaging: 'text',
         width: 185,
         windowWidth: 794,
         margin: [headerHeight + 5, 0, 20, 0],
         jsPDF: doc,
      });
      
   } catch (error) {
      console.error('PDF generation failed:', error);
      setPdfProgress('PDF generation failed');
      setTimeout(() => setPdfProgress(''), 3000);
      setDownloadingPdf(false);
   }
};


   return (
      <AuthLayout>
         <style>
            {`
               /* Prevent page breaks inside these elements */
               .pdf-content > div > div,
               .pdf-content table,
               .pdf-content .bank-details,
               .shipping-detail-item,
               .processed-by-section,
               .remittance-section,
               .bill-to-section,
               .table-section {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  display: block;
                  orphans: 3;
                  widows: 3;
               }
               
               /* Keep table rows together */
               .pdf-content table tr {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
               }
               
               .pdf-content table {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
               }
               
               /* Add page break before these sections if needed */
               .bank-details {
                  page-break-before: auto;
                  break-before: auto;
               }
               
               /* Ensure pickup/stop location blocks stay together */
               .location-block {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  display: block;
               }
               
               /* Add spacing and ensure sections stay intact */
               .table-section {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  margin-bottom: 30px;
               }
               
               .remittance-section {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  margin-bottom: 20px;
                  padding-top: 10px;
               }
               
               .shipping-detail-item {
                  margin-bottom: 25px;
               }
            `}
         </style>
         {loading ? <Loading /> :
            <div className="boltable bg-white">

            <div className="relative max-w-[794px] mx-auto pt-[30px] p-[10px] bg-white text-sm text-black">
               <div className='flex justify-between items-center'>
                  <h1 className='text-xl font-bold text-black mb-6 mt-4'>Order INVOICE #{order?.serial_no}</h1>
                  <div className='text-right'>
                     <button className='bg-main px-4 py-2 rounded-xl text-sm' onClick={downloadPDF} disabled={downloadingPdf}>
                        {downloadingPdf ? "Generating..." : "Download PDF"}
                     </button>
                     {pdfProgress && (
                        <div className='text-xs text-blue-600 mt-1 max-w-[200px]'>
                           {pdfProgress}
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex justify-between items-center pb-4 mb-4">
                        <div>
                           <h2 className='mb-2 text-3xl ' style={{ fontWeight: 700, fontSize: "2rem", color: "#111" }}>INVOICE</h2>
                           <p className='text-lg'><strong>{company?.address || ''}</strong></p>
                           <p className='text-lg'>{company?.email}</p>
                           <p className='text-lg'>PH : {company?.phone}</p>
                        </div>
                        <div style={{ textAlign: "right", paddingTop: "1.5rem" }}>
                           <Logotext black={true} />
                           <div style={{ color: "#444"}}>Invoice # {invoiceNo}</div>
                        <div style={{ fontSize: "11px", marginTop: "0.3rem" }}>Date: <TimeFormat date={todaydate} time={true} /></div>

                        </div>
                     </div>
               </div>

               <div
                  ref={pdfRef}
                  style={{
                     width: '794px',
                     minWidth: '794px',
                     maxWidth: '794px',
                     background: '#fff',
                     color: '#222',
                     fontFamily: 'sans-serif',
                     padding: '10px'
                  }}
                  className='m-auto pdf-content'

               >


               <div id="pdf-header-html" 
                  style={{
                     position: "absolute",
                     top: "-9999px",
                     left: "-9999px",
                     width: "794px", 
                     padding: "10px",
                     fontSize: "12px",
                     boxSizing: "border-box",
                     backgroundColor: "white",
                  }}>
                  <div className="flex justify-between items-center pb-4 mb-4">
                     <div>
                        <h2 style={{ fontWeight: 900, fontSize: "2rem", color: "#111" }}>INVOICE</h2>
                        <p className='text-lg'><strong>{company?.address || ''}</strong></p>
                        <p className='text-lg'>{company?.email}</p>
                        <p className='text-lg'>PH : {company?.phone}</p>
                     </div>
                     <div style={{ textAlign: "right", paddingTop: "1.5rem" }}>
                        <Logotext black={true} />
                        <div className='text-lg' style={{ color: "#444", fontSize: "14px" }}>Invoice # {invoiceNo}</div>
                        <div style={{ fontSize: "11px", marginTop: "0.3rem" }}>Date: <TimeFormat date={todaydate} time={true} /></div>
                     </div>
                  </div>
               </div>

                  <div>
                     
                     <div className="bill-to-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem",  marginBottom: "2rem" }}>
                        <div>
                           <h3 className='text-lg' style={{ color: "#2563eb", fontWeight: 900 }}>BILL TO</h3>
                           <p style={{ color: "#111", textTransform:"capitalize", marginBottom: "0.2rem" }}>{order?.customer?.name} {order?.customer?.customerCode ? `(Ref No: ${order?.customer?.customerCode})` : '' }</p>
                           <p style={{ marginBottom: "0.2rem" }}>{order?.customer?.address}</p>
                           <p style={{ marginBottom: "0.2rem" }}>Email: {order?.customer?.email}</p>
                           <p style={{ marginBottom: "0.2rem" }}>Phone: {order?.customer?.phone}</p>
                        </div>
                        <div>
                           <p style={{ textTransform: "uppercase", marginTop: "1.3rem", marginBottom: "0.2rem" }}> </p>
                           <p style={{ textTransform: "uppercase", marginBottom: "0.2rem" }}>Order Number : #CMC{order?.serial_no}</p>
                           <p style={{ marginBottom: "0.2rem" }}>Invoice Date : <TimeFormat time={true} date={Date.now()} /></p>
                           <p style={{ marginBottom: "0.2rem" }}>Amount : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p>
                        </div>
                     </div>
                     
                    
                     <div className="table-section" style={{marginBottom: "2rem",  paddingBottom: "1rem"}}>
                        <table cellPadding={8} className='bg-white' style={{ width:"100%", textAlign:"left", borderCollapse:"collapse" }} border="1">
                           <thead>
                              <tr>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Charges</th>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Notes</th>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Rate</th>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Amount</th>
                              </tr>
                           </thead>
                           <tbody>
                              {order && order.revenue_items && order.revenue_items.map((r, idx) => (
                                 <tr key={idx}>
                                    <td className='border'>{r?.revenue_item}</td>
                                    <td className='border text-left text-[14px] max-w-[200px]'>{r?.note}</td>
                                    <td className='border text-left'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</td>
                                    <td className='border text-left'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                 </tr>

                              ))}
                              <tr>
                                 <td colSpan={2} align='left' className='border' ><strong style={{ color: "#111" }}></strong></td>
                                 <td  align='left' className='border bg-gray-100' ><strong style={{ color: "#111" }}>Total</strong></td>
                                 <td   align='left' className='border bg-gray-100'  style={{ fontWeight: 700, color: "#111" }}>
                                    <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} />
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        {order?.created_by && (
                           <div className="processed-by-section" style={{  paddingTop: "1rem", marginTop: "1rem" }}>
                              <h3 className='text-lg' style={{ color: "#2563eb", fontWeight: 900 }}>PROCESSED BY</h3>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                 <div>
                                    <p>Employee Name :  
                                       {order?.created_by?.name ? 
                                             order.created_by.name
                                          : 'N/A'
                                       }
                                    </p>
                                    <p>Employee ID : {order?.created_by?.corporateID || 'N/A'}</p>
                                 </div>
                                 <div>
                                    <p>Email : {order?.created_by?.email}</p>
                                    <p>Phone : {order?.created_by?.phone || 'N/A'}</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                     <div className="table-section" style={{marginBottom: "2rem",  paddingBottom: "1rem"}}>
                        <table cellPadding={8} className='bg-white' style={{ width:"100%", textAlign:"left", borderCollapse:"collapse" }} border="1">
                           <thead>
                              <tr>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Charges</th>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Notes</th>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Rate</th>
                                 <th className='border bg-gray-100' style={{ color: "#111" }}>Amount</th>
                              </tr>
                           </thead>
                           <tbody>
                              {order && order.revenue_items && order.revenue_items.map((r, idx) => (
                                 <tr key={idx}>
                                    <td className='border'>{r?.revenue_item}</td>
                                    <td className='border text-left text-[14px] max-w-[200px]'>{r?.note}</td>
                                    <td className='border text-left'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</td>
                                    <td className='border text-left'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                 </tr>

                              ))}
                              <tr>
                                 <td colSpan={2} align='left' className='border' ><strong style={{ color: "#111" }}></strong></td>
                                 <td  align='left' className='border bg-gray-100' ><strong style={{ color: "#111" }}>Total</strong></td>
                                 <td   align='left' className='border bg-gray-100'  style={{ fontWeight: 700, color: "#111" }}>
                                    <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} />
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        {order?.created_by && (
                           <div className="processed-by-section" style={{  paddingTop: "1rem", marginTop: "1rem" }}>
                              <h3 className='text-lg' style={{ color: "#2563eb", fontWeight: 900 }}>PROCESSED BY</h3>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                 <div>
                                    <p>Employee Name :  
                                       {order?.created_by?.name ? 
                                             order.created_by.name
                                          : 'N/A'
                                       }
                                    </p>
                                    <p>Employee ID : {order?.created_by?.corporateID || 'N/A'}</p>
                                 </div>
                                 <div>
                                    <p>Email : {order?.created_by?.email}</p>
                                    <p>Phone : {order?.created_by?.phone || 'N/A'}</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* // Shiping details */}
                    
                     
                     

                     <div className='remittance-section'>
                        <p className='mt-6 pt-6 mb-4'>
                           Please send remittance to -
                           <a
                              className='text-blue-600 inline-block mt-[-5px]'
                              href={`mailto:${company?.remittance_primary_email || company?.email || ''}${company?.remittance_secondary_email ? `?cc=${encodeURIComponent(company.remittance_secondary_email)}` : ''}`}
                           >
                              {company?.remittance_primary_email || company?.email || ''}
                           </a>
                           {company?.remittance_secondary_email && (
                              <span className='ml-1 text-gray-700'>(cc: {company.remittance_secondary_email})</span>
                           )}
                        </p>
                        <div className='bank-details'>
                        <h3 style={{ color: "#2563eb", fontWeight: 900, }}>NAME OF BANK :- {company?.bank_name || 'ROYAL BANK OF CANADA'}</h3>
                       
                       <div className='p-6 border rounded-2xl mt-4 '>
                           <p className=''><strong>Bank Name:</strong> {company?.bank_name || ''}</p>
                           <p className='mt-2'><strong>Account Name:</strong> {company?.account_name || ''}</p>
                           <p className='mt-2'> <strong>Account Number:</strong> {company?.account_number || ''}</p>
                           <p className='mt-2'> <strong>Routing Number:</strong> {company?.routing_number || ''}</p>
                       </div>

                        </div>
                        <div style={{textAlign: 'right', marginTop: "2rem",marginBottom: "2rem"}}>
                           <div>Date: <TimeFormat date={todaydate} time={true} /></div>
                           <div style={{ fontSize: "11px", marginTop: "0.3rem" }}>
                              INVOICE# {invoiceNo} must appear on all invoices
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         }
      </AuthLayout>
   );
}