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
   setPdfProgress('Preparing PDF...');
   window.scrollTo(0, 0);

   const element = pdfRef.current;
   const headerElement = document.getElementById('pdf-header-html');
   if (!element || !headerElement) {
     setDownloadingPdf(false);
     setPdfProgress('');
     return;
   }

   try {
     setPdfProgress('Rendering header...');
    const headerCanvas = await html2canvas(headerElement, {
      scale: 7, // Good scale for crisp but not oversized header
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      pixelRatio: 1.0, // Full pixel ratio for clarity
       quality: 100, // Good quality for clear header
    });
    const headerImgData = headerCanvas.toDataURL('image/jpeg', 2);
    const headerHeight = Math.min(((headerCanvas.height * 170) / headerCanvas.width), 45);

     setPdfProgress('Generating PDF...');
     const doc = new jsPDF({
       unit: 'mm',
       format: 'a4',
       orientation: 'portrait',
       compress: true,
       precision: 1,
       userUnit: 1.0,
     });

     doc.html(element, {
       callback: async function (doc) {
         try {
           setPdfProgress('Adding headers to pages...');
           const totalPages = doc.internal.getNumberOfPages();
           for (let pageNum = 1; pageNum < 2; pageNum++) {
             doc.setPage(pageNum);
             doc.addImage(headerImgData, "JPEG", 12.5, 5, 185, Math.min(headerHeight, 40), '', 'FAST');
           }

           setPdfProgress('Compressing PDF...');
           const pdfArrayBuffer = doc.output('arraybuffer');
           const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
           const compressedPdfBytes = await pdfDoc.save({
             useObjectStreams: true,
             addDefaultPage: false,
             objectsPerTick: 2000,
             updateFieldAppearances: false,
             compress: true,
             linearize: false,
             normalizeWhitespace: true,
           });

           setPdfProgress('Finalizing download...');
           const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
           const url = URL.createObjectURL(blob);
           const link = document.createElement('a');
           link.href = url;
           link.download = `CMC${order?.serial_no || ''}_invoice-${invoiceNo}.pdf`;
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
           URL.revokeObjectURL(url);
           setPdfProgress('PDF downloaded successfully!');
           setTimeout(() => setPdfProgress(''), 3000);
           setDownloadingPdf(false);
         } catch (compressionError) {
           console.error('PDF compression failed:', compressionError);
           doc.save(`CMC${order?.serial_no || ''}_invoice-${invoiceNo}.pdf`);
           setPdfProgress('PDF downloaded (compression skipped)');
           setTimeout(() => setPdfProgress(''), 3000);
           setDownloadingPdf(false);
         }
       },
       x: 12.5,
       y: 0,
      html2canvas: {
        scale: 0.23,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 12000,
        removeContainer: true,
        pixelRatio: 0.8,
        quality: 0.5,
        foreignObjectRendering: false,
        onclone: function (clonedDoc) {
          clonedDoc.querySelectorAll('*').forEach(el => {
            const style = el.style;
            style.fontFamily = 'Arial, sans-serif';
            // normalize heavy font weights
            if (style.fontWeight === '900' || style.fontWeight === 'black') {
              style.fontWeight = '700';
            } else if (style.fontWeight === '800') {
              style.fontWeight = '600';
            }
            // table formatting for alignment
            if (el.tagName === 'TABLE') {
              el.setAttribute('cellpadding', '4');
              el.setAttribute('cellspacing', '0');
              style.border = '1px solid #999';
              style.borderCollapse = 'collapse';
              style.width = '100%';
              style.tableLayout = 'auto';
            } else if (el.tagName === 'TH' || el.tagName === 'TD') {
              style.border = '1px solid #ccc';
              style.padding = '6px';
              style.fontSize = '14px';
              style.fontWeight = '600';
              style.textAlign = 'left';
              style.verticalAlign = 'top';
              style.lineHeight = '22px';
              style.height = '22px';
              style.wordBreak = 'break-word';
            }
            // remove visual effects that disturb layout
            style.textShadow = 'none';
            style.boxShadow = 'none';
            style.backgroundImage = 'none';
            style.borderRadius = '0';
            style.transform = 'none';
            style.transition = 'none';
          });
          clonedDoc.querySelectorAll('.pdf-keep, .pdf-section, .pdf-table, .bank-details').forEach(el => {
            el.style.pageBreakInside = 'avoid';
            el.style.breakInside = 'avoid';
            el.style.display = 'block';
            el.style.width = '100%';
            el.style.maxWidth = '100%';
          });
        }
      },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-keep', '.pdf-section', '.pdf-table', '.bank-details'] },
      autoPaging: 'html',
      width: 185,
      windowWidth: 700,
      margin: [headerHeight + 2, 0, 15, 0],
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

               .table-section th, .table-section td {
                  padding: 8px; line-height: 24px;
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
                     width: "100%", 
                     padding: "10px",
                     fontSize: "12px",
                     boxSizing: "border-box",
                     backgroundColor: "white",
                  }}>
                  <div className="flex justify-between items-center pb-4 mb-4" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'12px', marginBottom:'12px' }}>
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
                     
                     <div className="bill-to-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem",  marginBottom: "3rem", pageBreakInside: "avoid", breakInside: "avoid" }}>
                        <div>
                           <h3 className='text-lg' style={{ color: "#2563eb", fontWeight: 900 }}>BILL TO</h3>
                           <p style={{ textTransform: "uppercase", color: "#111", marginBottom: "0.2rem" }}>{order?.customer?.name} {order?.customer?.customerCode ? `(Ref No: ${order?.customer?.customerCode})` : '' }</p>
                           <p style={{ marginBottom: "0.2rem" }}><p style={{fontWeight: 700, display:'inline-block'}}>Address :</p> {order?.customer?.address}</p>
                           <p style={{ marginBottom: "0.2rem" }}> <p style={{fontWeight:700, display:'inline-block'}}>Email : </p> {order?.customer?.email}</p>
                           <p style={{ marginBottom: "0.2rem" }}> <p style={{fontWeight:700, display:'inline-block'}}>Phone : </p> {order?.customer?.phone}</p>
                        </div>
                        <div>
                           <p style={{ textTransform: "uppercase", marginTop: "1.3rem", marginBottom: "0.2rem" }}> <p style={{fontWeight:700, display:'inline-block'}}>Order Number : </p> #CMC{order?.serial_no}</p>
                           <p style={{ marginBottom: "0.2rem" }}> <p style={{fontWeight:700, display:'inline-block'}}>Invoice Date : </p> <TimeFormat time={true} date={Date.now()} /></p>
                           <p style={{ marginBottom: "0.2rem" }}> <p style={{fontWeight:700, display:'inline-block'}}>Amount : </p> <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p>
                        </div>
                     </div>
                     
                    
                     <div className="table-section" style={{ paddingBottom: "1rem", pageBreakInside: "avoid", breakInside: "avoid"}}>
                        <table cellPadding={8} className='bg-white' style={{ width:"100%", textAlign:"left", borderCollapse:"collapse" }} border="1">
                           <thead>
                              <tr className='w-full'>
                                 <th className='border bg-gray-100' style={{  color: "#111" }}>Charges</th>
                                 <th className='border bg-gray-100' style={{  color: "#111" }}>Notes</th>
                                 <th className='border bg-gray-100' style={{  color: "#111" }}>Rate</th>
                                 <th className='border bg-gray-100' style={{  color: "#111" }}>Amount</th>
                              </tr>
                           </thead>
                           <tbody>
                              {order && order.revenue_items && order.revenue_items.map((r, idx) => (
                                 <tr key={idx}>
                                    <td style={{lineHeight:'22px', height:'22px', verticalAlign:'middle'}} className='border'>{r?.revenue_item}</td>
                                    <td style={{lineHeight:'22px', height:'22px', verticalAlign:'middle'}} className='border text-left text-[14px] max-w-[200px]'>{r?.note}</td>
                                    <td style={{lineHeight:'22px', height:'22px', verticalAlign:'middle'}} className='border text-left'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</td>
                                    <td style={{lineHeight:'22px', height:'22px', verticalAlign:'middle'}} className='border text-left'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                 </tr>

                              ))}
                              <tr>
                                 <td colSpan={3} align='left' className='border bg-gray-100' ><strong style={{ color: "#111" }}>Total</strong></td>
                                 <td   align='left' className='border bg-gray-100'  style={{ fontWeight: 700, color: "#111" }}>
                                    <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} />
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        {order?.created_by && (
                           <div className="processed-by-section" style={{  paddingTop: "1rem", marginTop: "1rem", pageBreakInside: "avoid", breakInside: "avoid" }}>
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
                     
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div className="shipping-detail-item" style={{   pageBreakInside: "avoid", breakInside: "avoid" }} key={index}>
                              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "2rem" }}>
                                    <p style={{marginBottom:'5px', marginRight:"20px"}}><p style={{fontWeight: 700, display:'inline-block'}}>Order No :</p>   #CMC{order?.serial_no ||''}</p>
                                    <p style={{marginBottom:'5px', marginRight:"20px"}}><p style={{fontWeight: 700, display:'inline-block'}}>Commodity :</p>  {s?.commodity?.value || s?.commodity}</p>
                                    <p style={{marginBottom:'5px', marginRight:"20px"}}><p style={{fontWeight: 700, display:'inline-block'}}>Equipments :</p>  {s?.equipment?.value}</p>
                                    <p style={{marginBottom:'5px', marginRight:"20px"}}><p style={{fontWeight: 700, display:'inline-block'}}>Weight :</p>  {s?.weight ||''}{s?.weight_unit ||''}</p>
                              </div>
                              <div style={{ marginBottom: "2rem" }}>
                                 {s.locations && (() => {
                                    let pickupCount = 0;
                                    let stopCount = 0;
                                    return s.locations.map((l, idx) => {
                                       if (l.type === 'pickup') {
                                          pickupCount++;
                                          return (
                                             <div className="location-block" key={idx} style={{ background: "#e1eee8ff", padding: "1rem", borderRadius: "7px", marginBottom: '1rem', pageBreakInside: "avoid", breakInside: "avoid" }}>
                                                <h4 style={{ color: "#2563eb", fontWeight: 700 }}>PICK {pickupCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat time={false} date={l.date} /> {l?.appointment ?  <b>(Appointment : {l?.appointment})</b>: ''}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div className="location-block" key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem', pageBreakInside: "avoid", breakInside: "avoid" }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} time={false} /> {l?.appointment ?  <b>(Appointment : {l?.appointment})</b>: ''}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       }
                                    });
                                 })()}
                              </div>
                           </div>
                        ))}
                     </div>
                     

                     <div className='remittance-section' style={{  pageBreakInside: "avoid", breakInside: "avoid" }}>
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
                        <div className='bank-details' style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
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
