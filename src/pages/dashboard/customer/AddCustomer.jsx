import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import countries from './../../common/Countries';

export default function AddCustomer({fetchLists}){

    const [data, setData] = useState({
      phone: "",
      email: "",
      name: "",
      address: "",
      country: "",
      state: "",
      city: "",
      zipcode: "",
    });

    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    const [loading, setLoading] = useState(false);

    const add_customer = () => {
      setLoading(true);
      const resp = Api.post(`/customer/add`, data);
      resp.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          fetchLists && fetchLists();
          setaction('close');
          setTimeout(() => {
            setaction();
          }, 1000);
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        Errors(err);
      });
    }

  return (
    <div>
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses="" btntext={"Add New Customer"} >
         <h2 className='text-white font-bold'>Add New Customer</h2>
         <div className='grid grid-cols-2 gap-3'>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
               <input required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
               <input required name='phone' onChange={handleinput} type={'number'} placeholder={"Phone Number"} className="input-sm" />
            </div>

            


            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Country</label>
               <select onChange={handleinput} name='country' className="input-sm" >
                <option selected disabled className='text-black'>Choose Country</option>
                  {countries && countries.map((c, i)=>{
                    return <option value={c.label} className='text-black'>{c.label}</option>
                  })}
               </select>
            </div> 

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">State</label>
               <input required name='state' onChange={handleinput} type={'state'} placeholder={"State"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">City</label>
               <input required name='city' onChange={handleinput} type={'city'} placeholder={"City"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Zipcode</label>
               <input required name='zipcode' onChange={handleinput} type={'zipcode'} placeholder={"Zipcode"} className="input-sm" />
            </div>

         </div>
          <div className='input-item mt-2'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Email</label>
              <input required name='email' onChange={handleinput} type={'email'} placeholder={"Email address"} className="input-sm" />
          </div>
          <div className='input-item'>
            <label className="mt-4 mb-0 block text-sm text-gray-400">Address</label>
            <textarea row='4' name='address' onChange={handleinput}   placeholder={"Address"} className="input-sm" />
        </div>

         <div className='flex justify-center items-center'>
            <button  onClick={add_customer} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
         </div>
      </Popup>
    </div>
  )
}
