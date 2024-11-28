import React, { useState } from 'react'
import Popup from '../../common/Popup';

export default function AddOrder(){

    const [data, setData] = useState({
      corporateID: "",
      email: "",
      password: "",
    });

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }

    const [loading, setLoading] = useState(false);


  return (
    <div>
      <Popup size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses="" btntext={"Add New Carrier"} >
         <h2 className='text-white font-bold'>Add New Carrier</h2>
         <div className='grid grid-cols-2 gap-5'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Company Name</label>
               <input required name='company_name' onChange={handleinput} type={'text'} placeholder={"Enter Company Name"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Order No.</label>
               <input required name='order_no' onChange={handleinput} type={'text'} placeholder={"Enter Company Name"} className="input-sm" />
            </div>
         </div>
      </Popup>
    </div>
  )
}
