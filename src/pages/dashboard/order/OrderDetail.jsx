import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';

export default function OrderDetail() {
   
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const {Errors} = useContext(UserContext);
   const { id } = useParams();

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
      <h1>Order Detail</h1>
      <div className='boltable   bg-gray-100 rounded-xl p-6'>
         <div className='max-w-[1200px] text-gray-700 m-auto'>
            <div className='bol-header p-3 flex justify-between items-center'>
               <div width="50%">
                  <h2 className='font-bold text-2xl text-black'>Cross Miles Carrier</h2>
                  <p ><strong className='text-black'>CARRIR ID #: 7889285</strong></p>
                  <p className='uppercase strong'>96 KENNY ROAD south</p>
                  <p className='capitalize'>Brampton, Ontario, L6T 1Y7</p>
                  <p className='capitalize'>PH. (416) 468-7791</p>
               </div>
               <div className='d-flex justify-center'>
                  <div className='flex justify-center w-full'>
                  <Logotext />
                  </div>
                  <h3 className='uppercase font-bold text-xl text-center text-black'>Order Dispatch Sheet</h3>
               </div>
            </div>
            <div className='orderFill p-3 border-t border-gray-300 mt-3 pt-4'>
               <ul className='grid grid-cols-4 gap-2'>
                  <li className=''><strong>Shipment No.:</strong> <p>#1</p> </li>
                  <li className=''><strong>Order # :</strong> <p>145412</p> </li>
                  <li className=''><strong>Commudity # :</strong> <p>Mobile</p> </li>
                  <li className=''><strong>Equipments # :</strong> <p>Packets</p> </li>
                  <li className=''><strong>Weight # :</strong> <p>200 KG</p> </li>
                  <li className=''><strong>Total Distance # :</strong> <p>200 KM</p> </li>
               </ul>
               
               <p className='font-bold text-black pt-4 '>Shipment Pickup Details</p>
               <ul className='flex flex-wrap w-full'>
                  <li className='w-full max-w-[100%] pb-[7px]'><strong className='text-black text-sm'>Pickup Location :</strong> <p>96 KENNY ROAD south Brampton, Ontario, L6T 1Y7</p> </li>
               </ul>
               <ul className='flex flex-wrap w-full'>
                  <li className='w-full max-w-[33%] pb-[7px]'><strong className='text-black text-sm'>Pickup Reference No. :</strong> <p>7814577</p> </li>
                  <li className='w-full max-w-[33%] pb-[7px]'><strong className='text-black text-sm'>Pickup Appointement : </strong> <p>Yes</p> </li>
                  <li className='w-full max-w-[33%] pb-[7px]'><strong className='text-black text-sm'>Pickup Date :</strong> <p>12 July 2025</p> </li>
               </ul>
               <p className='font-bold text-black pt-4 '>Shipment Delivery Details</p>
               <ul className='flex flex-wrap w-full'>
                  <li className='w-full max-w-[100%] pb-[7px]'><strong className='text-black text-sm'>Delivery Location :</strong> <p>96 KENNY ROAD south Brampton, Ontario, L6T 1Y7</p> </li>
               </ul>
               <ul className='flex flex-wrap w-full'>
                  <li className='w-full max-w-[33%] pb-[7px]'><strong className='text-black text-sm'>Delivery Reference No. :</strong> <p>7814577</p> </li>
                  <li className='w-full max-w-[33%] pb-[7px]'><strong className='text-black text-sm'>Delivery Appointement : </strong> <p>Yes</p> </li>
                  <li className='w-full max-w-[33%] pb-[7px]'><strong className='text-black text-sm'>Delivery Date :</strong> <p>12 July 2025</p> </li>
               </ul>
                  
                  
            </div>
         </div>
      </div>
   </AuthLayout>
}
