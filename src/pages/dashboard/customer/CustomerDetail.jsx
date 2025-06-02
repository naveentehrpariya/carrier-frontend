import React, { useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import OrdersFetch from '../order/OrdersFetch';
import CustomerOrders from './CustomerOrders';
import Loading from '../../common/Loading';
export default function CustomerDetail() {

   const [customer, setCustomer] = useState([]);
   const [loadCustomer, setLoadCustomer] = useState(false);
   const { id } = useParams();
   const fetchOrder = (search) => {
      setLoadCustomer(true);
      const resp = Api.get(`/customer/detail/${id}`);
      resp.then((res) => {
         if (res.data.status === true) {
            setCustomer(res.data.result);
         } else {
            setCustomer([]);
         }
         setLoadCustomer(false);
      }).catch((err) => {
         setLoadCustomer(false);
      });
   }

   useEffect(() => {
      fetchOrder();
   }, []);

  return (
      <AuthLayout> 
         {loadCustomer ? <Loading /> :
            <>
               <div id="profile" class="w-full mb-12">
                  <div class=" text-center lg:text-left">
                     <div class="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-48 w-48 bg-cover bg-center" ></div>
                     <h1 class="text-3xl text-white font-bold pt-8 lg:pt-0  capitalize">{customer?.name}</h1>
                     <div class="mx-auto lg:mx-0 w-4/5 pt-3 border-b-2 border-gray-500 opacity-25"></div>
                     
                     <p class="pt-4  flex items-center  text-white justify-center lg:justify-start">
                        </p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Address : {customer?.address}, {customer?.state}, {customer?.country}, {customer?.zipcode}</p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Phone : {customer?.phone},  {customer?.secondary_phone}</p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Email : {customer?.email},  {customer?.secondary_email}</p>
                     <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                        Assigned To : {customer?.assigned_to?.name}({customer?.assigned_to?.phone})</p>
                  </div>
               </div>
               <div className='text-file'>
                  <CustomerOrders type='customer' customerID={id} customer={customer} />
               </div>
            </>
         }
      </AuthLayout>
  )
}
