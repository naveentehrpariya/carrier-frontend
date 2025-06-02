import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';

export default function UpdatePaymentStatus({order, id, classes, fetchLists, paymentType, text, pstatus, pmethod, pnotes}) {
   
   const statuses = [
      {
         name: "pending"
      },
      {
         name: "paid"
      },
      {
         name: "initiated"
      },
      {
         name: "failed"
      },
      {
         name: "refunded"
      }
   ];
   const methods = [
      {
         name: "Cheque"
      },
      {
         name: "Online"
      },
      {
         name: "Others"
      } 
   ];

   const {Errors, user} = useContext(UserContext);
   const [type, setType] = useState(paymentType);
   const [method, setmethod] = useState(pmethod || 'cheque');
   const [status, setStatus] = useState( pstatus || 'pending');
   const [notes, setNotes] = useState( pnotes || '');
   const [action, setaction] = useState();
   const [loading, setLoading] = useState(false);

   const updateStatus = () => {
      setLoading(true);
      const resp = Api.post(`/account/order/update/payment/${id}/${type === 1 ? 'customer' : 'carrier'}`, {
         status, method, notes 
      });
      resp.then((res) => {
         setLoading(false);
         if (res.data.status) {
            toast.success(res.data.message);
            fetchLists && fetchLists();
            setaction('close');
            setTimeout(() => {
            setaction();
            }, 1000);
         } else {
            toast.error(res.data.message);
         }
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }

  return (
    <>
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={`${classes} p-3  w-full text-start rounded-xl text-gray-700 whitespace-nowrap flex items-center`} btntext={text || "Update Status"} >
         <h2 className='text-white font-bold text-xl'>Update {type === 1 ? 'Customer' : 'Carrier'} Payment Status</h2>
         <div className='grid sm:grid-cols-2 gap-4'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Payment Status {pmethod}</label>
               <select defaultValue={status}  onChange={(e)=>setStatus(e.target.value)} name='payment_status' className="focus:outline-0 capitalize input-sm" >
               <option selected disabled className='text-black capitalize'>Choose Payment Status</option>
                  {statuses && statuses.map((c, i)=>{
                     return <option value={c.name} className='text-black capitalize'>{c.name}</option>
                  })}
               </select>
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Payment method</label>
               <select defaultValue={method} onChange={(e)=>setmethod(e.target.value)} name='payment_method' className="focus:outline-0 capitalize input-sm" >
               <option selected disabled className='text-black'>Choose Payment method</option>
                  {methods && methods.map((c, i)=>{
                     return <option value={c.name} className='text-black capitalize'>{c.name}</option>
                  })}
               </select>
            </div>
         </div>
         <div className='input-item mt-4'>
            <textarea defaultValue={notes} onChange={(e)=>setNotes(e.target.value)} placeholder='Notes' className='bg-dark border border-gray-700 rounded-2xl w-full p-4 text-white focus:outline-0' rows='3'></textarea>
         </div>

                
         {paymentType === 1 && !order?.customer_payment_approved_by_admin && user && user?.is_admin && order?.customer_payment_date ?
            <div class="bg-red-100 rounded-xl border-t border-b border-red-500  text-red-800 px-4 mt-3 py-3" role="alert">
               <p className='capitalize   '>Customer payment status of this order is set to <span className='font-bold'>{status}.</span></p>
               <p className='text-red-400 text-sm capitalize '>Updated By : {order?.customer_payment_updated_by?.name} {order?.customer_payment_updated_by?.position ? `(${order?.customer_payment_updated_by?.position})` : ''} </p>
            </div>
         : ''}

         {paymentType === 2 && !order?.carrier_payment_approved_by_admin && user && user?.is_admin && order?.carrier_payment_date ?
            <div class="bg-red-100 rounded-xl border-t border-b border-red-500  text-red-800 px-4 mt-3 py-3" role="alert">
               <p className='capitalize   '>Carrier payment status of this order is set to <span className='font-bold'>{status}.</span></p>
               <p className='text-red-400 text-sm capitalize '>Updated By : {order?.carrier_payment_updated_by?.name} {order?.carrier_payment_updated_by?.position ? `(${order?.carrier_payment_updated_by?.position})` : ''} </p>
            </div>
         : ''}



         {paymentType === 1 && order?.customer_payment_approved_by_admin == 1 && order?.customer_payment_date ?
            <p className='capitalize text-green-500 text-center mt-4 '>Payment Status {status} is Approved by Admin.</p>
         : ''}

         {paymentType === 2 && order?.carrier_payment_approved_by_admin == 1 && order?.carrier_payment_date ?
            <p className='capitalize text-green-500 text-center mt-4   '>Payment Status {status} is Approved by Admin.</p>
         : ''}


        {paymentType === 2 ?
         <>
            <div className='flex justify-center items-center'>
               {user && user?.is_admin && order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ?
                     <button onClick={updateStatus} className="btn md mt-6 px-[50px] main-btn !bg-green-600 text-white capitalize font-bold">{loading ? "Updating..." : `Approve ${status} Status`}</button>
                  :
                  <>
                  {order?.carrier_payment_approved_by_admin &&  user && !user?.is_admin ? '' : 
                     <button onClick={updateStatus} className={`btn md mt-6 px-[50px] main-btn text-black font-bold`}>{loading ? "Updating..." : "Update"}</button>
                  }
                  </>
               }
            </div>
         </>
         :
         <>
         <div className='flex justify-center items-center'>
            {user && user?.is_admin && order?.customer_payment_date && !order?.customer_payment_approved_by_admin ?
               <button onClick={updateStatus} className="btn md mt-6 px-[50px] main-btn !bg-green-600 text-white capitalize font-bold">{loading ? "Updating..." : `Approve ${status} Status`}</button>
               :
               <>
               {order?.customer_payment_approved_by_admin && user && !user?.is_admin ? ''
                  :
                  <button  onClick={updateStatus} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Updating..." : "Update"}</button>
               }
               </>
            }
         </div>
         </>
         }


      </Popup>
    </>
  )
}
