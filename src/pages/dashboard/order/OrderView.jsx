import React, { useState } from 'react'
import AddNotes from '../accounts/AddNotes';

export default function OrderView({order, fetchLists}){ 
   const [open, setOpen] = useState(false);
   return <div className='orderSider'>
         <button onClick={(e)=>setOpen(true)} className='bg-gray-800 px-3 py-2 text-[12px] rounded-xl'>View Order</button>
         <div className={`sider ${open ? 'open visible' : 'close hidden'} w-full h-screen overflow-auto fixed top-0 right-0 bg-dark1 p-8 z-10 max-w-[500px]`}>
            <button className='absolute top-6 right-6 text-3xl text-white' onClick={(e)=>setOpen(false)} >&times;</button>
            <h2 className='text-white text-2xl'>Details</h2>

            <div className="flex mt-6 justify-between items-center">
               <p className=' text-gray-500'>Notes</p>
               <AddNotes text={"Edit Note"} classes="text-main" note={order.notes} id={order.id} fetchLists={fetchLists} />
            </div>
            <p className='my-2'>{order.notes}</p>
            {/* <p className='mt-6 border-t border-gray-700 pt-6 text-gray-500' >Documents</p> */}
         </div> 
   </div>
}
