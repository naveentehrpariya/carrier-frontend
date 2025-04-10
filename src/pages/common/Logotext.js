import React from 'react';
import logo from '../../img/logo.png';
import logowhite from '../../img/logo-white.png';
export default function Logotext({black}) {
  if(black){
    return <img className='max-w-[150px] md:max-w-[200px]' src={logo} alt='logo' />
  } else {
    return <img className='max-w-[150px] md:max-w-[200px]' src={logowhite} alt='logo' />
  }
  // return "Spenny Piggy" 
}   
