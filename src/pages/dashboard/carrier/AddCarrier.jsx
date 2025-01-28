import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

export default function AddCarrier({fetchLists}){

    const [data, setData] = useState({
      phone: "",
      email: "",
      name: "",
      location: "",
    });

    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    const [loading, setLoading] = useState(false);

    const addcarrier = () => {
      setLoading(true);
      const resp = Api.post(`/carriers/add`, data);
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
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses="" btntext={"Add New Carrier"} >
         <h2 className='text-white font-bold'>Add New Carrier</h2>
         <div className='grid grid-cols-2 gap-5'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
               <input required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
               <input required name='phone' onChange={handleinput} type={'number'} placeholder={"Phone Number"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Email</label>
               <input required name='email' onChange={handleinput} type={'text'} placeholder={"Enter email .."} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Location</label>
               <input required name='location' onChange={handleinput} type={'text'} placeholder={"Enter location"} className="input-sm" />
            </div>
         </div>
        <button  onClick={addcarrier} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
      </Popup>
    </div>
  )
}
