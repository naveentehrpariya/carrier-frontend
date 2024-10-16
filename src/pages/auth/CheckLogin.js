import React, { useContext, useEffect, useState } from 'react'
import Endpoints from '../../api/Endpoints';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/AuthProvider';
export default function CheckLogin({redirect, takeaction}) {

  const {Errors, setIsAuthenticated, setUser} = useContext(UserContext);
  const navigate = useNavigate();

  function check_login(e) {
      const m = new Endpoints();
      const resp = m.user_profile();
      resp.then((res) => {
        if(res.data.status){
          if(res.data.user && res.data.user.mailVerifiedAt === null){
            navigate('/send-verification-email');
          }  
          setIsAuthenticated(true);
          setUser(res.data.user);
         if(redirect){
             navigate('/home');
         }
        } else {
           toast.error("You must login first.");
           navigate('/login');
           setIsAuthenticated(false);
           setUser(null);
        }
        
      }).catch((err) => {
        console.log("errors",err);
        if(takeaction){
          navigate('/login');
        } else {
          // navigate('/login');
        }
      });
  }

  useEffect(()=>{
    check_login();
  },[]);

  return (
    <>
      
    </>
  )
}
