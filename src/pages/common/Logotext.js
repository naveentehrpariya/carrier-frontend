import React from 'react';
import logowhite from '../../img/logo-white.png';
import { useContext } from 'react';
import { UserContext } from '../../context/AuthProvider';

export default function Logotext({black}) {
  const { company } = useContext(UserContext);
  const fallbackLogo = black ? '/logo.png' : logowhite;
  const src = company?.pdf_logo || company?.logo || fallbackLogo;
  return <img className='max-w-[150px] md:max-w-[200px]' crossOrigin="anonymous" referrerPolicy="no-referrer" loading="eager" src={src} alt='logo' />
  // return <img className='max-w-[150px] md:max-w-[200px]' src={user?.company?.logo} alt='logo' />
  // return "Logistic" 
}   
