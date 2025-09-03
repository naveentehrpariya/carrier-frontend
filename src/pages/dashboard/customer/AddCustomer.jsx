import React, { useContext, useEffect, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import countries from './../../common/Countries';
import Select from 'react-select'
import DynamicEmailInput from '../../../components/DynamicEmailInput'

export default function AddCustomer({item, fetchLists, classes, text}){

    const [data, setData] = useState({
      // mc_code:  item?.mc_code || "",
      phone: item?.phone || "",
      email:  item?.email || "",
      secondary_phone: item?.secondary_phone || "",
      secondary_email:  item?.secondary_email || "",
      name:   item?.name || "",
      address: item?.address || "",
      country: item?.country || "",
      state:  item?.state || "",
      city: item?.city || "",
      zipcode: item?.zipcode || "",
      assigned_to: item?.assigned_to?._id || null,
    });

    const [emails, setEmails] = useState([]);
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    const [loading, setLoading] = useState(false);

    const [staffLists, setStaffListing] = useState([]);
    const fetchStaffLists = () => {
        const resp = Api.get(`/user/staff-listing`);
        resp.then((res) => {
          if (res.data.status === true) {
            const lists = res.data.users || []; 
            let arr = [];
            lists.forEach(e => {
              arr.push({
                _id: e._id,
                label: `${e.name} - ${e.country} (${e.email})`,
                value: e._id,
                corporateID: e.corporateID
              })
            });
            setStaffListing(arr);
          } else {
            setStaffListing([]);
          }
        }).catch((err) => {
          setStaffListing([]);
        });
    }

    useEffect(()=>{
      fetchStaffLists();
    },[]);

    const chooseStaff = (e) => { 
      setData({ ...data, assigned_to: e.value});
    }

    const handleEmailsChange = (emailsArray) => {
      console.log('Emails changed:', emailsArray);
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

    const add_customer = () => {
      if(data.assigned_to == null || data.assigned_to === ''){
        toast.error("Please select a staff member.");
        return false
      }

      // Validate that at least one valid email is provided
      const validEmails = emails.filter(e => e.email && e.email.trim() !== '');
      if(validEmails.length === 0){
        toast.error("Please provide at least one valid email address.");
        return false
      }
     
      setLoading(true);
      const requestData = { ...data, emails: validEmails };
      let customerInstance;
      if(item){
        customerInstance = Api.post(`/customer/update/${item._id}`, requestData);
      } else { 
        customerInstance = Api.post(`/customer/add`, requestData);
      }
      customerInstance.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          fetchLists && fetchLists();
          setaction('close');
          setData({
            phone: "",
            email:  "",
            secondary_phone: "",
            secondary_email:  "",
            name:   "",
            address: "",
            country: "",
            state:  "",
            city: "",
            zipcode: "",
            assigned_to: null,
          });
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
      <Popup action={action} size="md:max-w-2xl" space='p-8' bg="bg-black" btnclasses={classes} btntext={text || "Add New Customer"} >
         <h2 className='text-white font-bold'>Add New Customer</h2>

         <div className='input-item'>
            <label className="mt-4 mb-0 block text-sm text-gray-400">Assigned To</label>
            <Select defaultValue={(staffLists && staffLists.find(e => e.value === item?.assigned_to?._id)) || null} classNamePrefix="react-select input"  placeholder={'Choose Staff'}
              onChange={chooseStaff}
              options={staffLists} />
          </div>

          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Name</label>
              <input defaultValue={item?.name}   name='name' onChange={handleinput} type={'text'} placeholder={"Name"} className="input-sm" />
          </div>
         <div className='grid grid-cols-2 gap-3'>


            {/* <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">MC Code</label>
               <input  defaultValue={item?.mc_code} name='mc_code' onChange={handleinput} type={'number'} placeholder={"MC Code"} className="input-sm" />
            </div> */}

            {/* Dynamic Email Input Component */}
            <div className='col-span-2'>
              <DynamicEmailInput 
                existingCustomer={item}
                onChange={handleEmailsChange}
              />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Phone</label>
               <input  defaultValue={item?.phone} name='phone' onChange={handleinput} type={'number'} placeholder={"Phone Number"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Secondary Phone</label>
               <input  defaultValue={item?.secondary_phone} name='secondary_phone' onChange={handleinput} type={'number'} placeholder={"Secondary Phone Number"} className="input-sm" />
            </div>

            
            </div>
            <div className='grid grid-cols-1 gap-3'>
              <div className='input-item'>
                  <label className="mt-4 mb-0 block text-sm text-gray-400">Address</label>
                  <textarea defaultValue={item?.address} row='4' name='address' onChange={handleinput}   placeholder={"Address"} className="input-sm" />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>

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
               <input  defaultValue={item?.state} name='state' onChange={handleinput} type={'state'} placeholder={"State"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">City</label>
               <input  defaultValue={item?.city} name='city' onChange={handleinput} type={'city'} placeholder={"City"} className="input-sm" />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Zipcode</label>
               <input  defaultValue={item?.zipcode} name='zipcode' onChange={handleinput} type={'zipcode'} placeholder={"Zipcode"} className="input-sm" />
            </div>
         </div>

         

         <div className='flex justify-center items-center'>
            <button  onClick={add_customer} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Updating..." : "Submit"}</button>
         </div>
      </Popup>
    </div>
  )
}
