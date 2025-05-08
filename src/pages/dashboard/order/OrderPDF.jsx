import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import Badge from '../../common/Badge';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Loading from '../../common/Loading';
import html2pdf from 'html2pdf.js';

export default function OrderPDF() {
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors, company} = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const pdfRef = useRef();
   const input = pdfRef.current;
   const downloadPDF = () => {
      setDownloadingPdf(true);
    
      // Scroll to top to ensure all content is rendered
      window.scrollTo(0, 0);
    
      // Hide elements not needed in PDF
      const buttons = document.querySelectorAll('#revanue');
      buttons.forEach(button => {
        button.style.display = 'none';
      });
    
      const element = pdfRef.current;
      if (!element) {
        console.error("Element with ID 'content' not found.");
        setDownloadingPdf(false);
        return;
      }
    
      const opt = {
        margin:       10,
        filename:     'download.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 5 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };
    
      html2pdf().set(opt).from(element).save().then(() => {
        // Restore hidden elements after PDF generation
        buttons.forEach(button => {
          button.style.display = 'block';
        });
        setDownloadingPdf(false);
      }).catch(error => {
        console.error("Error generating PDF:", error);
        setDownloadingPdf(false);
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
         <h1 className='text-xl font-bold text-white mb-6 mt-4'>Customer Order #{order?.customer_order_no}</h1>
         <button className='bg-main px-4 py-2 rounded-xl text-normal test' onClick={downloadPDF} >{downloadingPdf ? "Downloading..." : "Download PDF"}</button>
      </div>
      {loading ? <Loading /> : 
         <div  className='boltable bg-white rounded-xl p-6  ' >
            <div ref={pdfRef} className='max-w-[794px] m-auto text-gray-700 m-auto text-sm'>
               <div className='bol-header flex justify-between items-center mb-6'>
                  <div width="50%">
                     <h2 className='font-bold text-3xl text-black capitalize'>Cross Miles Carrier</h2>
                     <p className='flex mb-2'><p className='capitalize' >{company?.address}</p></p>
                  </div>
                  <div className='d-flex justify-center'>
                     <div className='flex justify-center w-full'>
                     <Logotext black={true} />
                     </div>
                     <h3 className='uppercase mt-1 font-bold text-lg text-center text-black'>Rate confirmation</h3>
                  </div>
               </div>

               <div className='p-3 border border-gray-400 mt-8'>
                  <ul className='grid grid-cols-3 gap-2'>
                     <li className=''><strong className=''>Order # :</strong> <p>CMC{order?.serial_no}</p> </li>
                     <li className=''><strong className=''>Total Distance :</strong> <p>{order.totalDistance || '0'} Miles</p> </li>
                     <li className=''><strong className=''>Order Created Date :</strong> <p><TimeFormat date={order?.createdAt} /></p> </li>
                     {/* <li className=''><strong>Order Status :</strong> <p><Badge title={true} status={order?.order_status} /></p> </li> */}
                  </ul>
               </div>

               <div className='orderFill pt-4 flex justify-between mt-6'>
                  <div className='customerDetails border border-gray-400 border-r-0 p-4 w-full'>
                     <p className='font-bold text-lg text-black mb-2'>Customer Details</p>
                     <ul className=''>
                        <li className='flex mb-2'><p><strong className='text-normal test me-2 !text-gray-700'>Customer Name:</strong> {company?.name}</p> </li>
                        <li className='flex mb-2'><p><strong className='text-normal test me-2 !text-gray-700'>Customer Phone :</strong>  {company?.phone}</p> </li>
                        <li className='flex mb-2'><p><strong className='text-normal test me-2 !text-gray-700'>Customer Email :</strong>  {company?.email}</p> </li>
                        <li className='flex mb-2'><p className='capitalize' ><strong className='text-normal test me-2 !text-gray-700'>Address :</strong>{company?.address}</p></li>
                     </ul>
                  </div>
                  <div className='customerDetails border border-gray-400 p-4 w-full'>
                     <p className='font-bold text-lg text-black mb-2'>Carrier Details</p>
                     <ul className=''>
                        <li className=' flex mb-2'><strong className='text-normal test me-2 !text-gray-700'>Carrier Name:</strong> <p>{order?.carrier?.name}(MC{order?.carrier?.mc_code})</p> </li>
                        <li className=' flex mb-2'><strong className='text-normal test me-2 !text-gray-700'>Carrier Phone :</strong> <p>{order?.carrier?.phone}{order?.carrier?.secondary_phone ? `, ${order?.carrier?.secondary_phone}` :''}</p> </li>
                        <li className=' flex mb-2'> <p> <strong className='text-normal test me-2 !text-gray-700'>Carrier Email :</strong> {order?.carrier?.email}{order?.carrier?.secondary_email ? `, ${order?.carrier?.secondary_email}` :''}</p> </li>
                        <li className='flex mb-2'><p className='capitalize' ><strong className='text-normal test me-2 !text-gray-700'>Address :</strong>{order?.carrier?.location}</p></li>
                     </ul>
                  </div>
               </div>

               {order && order.shipping_details && order.shipping_details.map((s, index) => {
                  return <>
                     <div className='orderFill p-3 border border-gray-400 mt-8 pt-4'>
                        <ul className='flex items-center justify-between pe-6'>
                           <li className='flex items-center'><strong>Shipment No : </strong> <p>#{index+1}</p> </li>
                           <li className='flex items-center capitalize'><strong>Commudity : </strong> <p>{s?.community?.value}</p> </li>
                           <li className='flex items-center capitalize'><strong>Equipments : </strong> <p>{s?.equipment?.value}</p> </li>
                           <li className='flex items-center'><strong>Weight : </strong> <p>{s?.weight || 'N/A'} {s?.weight_unit ||''}</p> </li>
                        </ul>

                        <p className='font-bold text-lg text-black pt-6 mb-2 '>Shipment Pickup Details</p>
                        {s?.pickup && s?.pickup.length > 0 && s?.pickup.map((p, pindex) => {
                           return <>
                              <ul className='flex flex-wrap'>
                                 <li className='mr-[30px] flex items-center'><strong className='text-black text-normal test'>Pickup No : </strong> <p className='ps-1'>#{pindex+1}</p> </li>
                                 <li className='mr-[30px] flex items-center'><strong className='text-black text-normal test'>Pickup Reference No : </strong> <p className='ps-1'>{p?.referenceNo}</p> </li>
                                 <li className='mr-[30px] flex items-center'><strong className='text-black text-normal test'>Pickup Appointement : </strong> <p className='ps-1'>{p?.appointment ? "Yes" : "No"}</p> </li>
                                 <li className='mr-[30px] flex items-center'>
                                    <strong className='text-black text-normal test'>Pickup Date : </strong> 
                                    <p className='ps-1'><TimeFormat time={false} date={p?.date} /></p> 
                                 </li>
                                 <li className='w-full pb-[7px] flex items-center'>
                                    <strong className='text-black text-normal test'>Pickup Location : </strong> 
                                    <p className='ps-1'>{p?.location}</p> 
                                 </li>
                              </ul> 
                             
                           </>
                        })}

                        <p className='font-bold text-lg text-black pt-6 mb-1 '>Shipment Delivery Details</p>
                        {s?.delivery && s?.delivery.length > 0 && s?.delivery.map((p, pindex) => {
                           return <>
                              <ul className='flex flex-wrap'>
                                 <li className='mr-[30px] flex items-center'><strong className='text-black text-normal test'>Delivery No : </strong> <p className='ps-1'>#{pindex+1}</p> </li>
                                 <li className='mr-[30px] flex items-center'><strong className='text-black text-normal test'>Delivery Reference No : </strong> <p className='ps-1'>{p?.referenceNo}</p> </li>
                                 <li className='mr-[30px] flex items-center'><strong className='text-black text-normal test'>Delivery Appointement : </strong> <p className='ps-1'>{p?.appointment ? "Yes" : "No"}</p> </li>
                                 <li className='mr-[30px] flex items-center'>
                                    <strong className='text-black text-normal test'>Delivery Date : </strong> 
                                    <p className='ps-1'><TimeFormat time={false} date={p?.date} /></p> 
                                 </li>
                                 <li className='w-full pb-[7px] flex items-center'>
                                    <strong className='text-black text-normal test'>Delivery Location : </strong> 
                                    <p className='ps-1'>{p?.location}</p> 
                                 </li>
                              </ul> 
                           </>
                        })}
                     </div>
                  </>
               })}

               {order && order.carrier_revenue_items &&
                  <div id='revanue' className='orderFill py-3 mt-3 pt-4'>
                     <p className='font-bold text-black text-xl mb-2'>Revenue Items</p>
                     {order && order.carrier_revenue_items && order.carrier_revenue_items.map((r, index) => {
                        return <>
                           <ul className='flex justify-between mb-4  '>
                              <li className='flex items-center w-[32%]'><strong>Item :</strong> <p className='ps-2'>{r?.revenue_item}</p> </li>
                              <li className='flex items-center w-[32%]'><strong>Note/Comment : </strong  > <p className='capitalize ps-2'>{r?.note}</p> </li>
                              <li className='flex items-center w-[32%]'><strong>Rate : </strong  > <p className='capitalize ps-2'><Currency  onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}*{r?.quantity || 0}</p> </li>
                              <li className='flex items-center whitespace-nowrap'><strong>Sub Total : </strong> <p className='ps-2'><Currency amount={r?.rate*r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></p> </li>
                           </ul>
                        </>
                     })}
                  </div>
               }

               <div className='flex justify-end p-3'>
                  <div className='py-3'>
                     {/* <h2 className='font-bold text-black text-xl text-right'>Total : <Currency amount={order?.total_amount || 0} currency={order?.revenue_currency || 'cad'} /> </h2> */}
                     <h2 className='font-bold text-black text-xl text-right'>Order Total : <Currency amount={order?.carrier_amount || 0} currency={order?.revenue_currency || 'cad'} /> </h2>
                  </div>
               </div>
            </div>
         </div>
      }
   </AuthLayout>
}
