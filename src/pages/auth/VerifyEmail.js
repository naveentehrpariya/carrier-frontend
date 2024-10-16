import React, { useEffect, useState } from 'react'
import Api from '../../api/Api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Endpoints from '../../api/Endpoints';
import Button from '../common/Button';
export default function VerifyEmail(){

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [sent, setSent] = useState(false)
  const [count, setCount] = useState(1);
    const verify = () => { 
      if(count > 30){
        return false
      }
      setLoading(true);
      const resp = Api.get(`/user/sendVerifyEmail`);
      resp.then((res)=>{
          setCount(count + 1);
          if(res.data.status){
              toast.success(res.data.message);
              setSent(true)
          } else {
              toast.error("Email Verification Failed !!");
          }
          setLoading(false);
        }).catch((err)=> {
          console.log(err);
          toast.error("Something went wrong. Email Verification Failed !!");
          setLoading(false);
      });
  }

  function check_login(e) {
      const m = new Endpoints();
      const resp = m.user_profile();
      resp.then((res) => {
        if(res.data.status && res.data.user && res.data.user.mailVerifiedAt !== null){
          navigate('/home');
        }  
      }).catch((err) => {
        console.log("errors",err);
      });
  }

  useEffect(()=>{
    check_login();
    const interval = setInterval(check_login, 7000);
    return () => clearInterval(interval);
  },[]);

  const goback = () => { 
    localStorage.removeItem("token");
    window.location.href = "/signup";
  }

  return (
    <div>
      <div class="relative flex flex-wrap min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12 bg-dark1">
         <div class="max-w-xl w-full px-5 text-center p-6">
            <h2 class="mb-2 text-[30px] md:text-[42px] font-bold text-white">Email Verification</h2>
            <p class="mb-2 text-lg text-zinc-500">We are glad, that you’re with us ? 
              We’ll sent you a verification link to the email address to verify your account.</p>
            <button onClick={verify} class="mt-3 inline-block w-full max-w-[300px] rounded-xl bg-main px-5 py-3 font-medium text-white shadow-md  hover:opacity-[0.6]">{loading ? "Sending..." : sent ? "Link Sent" : "Send Link →"}</button>
         </div>
            <button onClick={goback} className='text-main'> Go Back</button>
      </div>
    </div>
  )
}
