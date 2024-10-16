import React, { useContext, useState } from 'react'
import toast from 'react-hot-toast';
import Popup from '../common/Popup';
import Endpoints from '../../api/Endpoints';
import { UserContext } from '../../context/AuthProvider';

export default function ForgotPasswors() {

   const [email, setEmail] = useState('');
   const [open, setOpen] = useState('');
   const [loading, setLoading] = useState(false);
   const {Errors} = useContext(UserContext);

   async function send() {
      setLoading(true);
      const m = new Endpoints();
      const resp = m.forgotpassword({ email });
      resp.then((res) => {
         if (res.data.status){
            toast.success(res.data.message);
         } else {
            toast.error(res.data.message);
         }
         setOpen('close');
         setTimeout(()=>{
            setOpen('');
         }, 1000);
         setLoading(false);
      }).catch((err) =>{
         setLoading(false);
         Errors(err)
      })
   }

  return (
   <>
      <Popup action={open} space={'p-6 sm:p-10'} btntext={"Forgot password ?"} btnclasses={'text-blue-600 text-center'} >
            <div className="flex justify-center w-full mx-auto">
               <div className=" w-full bg-white sm:rounded-lg">
                  <div className="mb-6 text-center">
                     <h2 className="text-xl sm:text-2xl font-semibold mb-2">Forgot password ?</h2>
                     <p className="text-lg max-w-[320px] m-auto table text-gray-500">Enter your email address to reset your login password.</p>
                  </div>

                  <input type='email' onChange={(e)=> setEmail(e.target.value)} className='bg-gray-200 w-full mb-4 focus:outline-none  rounded-xl py-3 px-4' placeholder='Enter your email address..' required={true} />

                  <div className='flex justify-center'>
                     <button onClick={send} className='btn w-full max-w-xs' > {loading ? `Sending` : "Send Verification Link" } </button>
                  </div>
               </div>
            </div>
      </Popup>
   </>
  )
}
