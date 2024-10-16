import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Endpoints from '../../api/Endpoints';
import toast from 'react-hot-toast';
import { UserContext } from '../../context/AuthProvider';
import Logo from '../common/Logo';

export default function ResetPasswordPage() {

   const [loading, setLoading] = useState(false);
   const [password, setPassword] = useState([]);
   const [confirmPassword, setConfirmPassword] = useState([]);
   const {Errors} = useContext(UserContext);
   const {id} = useParams();

   const navigate = useNavigate();
   async function reset() {

      const minLength = 8;
      const uppercaseRegex = /[A-Z]/;
      const lowercaseRegex = /[a-z]/;
      const digitRegex = /[0-9]/;
      const specialCharRegex = /[!@#$%^&*]/;
      if (password.length < minLength) {
          toast.error("Password must be at least 8 characters long.");
          return false;
      }
      if (!uppercaseRegex.test(password)) {
           toast.error("Password must contain at least one uppercase letter.");
          return false;
      }
      if (!lowercaseRegex.test(password)) {
          toast.error("Password must contain at least one lowercase letter.");
          return false;
      }
      if (!digitRegex.test(password)) {
           toast.error("Password must contain at least one digit.");
          return false;
      }
      if (!specialCharRegex.test(password)) {
          toast.error("Password must contain at least one special character.")
          return false;
      }

      setLoading(true);
      const m = new Endpoints();
      const resp = m.resetpassword(id, { password: password, confirmPassword: confirmPassword});
      resp.then((res) => {
         if (res.data.status){
            toast.success(res.data.message);
            navigate('/login');
         } else {
            toast.error(res.data.message);
         }
         setLoading(false);
      }).catch((err) =>{
         setLoading(false);
         Errors(err)
      })
   }


  return (
    <div className='w-full h-screen bg-gray-200 flex items-center justify-center' >
            <div className="p-6 md:mx-auto">
               <div className="text-center">
                  <div className=" w-full">
                     <div className='flex justify-center mb-4'>
                     <Logo />
                     </div>
                     <div className="mb-6 text-center">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Reset Password</h2>
                        <p className="text-lg max-w-[400px] m-auto table text-gray-500">Enter your new password to reset your password.</p>
                     </div>

                     <input type='password' onChange={(e)=> setPassword(e.target.value)} className='bg-white text-lg w-full mb-4 focus:outline-none  rounded-xl py-3 px-4' placeholder='New Password' required={true} />
                     <input type='password' onChange={(e)=> setConfirmPassword(e.target.value)} className='bg-white text-lg w-full mb-6 focus:outline-none  rounded-xl py-3 px-4' placeholder='Confirm Password' required={true} />

                     <div className='flex justify-center'>
                        <button onClick={reset} className='btn w-full max-w-xs' > {loading ? `Processing` : "Reset" } </button>
                     </div>
                  </div>
               </div>
            </div>
    </div>
  )
}
