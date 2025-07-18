import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';


export default function RemoveOrder({text, order, fetchLists}) {
    
   const {Errors} = useContext(UserContext);
   const [action, setaction] = useState();
     
   const [loading, setLoading] = useState(false);
   const remove = () => {
      setLoading(true);
      const resp = Api.get(`/delete-order/${order._id}`);
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
      btntext={text ? text :<>Delete Order</>} >
         <h2 className='text-white font-bold text-center text-lg '>Delete Order Permanently ?</h2>
         <p className='text-white text-center my-4 text-lg'>Are you sure you want to delete this order? <br></br> This action cannot be undone.</p>
         <div className='flex justify-center items-center'>
            <button onClick={remove} className={`btn md mt-6 px-[50px] ${order.lock ? "bg-green-500" : 'bg-red-500'} text-black font-bold`}>{loading ? "Deleting" : <>Delete Order</> }</button>
         </div>
      </Popup>
    </>
  )
}
