import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import toast from 'react-hot-toast';

export default function AddNotes({id, fetchLists, note, text, classes}) {
   
   const {Errors} = useContext(UserContext);
   const [action, setaction] = useState();
     
   const [notes, setNotes] = useState(note);
   const [loading, setLoading] = useState(false);
   const updateStatus = () => {
   setLoading(true);
   const resp = Api.post(`/account/order/addnote/${id}`, {
      notes: notes
   });
   resp.then((res) => {
      setLoading(false);
      if (res.data.status) {
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
    <>
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={classes ? classes  :  "p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 flex items-center"} btntext={text ? text : <>{notes ? "View Note" : "Add Note"}</>} >
         <h2 className='text-white font-bold'>Add Note</h2>
         <div className='txtarea'>
            <textarea className='input' rows={6} placeholder='Add Note here ...' defaultValue={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
         </div>             
         <div className='flex justify-center items-center'>
            <button  onClick={updateStatus} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Adding..." : "Add"}</button>
         </div>
      </Popup>
    </>
  )
}
