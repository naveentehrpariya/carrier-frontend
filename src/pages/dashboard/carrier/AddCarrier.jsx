import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import countries from './../../common/Countries';
import DynamicCarrierEmailInput from '../../../components/DynamicCarrierEmailInput';

export default function AddCarrier({item, fetchLists, classes, text}){

    const [data, setData] = useState({
      phone: item?.phone || "",
      email:  item?.email || "",
      name:   item?.name || "",
      location: item?.location || "",
      country: item?.country || "",
      state: item?.state || "",
      city: item?.city || "",
      zipcode: item?.zipcode || "",
      mc_code: item?.mc_code || "",
      secondary_email: item?.secondary_email || "",
      secondary_phone: item?.secondary_phone || "",
    });

    const [emails, setEmails] = useState([]);
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    
    const handleEmailsChange = (emailsArray) => {
      console.log('Carrier emails changed:', emailsArray);
      setEmails(emailsArray);
      // Update legacy fields for backward compatibility
      const primaryEmail = emailsArray.find(e => e.is_primary);
      const secondaryEmails = emailsArray.filter(e => !e.is_primary);
      
      setData(prevData => ({
        ...prevData,
        email: primaryEmail?.email || '',
        secondary_email: secondaryEmails[0]?.email || ''
      }));
    }
    
    const [loading, setLoading] = useState(false);
    const addcarrier = () => {
      // Validate that at least one valid email is provided
      const validEmails = emails.filter(e => e.email && e.email.trim() !== '');
      if(validEmails.length === 0){
        toast.error("Please provide at least one valid email address.");
        return false
      }
      
      setLoading(true);
      const requestData = { ...data, emails: validEmails };
      let carrierIstance;
      if(item){
        carrierIstance = Api.post(`/carriers/update/${item._id}`, {...requestData, carrierID:item.carrierID});
      } else { 
        carrierIstance = Api.post(`/carriers/add`, requestData);
      }
      carrierIstance.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          fetchLists && fetchLists();
          setaction('close');
          setData({
            phone: "",
            email:  "",
            name:   "",
            location: "",
            country: "",
            state: "",
            city: "",
            zipcode: "",
            mc_code: "",
            secondary_email: "",
            secondary_phone: "",
          });
          setEmails([]);
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
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={classes}  btntext={text || "Add New Carrier"} >
         <h2 className='text-white font-bold'>{item ? "Update" : "Add New"} Carrier</h2>
         <div className='grid grid-cols-2 gap-5'>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
               <input defaultValue={item?.name} required name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">MC Code</label>
               <input defaultValue={item?.mc_code} required name='mc_code' onChange={handleinput} type={'number'} placeholder={"MC code"} className="input-sm" />
            </div>
            {/* Dynamic Email Input Component */}
            <div className='col-span-2'>
              <DynamicCarrierEmailInput 
                existingCarrier={item}
                onChange={handleEmailsChange}
              />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
               <input defaultValue={item?.phone} required name='phone' onChange={handleinput} type='number' placeholder={"Phone Number"} className="input-sm" />
            </div>
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400"> Secondary Phone</label>
               <input defaultValue={item?.secondary_phone} required name='secondary_phone' onChange={handleinput} type='number' placeholder={"Secondary Phone"} className="input-sm" />
            </div>
            </div>

            <div className='grid grid-cols-1 gap-5'>
              <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Address</label>
                <input defaultValue={item?.location} required name='location' onChange={handleinput} type={'text'} placeholder={"Enter location"} className="input-sm" />
              </div>
            </div>
            
            <div className='grid grid-cols-2 gap-5'>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Country</label>
               <select defaultValue={item?.country} onChange={handleinput} name='country' className="input-sm" >
                <option selected disabled className='text-black'>Choose Country</option>
                  {countries && countries.map((c, i)=>{
                    return <option value={c.label} className='text-black'>{c.label}</option>
                  })}
               </select>
            </div> 

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">State</label>
               <input defaultValue={item?.state} required name='state' onChange={handleinput} type={'state'} placeholder={"State"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">City</label>
               <input defaultValue={item?.city}  name='city' onChange={handleinput} type={'city'} placeholder={"City"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Zipcode</label>
               <input defaultValue={item?.zipcode} name='zipcode' onChange={handleinput} type={'zipcode'} placeholder={"Zipcode"} className="input-sm" />
            </div>

         </div>
        <div className='flex justify-center'>
        <button  onClick={addcarrier} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : <>{item ? "Update Carrier" : "Add Carrier"}</>}</button>
        </div>
      </Popup>
    </div>
  )
}
