import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { getTruckLabel } from '../../../utils/truckLabel';
import AuthLayout from '../../../layout/AuthLayout';
import Loading from '../../common/Loading';
import TimeFormat from '../../common/TimeFormat';
import DistanceInMiles from '../../common/DistanceInMiles';
import Currency from '../../common/Currency';
import { getOrderNumber } from '../../../utils/orderPrefix';
import { FaTrash } from 'react-icons/fa';
import { TbTruckDelivery, TbRoute, TbListDetails, TbBuildingWarehouse, TbArrowRight } from 'react-icons/tb';
import { FiBox } from 'react-icons/fi';
import { LuMapPin, LuPackageCheck, LuPlus, LuMap } from 'react-icons/lu';
import { FaTruckMoving } from 'react-icons/fa6';
import Select from 'react-select';
import toast from 'react-hot-toast';
import Popup from '../../common/Popup';
import GetLocation from '../../common/GetLocation';

/* ── Shared presentational helpers (consistent with the order View / Add pages) ── */
const fieldLabel = 'block text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400';

// Render react-select menus in a body portal so they are never clipped by the
// card's `overflow-hidden` or the scrollable segment list.
const selectMenuProps = {
  menuPortalTarget: typeof document !== 'undefined' ? document.body : undefined,
  menuPosition: 'fixed',
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
};

const SectionCard = ({ title, subtitle, icon, accent = '#a091ff', children, className = '', right = null, bodyClass = 'p-5 sm:p-6' }) => (
  <section className={`bg-dark1 border border-white/[0.06] rounded-2xl overflow-hidden ${className}`}>
    <header className='flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.05]'>
      <div className='flex items-center gap-3 min-w-0'>
        <span className='flex items-center justify-center w-8 h-8 rounded-xl shrink-0' style={{ background: `${accent}1a`, color: accent }}>{icon}</span>
        <div className='min-w-0'>
          <h3 className='text-[12px] font-bold uppercase tracking-[0.14em] text-gray-200 truncate'>{title}</h3>
          {subtitle ? <p className='text-[11px] text-gray-500 mt-0.5 normal-case tracking-normal truncate'>{subtitle}</p> : null}
        </div>
      </div>
      {right}
    </header>
    <div className={bodyClass}>{children}</div>
  </section>
);

