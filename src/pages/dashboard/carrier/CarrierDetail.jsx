import React, { useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import CarrierOrders from './CarrierOrders';
import Loading from '../../common/Loading';

export default function CarrierDetail() {

   const [carrier, setCarrier] = useState([]);
   const [loadcarrier, setLoadcarrier] = useState(false);
   const { id } = useParams();

   const fetchOrder = (search) => {
      setLoadcarrier(true);
      const resp = Api.get(`/carrier/detail/${id}`);
      resp.then((res) => {
         if (res.data.status === true) {
            setCarrier(res.data.result);
         } else {
            setCarrier([]);
         }
         setLoadcarrier(false);
      }).catch((err) => {
         setLoadcarrier(false);
      });
   }

   useEffect(() => {
      fetchOrder();
   }, []);

  return (
      <AuthLayout> 
         {loadcarrier ? <Loading /> :
            <>
               <div id="profile" class="w-full mb-12">
                  <div class=" text-center lg:text-left">
                     <div class="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-48 w-48 bg-cover bg-center" ></div>
                     <h1 class="text-3xl text-white font-bold pt-8 lg:pt-0  capitalize">{carrier?.name}</h1>
                     <div class="mx-auto lg:mx-0 w-4/5 pt-3 border-b-2 border-gray-500 opacity-25"></div>
                     <p class="pt-4  flex items-center  text-white justify-center lg:justify-start">
                        </p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Address : {carrier?.address} {carrier?.state}, {carrier?.country} {carrier?.zipcode}</p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Phone : {carrier?.phone},  {carrier?.secondary_phone}</p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Email : {carrier?.email},  {carrier?.secondary_email}</p>
                  </div>
               </div>
               <div className='text-file'>
                  <CarrierOrders type='carrier' carrierID={id} carrier={carrier} />
               </div>
            </>
         }
      </AuthLayout>
  )
}
