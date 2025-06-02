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
               doc.addImage(watermarkImg, "PNG", 50, 150, 100, 38);
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

   const [invoiceNo, setInvoiceNo] = useState(``);
   useEffect(() => {
      if (order) {
         setInvoiceNo(`${order?.serial_no}-${todaydate.getMonth() + 1}${todaydate.getDate()}${Math.floor(Math.random() * 1000)}`);
      }
   }, [order]);
   
   return <AuthLayout>
      <div className='flex justify-between items-center'>
         <h1 className='text-xl font-bold text-white mb-6 mt-4'>Order INVOICE #{order?.customer_order_no}</h1>
         <button className='bg-main px-4 py-2 rounded-xl text-sm' onClick={downloadPDF} >{downloadingPdf ? "Downloading..." : "Download PDF"}</button>
      </div>

      {loading ? <Loading /> : 
         <div  className='boltable  bg-white rounded-xl p-6 py-12'>
            <div ref={pdfRef} className="relative max-w-[794px] mx-auto p-[20px] bg-white text-sm text-black shadow-md font-sans">
               <div className='relative z-1'> 
                     <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <div>
                           <h2 className='font-bold text-3xl text-black capitalize'>INVOICE</h2>
                           <p className='capitalize' ><strong className='text-black'>{company?.address|| ''}</strong></p>
                           <p>{company?.email}</p>
                           <p>PH : {company?.phone}</p>
                        </div>
                        <div className="text-right pt-6 pe-6 ">
                           <Logotext black={true} />
                           <div className="text-gray-700 text-end">Invoice # {invoiceNo}</div>
                        </div>
                     </div>
      
                     <div className="grid grid-cols-2 gap-8 border-b pb-4 mb-4">
                        <div>
                           <h3 className="text-blue-700 font-semibold">BILL TO</h3>
                           <p className=' text-black capitalize'>{order?.customer?.name}  {order?.customer?.customerCode ? `(Ref No: ${order?.customer?.customerCode})` : '' }</p>
                           <p >{order?.customer?.address}</p>
                           <p >Email : {order?.customer?.email}</p>
                           <p >Phone : {order?.customer?.phone}</p>
                        </div>
                        <div>
                           {/* <h3 className="text-blue-700 font-semibold">CUSTOMER</h3> */}
                           <p className='uppercase'>Order Number : #CMC{order.serial_no}</p>
                           <p>Invoice Date : <TimeFormat time={false} date={Date.now()} /></p>
                           <p>Amount : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p>
                        </div>
                     </div>

                        <div className='relative'>
                        {order && order.shipping_details && order.shipping_details.map((s, index) => {
                           return <>
                                 <div className="grid grid-cols-2 gap-6 mb-4">
                                 <div>
                                    <p><strong>Order No : </strong> #CMC{order?.serial_no ||''}</p>
                                    <p><strong>Commudity : </strong> {s?.commodity?.value || s?.commodity}</p>
                                 </div>
                                 <div>
                                    <p><strong>Equipments : </strong> {s?.equipment?.value}</p>
                                    <p><strong>Weight : </strong> {s?.weight ||''}{s?.weight_unit ||''}</p>
                                 </div>
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
                     
                     <div className='p3  mt-3 pt-4 w-full flex  sborder sborder-gray-300 '>
                        <ul className='w-full'>
                        </ul>
                        <ul className='w-full border border-gray-100 p-3'>
                           <table border={'1'} className='w-full text-start'>
                              <tr>
                                 <th align='left' className='text-black'>Charges</th>
                                 <th align='left ' className='text-black'>Amount</th>
                              </tr>
                              {order && order.revenue_items&&
                                 <>
                                       {order && order.revenue_items && order.revenue_items.map((r, index) => {
                                          return <>
                                          <tr>
                                             <td><p className='text-sm text-black'>{r.revenue_item} - <span className='capitalize'><Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} />*{r.quantity}</span></p></td>
                                             <td><Currency amount={((r?.rate) * (r.quantity)) || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                          </tr>
                                          </>
                                       })}
                                 </>
                              }
                              <tr>
                                 <td><strong className='text-sm text-black'>Total</strong></td>
                                 <td className='font-bold text-black'><Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></td>
                              </tr>
                           </table>
                        </ul>
                     </div>

                     <div className="flex justify-end items-center mt-6">
                        <div className="text-right">
                           <div>Date: {todaydate.getDate()} / {(todaydate.getMonth()+1) > 9 ? (todaydate.getMonth()+1) : '0'+(todaydate.getMonth()+1)} / {todaydate.getFullYear()}</div>
                           <div className="text-xs mt-1">INVOICE# {invoiceNo} must appear on all invoices</div>
                        </div>
                     </div>
               </div>
            </div>
         </div>
      }
   </AuthLayout>
}
