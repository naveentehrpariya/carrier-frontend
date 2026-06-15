import React, { useContext, useEffect, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import countries from './../../common/Countries';
import DynamicCarrierEmailInput from '../../../components/DynamicCarrierEmailInput';
import GoogleAddressInput from '../../common/GoogleAddressInput';
import { HiOutlineTruck } from 'react-icons/hi2';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, SelectInput, ModalFooter, ACCENTS } from '../../../components/modal/ModalKit';

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
    const [showSecondaryPhone, setShowSecondaryPhone] = useState(!!item?.secondary_phone);
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    useEffect(() => {
      setShowSecondaryPhone(!!item?.secondary_phone);
    }, [item]);

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
          // Pass the created/updated carrier so callers (e.g. AddOrder) can auto-select it.
          fetchLists && fetchLists(res.data.carrier);
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
          setShowSecondaryPhone(false);
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
      <Popup action={action} size="md:max-w-2xl" space='p-0' bg="bg-black" btnclasses={classes}  btntext={text || "Add New Carrier"} >
       <ModalShell accent={ACCENTS.carrier}>
         <ModalHeader
           icon={HiOutlineTruck}
           accent={ACCENTS.carrier}
           title={item ? 'Edit Carrier' : 'Add New Carrier'}
           subtitle={item ? 'Update carrier contact and location details' : 'Register a carrier with contacts and location'}
         />

         <FormSection title="Carrier & contact">
            <Field label="Name" required>
               <TextInput defaultValue={item?.name} name='name' onChange={handleinput} type='text' placeholder="Carrier name" />
            </Field>
            <Field label="MC Code" required>
               <TextInput defaultValue={item?.mc_code} name='mc_code' onChange={handleinput} type='number' placeholder="MC code" />
            </Field>
            <div className='sm:col-span-2'>
              <DynamicCarrierEmailInput existingCarrier={item} onChange={handleEmailsChange} />
            </div>
            <Field label="Primary Phone" required>
               <TextInput defaultValue={item?.phone} name='phone' onChange={handleinput} type='number' placeholder="Primary phone" />
            </Field>
            <Field label="Additional Phone">
              {showSecondaryPhone ? (
                <div className="flex items-center gap-2">
                  <TextInput
                    defaultValue={item?.secondary_phone}
                    name="secondary_phone"
                    onChange={handleinput}
                    type="number"
                    placeholder="Additional phone"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 p-2 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setData((prev) => ({ ...prev, secondary_phone: "" }));
                      setShowSecondaryPhone(false);
                    }}
                    title="Remove additional phone"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="h-[51px] w-full rounded-[15px] border border-dashed border-gray-700 text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5"
                  onClick={(e) => { e.preventDefault(); setShowSecondaryPhone(true); }}
                >
                  <span className="text-base leading-none">+</span> Add another phone
                </button>
              )}
            </Field>
         </FormSection>

         <FormSection title="Address" divider>
            <Field full label="Address">
              <GoogleAddressInput
                value={data.location}
                onChange={(v) => setData((prev) => ({ ...prev, location: v }))}
                placeholder="Search location"
                className="input-sm !mt-0"
              />
            </Field>
            <Field label="Country">
               <SelectInput defaultValue={item?.country} onChange={handleinput} name='country'>
                <option value="" className='text-black'>Choose country</option>
                  {countries && countries.map((c, i)=>(
                    <option key={`country-${i}`} value={c.label} className='text-black'>{c.label}</option>
                  ))}
               </SelectInput>
            </Field>
            <Field label="State" required>
               <TextInput defaultValue={item?.state} name='state' onChange={handleinput} type='text' placeholder="State" />
            </Field>
            <Field label="City">
               <TextInput defaultValue={item?.city} name='city' onChange={handleinput} type='text' placeholder="City" />
            </Field>
            <Field label="Zipcode">
               <TextInput defaultValue={item?.zipcode} name='zipcode' onChange={handleinput} type='text' placeholder="Zipcode" />
            </Field>
         </FormSection>

         <ModalFooter
           accent={ACCENTS.carrier}
           onCancel={() => { setaction('close'); setTimeout(() => setaction(), 300); }}
           onSubmit={addcarrier}
           loading={loading}
           loadingLabel={item ? 'Saving…' : 'Adding…'}
           submitLabel={item ? 'Update Carrier' : 'Add Carrier'}
         />
       </ModalShell>
      </Popup>
    </div>
  )
}