export default function TripPlanning() {
    const navigate = useNavigate();
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
    const [busy, setBusy] = useState(false);      // in-flight action (save / relay / delete) — page stays visible
    const [dirty, setDirty] = useState(false);    // unsaved segment edits
    const initialLoadedRef = useRef(false);       // full-page loader only on first fetch

    // Wrap user edits so we can flag unsaved changes
    const editTrips = (next) => { setTrips(next); setDirty(true); };

    // Owner-operator settlement is per trip: the truck a leg runs decides who gets paid for it.
    // An order split across two owners (or an owner + a company truck) is a "mixed" split — each
    // owner is settled only for their own legs, from a miles share of the order's settle amount.
    const truckMeta = (truckId) => trucks.find((t) => t.value === truckId) || null;
    const orderSettleTotal = Number(order?.input_settle_amount || 0) || Number(order?.settle_amount || 0);
    const legOwners = trips.map((t) => {
        const meta = truckMeta(t.truck);
        return meta?.ownerOperated && meta?.ownerOperator
            ? { id: String(meta.ownerOperator), name: meta.ownerName || 'Owner operator' }
            : null;
    });
    const ownerLegIds = [...new Set(legOwners.filter(Boolean).map((o) => o.id))];
    const ownerLegNames = [...new Set(legOwners.filter(Boolean).map((o) => o.name))];
    const hasCompanyLeg = legOwners.some((o) => !o);
    const isMixedSplit = ownerLegIds.length > 1 || (ownerLegIds.length === 1 && hasCompanyLeg);
    const typedSettleTotal = trips.reduce((acc, t) => {
        const v = t.settle_amount;
        if (v === null || v === undefined || v === '') return acc;
        return acc + (Number(v) || 0);
    }, 0);
    const settlePot = orderSettleTotal > 0 ? orderSettleTotal : typedSettleTotal;
    const ownerLegsUnpaid = ownerLegIds.length > 0 && settlePot <= 0;

    // What's still missing on a segment before it can be saved
    const segmentMissing = (trip, orderType) => {
        if (orderType === 'regular') {
            const missing = [];
            if (!((trip.drivers && trip.drivers.length > 0) || trip.driver)) missing.push('Driver');
            if (!trip.truck) missing.push('Truck');
            return missing;
        }
        return trip.carrier ? [] : ['Carrier'];
    };

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

    // Once real per-leg distances (actual miles, from /getdistance totalMiles) are available,
    // normalize each segment's `miles` to real miles. Legacy stored values may be KM mislabeled
    // as miles; this keeps pay + display in real miles and matches the backend salary calc
    // (which derives miles from order.totalDistance km). Manual edits (milesManual) are preserved.
    useEffect(() => {
        if (!Array.isArray(pairDistances) || pairDistances.length === 0) return;
        setTrips((prev) => prev.map((t) => {
            if (t.milesManual) return t;
            let sum = 0;
            for (let i = t.start_stop_index; i < t.end_stop_index; i++) sum += Number(pairDistances[i] || 0);
            if (sum > 0) {
                const v = Number(sum.toFixed(2));
                return { ...t, miles: v, totalDistance: v };
            }
            return t;
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairDistances]);

    const fetchData = useCallback(async () => {
        if (!initialLoadedRef.current) setLoading(true);
        try {
            const [orderRes, driversRes, trucksRes, trailersRes, tripsRes, carriersRes] = await Promise.all([
                Api.get(`/order/detail/${id}`),
                Api.get('/driver/listings'),
                Api.get('/fleet/trucks/listings'),
                Api.get('/fleet/trailers/listings?active=true'),
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
                    // The rates below are in this currency, not USD. A trip blends its drivers'
                    // rates into one rate_per_mile, so they must all share it (guarded on save).
                    rateCurrency: String(d.driverProfile?.rateCurrency || 'USD').toUpperCase(),
                    ratePerMile: d.driverProfile?.ratePerMile || 0,
                    ratePerMileSolo: d.driverProfile?.ratePerMileSolo || 0,
                    ratePerMileTeam: d.driverProfile?.ratePerMileTeam || 0
                }));
                setDrivers(driverOptions);
            }
            if (trucksRes.data.status) {
                const truckOptions = (trucksRes.data.lists || []).map(t => {
                    const tName = getTruckLabel(t, 'Unnamed Truck');
                    const ownerName = t.ownerOperator?.fullName || '';
                    const baseLabel = `${tName} ${t.plateNumber ? `(${t.plateNumber})` : ''}`.trim() || 'No Unit/Plate';
                    return {
                        value: t._id,
                        label: t.ownerOperated && ownerName ? `${baseLabel} · Owner: ${ownerName}` : baseLabel,
                        ownerOperated: !!t.ownerOperated,
                        ownerOperator: t.ownerOperator?._id || t.ownerOperator || null,
                        ownerName
                    };
                });
                setTrucks(truckOptions);
            }
            if (trailersRes.data.status) {
                const trailerOptions = (trailersRes.data.lists || []).map(t => {
                    const tName = [t.make, t.model].filter(Boolean).join(' ') || t.type || 'Unnamed Trailer';
                    return { 
                        value: t._id, 
                        label: `${tName} ${t.unitNumber ? `(${t.unitNumber})` : ''}`.trim() || 'No Unit/Plate'
                    };
                });
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
                    drivers: (Array.isArray(t.drivers) ? t.drivers : [])
                        .map(d => (d && typeof d === 'object') ? d._id : d)
                        .filter(Boolean),
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
                        miles: Number(orderData.totalDistance || 0) * 0.6214, // totalDistance is km; seed real miles
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
            setDirty(false); // fresh data from server — nothing unsaved
        } catch (err) {
            Errors(err);
        } finally {
            setLoading(false);
            initialLoadedRef.current = true;
        }
    }, [Errors, computePairDistances, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Warn before closing / reloading the tab with unsaved segment edits
    useEffect(() => {
        if (!dirty) return;
        const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [dirty]);

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
                editTrips(renumbered);
                setActiveTripIndex(Math.max(0, index - 1));
                return toast.success('Trip segments merged (unsaved)');
            }
            if (!window.confirm(`Delete Trip #${index + 1}? Its stops will merge into the neighbouring segment.`)) return;
            setBusy(true);
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
            setBusy(false);
        }
    };

    const saveSplit = async () => {
        setBusy(true);
        try {
            // Validate required assignments per segment before saving
            if (order.order_type === 'regular') {
                if (trips.length > 1) {
                    const firstMissingDriver = trips.findIndex(t => !t.driver);
                    if (firstMissingDriver !== -1) {
                        setActiveTripIndex(firstMissingDriver);
                        setMobileTab('trips');
                        setBusy(false);
                        return toast.error(`Trip #${firstMissingDriver + 1}: please select a Driver`);
                    }
                    const firstMissingTruck = trips.findIndex(t => !t.truck);
                    if (firstMissingTruck !== -1) {
                        setActiveTripIndex(firstMissingTruck);
                        setMobileTab('trips');
                        setBusy(false);
                        return toast.error(`Trip #${firstMissingTruck + 1}: please select a Truck`);
                    }
                    // Trailer is optional per trip
                }
            } else {
                const firstMissing = trips.findIndex(t => !t.carrier);
                if (firstMissing !== -1) {
                    setActiveTripIndex(firstMissing);
                    setMobileTab('trips');
                    setBusy(false);
                    return toast.error(`Trip #${firstMissing + 1}: please select a Carrier`);
                }
            }
            // A trip collapses its drivers' rates into one blended rate_per_mile, which is later read
            // back in each driver's own pay currency — so a mixed-currency trip would silently pay
            // one of them in the wrong currency. Catch it here so the user sees which trip is bad.
            const mixedIdx = trips.findIndex((t) => {
                const list = (t.drivers && t.drivers.length > 0) ? t.drivers : (t.driver ? [t.driver] : []);
                const curs = new Set(list.map((dVal) => drivers.find(d => d.value === dVal)?.rateCurrency || 'USD'));
                return curs.size > 1;
            });
            if (mixedIdx !== -1) {
                setActiveTripIndex(mixedIdx);
                setMobileTab('trips');
                setBusy(false);
                return toast.error(`Trip #${mixedIdx + 1}: all drivers on a trip must share the same pay currency.`);
            }

            // An owner-operator leg with no settle amount would pay the owner nothing for the miles
            // they ran. Backend rejects it too — catch it here so the user knows which field to fill.
            if (ownerLegsUnpaid) {
                setBusy(false);
                return toast.error('This split uses an owner operator\'s truck. Enter a leg settle amount for each owner trip (or set the order\'s settle amount).');
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
                    rate_per_mile: effectiveRate,
                    // null = derive this leg's settlement from the order's settle amount by miles share
                    settle_amount: (t.settle_amount === null || t.settle_amount === undefined || t.settle_amount === '')
                        ? null
                        : Number(t.settle_amount)
                };
            });

            const resp = await Api.post('/order/split', { orderId: id, segments });
            if (resp.data.status) {
                toast.success('All trips saved');
                await fetchData();
            } else {
                toast.error(resp.data.message || 'Failed to save split');
            }
        } catch (err) {
            Errors(err);
        } finally {
            setBusy(false);
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

    // Per-driver pay breakdown for a trip (miles split evenly across drivers).
    const calculateDriverPayBreakdown = (trip) => {
        const driversList = (trip.drivers && trip.drivers.length > 0)
            ? trip.drivers
            : (trip.driver ? [trip.driver] : []);
        const effDrivers = Math.max(driversList.length, 1);
        const rateType = effDrivers > 1 ? 'team' : 'solo';
        const miles = Number(trip.miles) || 0;
        const share = miles / effDrivers;
        const rows = driversList.map((dVal) => {
            const drv = drivers.find(d => d.value === dVal);
            const rate = rateType === 'team'
                ? (drv?.ratePerMileTeam || drv?.ratePerMile || 0)
                : (drv?.ratePerMileSolo || drv?.ratePerMile || 0);
            return {
                label: (drv?.label || 'Unassigned').split('(')[0].trim(),
                miles: share,
                rate,
                rateType,
                pay: share * rate,
            };
        });
        // Save is blocked unless every driver on the trip shares a pay currency, so one code
        // describes the whole breakdown. Amounts are in it — not USD.
        const currency = drivers.find(d => d.value === driversList[0])?.rateCurrency || 'USD';
        return { rows, currency, total: rows.reduce((s, r) => s + r.pay, 0) };
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
            if (!base.driver || !base.truck) {
                return toast.error('Please assign Driver/Truck to the first trip before adding another trip');
            }
        }
        
        setBusy(true);
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

            // Send ONLY the stops. Echoing the whole order back would replay its BASE amounts and
            // base `revenue_currency` as if the user had just typed them in that currency — the
            // update handler would re-stamp input_currency to USD and re-convert the money.
            const resp = await Api.put(`/order/update/${id}`, { shipping_details: updatedOrder.shipping_details });
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
            setBusy(false);
        }
    };
    
    if (loading) return <AuthLayout><Loading /></AuthLayout>;
    if (!order) return <AuthLayout><div className="text-white">Order not found</div></AuthLayout>;

    return (
        <AuthLayout>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 mt-2'>
                <div className='min-w-0'>
                    <div className='flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2'>
                        <span onClick={() => navigate('/orders')} className='cursor-pointer hover:text-gray-300 transition-colors'>Orders</span>
                        <span className='text-gray-700'>/</span>
                        <span className='text-gray-400'>Trip Planning</span>
                    </div>
                    <div className='flex items-center gap-3 flex-wrap'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-white font-mona truncate flex items-center gap-2.5'>
                            <span className='flex items-center justify-center w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-400 shrink-0'><TbRoute size={20} /></span>
                            Order {getOrderNumber(order, user, company, null)}
                        </h1>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border ${(order.order_type || '').toLowerCase() === 'outsourcing' ? 'text-amber-300 border-amber-400/30 bg-amber-400/10' : 'text-rose-300 border-rose-400/30 bg-rose-400/10'}`}>
                            {(order.order_type || '').toLowerCase() === 'outsourcing' ? 'Outsourcing' : 'Regular'}
                        </span>
                    </div>
                    <p className='text-gray-400 text-[12px] mt-1.5 truncate'>{order.customer?.name} <span className='text-gray-600 mx-1'>•</span> Total distance <span className='text-gray-200'><DistanceInMiles d={order.totalDistance} /></span></p>
                </div>
                <div className='flex flex-wrap gap-2.5 w-full sm:w-auto'>
                    <Link
                        to="/orders"
                        onClick={(e) => {
                            if (dirty && !window.confirm('You have unsaved trip changes. Leave without saving?')) e.preventDefault();
                        }}
                        className='text-[12px] uppercase font-bold tracking-wider px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/[0.04] transition-colors flex-1 sm:flex-none text-center'
                    >Back</Link>
                    <button
                        className='relative text-[12px] uppercase font-bold tracking-wider px-5 py-2.5 rounded-xl bg-main text-black hover:opacity-90 transition-opacity shadow-lg shadow-[#a091ff]/20 flex-1 sm:flex-none disabled:opacity-60 disabled:cursor-wait'
                        onClick={saveSplit}
                        disabled={busy}
                    >
                        {busy ? 'Saving…' : 'Save All Trips'}
                        {dirty && !busy && <span className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-dark1' title='Unsaved changes'></span>}
                    </button>
                </div>
            </div>

            <div className='mb-6'>
                <div className='bg-dark1 border border-white/[0.06] rounded-2xl overflow-hidden'>
                    <div className='p-5 sm:p-6'>
                        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center'>
                            <div className='lg:col-span-4 flex items-center gap-4 min-w-0'>
                                <div className='w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0'><LuMapPin size={19} /></div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] font-semibold uppercase tracking-[0.13em] text-emerald-300/80 mb-0.5'>Origin</p>
                                    <p className='text-white font-semibold text-sm sm:text-[15px] truncate'>{order.locations[0]?.location || order.locations[0]?.address || 'Pickup'}</p>
                                    <p className='text-gray-500 text-[11px] truncate'>{order.locations[0]?.city || ''} {order.locations[0]?.state || ''}</p>
                                </div>
                            </div>

                            <div className='lg:col-span-4 flex flex-col items-center gap-2.5'>
                                <div className='bg-main text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-[#a091ff]/20'>
                                    <TbTruckDelivery size={16} />
                                    <span className='font-bold text-[11px] sm:text-xs font-mona'>
                                        {(() => {
                                            const km = Number(order?.totalDistance || 0); // totalDistance is km
                                            const miles = km * 0.6214;
                                            return `${miles.toFixed(2)} mi (${km.toFixed(2)} km)`;
                                        })()}
                                    </span>
                                </div>
                                <div className='hidden lg:flex w-full max-w-[420px] items-center gap-1.5'>
                                    <div className='w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'></div>
                                    <div className='flex-1 h-0.5 bg-gradient-to-r from-emerald-500/40 via-white/10 to-rose-500/40'></div>
                                    <div className='w-2 h-2 rounded-full bg-gray-600'></div>
                                    <div className='flex-1 h-0.5 bg-gradient-to-r from-emerald-500/40 via-white/10 to-rose-500/40'></div>
                                    <div className='w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'></div>
                                </div>
                                <div className='text-[10px] text-gray-300 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full max-w-full truncate'>
                                    {(() => {
                                        const t = trips[activeTripIndex];
                                        if (!t) return '';
                                        const miles = Number(t.miles) || sumMilesBetween(t.start_stop_index, t.end_stop_index);
                                        const km = miles * 1.609344; // derive km from real miles (t.total_km is stale)
                                        const label = order.order_type === 'regular'
                                            ? (drivers.find(d => d.value === t.driver)?.label || 'Unassigned')
                                            : (carriers.find(c => c.value === t.carrier)?.label || 'Unassigned');
                                        return `Active Trip #${activeTripIndex + 1} • ${miles.toFixed(2)} mi (${km.toFixed(2)} km) • ${label}`;
                                    })()}
                                </div>
                            </div>

                            <div className='lg:col-span-4 flex items-center gap-4 min-w-0 justify-between lg:justify-end lg:flex-row-reverse'>
                                <div className='w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-300 flex-shrink-0'><LuPackageCheck size={19} /></div>
                                <div className='min-w-0 lg:text-right'>
                                    <p className='text-[10px] font-semibold uppercase tracking-[0.13em] text-rose-300/80 mb-0.5'>Destination</p>
                                    <p className='text-white font-semibold text-sm sm:text-[15px] truncate'>{order.locations[order.locations.length-1]?.location || order.locations[order.locations.length-1]?.address || 'Delivery'}</p>
                                    <p className='text-gray-500 text-[11px] truncate'>{order.locations[order.locations.length-1]?.city || ''} {order.locations[order.locations.length-1]?.state || ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {trips.length <= 1 && (
                <div className='mb-6 bg-[#a091ff]/[0.06] border border-[#a091ff]/20 rounded-2xl px-5 py-4'>
                    <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-main mb-2.5'>How trip splitting works</p>
                    <div className='flex flex-col sm:flex-row gap-2.5 sm:gap-6'>
                        {[
                            ['1', 'Add a relay point on the route where the driver, truck or carrier changes'],
                            ['2', order.order_type === 'regular' ? 'Assign driver & truck to each trip segment' : 'Assign a carrier to each trip segment'],
                            ['3', 'Press "Save All Trips" to apply the split'],
                        ].map(([n, text]) => (
                            <div key={n} className='flex items-start gap-2.5 flex-1'>
                                <span className='w-5 h-5 rounded-full bg-[#a091ff]/15 text-main text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mona'>{n}</span>
                                <p className='text-gray-300 text-[12px] leading-relaxed'>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className='lg:hidden mb-4'>
                <div className='grid grid-cols-2 bg-[#0c1b26] border border-white/[0.07] rounded-xl p-1'>
                    <button
                        className={`py-2.5 rounded-lg text-[11px] uppercase font-bold tracking-wider transition-all ${mobileTab === 'trips' ? 'bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white shadow-lg shadow-rose-500/20' : 'text-gray-400'}`}
                        onClick={() => setMobileTab('trips')}
                    >
                        Trips & Assets
                    </button>
                    <button
                        className={`py-2.5 rounded-lg text-[11px] uppercase font-bold tracking-wider transition-all ${mobileTab === 'route' ? 'bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white shadow-lg shadow-rose-500/20' : 'text-gray-400'}`}
                        onClick={() => setMobileTab('route')}
                    >
                        Route
                    </button>
                </div>
            </div>

            {(isMixedSplit || ownerLegsUnpaid) && (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-[12px] ${ownerLegsUnpaid ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-amber-500/25 bg-amber-500/[0.07] text-amber-200'}`}>
                    {ownerLegsUnpaid ? (
                        <>
                            <span className='font-semibold'>Owner legs have no settle amount.</span>{' '}
                            {ownerLegNames.join(', ')} run part of this order but nothing is set aside to pay them. Enter a leg settle amount on each owner trip.
                        </>
                    ) : (
                        <>
                            <span className='font-semibold'>Mixed split.</span>{' '}
                            Settled per leg: {ownerLegNames.join(', ')}{hasCompanyLeg ? ' + company truck' : ''}. Each owner is paid only for their own legs — by miles share of the order&apos;s settle amount ({settlePot.toLocaleString()} {String(order?.input_currency || 'usd').toUpperCase()}), unless you type a leg amount.
                        </>
                    )}
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                <div className={`${mobileTab === 'trips' ? 'block' : 'hidden'} lg:block lg:col-span-4`}>
                    <div className='space-y-4'>
                        {/* Trip Selector */}
                        <SectionCard
                            title='Trip Segments'
                            icon={<TbListDetails size={16} />}
                            accent='#fb7185'
                            bodyClass='p-2'
                            right={<span className='text-[10px] font-bold bg-rose-500/15 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/20'>{trips.length} Total</span>}
                        >
                            <div className='space-y-1 max-h-[260px] sm:max-h-[320px] overflow-y-auto pr-1'>
                                {trips.map((trip, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveTripIndex(i)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeTripIndex === i ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/[0.015] border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'}`}
                                    >
                                        <div className='flex items-center gap-3 min-w-0'>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mona shrink-0 ${activeTripIndex === i ? 'bg-rose-500 text-white' : 'bg-white/[0.06] text-gray-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div className='min-w-0'>
                                                <div className='flex items-center gap-2 min-w-0'>
                                                    <p className='text-white font-bold text-xs truncate'>Trip Segment #{i+1}</p>
                                                    {(() => {
                                                        const missing = segmentMissing(trip, order.order_type);
                                                        return missing.length === 0 ? (
                                                            <span className='text-[8px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shrink-0'>Ready</span>
                                                        ) : (
                                                            <span className='text-[8px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 shrink-0'>Needs {missing.join(' + ')}</span>
                                                        );
                                                    })()}
                                                </div>
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
                                                        const km = miles * 1.609344; // derive km from real miles (trip.total_km is stale)
                                                        return <>Distance: <span className='text-gray-300'>{miles.toFixed(2)} mi</span> (<span className='text-gray-300'>{km.toFixed(2)} km</span>)</>;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        {trips.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeTrip(i); }}
                                                disabled={busy}
                                                className='p-2 text-gray-600 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40'
                                                title="Remove this segment (its stops merge into the neighbouring trip)"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* Assets for Active Trip */}
                        <SectionCard
                            title={`Trip #${activeTripIndex + 1} · Assets & Pay`}
                            icon={order.order_type === 'regular' ? <FaTruckMoving size={14} /> : <TbBuildingWarehouse size={16} />}
                            accent={order.order_type === 'regular' ? '#fb7185' : '#fbbf24'}
                            right={<span className='text-[10px] uppercase tracking-wider text-gray-500 font-semibold'>{order.order_type === 'regular' ? 'Driver' : 'Carrier'}</span>}
                        >
                            <div className='space-y-4'>
                                {order.order_type === 'regular' ? (
                                    <>
                                        <div className='input-item'>
                                            <label className={fieldLabel}>Driver(s)</label>
                                            <Select 
                                                isMulti
                                                options={drivers} 
                                                isSearchable={true}
                                                classNamePrefix="react-select input" {...selectMenuProps}
                                                placeholder="Choose Driver(s)"
                                                value={drivers.filter(d => (trips[activeTripIndex]?.drivers || []).includes(d.value))}
                                                onChange={(opts) => {
                                                    const newTrips = [...trips];
                                                    const values = opts ? opts.map(opt => opt.value) : [];
                                                    newTrips[activeTripIndex].drivers = values;
                                                    newTrips[activeTripIndex].driver = values.length > 0 ? values[0] : null;
                                                    editTrips(newTrips);
                                                }}
                                            />
                                            {(!trips[activeTripIndex]?.drivers || trips[activeTripIndex]?.drivers.length === 0) && (
                                                <p className='text-[10px] text-rose-400 mt-1'>Driver is required for this segment</p>
                                            )}
                                        </div>
                                        <div className='grid grid-cols-1 gap-4'>
                                            <div className='input-item'>
                                                <label className={fieldLabel}>Truck</label>
                                                <Select 
                                                    options={trucks} 
                                                    isSearchable={true}
                                                    classNamePrefix="react-select input" {...selectMenuProps}
                                                    placeholder="Truck"
                                                    value={trucks.find(t => t.value === trips[activeTripIndex]?.truck)}
                                                    onChange={(opt) => {
                                                        const newTrips = [...trips];
                                                        newTrips[activeTripIndex].truck = opt.value;
                                                        editTrips(newTrips);
                                                    }}
                                                />
                                                {truckMeta(trips[activeTripIndex]?.truck)?.ownerOperated && (
                                                    <p className='text-[10px] text-amber-300/90 mt-1'>
                                                        Owner operator: {truckMeta(trips[activeTripIndex]?.truck)?.ownerName || '—'} — this leg is settled to them.
                                                    </p>
                                                )}
                                            </div>
                                            {truckMeta(trips[activeTripIndex]?.truck)?.ownerOperated && (
                                                <div className='input-item'>
                                                    <label className={fieldLabel}>
                                                        Leg settle amount ({String(order?.input_currency || 'usd').toUpperCase()})
                                                    </label>
                                                    <input
                                                        type='number'
                                                        min='0'
                                                        step='0.01'
                                                        className='input-sm'
                                                        placeholder={`Auto (miles share of ${orderSettleTotal || 0})`}
                                                        value={trips[activeTripIndex]?.settle_amount ?? ''}
                                                        onChange={(e) => {
                                                            const newTrips = [...trips];
                                                            newTrips[activeTripIndex].settle_amount = e.target.value === '' ? null : e.target.value;
                                                            editTrips(newTrips);
                                                        }}
                                                    />
                                                    <p className='text-[10px] text-gray-400 mt-1'>
                                                        Leave blank to split the order&apos;s settle amount across legs by miles.
                                                    </p>
                                                </div>
                                            )}
                                            <div className='input-item'>
                                                <label className={fieldLabel}>Trailer</label>
                                                <Select 
                                                    options={trailers} 
                                                    isSearchable={true}
                                                    classNamePrefix="react-select input" {...selectMenuProps}
                                                    placeholder="Trailer"
                                                    value={trailers.find(t => t.value === trips[activeTripIndex]?.trailer)}
                                                    onChange={(opt) => {
                                                        const newTrips = [...trips];
                                                        newTrips[activeTripIndex].trailer = opt.value;
                                                        editTrips(newTrips);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap gap-2.5'>
                                            <button
                                                className='text-[12px] font-semibold px-3.5 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/[0.04] transition-colors'
                                                onClick={() => {
                                                    const newTrips = [...trips];
                                                    newTrips[activeTripIndex].drivers = [];
                                                    newTrips[activeTripIndex].driver = null;
                                                    newTrips[activeTripIndex].truck = null;
                                                    newTrips[activeTripIndex].trailer = null;
                                                    editTrips(newTrips);
                                                }}
                                            >
                                                Clear Segment
                                            </button>
                                            <button
                                                className='text-[12px] font-semibold px-3.5 py-2 rounded-lg border border-[#a091ff]/25 text-main hover:border-[#a091ff]/50 transition-colors'
                                                onClick={() => {
                                                    const base = trips[activeTripIndex];
                                                    const newTrips = trips.map((t, idx) => idx <= activeTripIndex ? t : ({
                                                        ...t,
                                                        drivers: base.drivers || [],
                                                        driver: base.driver,
                                                        truck: base.truck,
                                                        trailer: base.trailer
                                                    }));
                                                    editTrips(newTrips);
                                                    toast.success('Assets applied to next segments');
                                                }}
                                            >
                                                Apply To Next Segments
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className='input-item'>
                                        <label className={fieldLabel}>Carrier</label>
                                        <Select 
                                            options={carriers} 
                                            isSearchable={true}
                                            classNamePrefix="react-select input" {...selectMenuProps}
                                            placeholder="Choose Carrier"
                                            value={carriers.find(c => c.value === trips[activeTripIndex]?.carrier)}
                                            onChange={(opt) => {
                                                const newTrips = [...trips];
                                                newTrips[activeTripIndex].carrier = opt.value;
                                                editTrips(newTrips);
                                            }}
                                        />
                                        {!trips[activeTripIndex]?.carrier && (
                                            <p className='text-[10px] text-rose-400 mt-1'>Carrier is required for this segment</p>
                                        )}
                                    </div>
                                )}
                                <div className='input-item'>
                                    <label className={fieldLabel}>Segment Miles</label>
                                    <div className='relative'>
                                        <input
                                            type="number"
                                            disabled
                                            readOnly
                                            className='input-sm pe-12 opacity-70 cursor-not-allowed'
                                            placeholder='Auto-calculated from route'
                                            value={trips[activeTripIndex]?.miles ? Number(trips[activeTripIndex].miles).toFixed(2) : ''}
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
                                {order.order_type === 'regular'
                                    && ((trips[activeTripIndex]?.drivers && trips[activeTripIndex].drivers.length > 0) || trips[activeTripIndex]?.driver)
                                    && trips[activeTripIndex]?.miles > 0 && (() => {
                                    const breakdown = calculateDriverPayBreakdown(trips[activeTripIndex]);
                                    const multi = breakdown.rows.length > 1;
                                    return (
                                    <div className='bg-gradient-to-r from-emerald-500/[0.12] to-transparent border border-emerald-500/20 rounded-xl p-4'>
                                        {multi && breakdown.rows.map((r, i) => (
                                            <div key={i} className='flex justify-between items-center mb-2'>
                                                <div className='flex flex-col'>
                                                    <span className='text-xs text-gray-300 font-semibold'>{r.label}</span>
                                                    <span className='text-[10px] text-gray-500'>{r.miles.toFixed(2)} mi @ <Currency amount={r.rate} currency={breakdown.currency} />/mile <span className='text-emerald-500/70 uppercase font-semibold'>({r.rateType})</span></span>
                                                </div>
                                                <span className='text-emerald-300 font-semibold text-sm font-mona'><Currency amount={r.pay} currency={breakdown.currency} /></span>
                                            </div>
                                        ))}
                                        <div className={`flex justify-between items-center ${multi ? 'pt-2 border-t border-emerald-500/20' : ''}`}>
                                            <span className='text-[10px] text-gray-400 uppercase font-bold tracking-[0.13em]'>{multi ? 'Total Driver Pay' : 'Driver Pay'}</span>
                                            <span className='text-emerald-400 font-bold text-xl font-mona'><Currency amount={breakdown.total} currency={breakdown.currency} /></span>
                                        </div>
                                        {!multi && breakdown.rows[0] && (
                                            <p className='text-[10px] text-gray-500 mt-1'>Based on {Number(trips[activeTripIndex].miles).toFixed(2)} miles @ <Currency amount={breakdown.rows[0].rate} currency={breakdown.currency} />/mile <span className='text-emerald-500/70 uppercase font-semibold'>({breakdown.rows[0].rateType})</span></p>
                                        )}
                                    </div>
                                    );
                                })()}

                                <div className='input-item'>
                                    <label className={fieldLabel}>Special Instructions</label>
                                    <textarea 
                                        className='input-sm min-h-[80px] py-2 text-xs' 
                                        placeholder='Instructions for this specific trip segment...'
                                        value={trips[activeTripIndex]?.instructions || ''}
                                        onChange={(e) => {
                                            const newTrips = [...trips];
                                            newTrips[activeTripIndex].instructions = e.target.value;
                                            editTrips(newTrips);
                                        }}
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                <div className={`${mobileTab === 'route' ? 'block' : 'hidden'} lg:block lg:col-span-8 space-y-6`}>
                    <SectionCard
                        title='Route & Splitting Points'
                        icon={<LuMap size={16} />}
                        accent='#a091ff'
                        subtitle='Add relay points to create trip segments'
                        bodyClass='p-4 sm:p-6'
                    >
                            <div className='relative space-y-4'>
                                {order.locations.map((loc, idx) => {
                                    const tripForThisStop = trips.find(t => idx >= t.start_stop_index && idx <= t.end_stop_index);
                                    const isActiveSegment = trips[activeTripIndex] === tripForThisStop;
                                    const isSplitPoint = trips.some(t => t.start_stop_index === idx && idx !== 0);
                                    const locType = loc.location_type || loc.type;
                                    const isPickup = locType === 'pickup';
                                    const isRelay = locType === 'relay';

                                    return (
                                        <div key={idx} className='relative'>
                                            {/* Split Marker */}
                                            {isSplitPoint && (
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <div className='h-px flex-1 bg-rose-500/30'></div>
                                                    <div className='px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[9px] font-bold text-rose-400 tracking-[0.13em] uppercase'>New Trip Segment Below</div>
                                                    <div className='h-px flex-1 bg-rose-500/30'></div>
                                                </div>
                                            )}

                                            <div className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 rounded-2xl border transition-all duration-300 ${isActiveSegment ? 'bg-gradient-to-r from-rose-500/[0.08] to-transparent border-rose-500/25' : 'bg-white/[0.015] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${isPickup ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30' : isRelay ? 'bg-amber-500/10 text-amber-300 border-amber-400/30' : 'bg-rose-500/10 text-rose-300 border-rose-400/30'}`}>
                                                    {isPickup ? <LuMapPin size={17} /> : isRelay ? <TbArrowRight size={17} /> : <LuPackageCheck size={17} />}
                                                    <span className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-dark1 border border-white/15 text-[10px] font-bold text-gray-300 flex items-center justify-center font-mona'>{idx + 1}</span>
                                                </div>

                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center gap-2 flex-wrap'>
                                                        <p className='text-white font-semibold text-sm truncate'>{loc.location || loc.address || 'No Address'}</p>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-[0.08em] ${isPickup ? 'bg-emerald-500/10 text-emerald-300' : isRelay ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'}`}>{locType}</span>
                                                    </div>
                                                    {loc.city && <p className='text-gray-400 text-[11px] truncate mt-0.5'>{loc.city}, {loc.state} {loc.zip}</p>}
                                                    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-2'>
                                                        <p className='text-gray-500 text-[10px] flex items-center gap-1'><TimeFormat date={loc.date} time={true} /></p>
                                                        {loc.referenceNo && <p className='text-[10px] text-gray-500 font-medium flex items-center gap-1'><FiBox size={10} className='text-gray-500' /> Ref: {loc.referenceNo}</p>}
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end'>
                                                    {(loc.location_type === 'relay' || loc.type === 'relay') && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm('Remove this relay point? Trips will be rebuilt around it.')) return;
                                                                try {
                                                                    setBusy(true);
                                                                    const updatedOrder = { ...order };
                                                                    const newLocations = [...order.locations];
                                                                    newLocations.splice(idx, 1);
                                                                    updatedOrder.shipping_details[0].locations = newLocations;
                                                                    // Stops only — see the relay-add call: echoing the full order re-stamps its currency.
                                                                    const resp = await Api.put(`/order/update/${id}`, { shipping_details: updatedOrder.shipping_details });
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
                                                                    setBusy(false);
                                                                }
                                                            }}
                                                            disabled={busy}
                                                            className='px-3 py-2 bg-white/[0.04] text-gray-300 rounded-lg text-[11px] font-semibold border border-white/10 hover:bg-white/[0.08] transition-all disabled:opacity-50'
                                                            title='Remove this relay point'
                                                        >
                                                            Remove
                                                        </button>
                                                    )}

                                                </div>

                                                {/* Segment Indicator Bar */}
                                                <div className={`absolute -left-px top-4 bottom-4 w-1 rounded-full transition-all ${isActiveSegment ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-white/[0.06]'}`}></div>
                                            </div>
                                            
                                            {/* Connector Line & Add Relay Button */}
                                            {idx < order.locations.length - 1 && (
                                                <div className='relative ml-[26px] my-1 h-16 w-full'>
                                                    {/* Vertical connector line centered */}
                                                    <div className='absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 to-white/5'></div>
                                                    <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 px-2'>
                                                        <span className='inline-block whitespace-nowrap text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-gray-300 pointer-events-none max-w-[75vw] sm:max-w-none truncate'>
                                                            {(() => {
                                                                const m = Number(pairDistances[idx] || 0);
                                                                const k = (m * 1.60934);
                                                                return `${m.toFixed(2)} mi (${k.toFixed(2)} km)`;
                                                            })()}
                                                        </span>
                                                        <button
                                                            onClick={() => setRelayModal(idx)}
                                                            className='flex items-center gap-1 bg-[#a091ff]/10 hover:bg-[#a091ff]/20 text-[10px] text-main font-bold px-3 py-1.5 rounded-full border border-[#a091ff]/25 transition-all uppercase tracking-[0.1em] whitespace-nowrap max-w-[75vw] truncate'
                                                        >
                                                            <LuPlus size={12} /> Add Relay Point
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                    </SectionCard>
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
                    <div className='flex items-center gap-3 mb-2'>
                        <span className='flex items-center justify-center w-9 h-9 rounded-xl bg-[#a091ff]/10 text-main border border-[#a091ff]/20'><TbArrowRight size={18} /></span>
                        <h2 className='text-white font-bold text-lg font-mona'>Add Relay / Hand-off Point</h2>
                    </div>
                    <p className='text-gray-400 text-xs mb-6'>Insert a location where you want to change drivers or trucks.</p>

                    <div className='input-item mb-8'>
                        <label className={`${fieldLabel} mb-2`}>Relay Location</label>
                        <GetLocation
                            id="relay-point"
                            placeholder="Search location (City, Warehouse, etc.)"
                            onchange={(val) => setNewRelayLocation(val)}
                        />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <button className='text-[13px] font-semibold px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/[0.04] transition-colors' onClick={() => setRelayModal(null)}>Cancel</button>
                        <button className='text-[13px] font-bold px-4 py-3 rounded-xl bg-main text-black hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait' onClick={addRelayPoint} disabled={busy}>{busy ? 'Adding…' : 'Add & Create Trips'}</button>
                    </div>
                </div>
            </Popup>

            {/* Unsaved-changes bar — Save is always reachable, even deep in a long route */}
            {dirty && (
                <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 sm:gap-4 bg-[#10202e] border border-amber-400/25 rounded-2xl pl-4 pr-2 py-2 shadow-2xl shadow-black/50 max-w-[94vw]'>
                    <span className='w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse'></span>
                    <p className='text-[12px] text-gray-200 whitespace-nowrap'>
                        Unsaved changes
                        {(() => {
                            const n = trips.filter(t => segmentMissing(t, order.order_type).length > 0).length;
                            return n > 0 ? <span className='text-amber-300'> · {n} segment{n > 1 ? 's' : ''} incomplete</span> : null;
                        })()}
                    </p>
                    <button
                        className='text-[11px] uppercase font-bold tracking-wider px-4 py-2 rounded-xl bg-main text-black hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait whitespace-nowrap'
                        onClick={saveSplit}
                        disabled={busy}
                    >{busy ? 'Saving…' : 'Save All Trips'}</button>
                </div>
            )}
        </AuthLayout>
    );
}
