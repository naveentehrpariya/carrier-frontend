import React, { useContext, useEffect, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import TimeFormat from '../../common/TimeFormat';
import Loading from '../../common/Loading';
import { Link } from 'react-router-dom';
import Nocontent from '../../common/NoContent';
import Badge from '../../common/Badge';
export default function Orders() {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/order/listings`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.orders);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }

   useEffect(() => {
      fetchLists();
   }, []);


  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Orders</h2>
            <Link to="/order/add" className={"btn md text-black font-bold"} >Add New Order</Link>
         </div>

         {loading ? <p className='text-center py-12 px-12 text-center w-full text-gray-400'>Loading ...</p>
            :
            <>
            {lists && lists.length > 0 ? 
               <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
                  <table className='w-full p-2' cellPadding={'20'}>
                     <tr>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Order ID</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier / Driver</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Pickup and Delivery</th>
                        <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Created Date</th>
                     </tr>
                     {lists && lists.map((c, index) => {
                        return <tr key={`carriew-${index}`}>

                           <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>
                              <p className='whitespace-nowrap'>Order No. : {c.customer_order_no || "--"}</p>
                              <p>{c.company_name || "--"}</p>
                           </td>
                          
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <p>Customer : {c.customer?.name || "--"}</p>
                              <p className='mt-1'>Carrier : {c.carrier?.name || "--"}</p>
                           </td>
                           
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              {/* <p className='mb-1'>Order Status : <Badge classes="ms-2" status={c.order_status} /> </p> */}
                              <p className='mb-1'>Customer Payment : <Badge classes="ms-2" status={c.payment_status} /> </p>
                              <p className='mb-1'>Carrier Payment : <Badge classes="ms-2" status={c.carrier_payment_status} /> </p>
                           </td>
                          
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                               <Link className='text-main disabled' to="/">View Details</Link>
                           </td>
                        </tr>
                     })}
                     
                  </table>
               
               </div>
               : 
               <Nocontent text="No orders found" />
             }
            </>
         }
      </AuthLayout>
  )
}
