import React, { useContext, useEffect, useState } from 'react'
import Popup from '../../common/Popup'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import countries from './../../common/Countries';
import Select from 'react-select'
import DynamicEmailInput from '../../../components/DynamicEmailInput'
import GoogleAddressInput from '../../common/GoogleAddressInput';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, SelectInput, ModalFooter, ACCENTS } from '../../../components/modal/ModalKit';

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
    const [showSecondaryPhone, setShowSecondaryPhone] = useState(!!item?.secondary_phone);
    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    useEffect(() => {
      setShowSecondaryPhone(!!item?.secondary_phone);
    }, [item]);

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
      setData({ ...data, assigned_to: e ? e.value : null});
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
      <Popup action={action} size="md:max-w-2xl" space='p-0' bg="bg-black" btnclasses={classes} btntext={text || "Add New Customer"} >
       <ModalShell accent={ACCENTS.customer}>
         <ModalHeader
           icon={HiOutlineBuildingOffice2}
           accent={ACCENTS.customer}
           title={item ? 'Edit Customer' : 'Add New Customer'}
           subtitle={item ? 'Update customer contact and assignment details' : 'Create a customer profile and assign an owner'}
         />

         <FormSection title="Profile & contact">
            <Field full label="Assigned To" hint="Leave unassigned to make this customer visible to all staff.">
              <Select
                defaultValue={(staffLists && staffLists.find(e => e.value === item?.assigned_to?._id)) || null}
                classNamePrefix="react-select input"
                placeholder={'Choose staff'}
                onChange={chooseStaff}
                isClearable={true}
                options={[{ label: 'Unassigned (Visible to all staff)', value: null }, ...staffLists]} />
            </Field>

            <Field full label="Name" required>
              <TextInput defaultValue={item?.name} name='name' onChange={handleinput} type='text' placeholder="Customer name" />
            </Field>

            <div className="sm:col-span-2">
              <DynamicEmailInput existingCustomer={item} onChange={handleEmailsChange} />
            </div>

            <Field label="Primary Phone">
              <TextInput defaultValue={item?.phone} name='phone' onChange={handleinput} type='number' placeholder="Phone number" />
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
                value={data.address || ''}
                onChange={(v) => setData((prev) => ({ ...prev, address: v }))}
                placeholder="Search address"
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
            <Field label="State">
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
           accent={ACCENTS.customer}
           onCancel={() => { setaction('close'); setTimeout(() => setaction(), 300); }}
           onSubmit={add_customer}
           loading={loading}
           loadingLabel={item ? 'Saving…' : 'Creating…'}
           submitLabel={item ? 'Save Changes' : 'Add Customer'}
         />
       </ModalShell>
      </Popup>
    </div>
  )
}
