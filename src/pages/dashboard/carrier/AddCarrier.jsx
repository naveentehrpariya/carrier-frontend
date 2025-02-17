import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

export default function AddCarrier({item, fetchLists, classes, text}){

    const [data, setData] = useState({
      phone: item?.phone || "",
      email:  item?.email || "",
      name:   item?.name || "",
      location: item?.location || "",
    });

    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    const [loading, setLoading] = useState(false);

    const addcarrier = () => {
      setLoading(true);
      let carrierIstance;
      if(item){
        carrierIstance = Api.post(`/carriers/update/${item._id}`, data);
      } else { 
        carrierIstance = Api.post(`/carriers/add`, data);
      }
      carrierIstance.then((res) => {
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
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={classes} btntext={text || "Add New Carrier"} >
         <h2 className='text-white font-bold'>{item ? "Update" : "Add New"} Carrier</h2>
         <div className='grid grid-cols-2 gap-5'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
               <input defaultValue={item?.name} required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
               <input defaultValue={item?.phone} required name='phone' onChange={handleinput} type={'number'} placeholder={"Phone Number"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Email</label>
               <input defaultValue={item?.email} required name='email' onChange={handleinput} type={'text'} placeholder={"Enter email .."} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Location</label>
               <input defaultValue={item?.location} required name='location' onChange={handleinput} type={'text'} placeholder={"Enter location"} className="input-sm" />
            </div>
         </div>
        <div className='flex justify-center'>
        <button  onClick={addcarrier} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : <>{item ? "Update Carrier" : "Add Carrier"}</>}</button>
        </div>
      </Popup>
    </div>
  )
}
