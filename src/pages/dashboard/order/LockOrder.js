import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';


export default function LockOrder({text, order, fetchLists}) {
    
   const {Errors} = useContext(UserContext);
   const [status, setStatus] = useState('added');
   const [action, setaction] = useState();
     
   const [loading, setLoading] = useState(false);
   const lockOrder = () => {
      setLoading(true);
      const resp = Api.get(`/lock-order/${order._id}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status) {
            toast.success(res.data.message || res.data.msg || "Updated Successfully");
            fetchLists && fetchLists();
            setaction('close');
            setTimeout(() => {
            setaction();
            }, 1000);
         } else {
            toast.error(res.data.message || res.data.msg);
         }
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }

  return (
    <>
      <Popup action={action} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700" 
      btntext={text ? text :<>{order.lock ? "Unlock Order" : 'Lock Order'}</>} >
         <h2 className='text-white font-bold text-center text-lg '>{order.lock ? "Unlock Order" : 'Lock Order'}</h2>

         {order.lock ?
          <p className='text-white text-center my-4 text-lg'>After unlocking,   payment and order status can be updated.</p>
          :
          <p className='text-white text-center my-4 text-lg'>After locking the order, you <br></br>will not be able to update it.</p>
         }
         <div className='flex justify-center items-center'>
            <button onClick={lockOrder} className={`btn md mt-6 px-[50px] ${order.lock ? "bg-green-500" : 'bg-red-500'} text-black font-bold`}>{loading ? "Updating" : <>{order.lock ? "Unlock Order" : 'Lock Order'}</> }</button>
         </div>
      </Popup>
    </>
  )
}
