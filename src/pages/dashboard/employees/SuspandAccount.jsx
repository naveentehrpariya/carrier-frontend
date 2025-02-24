import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

export default function SuspandAccount({item, fetchLists, text}){
   const {Errors} = useContext(UserContext);
   const [action, setaction] = useState();
   const [loading, setLoading] = useState(false)
    const suspandAccount = () => {
      setLoading(true);
      const account = Api.get(`/user/suspanduser/${item._id}`);
      account.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
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
    <div>
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={'p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block'} btntext={text || "Add New Carrier"} >
         <h2 className='text-white font-bold text-xl text-center pt-6 '>Confirm Action</h2>
         <p className='text-center text-gray-400 text-lg mt-2 max-w-[400px] m-auto '>Are you sure you want to {item.status === 'active' ? "suspand" : "reactivate"} this user ?</p>
        <div className='flex justify-center'>
            <button  onClick={suspandAccount} className={`btn md mt-6 mb-6 px-[50px] ${item.status === 'active' ? "main-btn text-black " : "bg-green-700 text-white "}  `}>{loading ? "Loading..." :  `${item.status === 'active' ? "Suspand Account" : "Enable Account"}`}</button>
        </div>
      </Popup>
    </div>
  )
}
