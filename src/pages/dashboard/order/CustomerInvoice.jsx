import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import Badge from './../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Loading from './../../common/Loading';

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

   const downloadPDF = () => {
   setDownloadingPdf(true);
   window.scrollTo(0,0);

   const element = pdfRef.current;
   if (!element) {
      setDownloadingPdf(false);
      return;
   }
 
   const doc = new jsPDF({
  unit: 'mm',
  format: 'a4',
  orientation: 'portrait',
});
doc.html(pdfRef.current, {
  callback: function (doc) {
    doc.save('invoice.pdf');
    setDownloadingPdf(false);
  },
  x: 0,
  y: 0,
  html2canvas: { scale: 0.265, useCORS: true },
  width: 210,          // A4 width in mm
  windowWidth: 794,    // Must match export container's pixel width
});

};


   return (
      <AuthLayout>
         <div className='flex justify-between items-center'>
            <h1 className='text-xl font-bold text-white mb-6 mt-4'>Order INVOICE #{order?.customer_order_no}</h1>
            <button className='bg-main px-4 py-2 rounded-xl text-sm' onClick={downloadPDF} >
               {downloadingPdf ? "Downloading..." : "Download PDF"}
            </button>
         </div>
         {loading ? <Loading /> :
            <div className="boltable">
               {/* Critical: ONLY inline style for export container */}
               <div
                  ref={pdfRef}
                  style={{
                     width: '794px',
                     minWidth: '794px',
                     maxWidth: '794px',
                     background: '#fff',
                     color: '#222',
                     fontFamily: 'sans-serif',
                     padding: '20px'
                  }}

               >
                  {/* --- your full invoice content BELOW here... --- */}
                  <div>
                     <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <div>
                           <h2 style={{ fontWeight: 700, fontSize: "2rem", color: "#111" }}>INVOICE</h2>
                           <p><strong>{company?.address || ''}</strong></p>
                           <p>{company?.email}</p>
                           <p>PH : {company?.phone}</p>
                        </div>
                        <div style={{ textAlign: "right", paddingTop: "1.5rem" }}>
                           <Logotext black={true} />
                           <div style={{ color: "#444" }}>Invoice # {invoiceNo}</div>
                        </div>
                     </div>
                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", borderBottom: "1px solid #ddd", paddingBottom: "1rem", marginBottom: "1rem" }}>
                        <div>
                           <h3 style={{ color: "#2563eb", fontWeight: 600 }}>BILL TO</h3>
                           <p style={{ color: "#111" }}>{order?.customer?.name} {order?.customer?.customerCode ? `(Ref No: ${order?.customer?.customerCode})` : '' }</p>
                           <p>{order?.customer?.address}</p>
                           <p>Email: {order?.customer?.email}</p>
                           <p>Phone: {order?.customer?.phone}</p>
                        </div>
                        <div>
                           <p style={{ textTransform: "uppercase" }}>Order Number : #CMC{order?.serial_no}</p>
                           <p>Invoice Date : <TimeFormat time={false} date={Date.now()} /></p>
                           <p>Amount : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p>
                        </div>
                     </div>
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
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
                                                <p><TimeFormat date={l.date} /> {l.appointment ? <b>(Appointment)</b> : null}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} /></p>
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
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
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
                                                <p><TimeFormat date={l.date} /> {l.appointment ? <b>(Appointment)</b> : null}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} /></p>
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
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
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
                                                <p><TimeFormat date={l.date} /> {l.appointment ? <b>(Appointment)</b> : null}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} /></p>
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
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
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
                                                <p><TimeFormat date={l.date} /> {l.appointment ? <b>(Appointment)</b> : null}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} /></p>
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
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
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
                                                <p><TimeFormat date={l.date} /> {l.appointment ? <b>(Appointment)</b> : null}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} /></p>
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
                     <div>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => (
                           <div key={index}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
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
                                                <p><TimeFormat date={l.date} /> {l.appointment ? <b>(Appointment)</b> : null}</p>
                                                <p>Ref #: {l.referenceNo}</p>
                                             </div>
                                          );
                                       } else {
                                          stopCount++;
                                          return (
                                             <div key={idx} style={{ background: "#dbeafe", padding: "1rem", borderRadius: "7px", marginBottom: '1rem' }}>
                                                <h4 style={{ color: "#b91c1c", fontWeight: 700 }}>STOP {stopCount}</h4>
                                                <p>{l.location}</p>
                                                <p><TimeFormat date={l.date} /></p>
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
                        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }} border="1">
                           <thead>
                              <tr>
                                 <th style={{ color: "#111" }}>Charges</th>
                                 <th style={{ color: "#111" }}>Amount</th>
                              </tr>
                           </thead>
                           <tbody>
                              {order && order.revenue_items && order.revenue_items.map((r, idx) => (
                                 <tr key={idx}>
                                    <td>
                                       <span style={{ color: "#111" }}>{r.revenue_item} - <Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} />*{r.quantity}</span>
                                    </td>
                                    <td>
                                       <Currency amount={(r?.rate || 0) * (r.quantity)} currency={order?.revenue_currency || 'cad'} />
                                    </td>
                                 </tr>
                              ))}
                              <tr>
                                 <td><strong style={{ color: "#111" }}>Total</strong></td>
                                 <td style={{ fontWeight: 700, color: "#111" }}>
                                    <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} />
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div style={{textAlign: 'right', marginTop: "2rem"}}>
                        <div>Date: {todaydate.getDate()} / {(todaydate.getMonth()+1).toString().padStart(2,'0')} / {todaydate.getFullYear()}</div>
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
