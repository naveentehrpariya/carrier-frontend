import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';

export default function RemoveCarrier({item, fetchLists, classes, text}){

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
      carrierIstance = Api.get(`/carriers/remove/${item._id}`, data);
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
         <h2 className='text-white font-bold text-xl text-center pt-6 '>Confirm Action</h2>
         <p className='text-center text-gray-400 text-lg mt-2 max-w-[400px] m-auto '>Are you sure you want to remove this carrier? This action cannot be undone.</p>
        <div className='flex justify-center'>
            <button  onClick={addcarrier} className="btn md mt-6 mb-6 px-[50px] main-btn text-black font-bold">{loading ? "Removing..." :  "Confirm"}</button>
        </div>
      </Popup>
    </div>
  )
}
