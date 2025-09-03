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
import Loading from './../../common/Loading';
import DebugCompanyData from '../../../components/DebugCompanyData';

export default function CustomerInvoice() {
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors, company} = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
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
   window.scrollTo(0,0);

   const element = pdfRef.current;
   if (!element) {
      setDownloadingPdf(false);
      return;
   }

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
   unit: 'mm',
   format: 'a4',
   orientation: 'portrait',
   compress: true,
   precision: 2,
   userUnit: 1.0,
   });
   doc.html(pdfRef.current, {
      callback: function (doc) {
         const totalPages = doc.internal.getNumberOfPages();
         const watermarkImg = "/transparent-logo.png";
         for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            // doc.addImage(headerImgData, "PNG", 0, 0, 210, headerHeight);
            doc.addImage(headerImgData, "JPEG", 12.5, 0, 185, headerHeight, '', 'MEDIUM'); // x = 12.5mm, width = 185mm to match content
            doc.addImage(watermarkImg, "PNG", 50, 110, 100, 38, '', 'FAST');
            // doc.addImage(watermarkImg, "PNG", 50, 180, 100, 38, '', 'FAST');
         }
         doc.save(`invoice-${invoiceNo}.pdf`);
         setDownloadingPdf(false);
      },
      x: 12.5,
      y: 0,
      html2canvas: { 
         scale: 0.236, 
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
      windowWidth: 794,
      margin: [headerHeight, 0, 20, 0],    // Must match export container's pixel width
   });

};


   return (
      <AuthLayout>
         <DebugCompanyData />
         {loading ? <Loading /> :
            <div className="boltable bg-white">

            <div className="relative max-w-[794px] mx-auto pt-[30px] p-[10px] bg-white text-sm text-black">
               <div className='flex justify-between items-center'>
                  <h1 className='text-xl font-bold text-black mb-6 mt-4'>Order INVOICE #{order?.serial_no}</h1>
                  <button className='bg-main px-4 py-2 rounded-xl text-sm' onClick={downloadPDF} >
                     {downloadingPdf ? "Downloading..." : "Download PDF"}
                  </button>
               </div>

               <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <div>
                           <h2 className='mb-2 text-3xl ' style={{ fontWeight: 700, fontSize: "2rem", color: "#111" }}>INVOICE</h2>
                           <p className='text-lg'><strong>{company?.address || ''}</strong></p>
                           <p className='text-lg'>{company?.email}</p>
                           <p className='text-lg'>PH : {company?.phone}</p>
                        </div>
                        <div style={{ textAlign: "right", paddingTop: "1.5rem" }}>
                           <Logotext black={true} />
                           <div style={{ color: "#444" }}>Invoice # {invoiceNo}</div>
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
                  className='m-auto'

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
                  <div className="flex justify-between items-center border-b pb-4 mb-4">
                     <div>
                        <h2 style={{ fontWeight: 900, fontSize: "2rem", color: "#111" }}>INVOICE</h2>
                        <p className='text-lg'><strong>{company?.address || ''}</strong></p>
                        <p className='text-lg'>{company?.email}</p>
                        <p className='text-lg'>PH : {company?.phone}</p>
                     </div>
                     <div style={{ textAlign: "right", paddingTop: "1.5rem" }}>
                        <Logotext black={true} />
                        <div className='text-lg' style={{ color: "#444" }}>Invoice # {invoiceNo}</div>
                     </div>
                  </div>
               </div>

                  <div>
                     
                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem", marginBottom: "1rem" }}>
                        <div>
                           <h3 className='text-lg' style={{ color: "#2563eb", fontWeight: 900 }}>BILL TO</h3>
                           <p style={{ color: "#111" }}>{order?.customer?.name} {order?.customer?.customerCode ? `(Ref No: ${order?.customer?.customerCode})` : '' }</p>
                           <p>{order?.customer?.address}</p>
                           <p>Email: {order?.customer?.email}</p>
                           <p>Phone: {order?.customer?.phone}</p>
                        </div>
                        <div>
                           <p style={{ textTransform: "uppercase", marginTop: "1.3rem" }}> </p>
                           <p style={{ textTransform: "uppercase" }}>Order Number : #CMC{order?.serial_no}</p>
                           <p>Invoice Date : <TimeFormat time={true} date={Date.now()} /></p>
                           <p>Amount : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p>
                        </div>
                     </div>
                     
                     {/* Employee Information Section */}
                     {order?.created_by && (
                        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "1rem", marginBottom: "1rem" }}>
                           <h3 className='text-lg' style={{ color: "#2563eb", fontWeight: 900 }}>PROCESSED BY</h3>
                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
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
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p className='flex items-center'><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p className='flex items-center'><strong>Commodity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p className='flex items-center'><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p className='flex items-center'><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
                                 </div>
                              </div>
                              <div style={{ marginBottom: "2rem" }}>
                                 {s.locations && (() => {
                                    let pickupCount = 0;
                                    let stopCount = 0;
                                    return s.locations.map((l, idx) => {
                                       if (l.type === 'pickup') {
                                          pickupCount++;
                                          return (
                                             <div key={idx} style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#2563eb", fontWeight: 700 }}>PICK {pickupCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat time={false} date={l.date} /> {l?.appointment ?  <b>(Appointment : {l?.appointment})</b>: ''}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
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
                     
                     <div style={{marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem"}}>
                        <table  cellPadding={8} className='bg-white'  style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }} border="1">
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
                     </div>

                     <p className='mt-8 mb-4'>Please send remittance to - 
                        <a className='text-blue-600' href={`mailto:${company?.remittance_primary_email || company.email || ''}`}>
                           {company?.remittance_primary_email || company.email || ''}
                        </a>
                        {(company?.remittance_secondary_email) && (
                           <>, cc <a className='text-blue-600' href={`mailto:${company?.remittance_secondary_email || ''}`}>
                              {company?.remittance_secondary_email || ''}
                           </a></>
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
                        <div>Date: {(todaydate.getMonth()+1).toString().padStart(2,'0')} / {todaydate.getDate()}  / {todaydate.getFullYear()}  {todaydate.getHours()}:{todaydate.getMinutes().toString().padStart(2,'0')} {todaydate.getHours() >= 12 ? 'PM' : 'AM'} </div>
                        <div style={{ fontSize: "11px", marginTop: "0.3rem" }}>
                           INVOICE# {invoiceNo} must appear on all invoices
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         }
      </AuthLayout>
   );
}
