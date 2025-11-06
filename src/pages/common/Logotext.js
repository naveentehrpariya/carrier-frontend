import React from 'react';
import logo from '../../img/logo.png';
import logowhite from '../../img/logo-white.png';
import { useContext } from 'react';
import { UserContext } from '../../context/AuthProvider';
export default function Logotext({black}) {
  const {Errors, user} = useContext(UserContext);
  if(black){
    return <img className='max-w-[150px] md:max-w-[200px]' src={logo || user?.company?.logo || logo} alt='logo' />
  } else {
    return <img className='max-w-[150px] md:max-w-[200px]' src={logowhite || user?.company?.logo || logowhite} alt='logo' />
  }
  // return <img className='max-w-[150px] md:max-w-[200px]' src={user?.company?.logo} alt='logo' />
  // return "Logistic" 
}   
