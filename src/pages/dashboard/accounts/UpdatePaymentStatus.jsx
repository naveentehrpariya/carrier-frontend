import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';

export default function UpdatePaymentStatus({id, item, fetchLists, paymentType, text, pstatus, pmethod, pnotes}) {
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

   const {Errors} = useContext(UserContext);
   const [type, setType] = useState(paymentType);
   const [method, setmethod] = useState(pmethod || 'Cheque');
   const [status, setStatus] = useState( pstatus || 'pending');
   const [notes, setNotes] = useState( pnotes || '');
   const [action, setaction] = useState();
   const [loading, setLoading] = useState(false);

   const updateStatus = () => {
      setLoading(true);
      const resp = Api.post(`/account/order/update/${id}/${type === 1 ? 'customer' : 'carrier'}`, {
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
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700" btntext={text || "Update Status"} >
         <h2 className='text-white font-bold'>Update {type === 1 ? 'Customer' : 'Carrier'} Payment Status</h2>
         {/* <div>
            <label className="mt-4 block text-sm mb-2  text-gray-400">Choose Payment Type</label>
            <div className='flex justify-start mb-2'>
               <button className={`me-2 ${type === 1 ? 'bg-main text-black' : 'bg-gray-300'} rounded-[20px] min-w-[120px] !text-[15px] text-center px-4 py-2`} onClick={(e)=>setType(1)} > Customer Payment</button>
               <button className={`me-2 ${type === 2 ? 'bg-main text-black' : 'bg-gray-300'} rounded-[20px] min-w-[120px] !text-[15px] text-center px-4 py-2`} onClick={(e)=>setType(2)} >Carrier Payment</button>
            </div>
         </div> */}
         <div className='grid sm:grid-cols-2 gap-4'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Payment Status {pmethod}</label>
               <select defaultValue={status}  onChange={(e)=>setStatus(e.target.value)} name='payment_status' className="input-sm" >
               <option selected disabled className='text-black'>Choose Payment Status</option>
                  {statuses && statuses.map((c, i)=>{
                     return <option value={c.name} className='text-black capitalize'>{c.name}</option>
                  })}
               </select>
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Payment method</label>
               <select defaultValue={method} onChange={(e)=>setmethod(e.target.value)} name='payment_method' className="input-sm" >
               <option selected disabled className='text-black'>Choose Payment method</option>
                  {methods && methods.map((c, i)=>{
                     return <option value={c.name} className='text-black capitalize'>{c.name}</option>
                  })}
               </select>
            </div>
         </div>
         <div className='input-item mt-4'>
            <textarea defaultValue={notes} onChange={(e)=>setNotes(e.target.value)} placeholder='Notes' className='bg-dark border border-gray-700 rounded-2xl w-full p-4 text-white' rows='3'></textarea>
         </div>
         <div className='flex justify-center items-center'>
            <button  onClick={updateStatus} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
         </div>
      </Popup>
    </>
  )
}
