import React, { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import AuthLayout from '../../../layout/AuthLayout';
import Select from 'react-select'
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../../common/Popup';
import Currency from '../../common/Currency';
import GetLocation from '../../common/GetLocation';
import DistanceInMiles from '../../common/DistanceInMiles';
import GetDeliveryLocation from '../../common/GetDeliveryLocation';
import Loading from '../../common/Loading';
import { TbUser, TbReceipt2, TbBuildingWarehouse, TbTruck, TbRoute } from "react-icons/tb";
import { LuPackage, LuMapPin, LuPackageCheck, LuPlus, LuCalculator } from "react-icons/lu";
import { FaTruckMoving } from "react-icons/fa6";
import AddCustomer from '../customer/AddCustomer';
import AddCarrier from '../carrier/AddCarrier';
import QuickAddItem from '../../../components/order/QuickAddItem';
import QuickAddAsset from '../../../components/order/QuickAddAsset';
import AddDriver from '../drivers/AddDriver';

// const revenueItemOptions = [
//   { label: "Freight Charge", value: "Freight Charge" },
//   { label: "Fuel Charge", value: "Fuel Charge" },
// ];

const rateMethodOptions = [
  { label: "Flat", value: "flat" },
  { label: "Percentage", value: "percentage" },
];

const appointmentOptions = [
  { value: "no", label: "No Appointment" },
  { value: "appointment", label: "Appointment" },
  { value: "time", label: "Appointment with Time" },
];

const weightUnits = [
  { value: "KG", label: "KG" },
  { value: 'LBS',  label: "LBS" },
];

/* ── Shared presentational helpers (consistent with the order View page) ── */
const fieldLabel = 'block text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400';

// Render react-select menus in a body portal so they are never clipped by the
// card's `overflow-hidden` or covered by following sections.
const selectMenuProps = {
  menuPortalTarget: typeof document !== 'undefined' ? document.body : undefined,
  menuPosition: 'fixed',
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
};

const SectionCard = ({ title, subtitle, icon, accent = '#a091ff', children, className = '', right = null }) => (
  <section className={`bg-dark1 border border-white/[0.06] rounded-2xl overflow-hidden ${className}`}>
    <header className='flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/[0.05]'>
      <div className='flex items-center gap-3'>
        <span className='flex items-center justify-center w-9 h-9 rounded-xl shrink-0' style={{ background: `${accent}1a`, color: accent }}>{icon}</span>
        <div>
          <h3 className='text-[13px] font-bold uppercase tracking-[0.14em] text-gray-200'>{title}</h3>
          {subtitle ? <p className='text-[12px] text-gray-500 mt-0.5 normal-case tracking-normal'>{subtitle}</p> : null}
        </div>
      </div>
      {right}
    </header>
    <div className='p-5 sm:p-6'>{children}</div>
  </section>
);

export default function AddOrder({ isEdit = false }){

    const { id } = useParams();
    const [isEditMode, setIsEditMode] = useState(isEdit && id);
    const [existingOrder, setExistingOrder] = useState(null);
    const [initialLoading, setInitialLoading] = useState(isEdit && id);

    const fetchOrder = () => {
      if (!isEdit || !id) return;

      setInitialLoading(true);
      const resp = Api.get(`/order/detail/${id}`);
      resp.then((res) => {
        setInitialLoading(false);
        if (res.data.status) {
            setExistingOrder(res.data.order);
            populateOrderData(res.data.order);
        } else {
            toast.error('Order not found');
            navigate('/orders');
        }
      }).catch((err) => {
        setInitialLoading(false);
        Errors(err);
        navigate('/orders');
      });
    }

    const [revenueItemOptions, setRevenueItemOptions] = useState([]);
    const fetchCharges = () => {
      setLoading(true);
      const resp = Api.get(`/api/tenant/chargesLists`);
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
      const resp = Api.get(`/api/tenant/equipmentLists`);
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
    useEffect(()=> {
      fetchcustomers();
      fetchcarriers();
      fetchequipmentOptions();
      fetchCharges();
      if (isEdit && id) {
        fetchOrder();
      }
    }, [isEdit, id]);



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
        reference: "",
        equipment: null,
        weight: "",
        weight_unit: "KG",
        locations: [
          {
            location: "",
            referenceNo: "",
            appointment: "no",
            date: "",
            type: "pickup",
          },
          {
            location: "",
            referenceNo: "",
            appointment: "no",
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
          reference: "",
          equipment: null,
          weight: "",
          weight_unit: "KG",
          locations: [
            {
              location: "",
              referenceNo: "",
              appointment: "no",
              date: "",
              type: "pickup",
            },
            {
              location: "",
              referenceNo: "",
              appointment: "no",
              date: "",
              type: "delivery",
            }
          ],
        },
      ]);
    };
    const addStop = (blockIndex, tag) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex].locations.push({
        location: "",
        referenceNo: "",
        appointment: "no",
        date: "",
        type: tag,
      });
      setShippingDetails(updatedDetails);
    };

    const removeLocation = (blockIndex, locationIndex) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex].locations.splice(locationIndex, 1);
      setShippingDetails(updatedDetails);
    };


    const removeItemShipItem = (index) => {
      const updatedItems = shippingDetails.filter((_, i) => i !== index);
      setShippingDetails(updatedItems);
    };
    const handleNestedInputChange = (blockIndex, type, locIndex, field, value) => {
      const updatedDetails = [...shippingDetails];
      updatedDetails[blockIndex].locations[locIndex][field] = value;
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


    const {Errors, user: currentUser, selectedCurrency} = useContext(UserContext);
    const selectedCurrencyCode = String(selectedCurrency || 'USD').toLowerCase();

    const [data, setData] = useState({
      "company_name" : "Cross Miles Carrier",
      "customer_order_no": "",
      "customer" :null,
      'customer_payment_method' : '',
      "carrier" : null,
      "payment_status" : "pending",
      "payment_method" : "none",
      "carrier_payment_status" : "pending",
      "carrier_payment_method" : "",
      "revenue_currency" : selectedCurrencyCode,
      "order_status" : "added",
      "settle_amount": 0,
      "driver_assignment_mode": "company_driver",
    });

    const chooseCustomer = (e) => {
      setData({ ...data, customer: e.value});
    }

    // Admin / customers_write / subadmin can add a customer inline from the order form.
    const canAddCustomer = currentUser?.is_admin === 1
      || Number(currentUser?.role) === 3
      || (Array.isArray(currentUser?.permissions) && (
        currentUser.permissions.includes('customers_write') || currentUser.permissions.includes('subadmin')
      ));

    // Refresh the listing and auto-select the freshly created customer.
    const handleCustomerAdded = (newCustomer) => {
      fetchcustomers();
      if (newCustomer && newCustomer._id) {
        const opt = {
          _id: newCustomer._id,
          label: `${newCustomer.name} (Ref: ${newCustomer.customerCode})  `,
          value: newCustomer._id,
          mc_code: newCustomer.customerCode,
        };
        setCustomersListing(prev => prev.some(c => c.value === opt.value) ? prev : [opt, ...prev]);
        setData(prev => ({ ...prev, customer: newCustomer._id }));
      }
    }

    // Admin / carriers_write / subadmin can add a carrier inline.
    const canAddCarrier = currentUser?.is_admin === 1
      || Number(currentUser?.role) === 3
      || (Array.isArray(currentUser?.permissions) && (
        currentUser.permissions.includes('carriers_write') || currentUser.permissions.includes('subadmin')
      ));

    // Equipment & charge items are tenant settings — admin-only (mirrors the
    // /commodity-and-equipments admin page).
    const canManageSettings = currentUser?.is_admin === 1 || Number(currentUser?.role) === 3;

    const handleCarrierAdded = (newCarrier) => {
      fetchcarriers();
      if (newCarrier && newCarrier._id) {
        const opt = {
          _id: newCarrier._id,
          label: `${newCarrier.name} | ${newCarrier.country}(${newCarrier.mc_code})`,
          value: newCarrier._id,
          carrierID: newCarrier.carrierID,
        };
        setCarrierListings(prev => prev.some(c => c.value === opt.value) ? prev : [opt, ...prev]);
        setData(prev => ({ ...prev, carrier: newCarrier._id }));
      }
    }

    // Equipment add returns the created doc; charges does not — refetch covers both,
    // optimistic prepend makes the new option appear instantly.
    const handleEquipmentAdded = (value, doc) => {
      fetchequipmentOptions();
      const opt = { value: doc?.name || value, label: doc?.name || value, _id: doc?._id };
      setequipmentOptions(prev => prev.some(o => o.value === opt.value) ? prev : [opt, ...prev]);
    }

    const handleChargeAdded = (value) => {
      fetchCharges();
      const opt = { value, label: value };
      setRevenueItemOptions(prev => prev.some(o => o.value === opt.value) ? prev : [opt, ...prev]);
    }
    const chooseCarrier = (e) => {
      setData({ ...data, carrier: e.value});
    }

    // Function to populate form data when editing
    const pickId = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value._id) return String(value._id);
      return null;
    };

    const populateOrderData = (order) => {
      if (!order) return;
      const normalizedDrivers = Array.isArray(order.drivers)
        ? order.drivers
            .map((d) => pickId(d))
            .filter(Boolean)
        : (pickId(order.driver) ? [pickId(order.driver)] : []);

      // Set basic order data
      setData({
        company_name: order.company_name || "Cross Miles Carrier",
        customer_order_no: order.customer_order_no || "",
        customer: pickId(order.customer),
        customer_payment_method: order.customer_payment_method || '',
        carrier: pickId(order.carrier),
        payment_status: order.payment_status || "pending",
        payment_method: order.payment_method || "none",
        carrier_payment_status: order.carrier_payment_status || "pending",
        carrier_payment_method: order.carrier_payment_method || "",
        revenue_currency: order.input_currency || order.revenue_currency || 'usd',
        order_status: order.order_status || "added",
        order_type: order.order_type || 'outsourcing',
        drivers: normalizedDrivers,
        driver: normalizedDrivers.length > 0 ? normalizedDrivers[0] : null,
        truck: pickId(order.truck),
        trailer: pickId(order.trailer),
        settle_amount: Number(order.settle_amount || 0),
        driver_assignment_mode: order.driver_assignment_mode || 'company_driver'
      });

      // Set currency
      setRevCurrency(order.input_currency || order.revenue_currency || 'usd');

      // Set distance
      setDistance(order.totalDistance || 0);

      // Set shipping details
      if (order.shipping_details && order.shipping_details.length > 0) {
        setShippingDetails(order.shipping_details);
      }

      // Revenue/carrier items are stored in base currency (revenue_currency, usually USD),
      // but the form edits values in input_currency. Convert rates back so the displayed
      // amounts match what the user originally typed (input_total_amount / input_carrier_amount).
      const inputCur = (order.input_currency || order.revenue_currency || 'usd');
      const baseCur = (order.revenue_currency || 'usd');
      const needsBackConvert = inputCur !== baseCur;

      const backConvert = (items, inputTotal, baseTotal) => {
        const factor = (needsBackConvert && Number(baseTotal) > 0 && Number(inputTotal) > 0)
          ? Number(inputTotal) / Number(baseTotal)
          : 1;
        if (factor === 1) return items;
        return items.map((item) => ({
          ...item,
          rate: Number((Number(item.rate || 0) * factor).toFixed(2)),
        }));
      };

      // Set revenue items
      if (order.revenue_items && order.revenue_items.length > 0) {
        setRevenueItems(backConvert(order.revenue_items, order.input_total_amount, order.total_amount));
      }

      // Set carrier revenue items
      if (order.carrier_revenue_items && order.carrier_revenue_items.length > 0) {
        setCarrierRevenueItems(backConvert(order.carrier_revenue_items, order.input_carrier_amount, order.carrier_amount));
      }
    };

    const [revCurrency, setRevCurrency] = useState(selectedCurrencyCode);

    // Terminology constants
    const TERM_OUTSOURCING = 'Outsourcing (Carriers)';
    const TERM_REGULAR = 'Regular (Trucking, driver etc)';

    const userModules = Array.isArray(currentUser?.permissions) ? currentUser.permissions : ['outsourcing', 'regular'];
    const availableOrderTypes = [
      ...(userModules.includes('outsourcing') ? [{ label: TERM_OUTSOURCING, value: 'outsourcing' }] : []),
      ...(userModules.includes('regular') ? [{ label: TERM_REGULAR, value: 'regular' }] : []),
    ];

    const handleRevCurrencyChange = (code) => {
      const next = String(code || 'USD').toLowerCase();
      setRevCurrency(next);
      setData((prev) => ({ ...prev, revenue_currency: next }));
    };

    useEffect(() => {
      if (!data.order_type) {
        const def = availableOrderTypes[0]?.value || 'outsourcing';
        setData(prev => ({ ...prev, order_type: def }));
      }
    }, [userModules]);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
      console.log("shippingDetails",shippingDetails);
    },[shippingDetails]);

    // Asset listings for Regular orders
    const [drivers, setDrivers] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [truckMetaMap, setTruckMetaMap] = useState({});
    const [trailers, setTrailers] = useState([]);
    const fetchAssetLists = () => {
      // Fetch drivers
      Api.get(`/driver/listings`).then(res => {
        const lists = res.data?.lists || [];
        const opts = lists.map(d => ({ value: d._id, label: `${d.name} (${d.corporateID || 'No ID'})` }));
        setDrivers(opts);
      }).catch(()=> setDrivers([]));

      // Fetch trucks
      Api.get(`/fleet/trucks/listings`).then(res => {
        const lists = res.data?.lists || res.data?.trucks || [];
        const nextMeta = {};
        const opts = lists.map(t => {
            const tName = [t.make, t.model].filter(Boolean).join(' ') || t.unitNumber || 'Unnamed Truck';
            nextMeta[t._id] = t;
            return {
              value: t._id,
              label: `${`${tName} ${t.plateNumber ? `(${t.plateNumber})` : ''}`.trim() || 'No Unit/Plate'}${t.ownerOperated ? ' • Owner Operated' : ''}`,
              ownerOperated: !!t.ownerOperated,
              ownerOperatorName: t?.ownerOperator?.fullName || ''
            };
        });
        setTrucks(opts);
        setTruckMetaMap(nextMeta);
      }).catch(()=> setTrucks([]));

      // Fetch trailers
      Api.get(`/fleet/trailers/listings`).then(res => {
        const lists = res.data?.lists || res.data?.trailers || [];
        const opts = lists.map(t => {
            const tName = [t.make, t.model].filter(Boolean).join(' ') || t.type || 'Unnamed Trailer';
            return { value: t._id, label: `${tName} ${t.unitNumber ? `(${t.unitNumber})` : ''}`.trim() || 'No Unit/Plate' };
        });
        setTrailers(opts);
      }).catch(()=> setTrailers([]));
    };

    useEffect(() => {
      fetchAssetLists();
    }, []);

    const selectedTruckMeta = data.truck ? truckMetaMap[data.truck] : null;
    const hasCompanyDriverSelected = Array.isArray(data.drivers) && data.drivers.length > 0;

    const chooseDriver = (e) => {
      const selectedDrivers = e ? e.map(item => item.value) : [];
      setData(prev => ({ ...prev, drivers: selectedDrivers }));
    };
    const chooseTruck = (e) => {
      const truckId = e?.value || null;
      const meta = truckId ? truckMetaMap[truckId] : null;
      const ownerOperated = !!meta?.ownerOperated;
      setData((prev) => ({
        ...prev,
        truck: truckId,
        settle_amount: ownerOperated ? prev.settle_amount : 0,
        driver_assignment_mode: 'company_driver',
      }));
    };
    const chooseTrailer = (e) => setData(prev => ({ ...prev, trailer: e?.value || null }));

    // Admin / regular-module users can add fleet assets (truck/trailer/driver) inline.
    // Mirrors requireModuleAccess('regular') on the fleet create routes; this whole
    // section only renders for regular orders anyway.
    const canManageFleet = currentUser?.is_admin === 1
      || Number(currentUser?.role) === 3
      || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('regular'));

    const handleTruckAdded = (doc) => {
      fetchAssetLists();
      if (doc && doc._id) {
        const tName = [doc.make, doc.model].filter(Boolean).join(' ') || doc.unitNumber || 'Unnamed Truck';
        const opt = {
          value: doc._id,
          label: `${`${tName} ${doc.plateNumber ? `(${doc.plateNumber})` : ''}`.trim() || 'No Unit/Plate'}${doc.ownerOperated ? ' • Owner Operated' : ''}`,
          ownerOperated: !!doc.ownerOperated,
          ownerOperatorName: doc?.ownerOperator?.fullName || '',
        };
        setTrucks(prev => prev.some(t => t.value === opt.value) ? prev : [opt, ...prev]);
        setTruckMetaMap(prev => ({ ...prev, [doc._id]: doc }));
        setData(prev => ({ ...prev, truck: doc._id, settle_amount: doc.ownerOperated ? prev.settle_amount : 0 }));
      }
    }

    const handleTrailerAdded = (doc) => {
      fetchAssetLists();
      if (doc && doc._id) {
        const tName = [doc.make, doc.model].filter(Boolean).join(' ') || doc.type || 'Unnamed Trailer';
        const opt = { value: doc._id, label: `${tName} ${doc.unitNumber ? `(${doc.unitNumber})` : ''}`.trim() || 'No Unit/Plate' };
        setTrailers(prev => prev.some(t => t.value === opt.value) ? prev : [opt, ...prev]);
        setData(prev => ({ ...prev, trailer: doc._id }));
      }
    }

    const handleDriverAdded = (user) => {
      fetchAssetLists();
      if (user && user._id) {
        const opt = { value: user._id, label: `${user.name} (${user.corporateID || 'No ID'})` };
        setDrivers(prev => prev.some(d => d.value === opt.value) ? prev : [opt, ...prev]);
        setData(prev => ({ ...prev, drivers: [...(prev.drivers || []), user._id] }));
      }
    }

    const addOrder = async () => {

      setLoading(true);
      const calculated_distance = await getDistance();
      // add 2 seconds delay to get distance
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderType = data.order_type || (availableOrderTypes[0]?.value || 'outsourcing');
      const isOutsourcing = orderType === 'outsourcing';
      const isRegular = orderType === 'regular';
      const isOwnerOperatedTruck = isRegular && !!selectedTruckMeta?.ownerOperated;
      const settleAmount = Number(data.settle_amount || 0);

      const ownerDriverAssignmentMode = isOwnerOperatedTruck
        ? (hasCompanyDriverSelected ? 'company_driver' : 'owner_driver')
        : 'company_driver';

      const alldata = {...data,
        order_type: orderType,
        "revenue_items"  : revenueItems || [],
        "carrier_revenue_items"  : isOutsourcing ? (carrierRevenueItems || []) : [],
        "shipping_details" : shippingDetails || [],
        "totalDistance" : Number(calculated_distance),
        "total_amount" : revenueItems.reduce((total, item) => total + Number(item.rate) * Number(item.quantity), 0),
        "carrier_amount" : isOutsourcing ? carrierRevenueItems.reduce((total, item) => total + Number(item.rate) * Number(item.quantity), 0) : settleAmount,
        "drivers": isOutsourcing ? [] : ((isOwnerOperatedTruck && ownerDriverAssignmentMode === 'owner_driver') ? [] : (data.drivers || [])),
        "driver": isOutsourcing ? null : ((isOwnerOperatedTruck && ownerDriverAssignmentMode === 'owner_driver') ? null : (data.drivers && data.drivers.length > 0 ? data.drivers[0] : null)),
        "truck": isOutsourcing ? null : data.truck,
        "trailer": isOutsourcing ? null : data.trailer,
        "carrier": isOutsourcing ? data.carrier : null,
        "settle_amount": isRegular ? settleAmount : 0,
        "driver_assignment_mode": isRegular ? ownerDriverAssignmentMode : 'company_driver'
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
      if (isOutsourcing) {
        if(alldata.carrier_revenue_items && alldata.carrier_revenue_items[0]) {
          const isall = isObjectValid(alldata.carrier_revenue_items && alldata.carrier_revenue_items[0]);
          if(!isall) {
            toast.error('Please enter correct carrier revenue details of this order.');
            setLoading(false);
            return false;
          }
        }
      }

      if(alldata.customer === null || alldata.customer === '') {
        toast.error('Customer is required');
        setLoading(false);
        return false;
      }

      if(isOutsourcing){
        if(!alldata.carrier) {
          toast.error('Carrier is required');
          setLoading(false);
          return false;
        }
      } else {
        alldata.drivers = alldata.drivers || [];
        alldata.driver = alldata.driver || null;
        alldata.truck = alldata.truck || null;
        alldata.trailer = alldata.trailer || null;
        if (isOwnerOperatedTruck) {
          if (!alldata.settle_amount || Number(alldata.settle_amount) <= 0) {
            toast.error('Settle amount is required for owner operated truck');
            setLoading(false);
            return false;
          }
          if (Number(alldata.settle_amount) > Number(alldata.total_amount || 0)) {
            toast.error('Settle amount can not be greater than order total');
            setLoading(false);
            return false;
          }
        }
      }

      if(alldata.total_amount === '') {
        toast.error('Total amount can not be empty.');
        setLoading(false);
        return false;
      }


      // Determine if we're adding or updating
      const endpoint = isEditMode ? `/order/update/${id}` : `/order/add`;
      const method = isEditMode ? 'put' : 'post';

      const resp = Api[method](endpoint, alldata);
      resp.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
          navigate('/orders');
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        Errors(err);
      });
    }




  // Show loading while fetching order data for editing
  if (initialLoading) {
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    );
  }

  const orderType = data.order_type || 'outsourcing';
  const isOutsourcingUI = orderType === 'outsourcing';
  const isRegularUI = orderType === 'regular';
  const customerTotal = revenueItems.reduce((a, b) => a + b.rate * b.quantity, 0);
  const carrierTotal = carrierRevenueItems.reduce((a, b) => a + b.rate * b.quantity, 0);
  const selectedCustomerOpt = data.customer ? customersListing.find(c => c.value === data.customer) : null;

  return (
    <AuthLayout>
      <div className='max-w-[1400px] mx-auto pb-28'>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className='flex flex-wrap items-end justify-between gap-4 mb-8 mt-2'>
          <div>
            <div className='flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2'>
              <span onClick={() => navigate('/orders')} className='cursor-pointer hover:text-gray-300 transition-colors'>Orders</span>
              <span className='text-gray-700'>/</span>
              <span className='text-gray-400'>{isEditMode ? 'Edit' : 'New'}</span>
            </div>
            <h2 className='text-3xl font-bold text-white font-mona'>{isEditMode ? `Edit Order #${existingOrder?.serial_no}` : 'Add New Order'}</h2>
          </div>

          {/* Module Switcher Tabs */}
          {availableOrderTypes.length > 1 && (
            <div className="flex bg-[#0c1b26] p-1 rounded-xl border border-white/[0.07] shadow-inner w-fit">
              <button
                onClick={() => setData(prev => ({ ...prev, order_type: 'outsourcing' }))}
                className={`text-[11px] uppercase font-bold tracking-wider py-2.5 px-5 sm:px-7 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  isOutsourcingUI
                    ? 'bg-gradient-to-r from-[#a091ff] to-[#c3a9ff] text-black shadow-lg shadow-[#a091ff]/20'
                    : 'text-[#8A8FA3] hover:text-[#EDEFF6]'
                }`}
              >
                <TbBuildingWarehouse size={15} /> {TERM_OUTSOURCING}
              </button>
              <button
                onClick={() => setData(prev => ({ ...prev, order_type: 'regular' }))}
                className={`text-[11px] uppercase font-bold tracking-wider py-2.5 px-5 sm:px-7 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  isRegularUI
                    ? 'bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white shadow-lg shadow-rose-500/20'
                    : 'text-[#8A8FA3] hover:text-[#EDEFF6]'
                }`}
              >
                <FaTruckMoving size={13} /> {TERM_REGULAR}
              </button>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-6'>

          {/* ── Order basics ──────────────────────────────────── */}
          <SectionCard title='Order Basics' subtitle='Who the order is for and how to reference it' icon={<TbUser size={18} />} accent='#a091ff'>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className='input-item'>
                <div className='flex items-center justify-between gap-2 mb-1'>
                  <label className={fieldLabel}>Customer</label>
                  {canAddCustomer && (
                    <AddCustomer
                      fetchLists={handleCustomerAdded}
                      classes="text-[11px] font-semibold text-[#a091ff] hover:text-[#c3a9ff] transition-colors flex items-center gap-1"
                      text={<><LuPlus size={12} /> New customer</>}
                    />
                  )}
                </div>
                <Select
                  classNamePrefix="react-select input" {...selectMenuProps}
                  placeholder={'Search and choose customer...'}
                  isSearchable={true}
                  value={selectedCustomerOpt}
                  onChange={chooseCustomer}
                  options={customersListing}
                />
              </div>
              <div className='input-item'>
                <label className={fieldLabel}>Customer Order No <span className='text-gray-600 normal-case font-normal'>(optional)</span></label>
                <input
                  className="input-sm"
                  value={data.customer_order_no || ''}
                  onChange={(e) => setData(prev => ({ ...prev, customer_order_no: e.target.value }))}
                  placeholder="Enter customer order number"
                />
              </div>
              <div className='input-item'>
                <label className={fieldLabel}>Reference <span className='text-gray-600 normal-case font-normal'>(PO#, Load#, etc.)</span></label>
                <input
                  className="input-sm"
                  value={shippingDetails?.[0]?.reference || ''}
                  onChange={(e) => handleShippingInputChange(0, "reference", e.target.value)}
                  placeholder="PO#, Load#, Customer Pickup#, Container#"
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Shipment details ──────────────────────────────── */}
          {shippingDetails.map((detail, index) => (
            <SectionCard
              key={index}
              title={shippingDetails.length > 1 ? `Shipment #${index + 1}` : 'Shipment Details'}
              subtitle='Commodity, equipment and route stops'
              icon={<LuPackage size={18} />}
              accent='#a091ff'
              right={index ? (
                <button className="text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors" onClick={() => removeItemShipItem(index)}>Remove shipment</button>
              ) : null}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4 pb-6 border-b border-white/[0.06] mb-2">
                <div className="input-item">
                  <label className={fieldLabel}>Commodity</label>
                  <input
                    required
                    name="commodity"
                    value={detail.commodity || ""}
                    onChange={(e) =>handleShippingInputChange(index, "commodity", e.target.value)}
                    type={"text"}
                    placeholder={"Enter Commodity"}
                    className="input-sm"
                  />
                </div>
                {!(index === 0) && (
                  <div className="input-item">
                    <label className={fieldLabel}>Reference <span className='text-gray-600 normal-case font-normal'>(PO#, Load#)</span></label>
                    <input
                      name="reference"
                      value={detail.reference || ""}
                      onChange={(e) =>handleShippingInputChange(index, "reference", e.target.value)}
                      type={"text"}
                      placeholder={"PO#, Load#, Customer Pickup#, Container#"}
                      className="input-sm"
                    />
                  </div>
                )}
                <div className="input-item">
                  <div className='flex items-center justify-between gap-2 mb-1'>
                    <label className={fieldLabel}>Equipment</label>
                    {canManageSettings && (
                      <QuickAddItem
                        endpoint="/api/tenant/addEquipment"
                        title="Add Equipment"
                        subtitle="Create a new equipment type for this tenant"
                        label="Equipment name"
                        icon={LuPackage}
                        accent="#22d3ee"
                        onAdded={handleEquipmentAdded}
                        classes="text-[11px] font-semibold text-[#22d3ee] hover:text-[#67e8f9] transition-colors flex items-center gap-1"
                        text={<><LuPlus size={12} /> New</>}
                      />
                    )}
                  </div>
                  <Select
                    classNamePrefix="react-select input" {...selectMenuProps}
                    placeholder={"Equipment"}
                    value={detail.equipment}
                    onChange={(selected) =>handleShippingInputChange(index, "equipment", selected)}
                    options={equipmentOptions}
                  />
                </div>

                <div className="input-item">
                  <label className={fieldLabel}>Weight</label>
                  <input
                    required name="weight"
                    value={detail.weight || ""}
                    onChange={(e) =>
                      handleShippingInputChange(index, "weight", e.target.value)
                    }
                    type={"text"} placeholder={"Enter Weight"}
                    className="input-sm"
                  />
                </div>
                <div className="input-item">
                  <label className={fieldLabel}>Weight Unit</label>
                  <Select
                    classNamePrefix="react-select input" {...selectMenuProps}
                    placeholder={"Weight Unit"}
                    value={detail.weight_unit ? weightUnits.find(option => option.value === detail.weight_unit) : null}
                    onChange={(selected) =>
                      handleShippingInputChange(index, "weight_unit", selected && selected.value)
                    }
                    options={weightUnits}
                  />
                </div>
              </div>

              {/* Route stops */}
              <div className='mt-5'>
                {detail && detail?.locations && (() => {
                    let pickupCount = 0;
                    let stopCount = 0;
                    return detail?.locations && detail?.locations.map((l, locationIndex)=>{
                        const isPickup = l.type === 'pickup';
                        if(isPickup){
                          pickupCount = pickupCount+1;
                          const totalPickups = detail.locations.filter(loc => loc.type === 'pickup').length;
                          return  <div key={`pickup-${locationIndex}`} className='relative rounded-xl border border-emerald-400/15 bg-emerald-500/[0.04] p-4 sm:p-5 mb-4'>
                            <div className='flex items-center justify-between mb-4'>
                              <h4 className='flex items-center gap-2 text-emerald-300 text-[12px] font-bold uppercase tracking-[0.13em]'>
                                <span className='flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-400/30'><LuMapPin size={14} /></span>
                                Pickup #{pickupCount}
                              </h4>
                              {totalPickups > 1 && (
                                <button
                                  className="text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors"
                                  onClick={() => removeLocation(index, locationIndex)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                              <div className="input-item">
                                <label className={fieldLabel}>Pickup Location</label>
                                <GetLocation id="getpickup" initialValue={l.location || ""} placeholder={"Enter Pickup Location"} onchange={(value)=>handleNestedInputChange(index, 'locations', locationIndex, 'location', value)} />
                              </div>
                              <div className="input-item">
                                <label className={fieldLabel}>Pickup Reference No.</label>
                                <input
                                  required
                                  value={l.referenceNo || ""}
                                  onChange={(e)=>handleNestedInputChange(index, 'locations', locationIndex, 'referenceNo', e.target.value)}
                                  type={"text"}
                                  placeholder={"Pickup Reference No."}
                                  className="input-sm"
                                />
                              </div>
                              <div className="input-item">
                                <label className={fieldLabel}>Appointment Time</label>
                                <input
                                  type="time" defaultValue={l.appointment || "no"}
                                  onChange={(e) => handleNestedInputChange(index, 'locations', locationIndex, 'appointment', e.target.value || "no")}
                                  className="input-sm"
                                  placeholder="Select time"
                                />
                              </div>
                              <div className="input-item">
                                <label className={fieldLabel}>Pickup Date</label>
                                <input
                                  required onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                  value={l.date || ""}
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
                          const totalDeliveries = detail.locations.filter(loc => loc.type === 'delivery').length;
                          return <div key={`delivery-${locationIndex}`} className='relative rounded-xl border border-rose-400/15 bg-rose-500/[0.04] p-4 sm:p-5 mb-4'>
                            <div className='flex items-center justify-between mb-4'>
                              <h4 className='flex items-center gap-2 text-rose-300 text-[12px] font-bold uppercase tracking-[0.13em]'>
                                <span className='flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/10 border border-rose-400/30'><LuPackageCheck size={14} /></span>
                                Delivery #{stopCount}
                              </h4>
                              {totalDeliveries > 1 && (
                                <button
                                  className="text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors"
                                  onClick={() => removeLocation(index, locationIndex)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                              <div className="input-item">
                                <label className={fieldLabel}>Delivery Location</label>
                                <GetDeliveryLocation id="getdelivery"  initialValue={l.location || ""} placeholder={"Enter Delivery Location"} onchange={(value)=>handleNestedInputChange(index, 'locations', locationIndex, 'location', value)} />
                              </div>
                              <div className="input-item">
                                <label className={fieldLabel}>Delivery Reference No.</label>
                                <input
                                  required
                                  value={l.referenceNo || ""}
                                  onChange={(e)=>handleNestedInputChange(index, 'locations', locationIndex, 'referenceNo', e.target.value)}
                                  type={"text"}
                                  placeholder={"Delivery Reference No."}
                                  className="input-sm"
                                />
                              </div>
                              <div className="input-item">
                                <label className={fieldLabel}>Delivery Appointment</label>
                                <input
                                  type="time" defaultValue={l.appointment || "no"}
                                  onChange={(e) => handleNestedInputChange(index, 'locations', locationIndex, 'appointment', e.target.value || "no")}
                                  className="input-sm"
                                  placeholder="Select time"
                                />
                              </div>
                              <div className="input-item">
                                <label className={fieldLabel}>Delivery Date</label>
                                <input onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                  required
                                  value={l.date || ""}
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

                <div className='flex flex-wrap gap-3 mt-1'>
                  <button onClick={()=>addStop(index, 'pickup')} className='flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/40 rounded-lg px-3 py-2 transition-colors'><LuPlus size={15} /> Add Pickup Stop</button>
                  <button onClick={()=>addStop(index, 'delivery')} className='flex items-center gap-1.5 text-[13px] font-semibold text-rose-400 hover:text-rose-300 border border-rose-400/20 hover:border-rose-400/40 rounded-lg px-3 py-2 transition-colors'><LuPlus size={15} /> Add Delivery Stop</button>
                </div>
              </div>
            </SectionCard>
          ))}

          {/* ── Customer revenue ──────────────────────────────── */}
          <SectionCard
            title='Customer Revenue Items'
            subtitle='Line items billed to the customer'
            icon={<TbReceipt2 size={18} />}
            accent='#a091ff'
            right={
              <div className='flex items-center gap-2'>
                <span className='text-[11px] uppercase tracking-wider text-gray-500 font-semibold'>Order Currency</span>
                <select
                  value={(revCurrency || 'usd').toUpperCase()}
                  onChange={(e) => handleRevCurrencyChange(e.target.value)}
                  className='bg-[#0c1b26] text-white px-3 py-[7px] rounded-lg text-sm border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#a091ff] uppercase'
                >
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            }
          >
            <div className='flex flex-col gap-3'>
              {revenueItems.map((item, index) => {
                const total  = item.rate * item.quantity;
                return <div key={index} className="rev-items rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full gap-x-4 gap-y-3 items-start">
                    <div className="input-item">
                      <div className='flex items-center justify-between gap-2 mb-1'>
                        <label className={fieldLabel}>Revenue Item</label>
                        {canManageSettings && (
                          <QuickAddItem
                            endpoint="/api/tenant/addCharge"
                            title="Add Revenue Item"
                            subtitle="Create a new charge item for this tenant"
                            label="Revenue item name"
                            icon={TbReceipt2}
                            accent="#a091ff"
                            onAdded={handleChargeAdded}
                            classes="text-[11px] font-semibold text-[#a091ff] hover:text-[#c3a9ff] transition-colors flex items-center gap-1"
                            text={<><LuPlus size={12} /> New</>}
                          />
                        )}
                      </div>
                      <Select
                        classNamePrefix="react-select input" {...selectMenuProps}
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handleCustomerRevInputChange(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={ item.revenue_item ? { label: item.revenue_item, value: item.revenue_item} : null }
                      />
                    </div>

                    <div className="input-item">
                      <label className={fieldLabel}>Note/Comment</label>
                      <div className='relative'>
                          <input
                            required
                            name="rate"
                            type="text"
                            placeholder="Notes"
                            value={item.note || ""}
                            className="input-sm"
                            onChange={(e) => {
                              handleCustomerRevInputChange(index, "note", e.target.value)
                            }}
                          />
                      </div>
                    </div>

                    <div className="input-item">
                      <label className={fieldLabel}>Rate</label>
                      <div className='relative'>
                        <div className='absolute text-gray-400 top-[26px] left-4 z-[1]'>
                            <Currency onlySymbol={true} amount={item.rate*(distance)} currency={revCurrency || 'usd'} />
                        </div>
                          <input
                            required
                            name="rate"
                            type="number"
                            placeholder="Rate"
                            value={item.rate || ""}
                            className="input-sm ps-[50px]"
                            onChange={(e) => handleCustomerRevInputChange(index, "rate", e.target.value)}
                          />
                      </div>
                    </div>

                    <div className="input-item">
                      <label className={fieldLabel}>Quantity</label>
                      <div className='relative'>
                          <input
                            required
                            name="quantity"
                            type="text"
                            placeholder="Quantity"
                            value={item.quantity || ""}
                            className="input-sm"
                            onChange={(e) => {
                              handleCustomerRevInputChange(index, "quantity", e.target.value)
                            }}
                          />
                      </div>
                    </div>

                    <div className="input-item relative">
                      <label className={fieldLabel}>Total</label>
                      <div className='border border-white/10 bg-[#0c1b26] mt-2.5 p-3 sm:p-4 rounded-[15px] relative flex items-center justify-between'>
                        <p className='text-white font-semibold font-mona'> <Currency amount={total} currency={revCurrency || 'usd'} /></p>
                        { index > 0 ?
                        <button className="text-red-500 hover:text-red-400 text-2xl leading-none ms-2"
                        onClick={()=>removeCustomeRevenueLine(index)} >&times;
                        </button> : '' }
                      </div>
                    </div>
                  </div>
                </div>
              })}
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1'>
                  <button className="flex items-center gap-1.5 text-[13px] font-semibold text-main border border-[#a091ff]/25 hover:border-[#a091ff]/50 rounded-lg px-3 py-2 transition-colors" onClick={addCustomerRevItems}><LuPlus size={15} /> Add New Line</button>
                  <h2 className='text-[15px] text-gray-300'>Customer Total : <strong className='text-white font-mona'><Currency amount={customerTotal} currency={revCurrency || 'usd'} /></strong></h2>
              </div>
            </div>
          </SectionCard>


          {/* CARRIER FINANCIALS - ONLY for Outsourcing */}
          {isOutsourcingUI && (
          <SectionCard title='Carrier Financials' subtitle='Line items paid to the carrier' icon={<TbReceipt2 size={18} />} accent='#fbbf24'>
            <div className='flex flex-col gap-3'>
              {carrierRevenueItems.map((item, index) => {
                const total  = item.rate * item.quantity;
                return <div key={index} className="rev-items rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full gap-x-4 gap-y-3 items-start">
                    <div className="input-item">
                      <div className='flex items-center justify-between gap-2 mb-1'>
                        <label className={fieldLabel}>Revenue Item</label>
                        {canManageSettings && (
                          <QuickAddItem
                            endpoint="/api/tenant/addCharge"
                            title="Add Revenue Item"
                            subtitle="Create a new charge item for this tenant"
                            label="Revenue item name"
                            icon={TbReceipt2}
                            accent="#fbbf24"
                            onAdded={handleChargeAdded}
                            classes="text-[11px] font-semibold text-[#fbbf24] hover:text-[#fcd34d] transition-colors flex items-center gap-1"
                            text={<><LuPlus size={12} /> New</>}
                          />
                        )}
                      </div>
                      <Select
                        classNamePrefix="react-select input" {...selectMenuProps}
                        placeholder="Revenue Items"
                        onChange={(option) =>
                          handleCarrierRevInputChange(index, "revenue_item", option.value)
                        }
                        options={revenueItemOptions}
                        value={ item.revenue_item ? { label: item.revenue_item, value: item.revenue_item} : null }
                      />
                    </div>

                    <div className="input-item">
                      <label className={fieldLabel}>Note/Comment</label>
                      <div className='relative'>
                          <input
                            required
                            name="rate"
                            type="text"
                            placeholder="Notes"
                            value={item.note || ""}
                            className="input-sm"
                            onChange={(e) => {
                              handleCarrierRevInputChange(index, "note", e.target.value)
                            }}
                          />
                      </div>
                    </div>

                    <div className="input-item">
                      <label className={fieldLabel}>Rate</label>
                      <div className='relative'>
                        <div className='absolute text-gray-400 top-[26px] left-4 z-[1]'>
                            <Currency onlySymbol={true} amount={item.rate*(distance)} currency={revCurrency || 'usd'} />
                        </div>
                          <input
                            required
                            name="rate"
                            type="number"
                            placeholder="Rate"
                            value={item.rate || ""}
                            className="input-sm ps-[50px]"
                            onChange={(e) => handleCarrierRevInputChange(index, "rate", e.target.value)}
                          />
                      </div>
                    </div>

                    <div className="input-item">
                      <label className={fieldLabel}>Quantity</label>
                      <div className='relative'>
                          <input
                            required
                            name="quantity"
                            type="text"
                            placeholder="Quantity"
                            value={item.quantity || ""}
                            className="input-sm"
                            onChange={(e) => {
                              handleCarrierRevInputChange(index, "quantity", e.target.value)
                            }}
                          />
                      </div>
                    </div>

                    <div className="input-item relative">
                      <label className={fieldLabel}>Total</label>
                      <div className='border border-white/10 bg-[#0c1b26] mt-2.5 p-3 sm:p-4 rounded-[15px] relative flex items-center justify-between'>
                        <p className='text-white font-semibold font-mona'> <Currency amount={total} currency={revCurrency || 'usd'} /></p>
                        { index > 0 ?
                        <button className="text-red-500 hover:text-red-400 text-2xl leading-none ms-2"
                        onClick={()=>removeCarrierRevenueLine(index)} >&times;
                        </button> : ""
                        }
                      </div>
                    </div>
                  </div>
                </div>
              })}
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1'>
                  <button className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-300 border border-amber-400/25 hover:border-amber-400/50 rounded-lg px-3 py-2 transition-colors" onClick={addCarrierRevItems}><LuPlus size={15} /> Add New Line</button>
                  <h2 className='text-[15px] text-gray-300'>Carrier Total : <strong className='text-white font-mona'><Currency amount={carrierTotal} currency={revCurrency || 'usd'} /></strong></h2>
              </div>
            </div>
          </SectionCard>
          )}

          {/* CARRIER SELECTION - ONLY for Outsourcing */}
          {isOutsourcingUI && (
            <SectionCard title='Carrier Assignment' subtitle='Carrier handling this load' icon={<TbBuildingWarehouse size={18} />} accent='#fbbf24'>
              <div className='input-item md:max-w-md'>
                <div className='flex items-center justify-between gap-2 mb-1'>
                  <label className={fieldLabel}>Assign Carrier</label>
                  {canAddCarrier && (
                    <AddCarrier
                      fetchLists={handleCarrierAdded}
                      classes="text-[11px] font-semibold text-[#fbbf24] hover:text-[#fcd34d] transition-colors flex items-center gap-1"
                      text={<><LuPlus size={12} /> New carrier</>}
                    />
                  )}
                </div>
                <Select
                  classNamePrefix="react-select input" {...selectMenuProps}
                  placeholder={'Search and choose carrier...'}
                  isSearchable={true}
                  value={data.carrier ? carriersListing.find(carrier => carrier.value === data.carrier) : null}
                  onChange={chooseCarrier}
                  options={carriersListing}
                />
              </div>
            </SectionCard>
          )}

          {/* FLEET ASSIGNMENTS - ONLY for Regular */}
          {isRegularUI && (
            <SectionCard title='Fleet Assignments' subtitle='Truck, trailer and driver for this trip' icon={<FaTruckMoving size={16} />} accent='#fb7185'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4'>
                <div className='input-item'>
                  <div className='flex items-center justify-between gap-2 mb-1'>
                    <label className={fieldLabel}>Truck</label>
                    {canManageFleet && (
                      <QuickAddAsset
                        endpoint="/fleet/trucks/add"
                        docKey="truck"
                        title="Add Truck"
                        subtitle="Create a new truck for this tenant"
                        icon={TbTruck}
                        accent="#22d3ee"
                        onAdded={handleTruckAdded}
                        classes="text-[11px] font-semibold text-[#22d3ee] hover:text-[#67e8f9] transition-colors flex items-center gap-1"
                        text={<><LuPlus size={12} /> New</>}
                      />
                    )}
                  </div>
                  <Select classNamePrefix="react-select input" {...selectMenuProps} placeholder="Search and choose Truck" isSearchable={true} isClearable={true} options={trucks} value={trucks.find(t => t.value === data.truck) || null} onChange={chooseTruck} />
                </div>
                <div className='input-item'>
                  <div className='flex items-center justify-between gap-2 mb-1'>
                    <label className={fieldLabel}>Trailer</label>
                    {canManageFleet && (
                      <QuickAddAsset
                        endpoint="/fleet/trailers/add"
                        docKey="trailer"
                        title="Add Trailer"
                        subtitle="Create a new trailer for this tenant"
                        icon={TbTruck}
                        accent="#e879f9"
                        onAdded={handleTrailerAdded}
                        classes="text-[11px] font-semibold text-[#e879f9] hover:text-[#f0abfc] transition-colors flex items-center gap-1"
                        text={<><LuPlus size={12} /> New</>}
                      />
                    )}
                  </div>
                  <Select classNamePrefix="react-select input" {...selectMenuProps} placeholder="Search and choose Trailer" isSearchable={true} isClearable={true} options={trailers} value={trailers.find(t => t.value === data.trailer) || null} onChange={chooseTrailer} />
                </div>
                <div className='input-item'>
                  <div className='flex items-center justify-between gap-2 mb-1'>
                    <label className={fieldLabel}>Driver(s)</label>
                    {canManageFleet && (
                      <AddDriver
                        fetchLists={handleDriverAdded}
                        classes="text-[11px] font-semibold text-[#fb7185] hover:text-[#fda4af] transition-colors flex items-center gap-1"
                        text={<><LuPlus size={12} /> New driver</>}
                      />
                    )}
                  </div>
                  <Select
                    isMulti
                    classNamePrefix="react-select input" {...selectMenuProps}
                    placeholder="Search and choose Driver(s)"
                    isSearchable={true}
                    isClearable={true}
                    options={drivers}
                    value={drivers.filter(d => (data.drivers || []).includes(d.value))}
                    onChange={chooseDriver}
                  />
                </div>
              </div>
              {!!selectedTruckMeta?.ownerOperated && (
                <div className='mt-5 border border-orange-500/20 bg-orange-500/[0.06] rounded-xl p-4 sm:p-5'>
                  <p className='flex items-center gap-2 text-orange-300 text-sm font-semibold'>
                    <TbTruck size={16} /> Owner Operated Truck: {selectedTruckMeta?.ownerOperator?.fullName || selectedTruckMeta?.ownerOperator?.name || 'Assigned Owner Operator'}
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 mt-4'>
                    <div className='input-item'>
                      <label className={fieldLabel}>Settle Amount</label>
                      <input
                        className='input-sm'
                        type='number'
                        min='0'
                        step='0.01'
                        value={data.settle_amount || ''}
                        onChange={(e) => setData((prev) => ({ ...prev, settle_amount: e.target.value }))}
                        placeholder='Enter settle amount'
                      />
                    </div>
                    <div className='input-item'>
                      <label className={fieldLabel}>Driver Assignment</label>
                      <div className='input-sm flex items-center text-white'>
                        {hasCompanyDriverSelected ? 'Company Driver Assigned' : 'Owner Operator Driver (No company driver selected)'}
                      </div>
                    </div>
                  </div>
                  <p className='text-xs text-gray-400 mt-3'>
                    Owner Profit = Customer Total − Settle Amount
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Summary + submit ──────────────────────────────── */}
          <div className='rounded-2xl border border-[#a091ff]/20 bg-gradient-to-r from-[#a091ff]/[0.09] via-[#a091ff]/[0.03] to-transparent p-5 sm:p-6'>
            <div className='flex flex-wrap items-end justify-between gap-x-10 gap-y-5'>
              <div className='flex flex-col gap-1.5'>
                <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400'>Customer Total</span>
                <span className='text-2xl font-bold text-white font-mona leading-none'><Currency amount={customerTotal} currency={revCurrency || 'usd'} /></span>
              </div>

              <div className='flex flex-col gap-1.5'>
                <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400'>Total Distance</span>
                <span className='text-[15px] text-gray-100 flex items-center gap-2 flex-wrap'>
                  <DistanceInMiles d={distance} />
                  <button
                    className="flex items-center gap-1 text-[12px] font-semibold text-main hover:underline"
                    onClick={getDistance}>
                    <LuCalculator size={13} /> {distance > 1 ? 'Re-calculate' : 'Calculate'}
                  </button>
                </span>
              </div>

              {isOutsourcingUI && (
                <div className='flex flex-col gap-1.5'>
                  <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400'>Carrier Total</span>
                  <span className='text-xl font-bold text-gray-200 font-mona leading-none'><Currency amount={carrierTotal} currency={revCurrency || 'usd'} /></span>
                </div>
              )}

              {isRegularUI && !!selectedTruckMeta?.ownerOperated && (
                <>
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400'>Settlement Amount</span>
                    <span className='text-xl font-bold text-gray-200 font-mona leading-none'><Currency amount={Number(data.settle_amount || 0)} currency={revCurrency || 'usd'} /></span>
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400'>Owner Profit</span>
                    <span className='text-xl font-bold text-emerald-300 font-mona leading-none'>
                      <Currency amount={(customerTotal - Number(data.settle_amount || 0))} currency={revCurrency || 'usd'} />
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={addOrder}
              disabled={loading}
              className={`mt-6 w-full rounded-xl py-4 text-[15px] font-bold text-black bg-main hover:opacity-90 transition-opacity shadow-lg shadow-[#a091ff]/20 ${
                (isOutsourcingUI && !data.carrier) ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {loading ? (isEditMode ? "Updating Order…" : "Adding Order…") : (isEditMode ? "Update Order" : "Submit Order")}
            </button>
          </div>

        </div>
      </div>
    </AuthLayout>
  )
}
