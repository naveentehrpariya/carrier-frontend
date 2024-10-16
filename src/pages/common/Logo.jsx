import React from 'react'
import { Link } from 'react-router-dom'
import Logotext from './Logotext'
export default function Logo({size}) {
  return (
    <div className='logo'>
       <Link to="/" className={`drunk ${size ? size : 'text-xl md:text-3xl'} font-mona font-bold text-center text-main`}>
          <Logotext />
        </Link> 
    </div>
  )
}
