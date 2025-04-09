import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { UserContext } from '../../context/AuthProvider';
import Api from '../../api/Api';
import AuthLayout from '../../layout/AuthLayout';

export default function CompanyDetails({ fetchLists, classes, text}){

   const [action, setaction] = useState();
   const {Errors, company, setcompany} = useContext(UserContext);

    const [data, setData] = useState({
      phone: company?.phone || "",
      email:  company?.email || "",
      name:   company?.name || "",
      address: company?.address || "",
    });

    useEffect(() => {
      if (company) {
        setData({
          phone: company?.phone || "",
          email:  company?.email || "",
          name:   company?.name || "",
          address: company?.address || "",
        });
      }
    }, [company]);


  


  
    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    
    const [loading, setLoading] = useState(false);
    const addDetails = () => {
      setLoading(true);
      const c = Api.post(`/user/add-company-information`, {...data, companyID:company._id});
      c.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        Errors(err);
      });
    }

  return (
   <AuthLayout>
      <div className='flex justify-center items-center w-full'>
         <div className='max-w-[900px] w-full'>
            <h2 className='text-white font-bold text-xl md:text-3xl'>Company Details</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-5 mt-3'>
               <div className='input-item'>
                  <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
                  <input defaultValue={company?.name} required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
               </div>
               <div className='input-item'>
                  <label className="mt-4 mb-0 block text-sm text-gray-400">Email</label>
                  <input defaultValue={company?.email} required name='email' onChange={handleinput} type={'text'} placeholder={"Enter email .."} className="input-sm" />
               </div>
               <div className='input-item'>
                  <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
                  <input defaultValue={company?.phone} required name='phone' onChange={handleinput} type={'text'} placeholder={"Phone Number"} className="input-sm" />
               </div>
            </div>
            <div className='grid grid-cols-1 gap-5'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Address</label>
               <input defaultValue={company?.address} required name='address' onChange={handleinput} type={'text'} placeholder={"Enter address"} className="input-sm" />
            </div>
            </div>
         <div className='flex justify-center'>
            <button  onClick={addDetails} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : <>{company ? "Update Details" : "Add Details"}</>}</button>
         </div>
         </div>
      </div>
   </AuthLayout>
  )
}
