import * as React from "react";
import CheckLogin from "../pages/auth/CheckLogin";
import Logo from "../pages/common/Logo";
import { UserContext } from "../context/AuthProvider";
import { useAuth } from "../context/MultiTenantAuthProvider";
import TimeCounter from "../pages/common/TimeCounter";
import {Helmet} from "react-helmet";
import Sidebar from "./Sidebar";
import { TbUserSquareRounded } from "react-icons/tb";
import { TbLogout } from "react-icons/tb";
 import { HiOutlineUserCircle } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import safeStorage from "../utils/safeStorage";
import Api from "../api/Api";


export default function AuthLayout({children, heading}) {

  const { user, selectedCurrency, setSelectedCurrency } = React.useContext(UserContext);
  const { user: multiTenantUser, logout: multiTenantLogout } = useAuth();
  
  // Use multi-tenant user if available, fallback to legacy user
  const currentUser = multiTenantUser || user;

  const handleLogout = async () => {
    console.log('🎯 AuthLayout logout clicked');
    if (multiTenantLogout) {
      console.log('🎤 Using multiTenantLogout in AuthLayout');
      await multiTenantLogout();
    } else {
      console.log('🔄 Using legacy logout in AuthLayout');
      safeStorage.removeItem("token");
      safeStorage.removeItem("activeModule");
      window.location.href = "/login";
    }
  };
  
  // const [windowWidth, setWindowWidth] = React.useState(window && window.innerWidth);
  // React.useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(window.innerWidth);
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  const [toggle, setToggle] = React.useState(false);
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = React.useState(false);
  const [globalSearchLoading, setGlobalSearchLoading] = React.useState(false);
  const [globalSearchResults, setGlobalSearchResults] = React.useState(null);
  const globalSearchRef = React.useRef(null);
  const navigate = useNavigate();
 function showSidebar() {
   const Sidebar = document.getElementById("sidebar");
    Sidebar.classList.toggle("open");
    setToggle(!toggle);
  }

  const roleChecker = () =>{
    if(currentUser?.permissions?.includes('subadmin')){
      return currentUser?.position ||'Subadmin'
    }
    if(currentUser?.permissions?.includes('regular') || currentUser?.permissions?.includes('outsourcing')){
      return currentUser?.position ||'Employee'
    }
    else if(currentUser?.permissions?.includes('accounting')){
      return currentUser?.position ||'Accountant'
    }
    else if(currentUser?.is_admin === 1){
      return currentUser?.position ||'Adminstrator'
    }
  }
  const submitGlobalSearch = (e) => {
    e.preventDefault();
    const q = String(globalSearch || '').trim();
    if (!q) return;
    setGlobalSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  React.useEffect(() => {
    const q = String(globalSearch || '').trim();
    if (q.length < 2) {
      setGlobalSearchResults(null);
      setGlobalSearchOpen(false);
      return;
    }
    setGlobalSearchLoading(true);
    setGlobalSearchOpen(true);
    const t = setTimeout(async () => {
      try {
        const res = await Api.get(`/search/global?q=${encodeURIComponent(q)}&limit=4`);
        if (res.data?.status) setGlobalSearchResults(res.data.results || null);
        else setGlobalSearchResults(null);
      } catch {
        setGlobalSearchResults(null);
      } finally {
        setGlobalSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [globalSearch]);

  React.useEffect(() => {
    const handler = (e) => {
      if (!globalSearchRef.current) return;
      if (!globalSearchRef.current.contains(e.target)) setGlobalSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <>
      <Helmet>
         <meta charSet="utf-8" />
         <title>{heading ? `${heading} | ` : '' } Cross Miles Carrier </title>
         <link rel="canonical" href={window.location.href || ""} />
      </Helmet>
      <style>{`
        body { 
          overflow:hidden;
        }
      `}</style>
      <CheckLogin  />
      {toggle ? <div onClick={showSidebar} className="fixed top-0 left-0 w-full h-full bg-[#0009] blur z-[9999]"></div> : ''}
      <div className="auth-wrap flex justify-between max-lg:flex-wrap">
        <main className="main-wrap ">
          <header className="fixed top-0 lg:top-0 z-[9998] bg-dark border-b border-gray-800 px-6 md:px-7 py-2 xl:py-4 flex items-center w-full justify-between">
            <Logo /> 
            <div ref={globalSearchRef} className="hidden lg:flex flex-1 px-6 relative">
            <form onSubmit={submitGlobalSearch} className="flex-1">
              <input
                className="input-sm w-full max-w-[720px]"
                placeholder="Search orders, customers, carriers, trucks, trailers, drivers…"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => {
                  if (globalSearchResults) setGlobalSearchOpen(true);
                }}
              />
              {globalSearchOpen && (
                <div className="absolute top-full left-6 right-6 mt-2 max-w-[720px] bg-[#11131A] border border-white/10 rounded-2xl overflow-hidden max-h-[60vh] !overflow-auto p-2">
                  <div className="px-4 py-3 flex items-center justify-between bg-[#12161d]">
                    <div className="text-white font-bold">Search</div>
                    <div className="text-xs text-gray-400">{globalSearchLoading ? 'Searching…' : 'Press Enter for full results'}</div>
                  </div>
                  <div className="p-2">
                    {(() => {
                      const keys = ['orders', 'customers', 'carriers', 'trucks', 'trailers', 'drivers'];
                      const available = keys
                        .map((k) => ({ k, items: globalSearchResults?.[k] || [] }))
                        .filter((b) => b.items.length > 0);
                      if (globalSearchLoading && available.length === 0) {
                        return <div className="text-gray-400 text-sm px-3 py-3">Searching…</div>;
                      }
                      if (available.length === 0) {
                        return <div className="text-gray-500 text-sm px-3 py-3">No matches</div>;
                      }
                      return (
                        <div className="space-y-2">
                          {available.map(({ k, items }) => {
                            const title = k.charAt(0).toUpperCase() + k.slice(1);
                            return (
                              <div key={k} className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
                                <div className="px-3 py-2 flex items-center justify-between bg-main ">
                                  <div className="text-white text-sm font-bold">{title}</div>
                                  <div className="text-xs text-gray-500">{items.length}</div>
                                </div>
                                <div className="p-2">
                                  <div className="space-y-1">
                                    {items.slice(0, 4).map((it) => {
                                      const onClick = (e) => {
                                        e.preventDefault();
                                        setGlobalSearchOpen(false);
                                        if (k === 'orders') return navigate(`/view/order/${it._id}`);
                                        if (k === 'customers') return navigate(`/customer/detail/${it._id}`);
                                        if (k === 'carriers') return navigate(`/carrier/detail/${it._id}`);
                                        if (k === 'drivers') return navigate(`/employee/detail/${it._id}`);
                                        if (k === 'trucks') return navigate(`/trucks?search=${encodeURIComponent(globalSearch)}`);
                                        return navigate(`/trailers?search=${encodeURIComponent(globalSearch)}`);
                                      };
                                      const label =
                                        k === 'orders'
                                          ? `#${it.serial_no || String(it._id).slice(-6)}${it.customer_order_no ? ` • ${it.customer_order_no}` : ''}`
                                          : k === 'customers'
                                            ? it.name
                                            : k === 'carriers'
                                              ? it.name
                                              : k === 'drivers'
                                                ? it.name
                                                : k === 'trucks'
                                                  ? `${it.unitNumber ? `${it.unitNumber} • ` : ''}${it.plateNumber || 'Truck'}`
                                                  : `${it.unitNumber ? `${it.unitNumber} • ` : ''}${it.plateNumber || 'Trailer'}`;
                                      const sub =
                                        k === 'orders'
                                          ? `${it.company_name || ''} ${it.order_status ? `• ${it.order_status}` : ''}`
                                          : k === 'customers'
                                            ? `${it.customerCode ? `${it.customerCode} • ` : ''}${it.email || ''}${it.phone ? ` • ${it.phone}` : ''}`
                                            : k === 'carriers'
                                              ? `${it.carrierID ? `${it.carrierID} • ` : ''}${it.email || ''}${it.phone ? ` • ${it.phone}` : ''}`
                                              : k === 'drivers'
                                                ? `${it.corporateID ? `${it.corporateID} • ` : ''}${it.email || ''}${it.phone ? ` • ${it.phone}` : ''}`
                                                : k === 'trucks'
                                                  ? [it.make, it.model, it.vin].filter(Boolean).join(' • ')
                                                  : [it.type, it.vin, it.licenseNumber].filter(Boolean).join(' • ');
                                      return (
                                        <a key={it._id} href="/" onClick={onClick} className="block px-2 py-2 rounded-lg hover:bg-gray-900">
                                          <div className="text-white text-sm font-semibold truncate">{label || title}</div>
                                          {sub ? <div className="text-gray-500 text-xs truncate">{sub}</div> : null}
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </form>
            </div>
            <div className="flex gap-2 items-center">
              <div className="hidden md:flex items-center">
                <select
                  value={selectedCurrency || 'CAD'}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="bg-[#121625] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#8B7CFF]"
                  aria-label="Display Currency"
                >
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <Link to='/profile' className="hidden md:flex items-center">
                <div><HiOutlineUserCircle color="white"  size='2.5rem'/></div>
                <div className="text-start me-4 ps-2">
                  <h2 className="capitalize font-bold text-white">{currentUser?.name}</h2>
                  <p className="capitalize text-sm mt-[-3px] text-gray-400">{roleChecker()}</p>
                </div>
              </Link>
              <button className="hidden md:flex" onClick={handleLogout} ><TbLogout color="#fff" className='me-2' size={'2rem'} /></button>
              
              <button onClick={showSidebar} className="sidebar-toggle text-base leading-6 whitespace-nowrap text-neutral-400">
                <span className="" ></span>
                <span className="my-2" ></span>
                <span className="" ></span>
              </button>

            </div>
            
          </header>
          <div className="flex w-full  ">
            <Sidebar  logout={handleLogout}  toggle={toggle} />
            <div className="content lg:w-[calc(100%-300px)] p-6 md:p-8 !pt-[100px] md:!pt-[130px] lg:!pt-[140px] !pb-[100px] w-full max-h-[100vh] overflow-hidden overflow-y-auto" >
                {children} 
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
