import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, TruckIcon, UserGroupIcon, ChartBarIcon, CurrencyDollarIcon, CubeTransparentIcon, CheckCircleIcon, DocumentTextIcon, BanknotesIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/MultiTenantAuthProvider';

const LogisticsSaaS = () => {
  const [billingCycle, setBillingCycle] = useState('month');
  const [activeFaq, setActiveFaq] = useState(null);
  const { user, loading } = useAuth();
  
  const faqs = [
    { q: "Can I manage both asset-based and brokerage operations?", a: "Yes! Our platform is built with a dual-module architecture. You can seamlessly switch between the 'Regular' module for your own fleet (Trucks, Trailers, Drivers) and the 'Outsourcing' module for carrier brokerage." },
    { q: "How granular are the user permissions?", a: "Extremely granular. You can assign roles like Administrator, Accountant, Employee/Staff, and Driver. Admins can explicitly restrict staff access to specific modules (e.g., only Brokerage) to ensure data security." },
    { q: "Does the system calculate driver salaries automatically?", a: "Absolutely. The Accounting module automatically calculates driver earnings based on solo/team miles or city hours, and tracks truck gross earnings and carrier payments in real-time." },
    { q: "Is this suitable for a multi-company setup?", a: "Yes. Our enterprise tier supports a true multi-tenant architecture, allowing you to manage multiple branches, subsidiaries, or client companies from a single Super Admin dashboard." }
  ];

  const features = [
    { icon: <TruckIcon className="w-6 h-6" />, title: 'Asset & Fleet Management', desc: 'Track trucks, trailers, and drivers. Manage driver logs, rate-per-mile profiles, and assignment histories effortlessly.' },
    { icon: <CubeTransparentIcon className="w-6 h-6" />, title: 'Carrier Outsourcing', desc: 'Streamline your brokerage operations. Assign loads to third-party carriers, track their MC numbers, and manage their payments securely.' },
    { icon: <CurrencyDollarIcon className="w-6 h-6" />, title: 'Advanced Accounting', desc: 'Auto-calculate driver payslips, track truck gross earnings, monitor customer invoices, and analyze per-order profit margins instantly.' },
    { icon: <ShieldCheckIcon className="w-6 h-6" />, title: 'Role-Based Access Control', desc: 'Secure your data. Assign precise roles (Admin, Accountant, Staff, Driver) and restrict module access on a per-user basis.' },
    { icon: <UserGroupIcon className="w-6 h-6" />, title: 'Multi-Tenant Architecture', desc: 'Built for scale. Super Admins can create isolated environments for different companies, each with their own subscription and limits.' },
    { icon: <ChartBarIcon className="w-6 h-6" />, title: 'Real-Time Analytics', desc: 'Get bird\'s-eye views of your operations. Track active loads, revenue trends, and operational bottlenecks from intuitive dashboards.' },
    { icon: <DocumentTextIcon className="w-6 h-6" />, title: 'Digital Document Management', desc: 'Store BOLs, PODs, rate confirmations, and receipts directly attached to orders or employee profiles with instant preview.' },
    { icon: <BanknotesIcon className="w-6 h-6" />, title: 'Revenue & Expense Tracking', desc: 'Log individual order expenses, track fuel surcharges, and auto-calculate precise profit margins for every load.' },
    { icon: <MapPinIcon className="w-6 h-6" />, title: 'Intelligent Dispatching', desc: 'Easily assign drivers, trucks, and trailers to specific orders. Maintain clear visibility of asset allocation across your entire fleet.' }
  ];

  return (
    <div className="bg-[#030308] text-white min-h-screen selection:bg-blue-500/30 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full -z-10 opacity-60" />

      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 bg-[#030308]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg rotate-12 shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-white -rotate-12" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Logistikore</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-gray-200 uppercase tracking-[0.2em]">
            <a href="#features" className="hover:text-white transition-all">Platform</a>
            <a href="#accounting" className="hover:text-white transition-all">Accounting</a>
            <a href="#pricing" className="hover:text-white transition-all">Pricing</a>
          </div>
          <div className="flex gap-4">
            <a href="mailto:contact@logistikore.com" className="bg-white/5 border border-white/10 px-5 py-2 rounded-full text-xs font-bold hover:bg-white/10 transition-all hidden sm:block">Contact Sales</a>
            {!loading && user ? (
              <Link to='/home' className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-600/20">Dashboard</Link>
            ) : (
              <Link to='/login' className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-600/20">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="container mx-auto px-6 pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-4 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Enterprise SaaS Edition</span>
            </div>
            <h1 className="text-5xl lg:text-[64px] font-extrabold leading-[1.05] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              The Ultimate OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Freight & Logistics.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Manage your entire asset-based fleet and carrier brokerage in one unified platform. Automate dispatch, accounting, and role-based permissions instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all text-center">Start Free Trial</Link>
              <a href="#features" className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-center">Explore Features</a>
            </div>
            <div className="pt-4 flex items-center gap-6 opacity-60">
               <div className="flex flex-col">
                  <span className="text-2xl font-black">10k+</span>
                  <span className="text-[10px] uppercase tracking-wider">Loads Managed</span>
               </div>
               <div className="w-[1px] h-8 bg-white/20"></div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black">$50M+</span>
                  <span className="text-[10px] uppercase tracking-wider">Carrier Payments</span>
               </div>
               <div className="w-[1px] h-8 bg-white/20"></div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black">99.9%</span>
                  <span className="text-[10px] uppercase tracking-wider">Uptime SLA</span>
               </div>
            </div>
          </div>
          <div className="relative group mt-12 lg:mt-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[32px] blur-2xl opacity-50" />
            <div className="relative bg-[#0D0D15] border border-white/10 rounded-[28px] p-2 overflow-hidden shadow-2xl">
              {/* Using the realistic dashboard screenshot from the user */}
              <div className="relative rounded-[22px] overflow-hidden bg-gray-900 border border-gray-800">
                {/* Mockup browser/app frame header */}
                <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  <div className="mx-auto h-4 w-1/2 bg-gray-800 rounded-full"></div>
                </div>
                
                {/* Actual image */}
                <img src="/dashboard-mockup.png" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" alt="Logistikore Dashboard Interface" 
                  onError={(e) => {
                    // Fallback to Unsplash if local image is missing
                    e.target.onerror = null; 
                    e.target.src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200";
                    e.target.className="rounded-[22px] opacity-90 group-hover:opacity-100 transition-all duration-700 object-cover h-[500px] w-full";
                  }}
                />
              </div>
              
              {/* Overlay floating UI elements to make it look like our app */}
              <div className="absolute bottom-6 left-6 bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-2xl shadow-xl">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-200">Truck Gross Earnings</span>
                 </div>
                 <div className="text-2xl font-black text-white">$12,450.00</div>
                 <div className="text-[10px] text-gray-400 mt-1">Updated just now</div>
              </div>
              
              <div className="absolute top-12 right-6 bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <UserGroupIcon className="w-5 h-5 text-blue-400" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-gray-200">Active Module</div>
                    <div className="text-sm font-black text-blue-400">Regular (Trucking)</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST BANNER --- */}
      <div className="py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-8">Trusted by growing freight companies</p>
          <div className="flex justify-center items-center opacity-40 grayscale gap-12 flex-wrap">
            <span className="text-2xl font-black tracking-tighter">CrossMiles Inc.</span>
            <span className="text-2xl font-black tracking-tighter">ApexLogistics</span>
            <span className="text-2xl font-black tracking-tighter">PrimeFreight</span>
            <span className="text-2xl font-black tracking-tighter">SwiftTransit</span>
          </div>
        </div>
      </div>

      {/* --- CORE FEATURES GRID --- */}
      <section id="features" className="container mx-auto px-6 py-32">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Dual-Power Logistics Engine</h2>
          <p className="text-gray-400">Whether you operate your own fleet or broker freight to external carriers, our platform adapts to your exact workflow.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#0D0D15] border border-white/[0.05] hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-100">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- ACCOUNTING HIGHLIGHT --- */}
      <section id="accounting" className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-900/5 border-y border-blue-500/10"></div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="lg:w-1/2">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Driver Payslip</div>
                        <div className="text-3xl font-black text-white">$4,250</div>
                        <div className="text-green-400 text-xs mt-2 font-medium">+ Generated automatically</div>
                     </div>
                     <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl mt-8">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Order Profit</div>
                        <div className="text-3xl font-black text-white">$850</div>
                        <div className="text-blue-400 text-xs mt-2 font-medium">Revenue minus Carrier Cost</div>
                     </div>
                     <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl col-span-2">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Truck Gross Earnings (Unit 101)</div>
                        <div className="flex items-end gap-4">
                           <div className="text-4xl font-black text-white">$18,900</div>
                           <div className="text-gray-500 text-sm mb-1">This Month</div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="lg:w-1/2 space-y-6">
                  <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Flawless Financial Control</h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                     Stop using spreadsheets to calculate driver salaries. Our integrated accounting module instantly generates payslips based on dispatch data, tracks carrier payments, and monitors overall truck profitability.
                  </p>
                  <ul className="space-y-4 mt-6">
                     <li className="flex items-center gap-3 text-gray-300 font-medium">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500" /> Secure payment statuses (Pending, Approved, Paid)
                     </li>
                     <li className="flex items-center gap-3 text-gray-300 font-medium">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500" /> Exportable PDF Payslips and Customer Invoices
                     </li>
                     <li className="flex items-center gap-3 text-gray-300 font-medium">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500" /> City hours, Solo miles, and Team miles tracking
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="container mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Simple, Scalable Pricing</h2>
          <p className="text-gray-400">Choose the plan that fits your company's operational size.</p>
          
          <div className="inline-flex items-center mt-8 bg-gray-900 p-1 rounded-full border border-gray-800">
             <button 
                onClick={() => setBillingCycle('month')} 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'month' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >
                Monthly
             </button>
             <button 
                onClick={() => setBillingCycle('year')} 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'year' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >
                Yearly (Save 20%)
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-[#0D0D15] border border-gray-800 rounded-3xl p-8 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-white">Starter</h3>
            <p className="text-sm text-gray-400 mb-6">Perfect for small brokerages or single-truck owner-operators.</p>
            <div className="mb-8">
               <span className="text-5xl font-black">${billingCycle === 'month' ? '49' : '39'}</span>
               <span className="text-gray-500 font-medium">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-gray-300 flex-1">
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Up to 5 Users</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Up to 100 Orders/mo</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Outsourcing Module</li>
               <li className="flex items-center gap-3 text-gray-600"><CheckCircleIcon className="w-5 h-5 text-gray-700 flex-shrink-0" /> No Fleet Management</li>
               <li className="flex items-center gap-3 text-gray-600"><CheckCircleIcon className="w-5 h-5 text-gray-700 flex-shrink-0" /> No Driver Payslips</li>
            </ul>
            <Link to="/login" className="mt-8 block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-center font-bold transition-colors">Start Trial</Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-[#151525] to-[#0D0D15] border border-blue-500/30 rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">
               Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-400">Professional</h3>
            <p className="text-sm text-gray-400 mb-6">Full suite for growing fleets and mid-sized brokerages.</p>
            <div className="mb-8">
               <span className="text-5xl font-black">${billingCycle === 'month' ? '149' : '119'}</span>
               <span className="text-gray-500 font-medium">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-gray-200 flex-1">
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Up to 25 Users</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Unlimited Orders</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Outsourcing & Regular Modules</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Full Fleet & Driver Management</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Accounting & Payslips</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Role-Based Access Control</li>
            </ul>
            <Link to="/login" className="mt-8 block w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-bold shadow-lg shadow-blue-600/25 transition-colors">Get Professional</Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#0D0D15] border border-gray-800 rounded-3xl p-8 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-white">Enterprise</h3>
            <p className="text-sm text-gray-400 mb-6">For large organizations requiring multi-tenant control.</p>
            <div className="mb-8">
               <span className="text-5xl font-black">Custom</span>
            </div>
            <ul className="space-y-4 text-sm text-gray-300 flex-1">
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Unlimited Users & Orders</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Multi-Tenant Architecture</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Custom Subdomains</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Super Admin Dashboard</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Dedicated Account Manager</li>
            </ul>
            <a href="mailto:enterprise@logistikore.com" className="mt-8 block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-center font-bold transition-colors">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* --- FAQ ACCORDION --- */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-extrabold mb-12 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#0D0D15] border border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-gray-700">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-8 py-6 text-left flex justify-between items-center"
              >
                <span className="font-semibold text-gray-200">{faq.q}</span>
                <span className={`text-blue-500 transition-transform duration-300 ${activeFaq === i ? 'rotate-45' : ''}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                   </svg>
                </span>
              </button>
              <div 
                 className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="text-sm text-gray-400 leading-relaxed border-t border-gray-800 pt-4">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="container mx-auto px-6 pt-24 pb-24">
        <div className="relative rounded-[40px] bg-gradient-to-br from-blue-900 to-indigo-900 p-12 md:p-20 overflow-hidden text-center border border-blue-500/30 shadow-2xl shadow-blue-900/50">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-[80px]" />
          
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Ready to modernize your logistics operations?
            </h2>
            <p className="text-blue-100 text-lg mx-auto font-medium">
              Join leading carriers and brokers who use Logistikore to manage dispatch, accounting, and fleet operations effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/login" className="bg-white text-blue-900 px-10 py-4 rounded-full font-extrabold shadow-xl hover:bg-gray-100 hover:scale-105 transition-all text-center">
                Create Free Account
              </Link>
            </div>
            <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mt-6">Instant Setup • No Credit Card Required</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#05050A] border-t border-white/5 mt-10">
        <div className='container mx-auto'>
            <div className='px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]'>
              <div className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
                   <TruckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="tracking-widest">LOGISTIKORE</span>
              </div>
              <div className="flex gap-8 flex-wrap justify-center">
                <a href="#" className="hover:text-blue-400 transition-colors">Platform</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Pricing</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              </div>
              <p>© {new Date().getFullYear()} All Rights Reserved</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LogisticsSaaS;
