import React, { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AuthLayout from '../../../layout/AuthLayout';
import Select from 'react-select'
import { useNavigate } from 'react-router-dom';
import Popup from '../../common/Popup';
import GetLocation from '../../common/GetLocation';
import Currency from '../../common/Currency';
import DeliveryLocation from '../../common/DeliveryLocation';


const revenueItemOptions = [
  { label: "Freight Charge", value: "Freight Charge" },
  { label: "Fuel Charge", value: "Fuel Charge" },
];

const rateMethodOptions = [
  { label: "Flat", value: "flat" },
  { label: "Percentage", value: "percentage" },
];

const appointmentOptions = [
  { value: 0, label: "No Appointment" },
  { value: 1,  label: "Appointment" },
];

const equipmentOptions = [
  { value: "Container", label: "Container" },
  { value: 'Dry Container',  label: "Dry Container" },
  { value: 'Packets',  label: "Packets" },
];
const weightUnits = [
  { value: "kg", label: "Kg" },
  { value: 'g',  label: "Grams" },
  { value: 'tons',  label: "Tons" },
  { value: 'pounds',  label: "pounds" },
];

export default function AddOrder(){
    const [closeCarrierPopup, setCloseCarrierPopup] = useState();

    const getPickupLocation = (index, value) => { 
        handleInputChange(index, "pickupLocation", value);
        console.log("pickupLocation",value)
    }
    const getDeliveryLocation = (index, value) => { 
        handleInputChange(index, "deliveryLocation", value);
        setTimeout(() => {
          getDistance();
        },1000);
        console.log("deliveryLocation",value);
    }
    
    const [shippingDetails, setShippingDetails] = useState([
      {
        community: null,
        equipment: null,
        weight: "",
        pickupLocation: "",
        pickupReferenceNo: "",
        pickupAppointment: null,
        pickupDate: "",
        deliveryLocation: "",
        deliveryReferenceNo: "",
        deliveryAppointment: null,
        deliveryDate: "",
      },
    ]);
    console.log("shippingDetails",shippingDetails)

    const handleInputChange = (index, field, value) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[index][field] = value;
      setShippingDetails(updatedDetails);
    };

    const addNewShippingBlock = () => {
      setShippingDetails((prevDetails) => [
        ...prevDetails,
        {
          community: null,
          equipment: null,
          weight: "",
          weight_unit: "",
          pickupLocation: "",
          pickupReferenceNo: "",
          pickupAppointment: null,
          pickupDate: "",
          deliveryLocation: "",
          deliveryReferenceNo: "",
          deliveryAppointment: null,
          deliveryDate: "",
        },
      ]);
    };

    const [revenueItems, setRevenueItems] = useState([
      {
        revenue_item: "",
        rate_method: "",
        rate: "",
        value: "",
      },
    ]);

    const handlerevanue = (index, field, value) => {
      const updatedItems = [...revenueItems];
      updatedItems[index][field] = value;
      setRevenueItems(updatedItems);
    };

    const addNewItem = () => {
      setRevenueItems([
        ...revenueItems,
        { revenue_item: "", rate_method: "", rate: "", value: "" },
      ]);
    };
    const removeItem = (index) => {
      const updatedItems = revenueItems.filter((_, i) => i !== index);
      setRevenueItems(updatedItems);
    };
    
    const [data, setData] = useState({
      "company_name" : "Capital Logistics",
      "customer_order_no": '',
      "customer" : '',
      "carrier" : '',
      "carrier_amount" : 0,
      "payment_status" : "pending",
      "payment_method" : "none",
      "carrier_payment_status" : "pending",
      "carrier_payment_method" : "none",
      "revenue_currency" : 'cad',
      "order_status" : "added"
    });


    const [customersListing, setCustomersListing] = useState([]);
    const [carriersListing, setCarrierListings] = useState([]);

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

    useEffect(()=>{ 
      fetchcustomers();
      fetchcarriers();
    },[]);

    const chooseCustomer = (e) => { 
      setData({ ...data, customer: e.value});
    }
    const chooseCarrier = (e) => { 
      setData({ ...data, carrier: e.value});
    }

    const closePopup = () => { 
      setCloseCarrierPopup(false);
      setTimeout(() => {
        setCloseCarrierPopup();
      },1000);
    }
    

    const [revCurrency, setRevCurrency] = useState('cad');
    const chooseAmountCurrency = (e) => { 
      setData({ ...data, revenue_currency: e.target.value});
      setRevCurrency(e.target.value);
    } 
    
    const {Errors} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }

    
    const navigate = useNavigate();
    const addOrder = () => {
      const alldata = {...data, 
        "revenue_items"  : revenueItems || [],
        "shipping_details" : shippingDetails || []
      }

      if(distance < 1) {
        toast.error('Please enter correct shipping details.');
        return false;
      }
      if(alldata.customer === '') {
        toast.error('Please select a customer');
        return false;
      }

      if(alldata.carrier === '') {
        toast.error('Please select a carrier');
        return false;
      }
      if(alldata.carrier_amount === '') {
        toast.error('Carrier amount is required');
        return false;
      }

      if(alldata.customer_order_no === '') {
        toast.error('Please enter a customer order number');
        return false;
      }

      if(alldata.order_amount === '') {
        toast.error('Please enter an order amount');
        return false;
      }

      if(alldata.revenue_currency === '') {
        toast.error('Please select a revenue currency');
        return false;
      }

      if(alldata.revenue_items.length === 0) {
        toast.error('Please add at least one revenue item');
        return false;
      }

      if(alldata.shipping_details.length === 0) {
        toast.error('Please add at least one shipping detail');
        return false;
      }
      setLoading(true);
      const resp = Api.post(`/order/add`, alldata);
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

    const [distance, setDistance] = useState(0);
    const getDistance = () => {
      console.log("distance calculate called");
      if (shippingDetails && shippingDetails.length > 0) {
        let totalDistance = 0;
        const distancePromises = shippingDetails.map((item) => {
          if (item.pickupLocation && item.deliveryLocation) {
            return Api.post("/getdistance", {
              start: item.pickupLocation,
              end: item.deliveryLocation,
            })
              .then((res) => {
                console.log("API response distance:", res.data.data);
                totalDistance += parseInt(res.data.data, 10); // Increment total distance
              })
              .catch((err) => {
                console.error("Error fetching distance:", err);
              });
          }
          return Promise.resolve(); // Return resolved promise for items without locations
        });
        Promise.all(distancePromises).then(() => {
          console.log("Total distance:", totalDistance);
          setDistance(totalDistance);
        });
      }
    };

    const [grossRevanue, setGrossRevenue] = useState(0);
    useEffect(() => {
      const items = revenueItems || [];
      let grossAmount = 0;
      items.forEach(item => {
          grossAmount += Number(item.rate)*distance;
      });
      setGrossRevenue(grossAmount);
    }, [revenueItems]);

   
  return (
    <AuthLayout>
      <div>
         
         <h2 className='text-white heading xl text-3xl pt-4 '>Add New Order</h2>
          <p className='text-gray-400 heading xl text-lg mt-6'>Customer Details</p>
          
          <div className='grid grid-cols-3 gap-5'>
            
            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Company Name</label>
                <input name='company_name' disabled type={'text'} placeholder='Capital Logistics' className="input-sm" />
            </div>
            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Order No.</label>
                <input required name='customer_order_no' onChange={handleinput} type={'number'} placeholder={"Order Number"} className="input-sm" />
            </div>

            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Customer</label>
                <Select classNamePrefix="react-select input"  placeholder={'Choose Customer'}
                onChange={chooseCustomer}
                options={customersListing} />
            </div>

          </div>

          <div>
            <div className="flex justify-between mt-12 mb-4 items-center">
              <p className="text-gray-400 heading xl text-xl">Shipping Details</p>
              <button
                className="btn text-black font-bold"
                onClick={addNewShippingBlock}> + Add New
              </button>
            </div>
            {shippingDetails.map((detail, index) => (
              <>
              <div key={index}
                className="border mt-2 rounded-[20px] bg-dark border-gray-900 p-6 mb-6">
                <p className="text-gray-400 heading xl text-xl mb-4">Shipment {index+1}</p>

                <div className="grid grid-cols-4 gap-4 pb-8 border-b border-gray-800 mb-8">
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Community</label>
                    <input
                      required
                      name="community"
                      onChange={(e) =>handleInputChange(index, "community", e.target.value)}
                      type={"text"}
                      placeholder={"Enter Community"}
                      className="input-sm"
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Equipment</label>
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Equipment"}
                      onChange={(selected) =>handleInputChange(index, "equipment", selected)}
                      options={equipmentOptions}
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Weight Unit</label>
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Weight Unit"}
                      onChange={(selected) =>
                        handleInputChange(index, "weight_init", selected && selected.value)
                      }
                      options={weightUnits}
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Weight</label>
                    <input
                      required name="weight"
                      onChange={(e) =>
                        handleInputChange(index, "weight", e.target.value)
                      }
                      type={"text"} placeholder={"Enter Weight"}
                      className="input-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Pickup Location</label>
                    <GetLocation placeholder={"Enter Pickup Location"} index={index} onchange={getPickupLocation} />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Pickup Reference No.
                    </label>
                    <input
                      required
                      name="pickupReferenceNo"
                      onChange={(e) => handleInputChange(index, "pickupReferenceNo", e.target.value) }
                      type={"text"}
                      placeholder={"Pickup Reference No."}
                      className="input-sm"
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Pickup Appointment
                    </label>
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Choose Appointment"}
                      onChange={(selected) =>
                        handleInputChange(index, "pickupAppointment", selected && selected.value)
                      }
                      options={appointmentOptions}
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Pickup Date
                    </label>
                    <input
                      required
                      name="pickupDate"
                      onChange={(e) =>
                        handleInputChange(index, "pickupDate", e.target.value)
                      }
                      type={"date"}
                      placeholder={"Enter Pickup Date"}
                      className="input-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 grid grid-cols-4 gap-4">
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Delivery Location
                    </label> 
                      <GetLocation placeholder={"Enter delivery location"} index={index} onchange={getDeliveryLocation} />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Pickup Reference No.
                    </label>
                    <input
                      required
                      name="deliveryReferenceNo"
                      onChange={(e) =>
                        handleInputChange(index, "deliveryReferenceNo", e.target.value)
                      }
                      type={"text"}
                      placeholder={"delivery Reference No."}
                      className="input-sm"
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Delivery Appointment
                    </label>
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Choose Appointment"}
                      onChange={(selected) =>
                        handleInputChange(index, "deliveryAppointment", selected)
                      }
                      options={appointmentOptions}
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">
                      Delivery Date
                    </label>
                    <input
                      required
                      name="deliveryDate"
                      onChange={(e) =>
                        handleInputChange(index, "deliveryDate", e.target.value)
                      }
                      type={"date"}
                      placeholder={"Enter delivery Date"}
                      className="input-sm"
                    />
                  </div>
                </div>
              </div>
              </>
            ))}
          </div>
          
          <div>
            <div className="flex justify-between mt-12 mb-4 items-center">
              <p className="text-gray-400 heading xl text-xl">Revenue Items</p>
              <div className='flex items-center'>
                <select onChange={chooseAmountCurrency} className='currency-drop bg-gray-800 text-white px-2 py-[5px] rounded-[10px]'>
                  <option value={"cad"} >CAD</option>
                  <option value={"gbp"} >GBP</option>
                  <option value={"usd"} >USD</option>
                  <option value={"inr"} >INR</option>
                </select>
                <button className="btn ms-3 text-black font-bold" onClick={addNewItem}> + Add New </button>
              </div>
            </div>
            <div className="border rounded-[20px] bg-dark border-gray-900 p-6">
              {revenueItems.map((item, index) => (
                <div key={index} className="rev-items flex justify-between items-center mb-4">
                  <div className="grid grid-cols-4 w-full gap-5">
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Revenue Item</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handlerevanue(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={
                          item.revenue_item
                            ? {
                                label: item.revenue_item,
                                value: item.revenue_item,
                              }
                            : null
                        }
                      />
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Rate Method</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Choose Rate"
                        onChange={(option) =>
                          handlerevanue(index, "rate_method", option.value)
                        }
                        options={rateMethodOptions}
                        value={
                          item.rate_method
                            ? {
                                label: item.rate_method,
                                value: item.rate_method,
                              }
                            : null
                        }
                      />
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Rate</label>
                      <input
                        required
                        name="rate"
                        type="number"
                        placeholder="Rate"
                        className="input-sm"
                        value={item.rate}
                        onChange={(e) =>
                          handlerevanue(index, "rate", e.target.value)
                        }
                      />
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Value</label>
                      <input
                        required
                        name="value" disabled
                        type="text" value={item.rate*(distance/1000)}
                        placeholder="Value"
                        className="input-sm" 
                        onChange={(e) => handlerevanue(index, "value", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button  className="btn bg-red-700 mt-[20px] ms-3 text-white"
                    onClick={() => removeItem(index)} >Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end py-2'>
            <div className='text-right'>
            <p className='text-white mb-2'>
              Total Amount :  <Currency amount={grossRevanue} currency={revCurrency || 'cad'} /> 
            </p> 
              {distance > 0 ? <p className='text-white mb-2'>Total Distance : {distance/1000}KM</p> : ''}
            </div>
          </div>

          <div className='flex justify-between items-center'>
              <Popup action={closeCarrierPopup} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses="" btntext={"Assign Carrier"} >
                  <h2 className='text-white text-2xl font-bold'>Assign Carrier</h2>
                  <div className=''>
                    <div className='input-item'>
                      <label className="mt-4 mb-0 block text-sm text-gray-400">Choose Carrier</label>
                      <Select classNamePrefix="react-select input"  placeholder={'Choose Customer'}
                        onChange={chooseCarrier}
                        options={carriersListing} />
                    </div>
                    <div className='input-item'>
                        <label className="mt-4 mb-0 block text-sm text-gray-400">Amount</label>
                        <input required onChange={handleinput} name='carrier_amount' type={'number'} placeholder={"Enter carrier amount"} className="input-sm" />
                    </div>
                  </div>
                  <div className='flex justify-center items-center'>
                    <button onClick={closePopup} className="btn md mt-6 px-[50px] main-btn text-black font-bold">ADD</button>
                  </div>
              </Popup>
            <button onClick={addOrder} className="btn md mt-6 px-[50px] main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
          </div>

      </div>
    </AuthLayout>
  )
}
