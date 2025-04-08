import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

export default function ChangePassword({item, fetchLists, text}){
   const {Errors} = useContext(UserContext);
   const [action, setaction] = useState();
   const [loading, setLoading] = useState(false);

   const [password, setPassword] = useState();
   const [confirmPassword, setConfirmPassword] = useState();

    const changeAccountPassword = () => {
      if(password !== confirmPassword){
        toast.error("Confirm password is incorrect. Please try again later.");
        return false;
      }
      setLoading(true);
      const account = Api.post(`/user/change-password`, {
        id: item._id,
        password: password
      });
      account.then((res) => {
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
    <div>
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={'p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block'} btntext={text || "Add New Carrier"} >
         <h2 className='text-white font-bold text-xl text-center pt-6 '>Change Password</h2>
         <p className='text-center text-gray-400 text-lg mt-2 max-w-[500px] m-auto '>Are you sure you want to change password for <strong className='text-white'>{item.name}</strong> ?</p>
         
         <div className='w-full max-w-[400px] m-auto'>
            <div className='field w-full mt-2'>
               <input onChange={(e) => setPassword(e.target.value)} className='input p-4 px-4 rounded-xl' placeholder='Please enter new password.' type="password" />
            </div>
            <div className='field w-full mt-2'>
               <input onChange={(e) => setConfirmPassword(e.target.value)} className='input p-4 px-4 rounded-xl' placeholder='Please re-enter new password.' type="password" />
            </div>
         </div>

        <div className='flex justify-center'>
            <button  onClick={changeAccountPassword} className={`btn md mt-6 mb-6 px-[50px] ${item.status === 'active' ? "main-btn text-black " : "bg-green-700 text-white "}  `}>{loading ? "Loading..." :  `Confirm`}</button>
        </div>
      </Popup>
    </div>
  )
}
