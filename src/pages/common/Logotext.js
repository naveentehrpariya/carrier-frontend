import React from 'react';
import logo from '../../img/logo.png';
import logoblack from '../../img/logo-black.png';
export default function Logotext({black}) {
  if(black){
    return <img className='max-w-[80px]' src={logoblack} alt='logo' />
  } else {
    return <img className='max-w-[80px]' src={logo} alt='logo' />
  }
  // return "Spenny Piggy" 
}   
