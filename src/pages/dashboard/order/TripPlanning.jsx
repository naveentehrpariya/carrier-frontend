import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import Loading from '../../common/Loading';
import TimeFormat from '../../common/TimeFormat';
import DistanceInMiles from '../../common/DistanceInMiles';
import { getOrderNumber } from '../../../utils/orderPrefix';
import { FaTrash } from 'react-icons/fa';
import { TbTruckDelivery } from 'react-icons/tb';
import { FiBox } from 'react-icons/fi';
import Select from 'react-select';
import toast from 'react-hot-toast';
import Popup from '../../common/Popup';
import GetLocation from '../../common/GetLocation';

export default function TripPlanning() {
    const { id } = useParams();
    const { Errors, user, company } = useContext(UserContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState([]);
    
    // Selection options
    const [drivers, setDrivers] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [carriers, setCarriers] = useState([]);
    
    // UI State
    const [activeTripIndex, setActiveTripIndex] = useState(0);
    const [pairDistances, setPairDistances] = useState([]); // miles between consecutive stops
    const [mobileTab, setMobileTab] = useState('route');

    const computePairDistances = useCallback(async (locs) => {
        try {
            if (!Array.isArray(locs) || locs.length < 2) {
                setPairDistances([]);
                return;
            }
            const getAddress = (loc) => {
                if (!loc) return '';
                const parts = [
                    (loc.location || loc.address || '').trim(),
                    (loc.city || '').trim(),
                    (loc.state || '').trim(),
                    (loc.zip || '').trim()
                ].filter(Boolean);
                return parts.join(', ');
            };
            const jobs = [];
            for (let i = 0; i < locs.length - 1; i++) {
                const a = getAddress(locs[i]);
                const b = getAddress(locs[i + 1]);
                if (!a || !b) {
                    jobs.push(Promise.resolve({ miles: 0 }));
                } else {
                    jobs.push(
                        Api.post('/getdistance', { locations: [a, b] })
                           .then(r => ({ miles: Number(r?.data?.totalMiles) || 0 }))
                           .catch(() => ({ miles: 0 }))
                    );
                }
            }
            const results = await Promise.all(jobs);
            setPairDistances(results.map(r => r.miles || 0));
        } catch (e) {
            setPairDistances([]);
        }
    }, []);

    const sumMilesBetween = (startIdx, endIdx) => {
        // sum pairDistances for edges start..end-1
        if (!Array.isArray(pairDistances) || pairDistances.length === 0) return 0;
        let sum = 0;
        for (let i = startIdx; i < endIdx; i++) sum += Number(pairDistances[i] || 0);
        return sum;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [orderRes, driversRes, trucksRes, trailersRes, tripsRes, carriersRes] = await Promise.all([
                Api.get(`/order/detail/${id}`),
                Api.get('/driver/listings'),
                Api.get('/fleet/trucks/listings'),
                Api.get('/fleet/trailers/listings'),
                Api.get(`/order/trips/${id}`),
                Api.get('/carriers/listings').catch(() => ({ data: { status: false, lists: [] } }))
            ]);

            let orderData = null;
            if (orderRes.data.status) {
                orderData = orderRes.data.order;
                // Flatten locations for easier use in planning
                if (orderData.shipping_details && orderData.shipping_details[0]) {
                    orderData.locations = orderData.shipping_details[0].locations || [];
                } else {
                    orderData.locations = [];
                }
                setOrder(orderData);
            }

            if (driversRes.data.status) {
                const driverOptions = driversRes.data.lists.map(d => ({ 
                    value: d._id, 
                    label: `${d.name} (${d.corporateID || 'No ID'})`,
                    ratePerMile: d.driverProfile?.ratePerMile || 0 
                }));
                setDrivers(driverOptions);
            }
            if (trucksRes.data.status) {
                const truckOptions = (trucksRes.data.lists || []).map(t => ({ 
                    value: t._id, 
                    label: `${t.unitNumber || ''} ${t.plateNumber ? `(${t.plateNumber})` : ''}`.trim() || 'No Unit/Plate'
                }));
                setTrucks(truckOptions);
            }
            if (trailersRes.data.status) {
                const trailerOptions = (trailersRes.data.lists || []).map(t => ({ 
                    value: t._id, 
                    label: `${t.unitNumber || ''} ${t.plateNumber ? `(${t.plateNumber})` : ''}`.trim() || 'No Unit/Plate'
                }));
                setTrailers(trailerOptions);
            }
            if (carriersRes.data.status) {
                const carrierOptions = (carriersRes.data.lists || []).map(c => ({
                    value: c._id,
                    label: `${c.name} ${c.mc_code ? `(MC${c.mc_code})` : ''}`
                }));
                setCarriers(carrierOptions);
            }
            
            if (tripsRes.data.status && tripsRes.data.trips.length > 0) {
                // Map backend trips back to our UI structure
                const mappedTrips = tripsRes.data.trips.map(t => ({
                    ...t,
                    driver: t.driver?._id || null,
                    truck: t.truck?._id || null,
                    trailer: t.trailer?._id || null,
                    carrier: t.carrier?._id || null,
                    ratePerMile: t.rate_per_mile || 0
                }));
                setTrips(mappedTrips);
            } else {
                // Initialize first trip covering all stops
                if (orderData && orderData.locations && orderData.locations.length > 0) {
                    setTrips([{
                        trip_no: 1,
                        start_stop_index: 0,
                        end_stop_index: orderData.locations.length - 1,
                        driver: orderData.order_type === 'regular' ? (orderData.driver || null) : null,
                        truck: orderData.order_type === 'regular' ? (orderData.truck || null) : null,
                        trailer: orderData.order_type === 'regular' ? (orderData.trailer || null) : null,
                        carrier: orderData.order_type === 'outsourcing' ? (orderData.carrier || null) : null,
                        miles: orderData.totalDistance || 0,
                        instructions: '',
                        status: 'planned'
                    }]);
                }
            }
            
            // Compute pairwise distances for display and default miles
            if (orderData && orderData.locations && orderData.locations.length > 1) {
                await computePairDistances(orderData.locations);
            } else {
                setPairDistances([]);
            }
        } catch (err) {
            Errors(err);
        } finally {
            setLoading(false);
        }
    }, [Errors, computePairDistances, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const removeTrip = async (index) => {
        try {
            if (!trips[index]?._id) {
                // Fallback to client-only merge when trips not yet saved
                if (trips.length <= 1) return;
                const newTrips = [...trips];
                const removedTrip = newTrips[index];
                if (index > 0) {
                    newTrips[index - 1].end_stop_index = removedTrip.end_stop_index;
                } else {
                    newTrips[index + 1].start_stop_index = removedTrip.start_stop_index;
                }
                newTrips.splice(index, 1);
                const renumbered = newTrips.map((t, i) => ({ ...t, trip_no: i + 1 }));
                setTrips(renumbered);
                setActiveTripIndex(Math.max(0, index - 1));
                return toast.success('Trip segments merged (unsaved)');
            }
            setLoading(true);
            const resp = await Api.delete(`/trip/${trips[index]._id}`);
            if (resp.data.status) {
                toast.success('Trip deleted and route updated');
                await fetchData();
            } else {
                toast.error(resp.data.message || 'Failed to delete trip');
            }
        } catch (e) {
            Errors(e);
        } finally {
            setLoading(false);
        }
    };

    const saveSplit = async () => {
        setLoading(true);
        try {
            // Validate required assignments per segment before saving
            if (order.order_type === 'regular') {
                if (trips.length > 1) {
                    const firstMissingDriver = trips.findIndex(t => !t.driver);
                    if (firstMissingDriver !== -1) {
                        setActiveTripIndex(firstMissingDriver);
                        setLoading(false);
                        return toast.error(`Trip #${firstMissingDriver + 1}: please select a Driver`);
                    }
                    const firstMissingTruck = trips.findIndex(t => !t.truck);
                    if (firstMissingTruck !== -1) {
                        setActiveTripIndex(firstMissingTruck);
                        setLoading(false);
                        return toast.error(`Trip #${firstMissingTruck + 1}: please select a Truck`);
                    }
                    const firstMissingTrailer = trips.findIndex(t => !t.trailer);
                    if (firstMissingTrailer !== -1) {
                        setActiveTripIndex(firstMissingTrailer);
                        setLoading(false);
                        return toast.error(`Trip #${firstMissingTrailer + 1}: please select a Trailer`);
                    }
                }
            } else {
                const firstMissing = trips.findIndex(t => !t.carrier);
                if (firstMissing !== -1) {
                    setActiveTripIndex(firstMissing);
                    setLoading(false);
                    return toast.error(`Trip #${firstMissing + 1}: please select a Carrier`);
                }
            }
            // Prepare segments for backend
        const segments = trips.map((t) => {
                const startLoc = order.locations[t.start_stop_index];
                const endLoc = order.locations[t.end_stop_index];
                
                const milesVal = Number(t.miles) || sumMilesBetween(t.start_stop_index, t.end_stop_index);
                
                const driversList = t.drivers || (t.driver ? [t.driver] : []);
                const effDrivers = Math.max(driversList.length, 1);
                const rateType = effDrivers > 1 ? 'team' : 'solo';
                let totalPay = 0;
                driversList.forEach(dVal => {
                    const drv = drivers.find(d => d.value === dVal);
                    const r = rateType === 'team' ? (drv?.ratePerMileTeam || drv?.ratePerMile || 0) : (drv?.ratePerMileSolo || drv?.ratePerMile || 0);
                    totalPay += (milesVal / effDrivers) * r;
                });
                const effectiveRate = milesVal > 0 ? (totalPay / milesVal) : 0;

                return {
                    start_stop_index: t.start_stop_index,
                    end_stop_index: t.end_stop_index,
                    driver: t.drivers && t.drivers.length > 0 ? t.drivers[0] : t.driver,
                    drivers: t.drivers || (t.driver ? [t.driver] : []),
                    truck: t.truck,
                    trailer: t.trailer,
                carrier: t.carrier,
                    start_location: `${startLoc.location || startLoc.address || ''}${startLoc.city ? `, ${startLoc.city}` : ''}`,
                    end_location: `${endLoc.location || endLoc.address || ''}${endLoc.city ? `, ${endLoc.city}` : ''}`,
                    instructions: t.instructions,
                    miles: milesVal,
                    totalDistance: milesVal,
                    distance_unit: 'mi',
                    rate_per_mile: effectiveRate
                };
            });

            const resp = await Api.post('/order/split', { orderId: id, segments });
            if (resp.data.status) {
                toast.success('Order split saved successfully');
                fetchData();
            } else {
                toast.error(resp.data.message || 'Failed to save split');
            }
        } catch (err) {
            Errors(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateDriverPay = (trip) => {
        const driversList = trip.drivers || (trip.driver ? [trip.driver] : []);
        const effDrivers = Math.max(driversList.length, 1);
        const rateType = effDrivers > 1 ? 'team' : 'solo';
        let totalPay = 0;
        driversList.forEach(dVal => {
            const selectedDriver = drivers.find(d => d.value === dVal);
            const rate = rateType === 'team' ? (selectedDriver?.ratePerMileTeam || selectedDriver?.ratePerMile || 0) : (selectedDriver?.ratePerMileSolo || selectedDriver?.ratePerMile || 0);
            totalPay += ((Number(trip.miles) || 0) / effDrivers) * rate;
        });
        return totalPay;
    };

    const [relayModal, setRelayModal] = useState(null); // stores the index after which to insert
    const [newRelayLocation, setNewRelayLocation] = useState('');

    const buildSegmentsFromLocations = (orderObj) => {
        const locs = orderObj?.shipping_details?.[0]?.locations || orderObj?.locations || [];
        if (!Array.isArray(locs) || locs.length < 2) return [];
        const n = locs.length;
        const relayIdxs = locs
            .map((loc, idx) => ((loc.location_type === 'relay' || loc.type === 'relay') ? idx : -1))
            .filter(i => i > 0 && i < n); // ignore index 0
        const boundaries = [0, ...relayIdxs, n - 1];
        // unique
        const uniqBounds = boundaries.filter((b, i, arr) => i === 0 || b !== arr[i - 1]);
        // base assets from first trip or order
        const base = trips?.[0] || orderObj || {};
        const segs = [];
        for (let i = 0; i < uniqBounds.length - 1; i++) {
            const start = uniqBounds[i];
            const end = uniqBounds[i + 1];
            segs.push({
                start_stop_index: start,
                end_stop_index: end,
                driver: orderObj.order_type === 'regular' ? (base.driver || orderObj.driver || null) : null,
                truck: orderObj.order_type === 'regular' ? (base.truck || orderObj.truck || null) : null,
                trailer: orderObj.order_type === 'regular' ? (base.trailer || orderObj.trailer || null) : null,
                carrier: orderObj.order_type === 'outsourcing' ? (base.carrier || orderObj.carrier || null) : null,
                start_location: `${(locs[start]?.location || locs[start]?.address || '')}${locs[start]?.city ? `, ${locs[start]?.city}` : ''}`,
                end_location: `${(locs[end]?.location || locs[end]?.address || '')}${locs[end]?.city ? `, ${locs[end]?.city}` : ''}`,
                miles: 0,
                totalDistance: 0,
                distance_unit: 'mi',
                rate_per_mile: (() => {
                    const d = (drivers || []).find(dd => dd.value === (base.driver || orderObj.driver));
                    return d?.ratePerMile || 0;
                })(),
                instructions: ''
            });
        }
        return segs;
    };

    const addRelayPoint = async () => {
        if (!newRelayLocation) return toast.error('Please choose a location');
        if (order.order_type === 'regular') {
            const base = trips?.[0] || {};
            if (!base.driver || !base.truck || !base.trailer) {
                return toast.error('Please assign Driver/Truck/Trailer to the first trip before adding another trip');
            }
        }
        
        setLoading(true);
        try {
            const updatedOrder = { ...order };
            const newStop = {
                location: newRelayLocation,
                location_type: 'relay',
                type: 'relay',
                date: new Date().toISOString(),
                appointment: 'no',
                referenceNo: 'RELAY'
            };

            // Insert into the flattened locations
            const newLocations = [...order.locations];
            newLocations.splice(relayModal + 1, 0, newStop);
            
            // Update the original structure
            updatedOrder.shipping_details[0].locations = newLocations;

            const resp = await Api.put(`/order/update/${id}`, updatedOrder);
            if (resp.data.status) {
                const freshOrder = resp.data.order || updatedOrder;
                // Build segments from ALL relay points and auto-create trips server-side
                const segments = buildSegmentsFromLocations(freshOrder);
                if (segments.length >= 1) {
                    const saveResp = await Api.post('/order/split', { orderId: id, segments });
                    if (saveResp.data.status) {
                        toast.success('Relay added and trips created');
                    } else {
                        toast.error('Relay added, but failed to create trips');
                    }
                } else {
                    toast.success('Relay point added to route');
                }
                setRelayModal(null);
                setNewRelayLocation('');
                await fetchData();
            } 
        } catch (err) {
            Errors(err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <AuthLayout><Loading /></AuthLayout>;
    if (!order) return <AuthLayout><div className="text-white">Order not found</div></AuthLayout>;

    return (
        <AuthLayout>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
                <div className='min-w-0'>
                    <h1 className='text-white text-lg sm:text-xl font-bold truncate'>
                        Trip Planning For: {getOrderNumber(order, user, company, null)}
                    </h1>
                    <p className='text-gray-400 text-xs truncate'>Cust: {order.customer?.name} • Total Order Distance: <DistanceInMiles d={order.totalDistance} /></p>
                </div>
                <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
                    <Link to="/orders" className='btn sm bg-gray-800 text-gray-400 text-[10px] uppercase font-bold px-4 flex-1 sm:flex-none text-center'>Back to Orders</Link>
                    <button className='btn sm main-btn text-black text-[10px] uppercase font-bold px-4 flex-1 sm:flex-none' onClick={saveSplit}>Save All Trips</button>
                </div>
            </div>

            <div className='sticky top-3 z-30 -mx-6 md:-mx-8 mb-6'>
                <div className='px-6 md:px-8'>
                    <div className='bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900 border border-gray-800/80 ring-1 ring-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur'>
                        <div className='p-4 sm:p-6'>
                            <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center'>
                                <div className='lg:col-span-4 flex items-center gap-3 sm:gap-4 min-w-0'>
                                    <div className='w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-black text-lg flex-shrink-0'>P</div>
                                    <div className='min-w-0'>
                                        <p className='text-white font-bold text-sm sm:text-base truncate'>{order.locations[0]?.location || order.locations[0]?.address || 'Pickup'}</p>
                                        <p className='text-gray-400 text-[10px] sm:text-xs truncate'>{order.locations[0]?.city || ''} {order.locations[0]?.state || ''}</p>
                                    </div>
                                </div>

                                <div className='lg:col-span-4 flex flex-col items-center gap-2'>
                                    <div className='bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-orange-500/20'>
                                        <TbTruckDelivery size={16} />
                                        <span className='font-black text-[11px] sm:text-xs'>
                                            {(() => {
                                                const miles = Number(order?.totalDistance || 0);
                                                const km = miles * 1.60934;
                                                return `${miles.toFixed(2)} mi (${km.toFixed(2)} km)`;
                                            })()}
                                        </span>
                                    </div>
                                    <div className='text-[10px] text-gray-300 bg-gray-800/50 border border-gray-800 px-3 py-1 rounded-full'>
                                        {(order.order_type || '').toLowerCase() === 'outsourcing' ? 'Outsourcing' : 'Regular'}
                                    </div>
                                    <div className='hidden lg:block w-full max-w-[520px] h-0.5 bg-gray-800/80 relative'>
                                        <div className='absolute inset-0 flex justify-between -top-1'>
                                            <div className='w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.35)]'></div>
                                            <div className='w-2.5 h-2.5 rounded-full bg-gray-700'></div>
                                            <div className='w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.25)]'></div>
                                        </div>
                                    </div>
                                    <div className='text-[10px] text-gray-300 bg-gray-800/40 border border-gray-800 px-3 py-1 rounded-full max-w-full truncate'>
                                        {(() => {
                                            const t = trips[activeTripIndex];
                                            if (!t) return '';
                                            const miles = Number(t.miles) || sumMilesBetween(t.start_stop_index, t.end_stop_index);
                                            const km = (Number(t.total_km) > 0) ? Number(t.total_km) : (miles * 1.60934);
                                            const label = order.order_type === 'regular'
                                                ? (drivers.find(d => d.value === t.driver)?.label || 'Unassigned')
                                                : (carriers.find(c => c.value === t.carrier)?.label || 'Unassigned');
                                            return `Active Trip #${activeTripIndex + 1} • ${miles.toFixed(2)} mi (${km.toFixed(2)} km) • ${label}`;
                                        })()}
                                    </div>
                                </div>

                                <div className='lg:col-span-4 flex items-center gap-3 sm:gap-4 min-w-0 justify-between lg:justify-end'>
                                    <div className='min-w-0 lg:text-right'>
                                        <p className='text-white font-bold text-sm sm:text-base truncate'>{order.locations[order.locations.length-1]?.location || order.locations[order.locations.length-1]?.address || 'Delivery'}</p>
                                        <p className='text-gray-400 text-[10px] sm:text-xs truncate'>{order.locations[order.locations.length-1]?.city || ''} {order.locations[order.locations.length-1]?.state || ''}</p>
                                    </div>
                                    <div className='w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-300 font-black text-lg flex-shrink-0'>D</div>
                                </div>
                            </div>
                        </div>
                        <div className='h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent'></div>
                    </div>
                </div>
            </div>

            <div className='lg:hidden mb-4'>
                <div className='grid grid-cols-2 bg-gray-900 border border-gray-800 rounded-2xl p-1'>
                    <button
                        className={`py-2 rounded-xl text-[10px] uppercase font-black transition-all ${mobileTab === 'trips' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-gray-300'}`}
                        onClick={() => setMobileTab('trips')}
                    >
                        Trips & Assets
                    </button>
                    <button
                        className={`py-2 rounded-xl text-[10px] uppercase font-black transition-all ${mobileTab === 'route' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-gray-300'}`}
                        onClick={() => setMobileTab('route')}
                    >
                        Route
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                <div className={`${mobileTab === 'trips' ? 'block' : 'hidden'} lg:block lg:col-span-4`}>
                    <div className='space-y-4'>
                        {/* Trip Selector */}
                        <div className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl'>
                            <div className='bg-gradient-to-r from-gray-800/70 to-gray-900/40 px-4 py-3 border-b border-gray-800 flex justify-between items-center'>
                                <span className='text-[10px] font-black text-gray-200 uppercase tracking-widest'>Current Trip Segments</span>
                                <span className='text-[10px] bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/20'>{trips.length} Total</span>
                            </div>
                            <div className='p-2 space-y-1 max-h-[260px] sm:max-h-[300px] overflow-y-auto'>
                                {trips.map((trip, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setActiveTripIndex(i)}
                                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${activeTripIndex === i ? 'bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/5' : 'bg-gray-900/30 border-transparent hover:border-gray-800 hover:bg-gray-800/40'}`}
                                    >
                                        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeTripIndex === i ? 'bg-rose-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-white font-bold text-xs truncate'>Trip Segment #{i+1}</p>
                                                <p className='text-gray-500 text-[9px] uppercase tracking-wider truncate'>
                                                    {order.locations[trip.start_stop_index]?.city || order.locations[trip.start_stop_index]?.location?.split(',')[0] || 'Start'} → {order.locations[trip.end_stop_index]?.city || order.locations[trip.end_stop_index]?.location?.split(',')[0] || 'End'}
                                                </p>
                                                <p className='text-[9px] mt-1'>
                                                    {order.order_type === 'regular' ? (
                                                        <span className='text-gray-500'>
                                                            Driver(s): <span className={`${trip.drivers && trip.drivers.length > 0 ? 'text-gray-300' : 'text-rose-400'}`}>{trip.drivers && trip.drivers.length > 0 ? trip.drivers.map(d => drivers.find(drv => drv.value === d)?.label?.split('(')[0] || 'Unassigned').join(', ') : (drivers.find(d => d.value === trip.driver)?.label || 'Unassigned')}</span>
                                                        </span>
                                                    ) : (
                                                        <span className='text-gray-500'>
                                                            Carrier: <span className={`${trip.carrier ? 'text-gray-300' : 'text-rose-400'}`}>{carriers.find(c => c.value === trip.carrier)?.label || 'Unassigned'}</span>
                                                        </span>
                                                    )}
                                                </p>
                                                <p className='text-[9px] text-gray-500 mt-0.5'>
                                                    {(() => {
                                                        const miles = Number(trip.miles) || sumMilesBetween(trip.start_stop_index, trip.end_stop_index);
                                                        if (miles <= 0) return 'Distance: —';
                                                        const km = (Number(trip.total_km) > 0) ? Number(trip.total_km) : (miles * 1.60934);
                                                        return <>Distance: <span className='text-gray-300'>{miles.toFixed(2)} mi</span> (<span className='text-gray-300'>{km.toFixed(2)} km</span>)</>;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        {trips.length > 1 && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeTrip(i); }}
                                                className='p-2 text-gray-600 hover:text-red-500 transition-colors flex-shrink-0'
                                                title="Merge this segment"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assets for Active Trip */}
                        <div className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl'>
                            <div className='bg-gradient-to-r from-gray-800/70 to-gray-900/40 px-4 py-3 border-b border-gray-800 flex items-center justify-between'>
                                <span className='text-[10px] font-black text-gray-200 uppercase tracking-widest'>Trip #{activeTripIndex + 1} Assets & Pay</span>
                                <span className='text-[10px] text-gray-500'>{order.order_type === 'regular' ? 'Driver' : 'Carrier'}</span>
                            </div>
                            <div className='p-5 space-y-4'>
                                {order.order_type === 'regular' ? (
                                    <>
                                        <div className='input-item'>
                                            <label className='text-[10px] text-gray-500 uppercase font-bold mb-1 block'>Driver(s)</label>
                                            <Select 
                                                isMulti
                                                options={drivers} 
                                                isSearchable={true}
                                                classNamePrefix="react-select input"
                                                placeholder="Choose Driver(s)"
                                                value={drivers.filter(d => (trips[activeTripIndex]?.drivers || []).includes(d.value))}
                                                onChange={(opts) => {
                                                    const newTrips = [...trips];
                                                    const values = opts ? opts.map(opt => opt.value) : [];
                                                    newTrips[activeTripIndex].drivers = values;
                                                    newTrips[activeTripIndex].driver = values.length > 0 ? values[0] : null;
                                                    setTrips(newTrips);
                                                }}
                                            />
                                            {(!trips[activeTripIndex]?.drivers || trips[activeTripIndex]?.drivers.length === 0) && (
                                                <p className='text-[10px] text-rose-400 mt-1'>Driver is required for this segment</p>
                                            )}
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='input-item'>
                                                <label className='text-[10px] text-gray-500 uppercase font-bold mb-1 block'>Truck</label>
                                                <Select 
                                                    options={trucks} 
                                                    isSearchable={true}
                                                    classNamePrefix="react-select input"
                                                    placeholder="Truck"
                                                    value={trucks.find(t => t.value === trips[activeTripIndex]?.truck)}
                                                    onChange={(opt) => {
                                                        const newTrips = [...trips];
                                                        newTrips[activeTripIndex].truck = opt.value;
                                                        setTrips(newTrips);
                                                    }}
                                                />
                                            </div>
                                            <div className='input-item'>
                                                <label className='text-[10px] text-gray-500 uppercase font-bold mb-1 block'>Trailer</label>
                                                <Select 
                                                    options={trailers} 
                                                    isSearchable={true}
                                                    classNamePrefix="react-select input"
                                                    placeholder="Trailer"
                                                    value={trailers.find(t => t.value === trips[activeTripIndex]?.trailer)}
                                                    onChange={(opt) => {
                                                        const newTrips = [...trips];
                                                        newTrips[activeTripIndex].trailer = opt.value;
                                                        setTrips(newTrips);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className='flex gap-3'>
                                            <button 
                                                className='btn bg-gray-800 text-white'
                                                onClick={() => {
                                                    const newTrips = [...trips];
                                                    newTrips[activeTripIndex].drivers = [];
                                                    newTrips[activeTripIndex].driver = null;
                                                    newTrips[activeTripIndex].truck = null;
                                                    newTrips[activeTripIndex].trailer = null;
                                                    setTrips(newTrips);
                                                }}
                                            >
                                                Clear This Segment
                                            </button>
                                            <button 
                                                className='btn bg-gray-700 text-white'
                                                onClick={() => {
                                                    const base = trips[activeTripIndex];
                                                    const newTrips = trips.map((t, idx) => idx <= activeTripIndex ? t : ({
                                                        ...t,
                                                        drivers: base.drivers || [],
                                                        driver: base.driver,
                                                        truck: base.truck,
                                                        trailer: base.trailer
                                                    }));
                                                    setTrips(newTrips);
                                                    toast.success('Assets applied to next segments');
                                                }}
                                            >
                                                Apply To Next Segments
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className='input-item'>
                                        <label className='text-[10px] text-gray-500 uppercase font-bold mb-1 block'>Carrier</label>
                                        <Select 
                                            options={carriers} 
                                            isSearchable={true}
                                            classNamePrefix="react-select input"
                                            placeholder="Choose Carrier"
                                            value={carriers.find(c => c.value === trips[activeTripIndex]?.carrier)}
                                            onChange={(opt) => {
                                                const newTrips = [...trips];
                                                newTrips[activeTripIndex].carrier = opt.value;
                                                setTrips(newTrips);
                                            }}
                                        />
                                        {!trips[activeTripIndex]?.carrier && (
                                            <p className='text-[10px] text-rose-400 mt-1'>Carrier is required for this segment</p>
                                        )}
                                    </div>
                                )}
                                <div className='input-item'>
                                    <label className='text-[10px] text-gray-500 uppercase font-bold mb-1 block'>Segment Miles</label>
                                    <div className='relative'>
                                        <input 
                                            type="number" 
                                            className='input-sm pe-12' 
                                            placeholder='Actual miles for this segment'
                                            value={trips[activeTripIndex]?.miles || ''}
                                            onChange={(e) => {
                                                const newTrips = [...trips];
                                                newTrips[activeTripIndex].miles = e.target.value;
                                                newTrips[activeTripIndex].totalDistance = e.target.value;
                                                setTrips(newTrips);
                                            }}
                                        />
                                        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold'>MILES</span>
                                    </div>
                                    {trips[activeTripIndex]?.miles > 0 && (
                                        <p className='text-[9px] text-gray-500 mt-1 italic'>
                                            ≈ {(Number(trips[activeTripIndex].miles) * 1.60934).toFixed(2)} km
                                        </p>
                                    )}
                                </div>

                                {/* Salary Calculation Preview */}
                                {order.order_type === 'regular' && trips[activeTripIndex]?.driver && trips[activeTripIndex]?.miles > 0 && (
                                    <div className='bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-[10px] text-gray-400 uppercase font-bold tracking-widest'>Driver Pay</span>
                                            <span className='text-green-500 font-black text-lg'>${calculateDriverPay(trips[activeTripIndex]).toFixed(2)}</span>
                                        </div>
                                        <p className='text-[9px] text-gray-500 mt-1 italic'>Based on {trips[activeTripIndex].miles} miles @ ${drivers.find(d => d.value === trips[activeTripIndex].driver)?.ratePerMile}/mile</p>
                                    </div>
                                )}

                                <div className='input-item'>
                                    <label className='text-[10px] text-gray-500 uppercase font-bold mb-1 block'>Special Instructions</label>
                                    <textarea 
                                        className='input-sm min-h-[80px] py-2 text-xs' 
                                        placeholder='Instructions for this specific trip segment...'
                                        value={trips[activeTripIndex]?.instructions || ''}
                                        onChange={(e) => {
                                            const newTrips = [...trips];
                                            newTrips[activeTripIndex].instructions = e.target.value;
                                            setTrips(newTrips);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${mobileTab === 'route' ? 'block' : 'hidden'} lg:block lg:col-span-8 space-y-6`}>
                    <div className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl'>
                        <div className='bg-gradient-to-r from-gray-800/70 to-gray-900/40 px-4 py-3 border-b border-gray-800 flex justify-between items-center'>
                            <span className='text-[10px] font-black text-gray-200 uppercase tracking-widest'>Route & Splitting Points</span>
                            <span className='hidden sm:inline text-[10px] text-gray-500 italic'>Add relay points to create trip segments</span>
                        </div>
                        <div className='p-4 sm:p-6'>
                            <div className='relative space-y-4'>
                                {order.locations.map((loc, idx) => {
                                    const tripForThisStop = trips.find(t => idx >= t.start_stop_index && idx <= t.end_stop_index);
                                    const isActiveSegment = trips[activeTripIndex] === tripForThisStop;
                                    const isSplitPoint = trips.some(t => t.start_stop_index === idx && idx !== 0);

                                    return (
                                        <div key={idx} className='relative'>
                                            {/* Split Marker */}
                                            {isSplitPoint && (
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <div className='h-px flex-1 bg-rose-500/30'></div>
                                                    <div className='px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[8px] font-black text-rose-500 tracking-widest uppercase'>New Trip Segment Below</div>
                                                    <div className='h-px flex-1 bg-rose-500/30'></div>
                                                </div>
                                            )}

                                            <div className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-3xl border transition-all duration-300 ${isActiveSegment ? 'bg-gradient-to-r from-rose-500/10 to-transparent border-rose-500/25' : 'bg-gray-900/40 border-gray-800/60 hover:border-gray-700'}`}>
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-xl ${loc.location_type === 'pickup' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                                                    {idx + 1}
                                                </div>
                                                
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center gap-2'>
                                                        <p className='text-white font-bold text-sm truncate'>{loc.location || loc.address || 'No Address'}</p>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${loc.location_type === 'pickup' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>{loc.location_type || loc.type}</span>
                                                    </div>
                                                    {loc.city && <p className='text-gray-400 text-[11px] truncate'>{loc.city}, {loc.state} {loc.zip}</p>}
                                                    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-2'>
                                                        <p className='text-gray-500 text-[10px] flex items-center gap-1'><TimeFormat date={loc.date} time={true} /></p>
                                                        {loc.referenceNo && <p className='text-[10px] text-gray-600 font-medium flex items-center gap-1'><FiBox size={10} className='text-gray-500' /> Ref: {loc.referenceNo}</p>}
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end'>
                                                    {(loc.location_type === 'relay' || loc.type === 'relay') && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    setLoading(true);
                                                                    const updatedOrder = { ...order };
                                                                    const newLocations = [...order.locations];
                                                                    newLocations.splice(idx, 1);
                                                                    updatedOrder.shipping_details[0].locations = newLocations;
                                                                    const resp = await Api.put(`/order/update/${id}`, updatedOrder);
                                                                    if (resp.data.status) {
                                                                        // Rebuild segments after removal
                                                                        const segments = buildSegmentsFromLocations(resp.data.order || updatedOrder);
                                                                        if (segments.length >= 1) {
                                                                            await Api.post('/order/split', { orderId: id, segments });
                                                                        } else {
                                                                            // no segments; backend can treat as whole-route default
                                                                        }
                                                                        toast.success('Relay removed and trips updated');
                                                                        fetchData();
                                                                    } else {
                                                                        toast.error('Failed to remove relay');
                                                                    }
                                                                } catch (e) {
                                                                    Errors(e);
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            className='px-3 py-2 bg-gray-800 text-gray-300 rounded-xl text-[10px] font-bold border border-gray-700 hover:bg-gray-700 transition-all'
                                                            title='Remove this relay point'
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    
                                                    <div className='hidden sm:flex flex-col items-end gap-1'>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-[10px] text-gray-500 font-bold uppercase'>Arrived</span>
                                                            <div className='w-4 h-4 rounded bg-gray-900 border border-gray-800 flex items-center justify-center'>
                                                                <input type="checkbox" className='hidden' />
                                                            </div>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-[10px] text-gray-500 font-bold uppercase'>Departed</span>
                                                            <div className='w-4 h-4 rounded bg-gray-900 border border-gray-800 flex items-center justify-center'>
                                                                <input type="checkbox" className='hidden' />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Segment Indicator Bar */}
                                                <div className={`absolute -left-1 top-4 bottom-4 w-1 rounded-full transition-all ${isActiveSegment ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-gray-800'}`}></div>
                                            </div>
                                            
                                            {/* Connector Line & Add Relay Button */}
                                            {idx < order.locations.length - 1 && (
                                                <div className='relative ml-9 my-2 h-16 w-full'>
                                                    {/* Vertical connector line centered */}
                                                    <div className='absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-800/50'></div>
                                                    <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 px-2'>
                                                        <span className='inline-block whitespace-nowrap text-[10px] px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 shadow-sm pointer-events-none max-w-[75vw] sm:max-w-none truncate'>
                                                            {(() => {
                                                                const m = Number(pairDistances[idx] || 0);
                                                                const k = (m * 1.60934);
                                                                return `${m.toFixed(2)} mi (${k.toFixed(2)} km)`;
                                                            })()}
                                                        </span>
                                                        <button 
                                                            onClick={() => setRelayModal(idx)}
                                                            className='bg-gray-800 hover:bg-gray-700 text-[9px] text-gray-400 font-black px-3 py-1 rounded-full border border-gray-700 transition-all hover:scale-110 uppercase tracking-widest whitespace-nowrap max-w-[75vw] truncate'
                                                        >
                                                            + Add Relay Point
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Relay Stop Modal */}
            <Popup 
                action={relayModal !== null ? 'open' : 'close'} 
                onClose={() => setRelayModal(null)}
                size="md:max-w-md"
                bg="bg-black"
                btnclasses="hidden"
            >
                <div className='p-6'>
                    <h2 className='text-white font-bold text-lg mb-4'>Add Relay / Hand-off Point</h2>
                    <p className='text-gray-400 text-xs mb-6'>Insert a location where you want to change drivers or trucks.</p>
                    
                    <div className='input-item mb-8'>
                        <label className='text-[10px] text-gray-500 uppercase font-bold mb-2 block'>Relay Location</label>
                        <GetLocation 
                            id="relay-point" 
                            placeholder="Search location (City, Warehouse, etc.)" 
                            onchange={(val) => setNewRelayLocation(val)} 
                        />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <button className='btn bg-gray-800 text-white' onClick={() => setRelayModal(null)}>Cancel</button>
                        <button className='btn main-btn text-black font-bold' onClick={addRelayPoint}>Add Location & Create Trips</button>
                    </div>
                </div>
            </Popup>
        </AuthLayout>
    );
}
