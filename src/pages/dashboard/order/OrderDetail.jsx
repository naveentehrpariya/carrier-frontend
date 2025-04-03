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

export default function OrderDetail() {
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors} = useContext(UserContext);
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
 
     const buttons = input.querySelectorAll('#revanue');
     buttons.forEach(button => {
      button.style.display = 'none';
     });
 
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
 
       buttons.forEach(button => {
         button.style.display = 'block';
       });
   
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

   console.log("order",order);

   return <AuthLayout>
      <div className='flex justify-between items-center'>
         <h1 className='text-xl font-bold text-white mb-6 mt-4'>Customer Order #{order?.customer_order_no}</h1>
         <button className='bg-main px-4 py-2 rounded-xl text-sm' onClick={downloadPDF} >{downloadingPdf ? "Downloading..." : "Download PDF"}</button>
      </div>
      {loading ? <Loading /> : 
         <div  className='boltable  bg-white rounded-xl p-6  ' >
            <div ref={pdfRef} className='w-[1200px] text-gray-700 m-auto'>
               <div className='bol-header p-3 flex justify-between items-center '>
                  <div width="50%">
                     <h2 className='font-bold text-2xl text-black capitalize'>{order?.carrier?.name}</h2>
                     <p ><strong className='text-black'>CARRIR ID #: {order?.carrier?.carrierID}</strong></p>
                     <p ><strong className='uppercase'>{order?.carrier?.location}  ({order?.carrier?.country}, {order?.carrier?.zipcode}) </strong></p>
                  </div>
                  <div className='d-flex justify-center'>
                     <div className='flex justify-center w-full'>
                     <Logotext />
                     </div>
                     <h3 className='uppercase font-bold text-xl text-center text-black'>Rate confirmation</h3>
                  </div>
               </div>

               <div className='p-3 border-t border-gray-300 mt-3 pt-4'>
                  <ul className='grid grid-cols-4 gap-2'>
                     <li className=''><strong>Order # :</strong> <p>{order?.serial_no}</p> </li>
                     <li className=''><strong>Order Created Date :</strong> <p><TimeFormat date={order?.createdAt} /></p> </li>
                     {/* <li className=''><strong>Order Status :</strong> <p><Badge title={true} status={order?.order_status} /></p> </li> */}
                     <li className=''><strong>Total Distance :</strong> <p>{order.totalDistance} Miles</p> </li>
                  </ul>
               </div>

               <div className='orderFill p-3 border-t border-gray-300 mt-3 pt-4 flex justify-between'>
                  <div className='customerDetails'>
                     <p className='font-bold text-black mb-2'>Customer Details</p>
                     {/* <ul className=''>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer Name:</strong> <p>{order?.customer?.name}</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer ID:</strong> <p>{order?.customer?.customerID}</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer Phone :</strong> <p>{order?.customer?.phone}</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer Email :</strong> <p>{order?.customer?.email}</p> </li>
                     </ul> */}
                     <ul className=''>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer Name:</strong> <p>Capital Logistics</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer Phone :</strong> <p>+45 454524545</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Customer Email :</strong> <p>info@cpaitallogistics.com</p> </li>
                     </ul>
                  </div>
                  <div className='customerDetails'>
                     <p className='font-bold text-black mb-2'>Carrier Details</p>
                     <ul className=''>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Carrier Name:</strong> <p>{order?.carrier?.name}(MC{order?.carrier?.mc_code})</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Carrier Phone :</strong> <p>{order?.carrier?.phone}</p> </li>
                        <li className=' flex'><strong className='text-sm me-2 !text-gray-700'>Carrier Email :</strong> <p>{order?.carrier?.email}</p> </li>
                     </ul>
                  </div>
                  <div className='customerDetails'>
                     {/* <p className='font-bold text-black mb-2'>Payment Status</p>
                     <ul className=''>
                        <li className=' flex items-center'><strong className='text-sm !text-gray-700'>Payment Status:</strong> <p><Badge title={true} status={order?.carrier_payment_status} /></p> </li>
                        <li className=' flex items-center capitalize'><strong className='text-sm me-1 !text-gray-700'>Payment Method:</strong> <p>{order?.carrier_payment_method}</p> </li>
                     </ul> */}
                  </div>
               </div>

               {order && order.shipping_details && order.shipping_details.map((s, index) => {
                  return <>
                     <div className='orderFill p-3 border-t border-gray-300 mt-3 pt-4'>
                        <ul className='grid grid-cols-6 gap-2'>
                           <li className=''><strong>Shipment No.:</strong> <p>#{index+1}</p> </li>
                           <li className='capitalize '><strong>Commudity :</strong> <p>{s?.community}</p> </li>
                           <li className='capitalize '><strong>Equipments :</strong> <p>{s?.equipment?.value}</p> </li>
                           <li className=''><strong>Weight :</strong> <p>{s?.weight || 'N/A'} {s?.weight_unit || ''}</p> </li>
                        </ul>
                        
                        <p className='font-bold text-black pt-4 '>Shipment Pickup Details</p>
                        <ul className='flex flex-wrap w-full'>
                           <li className='w-full max-w-[100%] pb-[7px] flex flex-wrap items-center'><strong className='text-black text-sm'>Pickup Location :</strong> <p>{s?.pickupLocation}</p> </li>
                        </ul>
                        <ul className='grid grid-cols-4 w-full'>
                           <li className='w-full pb-[7px]'><strong className='text-black text-sm'>Pickup Reference No. :</strong> <p>{s?.pickupReferenceNo}</p> </li>
                           <li className='w-full pb-[7px]'><strong className='text-black text-sm'>Pickup Appointement : </strong> <p>{s?.pickupAppointment ? "Yes" : "No"}</p> </li>
                           <li className='w-full pb-[7px]'><strong className='text-black text-sm'>Pickup Date :</strong> 
                           <p><TimeFormat time={false} date={s?.pickupDate} /></p> </li>
                        </ul>
                        <p className='font-bold text-black pt-4 '>Shipment Delivery Details</p>
                        <ul className='flex flex-wrap w-full'>
                           <li className='w-full max-w-[100%] pb-[7px] flex flex-wrap items-center'><strong className='text-black text-sm'>Delivery Location :</strong> <p>{s?.deliveryLocation}</p> </li>
                        </ul>
                        <ul className='grid grid-cols-4 w-full'>
                           <li className='w-full pb-[7px]'><strong className='text-black text-sm'>Delivery Reference No. :</strong> <p>{s?.deliveryReferenceNo}</p> </li>
                           <li className='w-full pb-[7px]'><strong className='text-black text-sm'>Delivery Appointement : </strong> <p>{s?.deliveryAppointment?.value ? "Yes": "No"}</p> </li>
                           <li className='w-full pb-[7px]'><strong className='text-black text-sm'>Delivery Date :</strong> 
                           <p><TimeFormat time={false} date={s?.deliveryDate} /></p> </li>
                        </ul>
                           
                           
                     </div>
                  </>
               })}

               {order && order.revenue_items &&
                  <div id='revanue' className='hidden orderFill p-3 border-t border-gray-300 mt-3 pt-4'>
                     <p className='font-bold text-black text-xl mb-2'>Revenue Items</p>
                     {order && order.revenue_items && order.revenue_items.map((r, index) => {
                        return <>
                           <ul className='flex justify-between mb-4  '>
                              <li className='flex items-center w-[32%]'><strong>Revenue Item:</strong> <p className='ps-2'>{r.revenue_item}</p> </li>
                              <li className='flex items-center w-[32%]'><strong>Rate method </strong  > <p className='capitalize ps-2'>{r.rate_method}</p> </li>
                              <li className='flex items-center w-[32%]'><strong>Rate </strong> <p className='ps-2'><Currency amount={r?.rate || 0} currency={order?.revenue_currency || 'cad'} /></p> </li>
                           </ul>
                        </>
                     })}
                  </div>
               }
               <div className='flex justify-start p-3'>
                  <div>
                     {/* <h2 className='font-bold text-black text-xl text-right'>Total : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /> </h2> */}
                     <h2 className='font-bold text-black text-xl text-right'>Total : <Currency amount={order?.carrier_amount || 0} currency={order?.revenue_currency || 'cad'} /> </h2>
                  </div>
               </div>
            </div>
         </div>
      }
   </AuthLayout>
}
