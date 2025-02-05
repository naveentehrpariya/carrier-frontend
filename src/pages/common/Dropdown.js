import React, { Children, useState } from 'react'
import { HiDotsVertical } from "react-icons/hi";
export default function Dropdown({children}) {
   const [open, setOpen] = useState(false);
   return (
      <>
         {open ? <div onClick={()=>setOpen(false)} className='bg-[#0001] fixed top-0 left-0 w-full h-full'></div> : ''}
         <div class="relative inline-block text-left">
            <button onClick={() => setOpen(!open)} >
               <HiDotsVertical size={'20px'} color='white' />
            </button>
            {open ? <div class="absolute right-0 !z-[99999999] mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                {children}
            </div>: ''}
         </div>
      </>
   )
}
