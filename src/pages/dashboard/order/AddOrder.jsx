import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AuthLayout from '../../../layout/AuthLayout';
import Select from 'react-select'
import { useNavigate } from 'react-router-dom';
import Popup from '../../common/Popup';
// import GetLocation from '../../common/GetLocation';
import Currency from '../../common/Currency';

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
  { value: 'Drive Van',  label: "Drive Van" },
  { value: 'Refer',  label: "Refer" },
  { value: 'Flatbed',  label: "Flatbed" },
  { value: "Container", label: "Container" }
];


const weightUnits = [
  { value: "kg", label: "Kg" },
  { value: 'g',  label: "Grams" },
  { value: 'tons',  label: "Tons" },
  { value: 'pounds',  label: "pounds" },
];

export default function AddOrder(){

    // const [exits, setExists] = useState(null)
    // const { id } = useParams();
    // const fetchOrder = () => {
    //   setLoading(true);
    //   const resp = Api.get(`/order/detail/${id}`);
    //   resp.then((res) => {
    //     setLoading(false);
    //     if (res.data.status) {
    //         setExists(res.data.order);
    //     } else {
    //         setExists(null);
    //     }
    //   }).catch((err) => {
    //     setLoading(false);
    //     Errors(err);
    //   });
    // }

    // useEffect(() => {
    //     fetchOrder();
    // }, []);


    const [closeCarrierPopup, setCloseCarrierPopup] = useState();
    const [distance, setDistance] = useState(0);

    // const getDistance = () => {
    //   if (shippingDetails && shippingDetails.length > 0) {
    //     let totalDistance = 0;
    //     const distancePromises = shippingDetails.map((item, index) => {
    //       if (item.pickupLocation && item.deliveryLocation)  {
    //         return Api.post("/getdistance", {
    //           start: item.pickupLocation,
    //           end: item.deliveryLocation,
    //         }).then((res) => {
    //           console.log("API response distance:", res.data.data);
    //           totalDistance += parseInt(res.data.data, 10);
    //           if(res.data.status === false) {
    //             setDistanceMsg(res.data.message +'Shipping location '+(index+1));
    //           } else { 
    //             setDistanceMsg(false)
    //           }
    //         })
    //         .catch((err) => {
    //           console.error("Error fetching distance:", err);
    //           setDistanceMsg('Unable to calculate distance between all shipping locations. Please check all the locations correctly.');
    //         });
    //       }
    //       return Promise.resolve();
    //     });
    //     Promise.all(distancePromises).then(() => {
    //       console.log("Total distance:", totalDistance);
    //       setDistance(totalDistance);
    //     });
    //   }
    // };


    const getPickupLocation = (index, value) => { 
        handleInputChange(index, "pickupLocation", value);
        console.log("packup value",value)
        setTimeout(() => {
          // getDistance();
        },1000);
    }
    
    const getDeliveryLocation = (index, value) => { 
        handleInputChange(index, "deliveryLocation", value);
    }
    
    const [shippingDetails, setShippingDetails] = useState([
      {
        community: null,
        equipment: null,
        weight: "",
        pickup: [
          {
            location: "",
            referenceNo: "",
            appointment: 0,
            date: "",
          }
        ],
        delivery: [
          {
            location: "",
            referenceNo: "",
            appointment: 0,
            date: "",
          }
        ],
      },
    ]);
    
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
          pickup: [
            {
              location: "",
              referenceNo: "",
              appointment: null,
              date: "",
            },
          ],
          delivery: [
            {
              location: "",
              referenceNo: "",
              appointment: null,
              date: "",
            },
          ],
        },
      ]);
    };
    
    const addPickupLocation = (blockIndex) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex].pickup.push({
        location: "",
        referenceNo: "",
        appointment: null,
        date: "",
      });
      setShippingDetails(updatedDetails);
    };
    
    const addDeliveryLocation = (blockIndex) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex].delivery.push({
        location: "",
        referenceNo: "",
        appointment: null,
        date: "",
      });
      setShippingDetails(updatedDetails);
    };

    const handleNestedInputChange = (blockIndex, type, locIndex, field, value) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex][type][locIndex][field] = value;
      setShippingDetails(updatedDetails);
    };
    

    // Customer revenue items
    const [revenueItems, setRevenueItems] = useState([
      {
        revenue_item: "",
        note: "",
        rate_method: "",
        rate: "",
        value: "",
      },
    ]);
    const addCustomerRev = () => {
      setRevenueItems([
        ...revenueItems,
        { revenue_item: "", rate_method: "", rate: "", value: "" },
      ]);
    };
    const handleCustomerRev = (index, field, value) => {
      const updatedItems = [...revenueItems];
      updatedItems[index][field] = value;
      setRevenueItems(updatedItems);
      // const items = updatedItems || [];
      // console.log("items",items);
      // let grossAmount = 0;
      // items.forEach(item => {
      //     grossAmount += Number(item.value);
      // });
    };

    // Carrier revenue items
    const [carrier_revenueItems, setCarrierRevenueItems] = useState([
      {
        item: "",
        note: "",
        rate_method: "",
        rate: "",
        value: "",
      },
    ]);

    // const [grossRevanue, setGrossRevenue] = useState(0);
    

    
    const removeCustomerRev = (index) => {
      const updatedItems = revenueItems.filter((_, i) => i !== index);
      setRevenueItems(updatedItems);
    };
    const removeItemShipItem = (index) => {
      const updatedItems = shippingDetails.filter((_, i) => i !== index);
      setShippingDetails(updatedItems);
    };
    
    const [data, setData] = useState({
      "company_name" : "Cross Miles Carrier",
      "customer_order_no": null,
      "customer" :null,
      "carrier" : null,
      "carrier_amount" : null,
      "payment_status" : "pending",
      "payment_method" : "none",
      "carrier_payment_status" : "pending",
      "carrier_payment_method" : "none",
      "revenue_currency" : 'cad',
      "order_status" : "added",
      "totalDistance": null,
      "total_amount": null
    });

    const [customersListing, setCustomersListing] = useState([]);
    const fetchcustomers = () => {
        const resp = Api.get(`/customer/listings`);
        resp.then((res) => {
          if (res.data.status === true) {
            const lists = res.data.customers || []; 
            let arr = [];
            lists.forEach(element => {
              arr.push({
                _id: element._id,
                label: `${element.name} (Ref: ${element.customerCode})  `,
                value: element._id,
                mc_code: element.customerCode
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
    const [carriersListing, setCarrierListings] = useState([]);
    const fetchcarriers = () => {
        const resp = Api.get(`/carriers/listings`);
        resp.then((res) => {
          if (res.data.status === true) {
            const lists = res.data.carriers || []; 
            let arr = [];
            lists.forEach(e => {
              arr.push({
                _id: e._id,
                label: `${e.name} | ${e.country}(${e.mc_code})`,
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
      setCloseCarrierPopup("close");
      setTimeout(() => {
        setCloseCarrierPopup();
      },2000);
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

    useEffect(()=>{
      console.log("shippingDetails",shippingDetails)
    },[shippingDetails]);

    const addOrder = () => {
      const alldata = {...data, 
        "revenue_items"  : revenueItems || [],
        "shipping_details" : shippingDetails || []
      }

      if(alldata.customer_order_no === '' || alldata.customer_order_no === null) {
        toast.error('Please enter order no of this order.');
        return false;
      }

      function isObjectValid(obj) {
        return Object.values(obj).every(value => value !== null && value !== '' && value !== undefined);
      }

      if(alldata.shipping_details && alldata.shipping_details[0]) {
        const isall = isObjectValid(alldata.shipping_details && alldata.shipping_details[0]);
        if(!isall) {
          toast.error('Please enter shipping details of this order.');
          return false;
        }
      }
      if(alldata.revenue_items && alldata.revenue_items[0]) {
        const isall = isObjectValid(alldata.revenue_items && alldata.revenue_items[0]);
        if(!isall) {
          toast.error('Please enter correct revenue details of this order.');
          return false;
        }
      }
      
      if(alldata.carrier_amount === '') {
        toast.error('Carrier amount is required');
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
   
  return (
    <AuthLayout>
      <div>
         <h2 className='text-white heading xl text-2xl '>Add New Order</h2>
          <p className='text-gray-400 heading xl text-lg mt-6'>Customer Details</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Company Name</label>
                <input name='company_name' disabled type={'text'} placeholder='Cross Miles Carrier' className="input-sm" />
            </div>
            {/* <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Order No.</label>
                <input required name='customer_order_no' onChange={handleinput} type={'number'} placeholder={"Order Number"} className="input-sm" />
            </div> */}
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
                
                <div className='flex mb-4 justify-between'>
                  <p className="text-gray-400 heading xl text-xl ">Shipment {index+1}
                  </p>
                  {index  ?<button  className="!text-red-500 !font-sm !font-normal !ms-3"
                  onClick={() => removeItemShipItem(index)} >Remove
                  </button> : ''}
                </div>
                  
                <div className="grid grid-cols-4 gap-4 pb-8 border-b border-gray-800 mb-8">
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Commodity</label>
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

                {detail?.pickup && detail?.pickup.map((pickup, pickupIndex)=>{
                  return <>
                    <h2 className='text-white mb-3 mt-6 text-normal heading'>Pickup #{pickupIndex+1}</h2>
                    <div className="grid grid-cols-4 gap-4 ">
                      <div className="input-item">
                        <label className="mb-0 block text-sm text-gray-400">Pickup Location</label>
                        <input
                          required
                          onChange={(e)=>handleNestedInputChange(index, 'pickup', pickupIndex, 'location', e.target.value)}
                          type={"text"} 
                          placeholder={"Enter Pickup location"} 
                          className="input-sm"
                        />
                        {/* <GetLocation placeholder={"Enter Pickup Location"} index={index} onchange={getPickupLocation} /> */}
                      </div>
                      <div className="input-item">
                        <label className="mb-0 block text-sm text-gray-400">
                          Pickup Reference No.
                        </label>
                        <input
                          required
                          onChange={(e)=>handleNestedInputChange(index, 'pickup', pickupIndex, 'referenceNo', e.target.value)}
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
                          onChange={(selected) => handleNestedInputChange(index, 'pickup', pickupIndex, 'appointment', selected && selected.value)}
                          options={appointmentOptions}
                        />
                      </div>
                      <div className="input-item">
                        <label className="mb-0 block text-sm text-gray-400">
                          Pickup Date
                        </label>
                        <input
                          required
                          onChange={(e) => handleNestedInputChange(index, 'pickup', pickupIndex, 'date', e.target.value)}
                          type={"date"}
                          placeholder={"Enter Pickup Date"}
                          className="input-sm"
                        />
                      </div>
                    </div>
                  </>
                })}
                <button onClick={()=>addPickupLocation(index)} className='text-main mb-4 mt-2  ' >+ Add Pickup Stop</button>
                <div className='border-t border-gray-700 my-4'></div>
                {detail?.delivery && detail?.delivery.map((delivery, deliveryIndex)=>{
                  return <>
                    <h2 className='text-white mb-3 mt-6 text-normal heading'>Delivery #{deliveryIndex+1}</h2>
                    <div className="grid grid-cols-4 gap-4 ">
                      <div className="input-item">
                        <label className="mb-0 block text-sm text-gray-400">Delivery Location</label>
                        <input
                          required
                          onChange={(e)=>handleNestedInputChange(index, 'delivery', deliveryIndex, 'location', e.target.value)}
                          type={"text"} 
                          placeholder={"Enter Delivery location"} 
                          className="input-sm"
                        />
                        {/* <GetLocation placeholder={"Enter Delivery Location"} index={index} onchange={getDeliveryLocation} /> */}
                      </div>
                      <div className="input-item">
                        <label className="mb-0 block text-sm text-gray-400">
                          Delivery Reference No.
                        </label>
                        <input
                          required
                          onChange={(e)=>handleNestedInputChange(index, 'delivery', deliveryIndex, 'referenceNo', e.target.value)}
                          type={"text"}
                          placeholder={"Delivery Reference No."}
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
                          onChange={(selected) => handleNestedInputChange(index, 'delivery', deliveryIndex, 'appointment', selected && selected.value)}
                          options={appointmentOptions}
                        />
                      </div>
                      <div className="input-item">
                        <label className="mb-0 block text-sm text-gray-400">
                          Delivery Date
                        </label>
                        <input
                          required
                          onChange={(e) => handleNestedInputChange(index, 'delivery', deliveryIndex, 'date', e.target.value)}
                          type={"date"}
                          placeholder={"Enter Delivery Date"}
                          className="input-sm"
                        />
                      </div>
                    </div>
                  </>
                })}
                <button onClick={()=>addDeliveryLocation(index)} className='text-main mt-2' >+ Add Delivery Stop</button>

              </div>
              </>
            ))}
          </div>

          <div className='customer'>
            <div className="flex justify-between mt-12 mb-4 items-center">
              <p className="text-gray-400 heading xl text-xl">Customer Revenue Items</p>
              <div className='flex items-center'>
                <select onChange={chooseAmountCurrency} className='currency-drop bg-gray-800 text-white px-2 py-[5px] rounded-[10px]'>
                  <option value={"cad"} >CAD</option>
                  <option value={"gbp"} >GBP</option>
                  <option value={"usd"} >USD</option>
                  <option value={"inr"} >INR</option>
                </select>
              </div>
            </div>
            <div className="borders rounded-[20px] mb-12 sbg-dark sborder-gray-900 p-6s">
              {revenueItems.map((item, index) => (
                <div key={index} className="rev-items flex justify-between items-center mb-4">
                  <div className="grid grid-cols-4 w-full gap-5">
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Revenue Item</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handleCustomerRev(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={
                          item.revenue_item ? { label: item.revenue_item, value: item.revenue_item} : null
                        }
                      />
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Rate Method</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Choose Rate"
                        onChange={(option) =>
                          handleCustomerRev(index, "rate_method", option.value)
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
                      <div className='relative'>
                        <div className='absolute text-white top-[26px] left-4'>
                            <Currency onlySymbol={true} amount={item.rate*(distance)} currency={revCurrency || 'cad'} />
                        </div>
                          <input
                            required
                            name="rate"
                            type="number"
                            placeholder="Rate"
                            className="input-sm ps-[50px]"
                            // onChange={(e) => handleCustomerRev(index, "rate", e.target.value)}
                            onChange={(e) => {
                              handleCustomerRev(index, "rate", e.target.value)
                              setData({ ...data, total_amount: e.target.value})
                            }}
                          />
                      </div>
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Value</label>
                      <div className='relative'>
                        <div className='absolute text-white top-[27px] left-4'>
                        <Currency amount={item.rate*(distance)} currency={revCurrency || 'cad'} />
                        </div>
                        <input
                          required
                          name="value" disabled
                          type="text"  
                          className="input-sm" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button  className="btn bg-red-700 mt-[20px] ms-3 text-white"
                    onClick={() => removeCustomerRev(index)} >Remove
                    </button>
                  </div>
                </div>
              ))}
              <button className="text-main ms-3 text-black font-bold" onClick={addCustomerRev}> + Add More </button>
            </div>
          </div>

          <h2 className='heading text-xl text-white pt-12 border-t border-gray-700 mt-16 mb-4'>Carrier Details</h2>

          <div className='customer'>
            <div className="flex justify-between  mb-4 items-center">
              <p className="text-gray-400 heading text-lg">Revenue Items</p>
            </div>
            <div className="borders rounded-[20px] sbg-dark sborder-gray-900 p-6s">
              {revenueItems.map((item, index) => (
                <div key={index} className="rev-items flex justify-between items-center mb-4">
                  <div className="grid grid-cols-4 w-full gap-5">
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Revenue Item</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handleCustomerRev(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={
                          item.revenue_item ? { label: item.revenue_item, value: item.revenue_item} : null
                        }
                      />
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Rate Method</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Choose Rate"
                        onChange={(option) =>
                          handleCustomerRev(index, "rate_method", option.value)
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
                      <div className='relative'>
                        <div className='absolute text-white top-[26px] left-4'>
                            <Currency onlySymbol={true} amount={item.rate*(distance)} currency={revCurrency || 'cad'} />
                        </div>
                          <input
                            required
                            name="rate"
                            type="number"
                            placeholder="Rate"
                            className="input-sm ps-[50px]"
                            // onChange={(e) => handleCustomerRev(index, "rate", e.target.value)}
                            onChange={(e) => {
                              handleCustomerRev(index, "rate", e.target.value)
                              setData({ ...data, total_amount: e.target.value})
                            }}
                          />
                      </div>
                    </div>
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Value</label>
                      <div className='relative'>
                        <div className='absolute text-white top-[27px] left-4'>
                        <Currency amount={item.rate*(distance)} currency={revCurrency || 'cad'} />
                        </div>
                        <input
                          required
                          name="value" disabled
                          type="text"  
                          className="input-sm" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button  className="btn bg-red-700 mt-[20px] ms-3 text-white"
                    onClick={() => removeCustomerRev(index)} >Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-main ms-3 text-black font-bold" onClick={addCustomerRev}> + Add More </button>
          </div>
       
          {/* <p className='pb-2 text-yellow-600'>{distanceMsg} Update distance manually.</p> 
          <div className="items-center">
            <div className='flex items-center'>
              <input onChange={(e) =>setData({ ...data, totalDistance: e.target.value})} 
              required type={"number"} placeholder={"Enter total distance manually..."} className="input-sm" />
            </div>
          </div> */}

          <div className='grid grid-cols-2 gap-3 mb-8 mt-6'>
            <div className=''>
              <p className='text-white '> Total Distance (Miles) </p>
              <div className='relative'>
                <div className='absolute text-white top-[26px] left-4'>
                    Miles
                </div>
                <input onChange={(e) =>setData({ ...data, totalDistance: e.target.value})} 
                required type={"number"} placeholder={"Enter total distance..."} className="input-sm ps-[60px]" />
                {/* {distanceMsg ? <p className='text-yellow-600 text-sm mb-2'>({distanceMsg}. Please update address or manually update total distance)</p>  : ""} */}
              </div>
            </div>

            <div className=''>
              <div className='text-start'>
                <p className='text-white '>Total Amount </p> 
                <div className='relative'>
                  <div className='absolute text-white top-[26px] left-4'>
                      <Currency onlySymbol={true}  currency={revCurrency || 'cad'} />
                  </div>
                  <input value={data.total_amount} onChange={(e) => setData({ ...data, total_amount: e.target.value}) } 
                  required type={"number"} placeholder={"Order Amount"}
                  className="input-sm ps-[50px] disabled" />
                </div>
              </div>
            </div>
          </div>

        {data?.carrier_amount ? <div className='flex justify-end my-6 '>
            <div>
              <p className='text-white'>Sell Amount : <span className='text-gray-400'>
                <Currency  amount={data.carrier_amount} currency={revCurrency || 'cad'} /> </span> 
              </p>
            </div>
        </div> : ''}

          

          <div className='flex justify-end items-center'>
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
                  <button onClick={(closePopup)} className="btn -sm md mt-6 px-[50px] text-sm main-btn text-black font-bold">Assign Carrier</button>
                </div>
            </Popup>
            <button onClick={addOrder}  className={`btn md   ${data.carrier === '' ? "disabled" : ''} px-[50px] text-sm ms-3 main-btn text-black font-bold`}>{loading ? "Logging in..." : "Submit Order"}</button>
          </div>

      </div>
    </AuthLayout>
  )
}
