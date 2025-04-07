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
   const downloadPDF = () => {
      setDownloadingPdf(true);
     const input = pdfRef.current;
   //   input.style.backgroundColor = 'black';
     input.style.padding = '40px';
   //   const elementWithMargin = input.querySelector('.element-with-margin');
   //   if (elementWithMargin) {
   //     elementWithMargin.style.margin = '20px';
   //   }
 
   //   const buttons = input.querySelectorAll('button');
   //   buttons.forEach(button => {
   //     button.style.backgroundColor = 'transparent';
   //     button.style.border = "none";
   //   });
 
   //   const match_score = input.querySelectorAll('.match_score');
   //   match_score.forEach(button => {
   //     button.style.setProperty("background-color", "transparent", "important");
   //     button.style.border = "none";
   //   });
 
     html2canvas(input, {
       useCORS: true,
       allowTaint: true,
       logging: true,
       scale: 1
     }).then((canvas) => {
       const imgData = canvas.toDataURL("image/png");
       const pdf = new jsPDF("p", "mm", "a4");
       const pageWidth = pdf.internal.pageSize.getWidth();
       const pageHeight = pdf.internal.pageSize.getHeight();
       const canvasAspectRatio = canvas.width / canvas.height;
       const pageAspectRatio = pageWidth / pageHeight;
 
       let imgWidth = pageWidth;
       let imgHeight = pageWidth / canvasAspectRatio;
       if (imgHeight > pageHeight) {
         imgHeight = pageHeight;
         imgWidth = pageHeight * canvasAspectRatio;
       }
 
       const xPos = (pageWidth - imgWidth) / 2; // Center horizontally
       const yPos = 0; // Center vertically
 
 
       pdf.addImage(imgData, "PNG", xPos, yPos, imgWidth, imgHeight);
       pdf.save("download.pdf");
      //  input.style.backgroundColor = 'black'; // Reset to original (or '')
       input.style.padding = '10px';        // Reset to original (or '')
 
      //  buttons.forEach(button => {
      //    button.style.backgroundColor = '';
      //    button.style.border = "";
      //  });
   
      //  match_score.forEach(button => {
      //    button.style.backgroundColor = '';
      //    button.style.border = "none";
      //  });
      setDownloadingPdf(false);
     }).catch(error => {
       console.error("Error capturing canvas or generating PDF:", error);
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
         <h1 className='text-xl font-bold text-white mb-6 mt-4'>Order INVOICE #{order?.customer_order_no}</h1>
         <button className='bg-main px-4 py-2 rounded-xl text-sm' onClick={downloadPDF} >{downloadingPdf ? "Downloading..." : "Download PDF"}</button>
      </div>
      {loading ? <Loading /> : 
         <div  className='boltable  bg-white rounded-xl p-6 py-12'>
            <div ref={pdfRef} className='max-w-[800px] text-gray-700 m-auto'>
               <div className='bol-header p-3 ps-0 flex justify-between items-center '>
                  <div width="50%">
                     <div className='max-w-[400px]'>
                        <h2 className='font-bold text-2xl text-black capitalize'>{company?.name || "Cross Miles Carrier"}</h2>
                        <p className='capitalize' ><strong className='text-black'>{company?.address|| ''}</strong></p>
                        <p>{company?.email}</p>
                        <p>PH : {company?.phone}</p>
                     </div>
                  </div>
                   
                  <div className='d-flex justify-center'>
                     <div className='flex justify-center w-full'>
                     <Logotext black="true" />
                     </div>
                     <h3 className='uppercase font-bold text-xl text-center text-black'>INVOICE</h3>
                  </div>
               </div>

               <div className='flex w-full'>
                  <div className='p-3 border border-gray-300 mt-3 pt-4 w-full '>
                     <p className='font-bold text-black'>Bill To</p>
                     <p className=' text-black capitalize'>{order?.customer?.name}</p>
                     <p >Reference No. : {order?.customer?.customerCode}</p>
                     <p >Email : {order?.customer?.email}</p>
                     <p >Phone : {order?.customer?.phone}</p>
                     <p className='max-w-[400px] capitalize' ><p className='capitalize'>{order?.carrier?.location}, {order?.carrier?.state} ({order?.carrier?.country})</p></p>
                  </div>
                  <div className='p-3 border border-gray-300 mt-3 pt-4 w-full '>
                     <ul className=''>
                        <li className=' flex'><strong className='text-sm me-2 text-black'>Customer Order Number :</strong> <p className='font-bold'>#{order.customer_order_no}</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 text-black'>Invoice #:</strong> <p>{Date.now()}</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 text-black'>Invoice Date :</strong> <p><TimeFormat time={false} date={Date.now()} /></p> </li>
                        <li className=' flex'><strong className='text-sm me-2 text-black'>Amount :</strong> <p><Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p> </li>
                     </ul>
                  </div>
               </div>

               {order && order.shipping_details && order.shipping_details.map((s, index) => {
                  return <>
                  <div className='flex w-full'>
                     <div className='p-3 border border-gray-300 mt-3 pt-4 w-full '>
                           <ul className='flex flex-wrap w-full'>
                              <li className='w-full max-w-[100%] pb-[7px] flex flex-wrap items-center'><strong className='text-black text-sm'>Pickup Location :</strong> <p>{s?.pickupLocation}</p> </li>
                           </ul>
                           <p className='w-full pb-[7px]'><strong className='text-black text-sm'>Pickup Date : </strong>  
                           <TimeFormat time={false} date={s?.pickupDate} /> </p>
                     </div>
                     <div className='p-3 border border-gray-300 mt-3 pt-4 w-full '>
                           <p className='w-full max-w-[100%] pb-[7px] flex flex-wrap items-center'><strong className='text-black text-sm'>Delivery Location :</strong> <p>{s?.deliveryLocation}</p> </p>
                           <p className='w-full pb-[7px]'><strong className='text-black text-sm'>Delivery Date :</strong> 
                            <TimeFormat time={false} date={s?.deliveryDate} /> </p>
                     </div>
                  </div>
                  </>
               })}


               <div className='p-3 border border-gray-300 mt-3 pt-4 w-full flex   '>
                  <ul className='w-full grid grid-cols-3'>
                     <li className=' flex'><strong className='text-sm me-2 text-black'>Order :</strong> <p>CMC{order.serial_no}</p> </li>
                     {/* <li className=' flex'><strong className='text-sm me-2 text-black'>Order Number #:</strong> <p>{order.customer_order_no}</p> </li> */}
                     <li className=' flex'><strong className='text-sm me-2 text-black'>Order Status :</strong> <p>
                        <Badge title={true} status={order?.order_status} /> </p> </li>
                     <li className=' flex'><strong className='text-sm me-2 text-black'>Amount :</strong> <p><Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></p> </li>
                  </ul>
                  {/* <ul className='w-full'>
                     <li className=' flex'><strong className='text-sm me-2 text-black'>Order Number #:</strong> <p>{order.customer_order_no}</p> </li>
                     <li className=' flex'><strong className='text-sm me-2 text-black'>Order Status :</strong> <p>
                        <Badge title={true} status={order?.order_status} /> </p> </li>
                     <li className=' flex'><strong className='text-sm me-2 text-black'>Amount :</strong> <p><Currency amount={order?.carrier_amount || 0} currency={order?.revenue_currency || 'cad'} /></p> </li>
                  </ul> */}
               </div>


               <div className='p3  mt-3 pt-4 w-full flex  sborder sborder-gray-300 '>
                  <ul className='w-full'>
                  </ul>
                  <ul className='w-full border border-gray-300 p-3'>
                     <table border={'1'} className='w-full text-start'>
                        <tr>
                           <th align='left' className='text-black'>Charges</th>
                           <th align='left ' className='text-black'>Amount</th>
                        </tr>
                           {/* {order && order.revenue_items &&
                              <>
                                    {order && order.revenue_items && order.revenue_items.map((r, index) => {
                                       return <>
                                       <tr>
                                          <td><strong className='text-sm text-black'>{r.revenue_item} - <span className='capitalize'>{r.rate_method}</span></strong></td>
                                          <td><Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                       </tr>
                                       </>
                                    })}
                              </>
                           } */}
                        <tr>
                           <td><strong className='text-sm text-black text-xl'>Total</strong></td>
                           <td className='font-bold text-black'><Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /></td>
                        </tr>
                     </table>
                  </ul>
               </div>

                
            </div>
         </div>
      }
   </AuthLayout>
}
