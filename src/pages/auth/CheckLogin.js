import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/AuthProvider';
import Api from '../../api/Api';
export default function CheckLogin({redirect}) {

  const { Errors, login, logout, isAuthenticated, setIsAuthenticated} = useContext(UserContext);
  const navigate = useNavigate();

  function check_login(e) {
      const resp = Api.get('/user/profile');
      resp.then((res) => {
        if(res.data.status){
          login(res.data.user, res.data.company);
          if(redirect){
              // navigate('/home');
          }
        } else {
          //  toast.error("You must login first.");
           navigate('/login');
            logout();
          //  setIsAuthenticated(false);
        }
        console.log("errors getting",res.data.status);
        
      }).catch((err) => {
        logout();
        navigate('/login');
        console.log("err errors getting",err);
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
