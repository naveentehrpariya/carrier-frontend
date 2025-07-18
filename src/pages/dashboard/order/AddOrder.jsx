import React, { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AuthLayout from '../../../layout/AuthLayout';
import Select from 'react-select'
import { useNavigate } from 'react-router-dom';
import Popup from '../../common/Popup';
import Currency from '../../common/Currency';
import GetLocation from '../../common/GetLocation';
import DistanceInMiles from '../../common/DistanceInMiles';
import GetDeliveryLocation from '../../common/GetDeliveryLocation';

// const revenueItemOptions = [
//   { label: "Freight Charge", value: "Freight Charge" },
//   { label: "Fuel Charge", value: "Fuel Charge" },
// ];

const rateMethodOptions = [
  { label: "Flat", value: "flat" },
  { label: "Percentage", value: "percentage" },
];

const appointmentOptions = [
  { value: 0, label: "No Appointment" },
  { value: 1,  label: "Appointment" },
];

const weightUnits = [
  { value: "KG", label: "KG" },
  { value: 'LBS',  label: "LBS" },
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

    const [revenueItemOptions, setRevenueItemOptions] = useState([]);
    const fetchCharges = () => {
      setLoading(true);
      const resp = Api.get(`/chargesLists`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
          setRevenueItemOptions(res.data.list);
         } else {
          setRevenueItemOptions([]);
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
      // fetCommunities();
      fetchequipmentOptions();
      fetchCharges();
          // fetchOrder();
    }, []);

 

    const [distance, setDistance] = useState(0);
    const getDistance = async () => {
      let distancesArray = [];

      if (
        shippingDetails &&
        shippingDetails[0] &&
        shippingDetails[0].locations
      ) {
        shippingDetails[0].locations.forEach((item) => {
          if (item.location) {
            distancesArray.push(item.location);
          }
        });
      }

      if (distancesArray.length < 2) {
        toast.error("Address is not complete to calculate distance.");
        return 0;
      }

      try {
        const res = await Api.post("/getdistance", { locations: distancesArray });

        if (res.data.status) {
          const alldistance = res.data.totalKm;
          setDistance(alldistance); // Optional, for UI only
          return alldistance;
        } else {
          toast.error(res.data.msg);
          return 0;
        }
      } catch (error) {
        toast.error("Error fetching distance");
        return 0;
      }
    };
 
    const [shippingDetails, setShippingDetails] = useState([
      {
        commodity: null,
        equipment: null,
        weight: "",
        weight_unit: "KG",
        locations: [
          {
            location: "",
            referenceNo: "",
            appointment: 0,
            date: "",
            type: "pickup",
          },
          {
            location: "",
            referenceNo: "",
            appointment: 0,
            date: "",
            type: "delivery",
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
          commodity: null,
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
    const addStop = (blockIndex, tag) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex].locations.push({
        location: "",
        referenceNo: "",
        appointment: null,
        date: "",
        type: tag,
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
      "customer" :null,
      'customer_payment_method' : '',
      "carrier" : null,
      "payment_status" : "pending",
      "payment_method" : "none",
      "carrier_payment_status" : "pending",
      "carrier_payment_method" : "",
      "revenue_currency" : 'cad',
      "order_status" : "added", 
    });

    const chooseCustomer = (e) => { 
      setData({ ...data, customer: e.value});
    }
    const chooseCarrier = (e) => { 
      setData({ ...data, carrier: e.value});
    }

    const [revCurrency, setRevCurrency] = useState('cad');
    const chooseAmountCurrency = (e) => { 
      setData({ ...data, revenue_currency: e.target.value});
      setRevCurrency(e.target.value);
    } 
    
    const {Errors} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
      console.log("shippingDetails",shippingDetails);
    },[shippingDetails]);

    const addOrder = async () => {

      setLoading(true);
      const calculated_distance = await getDistance();
      // add 2 seconds delay to get distance
      await new Promise(resolve => setTimeout(resolve, 2000));

      const alldata = {...data, 
        "revenue_items"  : revenueItems || [],
        "carrier_revenue_items"  : carrierRevenueItems || [],
        "shipping_details" : shippingDetails || [],
        "totalDistance" : distance ? Number(distance) : Number(calculated_distance),
        "total_amount" : revenueItems.reduce((total, item) => total + Number(item.rate) * Number(item.quantity), 0),
        "carrier_amount" : carrierRevenueItems.reduce((total, item) => total + Number(item.rate) * Number(item.quantity), 0),
      };

      function isObjectValid(obj) {
        return Object.values(obj).every(value => value !== null && value !== '' && value !== undefined);
      }

      if(alldata.shipping_details && alldata.shipping_details[0]) {
        const isall = isObjectValid(alldata.shipping_details && alldata.shipping_details[0]);
        if(!isall) {
          toast.error('Please enter shipping details of this order.');
          setLoading(false);
          return false;
        }
      }
      if(alldata.revenue_items && alldata.revenue_items[0]) {
        const isall = isObjectValid(alldata.revenue_items && alldata.revenue_items[0]);
        if(!isall) {
          toast.error('Please enter correct customer revenue details of this order.');
          setLoading(false);
          return false;
        }
      }
      if(alldata.carrier_revenue_items && alldata.carrier_revenue_items[0]) {
        const isall = isObjectValid(alldata.carrier_revenue_items && alldata.carrier_revenue_items[0]);
        if(!isall) {
          toast.error('Please enter correct carrier revenue details of this order.');
          setLoading(false);
          return false;
        }
      }
      
      if(alldata.customer === null || alldata.customer === '') {
        toast.error('Customer is required');
        setLoading(false);
        return false;
      }
      if(alldata.carrier === null || alldata.carrier === '') {
        toast.error('Carrier is required');
        setLoading(false);
        return false;
      }

      if(alldata.total_amount === '') {
        toast.error('Total amount can not be empty.');
        setLoading(false);
        return false;
      }


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
          <div>
            {/* <div className="flex justify-between mt-12 mb-4 items-center">
              <p className="text-gray-400 heading xl text-xl">Shipping Details</p>
              <button
                className="btn text-black font-bold"
                onClick={addNewShippingBlock}> + Add New
              </button>
            </div> */}


            {shippingDetails.map((detail, index) => (
              <>
              <div key={index}
                className="mt-2 mb-6">
                <div className='flex mb-4 justify-between'>
                  <p className="text-gray-400 heading xl text-xl ">Shipment Details
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
                      name="commodity"
                      onChange={(e) =>handleShippingInputChange(index, "commodity", e.target.value)}
                      type={"text"}
                      placeholder={"Enter Commodity"}
                      className="input-sm"
                    />
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
                </div>

                {detail && detail?.locations && (() => {
                    let pickupCount = 0;
                    let stopCount = 0;
                    return detail?.locations && detail?.locations.map((l, locationIndex)=>{
                        if(l.type === 'pickup'){
                          pickupCount = pickupCount+1;
                          return  <div>
                            <h2 className='text-white mb-3 mt-6 text-normal heading'>Pickup #{pickupCount}</h2>
                            <div className="grid grid-cols-4 gap-4 ">
                              <div className="input-item">
                                <label className="mb-0 block text-sm text-gray-400">Pickup Location</label>
                                {/* <input
                                  required
                                  onChange={(e)=>handleNestedInputChange(index, 'locations', locationIndex, 'location', e.target.value)}
                                  type={"text"} 
                                  placeholder={"Enter Pickup location"} 
                                  className="input-sm"
                                /> */}
                                <GetLocation id="getpickup" placeholder={"Enter Pickup Location"} onchange={(value)=>handleNestedInputChange(index, 'locations', locationIndex, 'location', value)} />

                              </div>
                              <div className="input-item">
                                <label className="mb-0 block text-sm text-gray-400">
                                  Pickup Reference No.
                                </label>
                                <input
                                  required
                                  onChange={(e)=>handleNestedInputChange(index, 'locations', locationIndex, 'referenceNo', e.target.value)}
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
                                  onChange={(selected) => handleNestedInputChange(index, 'locations', locationIndex, 'appointment', selected && selected.value)}
                                  options={appointmentOptions}
                                />
                              </div>
                              <div className="input-item">
                                <label className="mb-0 block text-sm text-gray-400">
                                  Pickup Date
                                </label>
                                <input
                                  required onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                  onChange={(e) => handleNestedInputChange(index, 'locations', locationIndex, 'date', e.target.value)}
                                  type={"date"}
                                  placeholder={"Enter Pickup Date"}
                                  className="input-sm"
                                />
                              </div>
                            </div>
                          </div>

                        } else {
                          stopCount = stopCount+1;
                          return <div>
                            <h2 className='text-white mb-3 mt-6 text-normal heading'>Delivery #{stopCount}</h2>
                            <div className="grid grid-cols-4 gap-4 ">
                              <div className="input-item">
                                <label className="mb-0 block text-sm text-gray-400">Delivery Location</label>
                                {/* 
                                <input
                                  required
                                  onChange={(e)=>handleNestedInputChange(index, 'locations', locationIndex, 'location', e.target.value)}
                                  type={"text"} 
                                  placeholder={"Enter Delivery location"} 
                                  className="input-sm"
                                /> 
                                */}
                                <GetDeliveryLocation id="getdelivery"  placeholder={"Enter Delivery Location"} onchange={(value)=>handleNestedInputChange(index, 'locations', locationIndex, 'location', value)} />
                              </div>
                              <div className="input-item">
                                <label className="mb-0 block text-sm text-gray-400">
                                  Delivery Reference No.
                                </label>
                                <input
                                  required
                                  onChange={(e)=>handleNestedInputChange(index, 'locations', locationIndex, 'referenceNo', e.target.value)}
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
                                  onChange={(selected) => handleNestedInputChange(index, 'locations', locationIndex, 'appointment', selected && selected.value)}
                                  options={appointmentOptions}
                                />
                              </div>
                              <div className="input-item">
                                <label className="mb-0 block text-sm text-gray-400">
                                  Delivery Date
                                </label>
                                <input onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                  required
                                  onChange={(e) => handleNestedInputChange(index, 'locations', locationIndex, 'date', e.target.value)}
                                  type={"date"}
                                  placeholder={"Enter Delivery Date"}
                                  className="input-sm"
                                />
                              </div>
                            </div>
                          </div>
                        }
                      })
                    })()}

                <div className='flex'>
                  <button onClick={()=>addStop(index, 'pickup')} className='text-main  mt-4 me-8  ' >+ Add Pickup Stop</button>
                  <button onClick={()=>addStop(index, 'delivery')} className='text-main  mt-4  ' >+ Add Delivery Stop</button>
                </div>
                <div className='border-t border-gray-700 my-8'></div>

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
                      <label className="block text-sm text-gray-400">Note/Comment</label>
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
              <Select classNamePrefix="react-select input"  placeholder={'Choose Carrier'}
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
                      <label className="block text-sm text-gray-400">Note/Comment</label>
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
                        onClick={()=>removeCarrierRevenueLine(index)} >&times;
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
              <li className='flex justify-end '><p className='text-gray-400 me-4'>Total Distance : </p> 
              <strong className='text-white'> <DistanceInMiles d={distance} />
                {distance > 1 ? <button
                className="text-main ms-2"
                onClick={getDistance}>Re-calculate
              </button> : 
                <button
                className="text-main ms-2"
                onClick={getDistance}> Calculate Distance
              </button>
              }
              </strong></li>
              <li className='flex justify-end '><p className='text-gray-400 me-4'>Carrier Total : </p> <strong className='text-white'>  <Currency amount={ carrierRevenueItems.reduce((a, b) => a + b.rate * b.quantity, 0)} currency={revCurrency || 'cad'} /></strong></li>
            </ul>
          </div>

          <div className='flex justify-end items-center mt-6'>
            <button onClick={addOrder}  className={`btn md   ${data.carrier === '' ? "disabled" : ''} px-[50px] text-sm ms-3 main-btn text-black font-bold`}>{loading ? "Adding..." : "Submit Order"}</button>
          </div>
          {/* <div className='flex justify-end items-center mt-6'>
            {distance ?
            <button onClick={addOrder}  className={`btn md   ${data.carrier === '' ? "disabled" : ''} px-[50px] text-sm ms-3 main-btn text-black font-bold`}>{loading ? "Adding..." : "Submit Order"}</button>
            :
          <Popup  size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses={`btn md    px-[50px] text-sm ms-3 main-btn text-black font-bold`} 
            btntext={<>Add Order</>} >
                <h2 className='text-white font-bold text-center text-lg '>Add Order Without Total Distance.</h2>
                <p className='text-white text-center my-4 text-lg'>
                  You can add order without calculating total distance, but it is recommended to calculate distance before adding order.
                </p>

                { distance ?
                <p className='text-white text-center my-4 text-lg'>Total Distance : <span className='text-gray-400'> <DistanceInMiles d={distance} /> </span></p>
                : ''}
                <div className='flex justify-center gap-3 items-center mt-6 '>
                    <button onClick={getDistance} className={`btn bg-gray-700  md px-[50px] text-white font-bold`}>Calculate Distance</button>
                    <button onClick={addOrder}  className={`btn md   ${data.carrier === '' ? "disabled" : ''} px-[50px] text-sm ms-3 main-btn text-black font-bold`}>{loading ? "Adding..." : "Submit Order"}</button>
                </div>
            </Popup>
             
            }
            </div> */}

      </div>
    </AuthLayout>
  )
}
