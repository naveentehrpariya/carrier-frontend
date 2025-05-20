import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';

export default function UpdateOrderStatus({id, fetchLists, text}) {
   
   const statuses = [
      {
         name: "completed"
      },
      {
         name: "intransit"
      },
      {
         name: "added"
      }
   ];
   
   const {Errors} = useContext(UserContext);
   const [status, setStatus] = useState('added');
   const [action, setaction] = useState();
   const [loading, setLoading] = useState(false);

   const updateStatus = () => {
      setLoading(true);
      const resp = Api.post(`/account/order-status/${id}`, {
         status
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
      <Popup action={action} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 flex items-center" btntext={text || "Update Status"} >
         <h2 className='text-white font-bold'>Update Order Status</h2>
         <div className='grid  gap-4'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Order Status</label>
               <select  onChange={(e)=>setStatus(e.target.value)} name='payment_status' className="input-sm focus:outline-none capitalize" >
               <option selected disabled className='text-black'>Choose Order Status</option>
                  {statuses && statuses.map((c, i)=>{
                     return <option value={c.name} className='text-black capitalize'>{c.name}</option>
                  })}
               </select>
            </div>
            
         </div>
         <div className='flex justify-center items-center'>
            <button  onClick={updateStatus} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Updating..." : "Update"}</button>
         </div>
      </Popup>
    </>
  )
}
