import React, { useEffect, useState } from 'react'
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Verifying(){
   
   const {token} = useParams();
   console.log("token",token);

   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState(false);
   const verify = (signal) => { 
      setLoading(true);
      const resp = Api.get(`/user/verifymail/${token}`);
      resp.then((res)=>{
         if(res.data.status){
            navigate("/home");
            setStatus(res.data.status);
         } else {
            setStatus(res.data.status);
         }
         setLoading(false);
        }).catch((err)=> {
          console.log(err);
          setLoading(false);
      });
   }
   useEffect(()=>{
      const controller = new AbortController();
      const {signal} = controller;
      verify(signal);
   },[]);

  return (
   <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12 bg-dark">
      <div class="max-w-xl px-5 text-center">
         <h2 class="mb-2 text-[22px] font-bold text-gray-300">Please Wait</h2>
         <p class="mb-2 text-lg text-zinc-500">{status ? status : "Verifying you email address ..."}</p>
      </div>
   </div>
  )
}
