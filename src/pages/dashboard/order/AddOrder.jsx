import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AuthLayout from '../../../layout/AuthLayout';
import Select from 'react-select'
import { useNavigate } from 'react-router-dom';

export default function AddOrder(){

  const currencies = [
    {
      label: "USD",
      value: "usd"
    },
    {
      label: "CAD",
      value: "cad"
    },
    {
      label: "GBP",
      value: "gbp"
    },
    {
      label: "INR",
      value: "inr"
    }
  ]
  const appointment = [
    {
      label: "Appointment",
      value: 1
    },
    {
      label: 'No appointment',
      value: 0
    }
  ]
    const [data, setData] = useState({
      company_name: "Capital Logistic",
      order_no: "",
      payment_status: "",
      order_amount: "",
      order_amount_currency: "",
      customer: "",
      carrier: "",
      driver: "",
      community: "",
      equipment: "",
      weight: "",
      weight_unit: "",
      pickup_location: "",
      pickup_phone: "",
      pickup_reference_no: "",
      pickup_date: "",
      pickup_is_appointment: "",
      delivery_location: "",
      delivery_phone: "",
      delivery_reference_no: "",
      delivery_date: "",
      delivery_is_appointment: "",
      revenue_items: []
    });

    const [customersListing, setCustomersListing] = useState([]);
    const [carriersListing, setCarrierListings] = useState([]);
    const [driversListing, setDriversListings] = useState([]);

    const fetchcustomers = () => {
        const resp = Api.get(`/customer/listings`);
        resp.then((res) => {
          if (res.data.status === true) {
            const lists = res.data.customers || []; 
            let arr = [];
            lists.forEach(element => {
              arr.push({
                _id: element._id,
                label: `${element.name} (${element.email})`,
                value: element._id,
                customerID: element.customerID
              })
            });
            setCustomersListing(arr);
          } else {
            setCustomersListing([]);
          }
        }).catch((err) => {
          setCustomersListing([]);
        });
    }
    const fetchcarriers = () => {
        const resp = Api.get(`/carriers/listings`);
        resp.then((res) => {
          if (res.data.status === true) {
            const lists = res.data.carriers || []; 
            let arr = [];
            lists.forEach(e => {
              arr.push({
                _id: e._id,
                label: `${e.name} (${e.email})`,
                value: e._id,
                carrierID: e.carrierID
              })
            });
            setCarrierListings(arr);
          } else {
            setCarrierListings([]);
          }
        }).catch((err) => {
          setCarrierListings([]);
        });
    }
    const fetchdrivers = () => {
        const resp = Api.get(`/driver/listings`);
        resp.then((res) => {
          if (res.data.status === true) {
            const lists = res.data.drivers || []; 
            let arr = [];
            lists.forEach(e => {
              arr.push({
                _id: e._id,
                label: `${e.name} (${e.phone})`,
                value: e._id,
                driverID: e.driverID
              })
            });
            setDriversListings(arr);
          } else {
            setDriversListings([]);
          }
        }).catch((err) => {
          setDriversListings([]);
        });
    }

    useEffect(()=>{ 
      fetchcustomers();
      fetchcarriers();
      fetchdrivers();
    },[]);

    const chooseCustomer = (e) => { 
      setData({ ...data, customer: e.value});
    }
    const chooseCarrier = (e) => { 
      setData({ ...data, carrier: e.value});
    }
    const chooseDriver = (e) => { 
      setData({ ...data, driver: e.value});
    }
    const chooseAmountCurrency = (e) => { 
      setData({ ...data, order_amount_currency: e.value});
    }
    const choosePickupAppointment = (e) => { 
      setData({ ...data, pickup_is_appointment: e.value});
    }
    const chooseDeliveryAppointment = (e) => { 
      setData({ ...data, delivery_is_appointment: e.value});
    }

    const {Errors} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }


    console.table(data);

    const navigate = useNavigate();
    const addcarrier = () => {
      setLoading(true);
      const resp = Api.post(`/order/add`, data);
      resp.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          navigate('/orders')
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
      <div >
         <h2 className='text-white heading xl text-3xl'>Add New Order</h2>
         <div className='grid grid-cols-3 gap-5'>
            
            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Order No.</label>
               <input required name='order_no' onChange={handleinput} type={'number'} placeholder={"Order Number"} className="input-sm" />
            </div>


            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Customer</label>
               <Select classNamePrefix="react-select input"  placeholder={'Choose Customer'}
                onChange={chooseCustomer}
                options={customersListing} />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Carrier</label>
               <Select classNamePrefix="react-select input"  placeholder={'Choose Carrier'}
                onChange={chooseCarrier}
                options={carriersListing} />
            </div>

            <div className='input-item'>
               <label className="mt-4 mb-0 block text-sm text-gray-400">Driver</label>
               <Select classNamePrefix="react-select input"  placeholder={'Choose Driver'}
                onChange={chooseDriver}
                options={driversListing} />
            </div>

            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Currency</label>
                <Select classNamePrefix="react-select input"  placeholder={'Currency'}
                  onChange={chooseAmountCurrency}
                  options={currencies} />
            </div>
            
            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Order Amount</label>
                <input required name='order_amount' onChange={handleinput} type={'number'} placeholder={"Order Amount"} className="input-sm" />
            </div>

         </div>


        <p className='mt-8 pt-4 text-gray-300 heading xl text-xl'>Pickup Information</p>
        <div className='grid grid-cols-2 gap-5'>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Pickup Location</label>
              <input required name='pickup_location' onChange={handleinput} type={'text'} placeholder={"Pickup Location"} className="input-sm" />
          </div>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Pickup Reference No.</label>
              <input required name='pickup_reference_no' onChange={handleinput} type={'text'} placeholder={"Pickup Reference No."} className="input-sm" />
          </div>
        </div>

        <div className='grid grid-cols-3 gap-5'>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Pickup Phone Number</label>
              <input required name='pickup_phone' onChange={handleinput} type={'number'} placeholder={"Enter Pickup Phone Number"} className="input-sm" />
          </div>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Pickup Appointment</label>
              <Select classNamePrefix="react-select input"  placeholder={'Choose Appointment Type'}
              onChange={choosePickupAppointment}
              options={appointment} />
          </div>
          
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Pickup Date</label>
              <input required name='pickup_date' onChange={handleinput} type={'date'} placeholder={"Enter Pickup Date"} className="input-sm" />
          </div>
        </div>


        <p className='mt-8 pt-4 text-gray-300 heading xl text-xl'>Delivery Information</p>
        <div className='grid grid-cols-2 gap-5'>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Location</label>
              <input required name='delivery_location' onChange={handleinput} type={'text'} placeholder={"Delivery Location"} className="input-sm" />
          </div>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Reference No.</label>
              <input required name='delivery_reference_no' onChange={handleinput} type={'text'} placeholder={"Delivery Reference No."} className="input-sm" />
          </div>
        </div>

        <div className='grid grid-cols-3 gap-5'>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Phone Number</label>
              <input required name='delivery_phone' onChange={handleinput} type={'number'} placeholder={"Enter delivery Phone Number"} className="input-sm" />
          </div>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Appointment Type</label>
              <Select classNamePrefix="react-select input"  placeholder={'Choose Appointment'}
              onChange={chooseDeliveryAppointment}
              options={appointment} />
          </div>
          
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Date</label>
              <input required name='delivery_date' onChange={handleinput} type={'date'} placeholder={"Enter Pickup Date"} className="input-sm" />
          </div>
        </div>


        <p className='mt-8 pt-4 text-gray-300 heading xl text-xl'>Shipment Information</p>
        <div className='grid grid-cols-2 gap-5'>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Location</label>
              <input required name='delivery_location' onChange={handleinput} type={'text'} placeholder={"Delivery Location"} className="input-sm" />
          </div>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Reference No.</label>
              <input required name='delivery_reference_no' onChange={handleinput} type={'text'} placeholder={"Delivery Reference No."} className="input-sm" />
          </div>
        </div>

        <div className='grid grid-cols-3 gap-5'>
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Phone Number</label>
              <input required name='delivery_phone' onChange={handleinput} type={'number'} placeholder={"Enter delivery Phone Number"} className="input-sm" />
          </div>
          
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Appointment Type</label>
              <Select classNamePrefix="react-select input"  placeholder={'Choose Appointment'}
              onChange={chooseDeliveryAppointment}
              options={appointment} />
          </div>
          
          <div className='input-item'>
              <label className="mt-4 mb-0 block text-sm text-gray-400">Delivery Date</label>
              <input required name='delivery_date' onChange={handleinput} type={'date'} placeholder={"Enter Pickup Date"} className="input-sm" />
          </div>
        </div>

        <div className='flex justify-center items-center'>
          <button onClick={addcarrier} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
        </div>

      </div>
    </AuthLayout>
  )
}
