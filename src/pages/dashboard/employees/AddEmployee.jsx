import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

export default function AddEmployee({fetchLists}){

  const commisions = Array.from({ length: 100 }, (_, index) => (index + 1) * 5);
  const [data, setData] = useState({
      name: "",
      email: "",
      password: "",
      role: "",
      staff_commision: "",
    });
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    const [loading, setLoading] = useState(false);

    const add_customer = () => {
      setLoading(true);
      const resp = Api.post(`/user/create_user`, {...data, generateAutoPassword: data.password ? 0 : 1});
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
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses="" btntext={"Add New Employee"} >
         <h2 className='text-white font-bold'>Add New Employee</h2>
         <div className='grid grid-cols-2 gap-4'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
               <input required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Email</label>
               <input required name='email' onChange={handleinput} type={'email'} placeholder={"Phone email address"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Staff Commission</label>
               <select  onChange={handleinput} name='phone' className="input-sm" >
                  {commisions && commisions.map((c, i)=>{
                    return <option className='text-black'>{c}% Commision</option>
                  })}
               </select>
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Password</label>
               <input required name='password' onChange={handleinput} type={'password'} placeholder={"Enter password"} className="input-sm" />
            </div>
         </div>
         <div className='flex justify-center items-center'>
            <button  onClick={add_customer} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Creating..." : "Create Account"}</button>
         </div>
      </Popup>
    </div>
  )
}
