import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { UserContext } from '../../context/AuthProvider';
import Api from '../../api/Api';
import AuthLayout from '../../layout/AuthLayout';

export default function CompanyDetails({ fetchLists, classes, text}){

   const [action, setaction] = useState();
   const {Errors, company, setcompany} = useContext(UserContext);

    const defaultTerms = `Carrier is responsible to confirm the actual weight and count received from the shipper before transit.

Additional fees such as loading/unloading, pallet exchange, etc., are included in the agreed rate.

POD must be submitted within 5 days of delivery.

Freight charges include $100 for MacroPoint tracking. Non-compliance may lead to deduction.

Cross-border shipments require custom stamps or deductions may apply.`;

    const [data, setData] = useState({
      phone: company?.phone || "",
      email:  company?.email || "",
      name:   company?.name || "",
      address: company?.address || "",
      bank_name: company?.bank_name || "",
      account_name: company?.account_name || "",
      account_number: company?.account_number || "",
      routing_number: company?.routing_number || "",
      remittance_primary_email: company?.remittance_primary_email || "",
      remittance_secondary_email: company?.remittance_secondary_email || "",
      rate_confirmation_terms: company?.rate_confirmation_terms || defaultTerms,
    });

    useEffect(() => {
      if (company) {
        setData({
          phone: company?.phone || "",
          email:  company?.email || "",
          name:   company?.name || "",
          address: company?.address || "",
          bank_name: company?.bank_name || "",
          account_name: company?.account_name || "",
          account_number: company?.account_number || "",
          routing_number: company?.routing_number || "",
          remittance_primary_email: company?.remittance_primary_email || "",
          remittance_secondary_email: company?.remittance_secondary_email || "",
          rate_confirmation_terms: company?.rate_confirmation_terms || defaultTerms,
        });
      }
    }, [company]);


  


  
    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }
    
    const [loading, setLoading] = useState(false);
    const addDetails = () => {
      setLoading(true);
      
      // Include rate confirmation terms in the backend payload
      const payload = {...data, companyID:company._id};
      
      // Debug: Log the data being sent
      console.log('Sending company data (with terms):', payload);
      console.log('Remittance emails being sent:', {
        primary: payload.remittance_primary_email,
        secondary: payload.remittance_secondary_email
      });
      
      const c = Api.post(`/user/add-company-information`, payload);
      c.then((res) => {
        setLoading(false);
        
        // Debug: Log the API response
        console.log('API Response:', res.data);
        
        if (res.data.status === true) {
          toast.success(res.data.message);
          
          // Debug: Check if company context is being updated
          console.log('Current company context before update:', company);
          
          // Try to refresh company data or update context
          if (res.data.company) {
            console.log('Updated company data from API:', res.data.company);
            setcompany(res.data.company);
          } else {
            // If API doesn't return updated company, manually update the context
            console.log('API did not return updated company data, manually updating context');
            const updatedCompany = {
              ...company,
              ...payload // Include all the form data
            };
            console.log('Manually updated company context:', updatedCompany);
            setcompany(updatedCompany);
            
            // Also update localStorage if that's where company data is stored
            localStorage.setItem('company', JSON.stringify(updatedCompany));
          }
          
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        console.error('API Error:', err);
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
            <div className='h-[1px] bg-gray-800 my-12'></div>

            <div className='mt-12'>
               <h3 className='text-white font-bold text-lg md:text-2xl '>Bank Details</h3>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-5'>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Bank Name</label>
                     <input defaultValue={company?.bank_name} name='bank_name' onChange={handleinput} type={'text'} placeholder={"Enter bank name"} className="input-sm" />
                  </div>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Account Name</label>
                     <input defaultValue={company?.account_name} name='account_name' onChange={handleinput} type={'text'} placeholder={"Enter account name"} className="input-sm" />
                  </div>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Account Number</label>
                     <input defaultValue={company?.account_number} name='account_number' onChange={handleinput} type={'text'} placeholder={"Enter account number"} className="input-sm" />
                  </div>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Routing Number</label>
                     <input defaultValue={company?.routing_number} name='routing_number' onChange={handleinput} type={'text'} placeholder={"Enter routing number"} className="input-sm" />
                  </div>
               </div>
            </div>
            

            <div className='h-[1px] bg-gray-800 my-12'></div>


            {/* Remittance Email Details Section */}
            <div className='mt-12'>
               <h3 className='text-white  font-bold text-lg md:text-2xl mb-2'>Remittance Email Settings</h3>
               <p className='text-gray-400 text-normal mt-2'>These email addresses will appear in invoices for remittance instructions.</p>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-5'>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Primary Remittance Email</label>
                     <input defaultValue={company?.remittance_primary_email} name='remittance_primary_email' onChange={handleinput} type={'email'} placeholder={"Enter primary remittance email"} className="input-sm" />
                  </div>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Secondary Remittance Email (CC)</label>
                     <input defaultValue={company?.remittance_secondary_email} name='remittance_secondary_email' onChange={handleinput} type={'email'} placeholder={"Enter secondary remittance email"} className="input-sm" />
                  </div>
               </div>
            </div>

            <div className='h-[1px] bg-gray-800 my-12'></div>

            
            {/* Rate Confirmation Terms Configuration */}
            <div className='mt-12'>
               <h3 className='text-white font-bold text-lg md:text-2xl mb-2'>Rate Confirmation Terms & Instructions</h3>
               <p className='text-gray-400 text-normal mt-2'>These terms and instructions will appear at the bottom of rate confirmations. You can update them monthly as needed.</p>
               <div className='mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg'>
                  <p className='text-green-300 text-sm'>
                     💾 <strong>Note:</strong> These terms are saved in your company database and will be available across all devices and users in your organization.
                  </p>
               </div>
               <div className='grid grid-cols-1 gap-5'>
                  <div className='input-item'>
                     <label className="mt-4 mb-0 block text-sm text-gray-400">Terms & Instructions</label>
                     <textarea 
                        value={data.rate_confirmation_terms} 
                        name='rate_confirmation_terms' 
                        onChange={handleinput} 
                        placeholder={"Enter terms and conditions that will appear at the bottom of rate confirmations"} 
                        className="input-sm min-h-[150px] resize-vertical" 
                        rows={6}
                     />
                  </div>
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
