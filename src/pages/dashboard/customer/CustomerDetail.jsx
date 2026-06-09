import React, { useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import OrdersFetch from '../order/OrdersFetch';
import CustomerOrders from './CustomerOrders';
import Loading from '../../common/Loading';
import CustomerAccessControl from '../../../components/CustomerAccessControl';
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
      <CustomerAccessControl customerId={id}>
         <AuthLayout> 
            {loadCustomer ? <Loading /> :
               <>
                  <div id="profile" class="w-full mb-12">
                     <div class=" text-center lg:text-left">
                        <div class="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-48 w-48 bg-cover bg-center" ></div>
                        <h1 class="text-3xl text-white font-bold pt-8 lg:pt-0  capitalize">{customer?.name}</h1>
                        
                        <p class="pt-4  flex items-center  text-white justify-center lg:justify-start">
                           </p>
                        <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                           Address : {customer?.address}, {customer?.state}, {customer?.country}, {customer?.zipcode}</p>
                        <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                           Phone : {customer?.phone},  {customer?.secondary_phone}</p>
                        <p class="pt-2 text-white flex items-center justify-center lg:justify-start">
                           Email : {customer?.email},  {customer?.secondary_email}</p>
                        <div className="pt-2 text-white flex items-start justify-center lg:justify-start gap-1 flex-wrap">
                           <span className="text-gray-400 shrink-0">Assigned To:</span>
                           {Array.isArray(customer?.assigned_to) && customer.assigned_to.length > 0
                             ? customer.assigned_to.map((u, i) => u && (
                               <span key={u._id || i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium">
                                 {u.name}
                                 {u.is_admin === 1 && <span className="text-violet-300">(Admin)</span>}
                               </span>
                             ))
                             : <span className="text-gray-500 italic text-sm">None assigned</span>
                           }
                        </div>
                     </div>
                  </div>
                  <div className='text-file'>
                     <CustomerOrders type='customer' customerID={id} customer={customer} />
                  </div>
               </>
            }
         </AuthLayout>
      </CustomerAccessControl>
  )
}
