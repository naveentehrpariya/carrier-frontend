import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import toast from 'react-hot-toast';

export default function EquipmentLists() {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors} = useContext(UserContext);

   const fetchLists = () => {
      setLoading(true);
      const resp = Api.get(`/equipmentLists`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.list);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }
   useEffect(() => {
      fetchLists();
   }, []);


   const [inputValue, setInputValue] = useState('');
   const [adding, setAdding] = useState(false);
   const addEquipment = () => {
      setAdding(true);
      const addC = Api.post(`/addEquipment`, {value:inputValue});
      addC.then((res) => {
        setAdding(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          setInputValue('');
          fetchLists();
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setAdding(false);
        Errors(err);
      });
   }
   const removeEquipment = (value) => {
      const addC = Api.post(`/removeEquipment`, {id:value});
      addC.then((res) => {
        if (res.data.status === true) {
          toast.success(res.data.message);
          fetchLists();
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        Errors(err);
      });
    }


  return (
      <div className='mt-12'> 
         <div className='flex justify-between items-center mb-4 '>
            <h2 className='text-white text-2xl'>Equipments</h2>
         </div>
         {loading ? <Loading /> :
         <div className='fgdg'>
             <ul className='grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3'>
                {lists.map((e) => (
                  <li key={e._id} className='text-white w-full border border-gray-800 my-2 p-3 flex justify-between rounded-xl'>
                    <p className='text-normal'>{e?.value}</p>
                    <button className='text-red-600' onClick={() => removeEquipment(e._id)}>Remove</button>
                  </li>
                ))}
             </ul>
             <div className='flex justify-between items-center mt-4'>
               <input defaultValue={inputValue} onChange={(e) => setInputValue(e.target.value)} className='text-white rounded-xl bg-dark1 border border-gray-800 focus:border-gray-600 w-full me-4 p-3' placeholder='Add Equipments' />
               <button className='btn text-black whitespace-nowrap' onClick={addEquipment} >{adding ? "Adding..." : "Add Equipment"}</button>
             </div>
         </div>
         }
      </div>
  )
}
