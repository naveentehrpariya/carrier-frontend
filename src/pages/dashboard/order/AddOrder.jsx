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

    const [communities, setCommunities] = useState([]);
    const fetCommunities = () => {
      setLoading(true);
      const resp = Api.get(`/cummodityLists`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
          setCommunities(res.data.list);
         } else {
          setCommunities([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }
    const [equipmentOptions, setequipmentOptions] = useState([]);
    const fetchequipmentOptions = () => {
      setLoading(true);
      const resp = Api.get(`/equipmentLists`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
          setequipmentOptions(res.data.list);
         } else {
          setequipmentOptions([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }

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
      fetCommunities();
      fetchequipmentOptions();
          // fetchOrder();
    }, []);

 


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
        handleShippingInputChange(index, "pickupLocation", value);
        console.log("packup value",value)
        setTimeout(() => {
          // getDistance();
        },1000);
    }
    
    const getDeliveryLocation = (index, value) => { 
        handleShippingInputChange(index, "deliveryLocation", value);
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
    
    const handleShippingInputChange = (index, field, value) => {
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
    const removeItemShipItem = (index) => {
      const updatedItems = shippingDetails.filter((_, i) => i !== index);
      setShippingDetails(updatedItems);
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
        rate: "",
        quantity: "",
      },
    ]);
    const addCustomerRevItems = () => {
      setRevenueItems([
        ...revenueItems,
        { revenue_item: "", note: "", rate: "", quantity: "" },
      ]);
    };
    const handleCustomerRevInputChange = (index, field, value) => {
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
    const removeCustomeRevenueLine = (index) => {
      const updatedItems = revenueItems.filter((_, i) => i !== index);
      setRevenueItems(updatedItems);
    };


    // CARRIER Revenaue Items
    const [carrierRevenueItems, setCarrierRevenueItems] = useState([{
          revenue_item: "",
          note: "",
          rate: "",
          quantity: "",
        },
    ]);
    const addCarrierRevItems = () => {
      setCarrierRevenueItems([
        ...carrierRevenueItems,
        { revenue_item: "", note: "", rate: "", quantity: "" },
      ]);
    };
    const handleCarrierRevInputChange = (index, field, value) => {
      const updatedItems = [...carrierRevenueItems];
      updatedItems[index][field] = value;
      setCarrierRevenueItems(updatedItems);
    };
    const removeCarrierRevenueLine = (index) => {
      const updatedItems = carrierRevenueItems.filter((_, i) => i !== index);
      setCarrierRevenueItems(updatedItems);
    };


    const [data, setData] = useState({
      "company_name" : "Cross Miles Carrier",
      // "customer_order_no": null,
      "customer" :null,
      'customer_payment_method' : '',
      "carrier" : null,
      // "carrier_amount" : null,
      "payment_status" : "pending",
      "payment_method" : "none",
      "carrier_payment_status" : "pending",
      "carrier_payment_method" : "",
      "revenue_currency" : 'cad',
      "order_status" : "added",
      "totalDistance": null,
      // "total_amount": null
    });

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
      console.log("shippingDetails",shippingDetails);
    },[shippingDetails]);

    const addOrder = () => {
      const alldata = {...data, 
        "revenue_items"  : revenueItems || [],
        "carrier_revenue_items"  : carrierRevenueItems || [],
        "shipping_details" : shippingDetails || [],
        "total_amount" : revenueItems.reduce((total, item) => total + Number(item.rate) * Number(item.quantity), 0),
        "carrier_amount" : carrierRevenueItems.reduce((total, item) => total + Number(item.rate) * Number(item.quantity), 0),
      }
      // if(alldata.customer_order_no === '' || alldata.customer_order_no === null) {
      //   toast.error('Please enter order no of this order.');
      //   return false;
      // }

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
          toast.error('Please enter correct customer revenue details of this order.');
          return false;
        }
      }
      if(alldata.carrier_revenue_items && alldata.carrier_revenue_items[0]) {
        const isall = isObjectValid(alldata.carrier_revenue_items && alldata.carrier_revenue_items[0]);
        if(!isall) {
          toast.error('Please enter correct carrier revenue details of this order.');
          return false;
        }
      }
      
      if(alldata.carrier_amount === '') {
        toast.error('Carrier amount is required');
        return false;
      }

      if(alldata.total_amount === '') {
        toast.error('Total amount can not be empty.');
        return false;
      }


      setLoading(true);
      const resp = Api.post(`/order/add`, alldata);
      resp.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          // navigate('/orders')
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
          {/* <p className='text-gray-400 heading xl text-lg mt-6'>Customer Details</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div className='input-item'>
                <label className="mt-4 mb-0 block text-sm text-gray-400">Company Name</label>
                <input name='company_name' disabled type={'text'} placeholder='Cross Miles Carrier' className="input-sm" />
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
          </div> */}

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
                    {/* <input
                      required
                      name="community"
                      onChange={(e) =>handleShippingInputChange(index, "community", e.target.value)}
                      type={"text"}
                      placeholder={"Enter Community"}
                      className="input-sm"
                    /> */}
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Enter Community"}
                      onChange={(selected) =>handleShippingInputChange(index, "community", selected)}
                      options={communities} />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Equipment</label>
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Equipment"}
                      onChange={(selected) =>handleShippingInputChange(index, "equipment", selected)}
                      options={equipmentOptions}
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Weight Unit</label>
                    <Select
                      classNamePrefix="react-select input"
                      placeholder={"Weight Unit"}
                      onChange={(selected) =>
                        handleShippingInputChange(index, "weight_unit", selected && selected.value)
                      }
                      options={weightUnits}
                    />
                  </div>
                  <div className="input-item">
                    <label className="mb-0 block text-sm text-gray-400">Weight</label>
                    <input
                      required name="weight"
                      onChange={(e) =>
                        handleShippingInputChange(index, "weight", e.target.value)
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
                  {/* <option value={"gbp"} >GBP</option> */}
                  <option value={"usd"} >USD</option>
                  <option value={"inr"} >INR</option>
                </select>
              </div>
            </div>


            <div className='input-item mb-3'>
                <label className="mt-2 mb-0 block text-sm text-gray-400">Customer</label>
                <Select classNamePrefix="react-select input"  placeholder={'Choose Customer'}
                onChange={chooseCustomer}
                options={customersListing} />
            </div>

            <div className="borders rounded-[20px] sbg-dark sborder-gray-900 p-6s">
              {revenueItems.map((item, index) => {
                const total  = item.rate * item.quantity;
                return <div key={index} className="rev-items flex justify-between items-center mb-4">
                  <div className="grid grid-cols-5 w-full gap-3">
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Revenue Item</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handleCustomerRevInputChange(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={ item.revenue_item ? { label: item.revenue_item, value: item.revenue_item} : null }
                      />
                    </div>

                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Note</label>
                      <div className='relative'>
                          <input
                            required
                            name="rate"
                            type="text"
                            placeholder="Notes"
                            className="input-sm"
                            onChange={(e) => {
                              handleCustomerRevInputChange(index, "note", e.target.value)
                            }}
                          />
                      </div>
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
                            onChange={(e) => handleCustomerRevInputChange(index, "rate", e.target.value)}
                          />
                      </div>
                    </div>

                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Quantity</label>
                      <div className='relative'>
                          <input
                            required
                            name="quantity"
                            type="text"
                            placeholder="Quantity"
                            className="input-sm"
                            onChange={(e) => {
                              handleCustomerRevInputChange(index, "quantity", e.target.value)
                            }}
                          />
                      </div>
                    </div>

                    <div className="input-item relative">
                      <label className="block text-sm text-gray-400 mb-2">Total</label>
                      <div className='border border-gray-500 p-4 rounded-xl relative'>
                        <p className='text-white'> <Currency amount={total} currency={revCurrency || 'cad'} />
                        </p>
                        { index > 0 ?
                        <button className="text-red-700  absolute top-[7px] right-4 text-3xl"
                        onClick={()=>removeCustomeRevenueLine(index)} >&times;
                        </button> : '' }
                      </div>
                    </div>
                  </div>
                </div>
              })}
              <div className='flex justify-between'>
                  <button className="text-main ms-3 text-black font-bold" onClick={addCustomerRevItems}> + Add New Line </button>
                  <h2 className='text-white'>Customer Total : <Currency amount={revenueItems.reduce((a, b) => a + b.rate * b.quantity, 0)} currency={revCurrency || 'cad'} /></h2>
              </div>
            </div>
          </div>


          {/* CARRIER DETAILS */}
          <h2 className='heading text-xl text-gray-400 pt-12 border-t border-gray-800 mt-12 mb-6'>Carrier Details</h2>
          <div className='customer'>

            <div className='input-item mb-4'>
              <label className="mt-2 mb-0 block text-sm text-gray-400">Choose Carrier</label>
              <Select classNamePrefix="react-select input"  placeholder={'Choose Customer'}
                onChange={chooseCarrier}
                options={carriersListing} />
            </div>

            <div className="borders rounded-[20px] sbg-dark sborder-gray-900 p-6s">
              {carrierRevenueItems.map((item, index) => {
                const total  = item.rate * item.quantity;
                return <div key={index} className="rev-items flex justify-between items-center mb-4">
                  <div className="grid grid-cols-5 w-full gap-3">
                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Revenue Item</label>
                      <Select
                        classNamePrefix="react-select input"
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handleCarrierRevInputChange(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={ item.revenue_item ? { label: item.revenue_item, value: item.revenue_item} : null }
                      />
                    </div>

                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Note</label>
                      <div className='relative'>
                          <input
                            required
                            name="rate"
                            type="text"
                            placeholder="Notes"
                            className="input-sm"
                            onChange={(e) => {
                              handleCarrierRevInputChange(index, "note", e.target.value)
                            }}
                          />
                      </div>
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
                            onChange={(e) => handleCarrierRevInputChange(index, "rate", e.target.value)}
                          />
                      </div>
                    </div>

                    <div className="input-item">
                      <label className="block text-sm text-gray-400">Quantity</label>
                      <div className='relative'>
                          <input
                            required
                            name="quantity"
                            type="text"
                            placeholder="Quantity"
                            className="input-sm"
                            onChange={(e) => {
                              handleCarrierRevInputChange(index, "quantity", e.target.value)
                            }}
                          />
                      </div>
                    </div>

                    <div className="input-item relative">
                      <label className="block text-sm text-gray-400 mb-2">Total</label>
                      <div className='border border-gray-500 p-4 rounded-xl relative'>
                        <p className='text-white'> <Currency amount={total} currency={revCurrency || 'cad'} />
                        </p>
                        { index > 0 ?
                        <button className="text-red-700  absolute top-[7px] right-4 text-3xl"
                        onClick={()=>removeCarrierRevenueLine} >&times;
                        </button> : ""
                        }
                      </div>
                    </div>
                  </div>
                </div>
              })}
              <div className='flex justify-between'>
                  <button className="text-main ms-3 text-black font-bold" onClick={addCarrierRevItems}> + Add New Line </button>
                  <h2 className='text-white'>Carrier Total : <Currency amount={carrierRevenueItems.reduce((a, b) => a + b.rate * b.quantity, 0)} currency={revCurrency || 'cad'} /></h2>
              </div>
            </div>
          </div>
       
          

          {data?.carrier_amount ? 
            <div className='flex justify-end my-6 '>
                <div>
                  <p className='text-white'>Sell Amount : <span className='text-gray-400'>
                    <Currency amount={data.carrier_amount} currency={revCurrency || 'cad'} /> </span> 
                  </p>
                </div>
            </div> 
          : ''}

          <div className='subtotals flex justify-ends my-6'>
            <ul className='flex justify-between w-full bg-dark2 p-4 border border-gray-700 rounded-xl '>
              <li className='flex justify-end '><p className='text-gray-400 me-4'>Customer Total : </p> <strong className='text-white'> <Currency amount={revenueItems.reduce((a, b) => a + b.rate * b.quantity, 0)} currency={revCurrency || 'cad'} /></strong></li>
              <li className='flex justify-end '><p className='text-gray-400 me-4'>Carrier Total : </p> <strong className='text-white'>  <Currency amount={ carrierRevenueItems.reduce((a, b) => a + b.rate * b.quantity, 0)} currency={revCurrency || 'cad'} /></strong></li>
              {/* <li className='flex justify-end '><p className='text-gray-400 me-4'>Total Distance : </p> <strong className='text-white'>  500Miles</strong></li> */}
            </ul>
          </div>

          <div className='flex justify-end items-center mt-6'>
            <button onClick={addOrder}  className={`btn md   ${data.carrier === '' ? "disabled" : ''} px-[50px] text-sm ms-3 main-btn text-black font-bold`}>{loading ? "Logging in..." : "Submit Order"}</button>
          </div>

      </div>
    </AuthLayout>
  )
}
