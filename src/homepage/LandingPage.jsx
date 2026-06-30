import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon, TruckIcon, UserGroupIcon, ChartBarIcon, CurrencyDollarIcon,
  CubeTransparentIcon, CheckCircleIcon, DocumentTextIcon, BanknotesIcon, MapPinIcon,
  ClipboardDocumentListIcon, BuildingOffice2Icon, ArrowsRightLeftIcon, BoltIcon,
  GlobeAltIcon, IdentificationIcon, ReceiptPercentIcon, Cog6ToothIcon, SparklesIcon,
  LockClosedIcon, ClipboardDocumentCheckIcon, WrenchScrewdriverIcon, ArchiveBoxIcon,
  CalculatorIcon, PresentationChartLineIcon, KeyIcon, CreditCardIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/MultiTenantAuthProvider';

const LogisticsSaaS = () => {
  const [billingCycle, setBillingCycle] = useState('month');
  const [activeFaq, setActiveFaq] = useState(null);
  const { user, loading } = useAuth();
  
  const faqs = [
    { q: "Can I manage both asset-based and brokerage operations?", a: "Yes. The platform has a dual-module architecture. Use the 'Regular' module for your own fleet (Trucks, Trailers, Drivers, Owner-Operators) and the 'Outsourcing' module for carrier brokerage — independently or together. Each tenant's plan decides which modules are unlocked." },
    { q: "How granular are the user permissions?", a: "Very granular. Beyond the core roles (Admin, Accountant, Staff/Dispatcher, Driver), you control 12+ individual permissions: regular, outsourcing, accounting, customers (read/write), carriers (read/write), employees, sub-admin, driver, and invoices. Admins can restrict any staff member to specific modules and actions." },
    { q: "Does the system calculate driver salaries automatically?", a: "Yes. The accounting module auto-generates payslips from dispatch data — solo miles, team miles, or city hours — and tracks truck gross earnings, carrier payments, and owner-operator statements in real time. Everything exports to PDF." },
    { q: "Does it handle multiple currencies?", a: "Yes. Orders can be entered in USD, CAD, or INR per order. The platform stores the exact typed amount plus a normalized USD base value with an FX-rate snapshot for accurate reporting and aggregation — no double conversion." },
    { q: "Is this suitable for a multi-company setup?", a: "Yes. It's true multi-tenant. A Super Admin creates isolated environments (own subdomain, data, subscription, and limits) per company, and can securely emulate any tenant for support. Tenant admins can likewise emulate their own employees to troubleshoot." },
    { q: "How does billing work?", a: "Each tenant subscribes to a plan (Starter / Professional / Enterprise) on monthly, quarterly, or yearly cycles with cycle discounts. Plans meter team seats and orders-per-month, and unlock modules. A self-serve billing page handles checkout, renewals, usage bars, and purchase history." }
  ];

  // Full project capability map — grouped so clients see the entire scope
  const featureGroups = [
    {
      label: 'Operations & Dispatch',
      accent: 'blue',
      items: [
        { icon: <ClipboardDocumentListIcon className="w-6 h-6" />, title: 'Order & Load Management', desc: 'Create and track loads end to end with custom order-number prefixes (e.g. CMC-1013), status workflow, and document counts.' },
        { icon: <MapPinIcon className="w-6 h-6" />, title: 'Intelligent Dispatching', desc: 'Assign drivers, trucks, and trailers to each order with clear visibility of asset allocation across the whole fleet.' },
        { icon: <ArrowsRightLeftIcon className="w-6 h-6" />, title: 'Trip Planning', desc: 'Plan multi-stop routes with pickup → delivery sequencing, distances, and per-trip detail on every order.' },
        { icon: <DocumentTextIcon className="w-6 h-6" />, title: 'Document Management', desc: 'Attach BOLs, PODs, rate confirmations, and receipts directly to orders or employee profiles with instant preview.' },
        { icon: <GlobeAltIcon className="w-6 h-6" />, title: 'Multi-Currency Orders', desc: 'Enter each order in USD, CAD, or INR. Amounts are normalized to a USD base with an FX-rate snapshot for accurate reporting.' },
      ],
    },
    {
      label: 'Fleet & Assets — Regular Module',
      accent: 'cyan',
      items: [
        { icon: <TruckIcon className="w-6 h-6" />, title: 'Truck Management', desc: 'Maintain your power units and track per-truck gross earnings month over month.' },
        { icon: <ArchiveBoxIcon className="w-6 h-6" />, title: 'Trailer Management', desc: 'Manage trailers and tie them to orders and assignments alongside trucks and drivers.' },
        { icon: <IdentificationIcon className="w-6 h-6" />, title: 'Driver Management', desc: 'Driver profiles with rate-per-mile, logs, and full assignment history.' },
        { icon: <WrenchScrewdriverIcon className="w-6 h-6" />, title: 'Owner-Operators', desc: 'Dedicated owner-operator profiles, financial summaries, owner-operated orders, and exportable settlement statements / pay slips.' },
      ],
    },
    {
      label: 'Carrier Brokerage — Outsourcing Module',
      accent: 'amber',
      items: [
        { icon: <CubeTransparentIcon className="w-6 h-6" />, title: 'Carrier Management', desc: 'Onboard third-party carriers, track MC numbers, and scope visibility by company or permission.' },
        { icon: <BuildingOffice2Icon className="w-6 h-6" />, title: 'Customer Management', desc: 'Multi-assign customers to staff, share unassigned customers within a company, and control exactly who sees what.' },
        { icon: <BanknotesIcon className="w-6 h-6" />, title: 'Carrier Payment Tracking', desc: 'Record and monitor carrier costs per load with payment statuses and per-order profit visibility.' },
      ],
    },
    {
      label: 'Accounting & Finance',
      accent: 'emerald',
      items: [
        { icon: <CalculatorIcon className="w-6 h-6" />, title: 'Automated Driver Payslips', desc: 'Auto-calculate earnings from solo miles, team miles, or city hours — no spreadsheets, with PDF export.' },
        { icon: <ReceiptPercentIcon className="w-6 h-6" />, title: 'Customer Invoices', desc: 'Generate permission-gated customer invoice PDFs, with download access restricted to authorized roles.' },
        { icon: <PresentationChartLineIcon className="w-6 h-6" />, title: 'Finance Reports', desc: 'Module- and period-filtered finance reports (30d/60d/90d/6m/1y/custom) with one-click PDF export.' },
        { icon: <CurrencyDollarIcon className="w-6 h-6" />, title: 'Profit & Expense Tracking', desc: 'Per-order expenses, fuel surcharges, revenue vs. carrier cost, and precise profit margins on every load.' },
      ],
    },
    {
      label: 'Platform, Security & Admin',
      accent: 'violet',
      items: [
        { icon: <UserGroupIcon className="w-6 h-6" />, title: 'Multi-Tenant Architecture', desc: 'Isolated environments per company — own subdomain, data, subscription, and limits — managed from a Super Admin dashboard.' },
        { icon: <ShieldCheckIcon className="w-6 h-6" />, title: 'Role-Based Access Control', desc: '12+ granular permissions across modules and actions on top of Admin / Accountant / Staff / Driver roles.' },
        { icon: <CreditCardIcon className="w-6 h-6" />, title: 'Subscriptions & Billing', desc: 'Self-serve plans with monthly/quarterly/yearly cycles, discounts, usage limits, checkout, and purchase history.' },
        { icon: <KeyIcon className="w-6 h-6" />, title: 'Secure Emulation', desc: 'Super Admins emulate tenants and tenant admins emulate employees via short-lived tokens for safe support and troubleshooting.' },
        { icon: <BoltIcon className="w-6 h-6" />, title: 'Real-Time & Activity Logs', desc: 'Live counters and updates (Pusher / Socket.io) plus a full activity audit trail across the platform.' },
        { icon: <SparklesIcon className="w-6 h-6" />, title: 'AI Assistance', desc: 'Built-in AI features and automated FX-rate jobs keep data current and reduce manual data entry.' },
      ],
    },
  ];

  const roles = [
    { icon: <Cog6ToothIcon className="w-5 h-5" />, name: 'Super Admin', desc: 'Platform owner. Creates tenants, manages subscription plans, and can securely emulate any company for support.' },
    { icon: <LockClosedIcon className="w-5 h-5" />, name: 'Tenant Admin', desc: 'Company owner. Full access to all modules, billing, employee management, and employee emulation within their tenant.' },
    { icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, name: 'Accountant', desc: 'Finance-focused. Access to accounting, invoices, payslips, and finance reports across the tenant.' },
    { icon: <MapPinIcon className="w-5 h-5" />, name: 'Staff / Dispatcher', desc: 'Day-to-day operations. Manage orders, customers, and carriers, scoped by the permissions the admin grants.' },
    { icon: <TruckIcon className="w-5 h-5" />, name: 'Driver', desc: 'Limited driver-scoped access to their own assignments and relevant load information.' },
  ];

  const accentMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/30',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/30',
  };

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
            <a href="#modules" className="hover:text-white transition-all">Modules</a>
            <a href="#features" className="hover:text-white transition-all">Features</a>
            <a href="#roles" className="hover:text-white transition-all">Roles</a>
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

      {/* --- DUAL MODULE OVERVIEW --- */}
      <section id="modules" className="container mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Two engines, one platform</span>
          <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Dual-Power Logistics Engine</h2>
          <p className="text-gray-400">Run your own fleet, broker freight to external carriers, or do both. Each tenant's plan unlocks the modules they need.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-8 rounded-3xl bg-[#0D0D15] border border-cyan-500/20">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 text-cyan-400"><TruckIcon className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Regular — Asset-Based Fleet</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">For carriers running their own equipment. Manage trucks, trailers, drivers, and owner-operators with full driver-pay accounting.</p>
            <div className="flex flex-wrap gap-2">
              {['Trucks', 'Trailers', 'Drivers', 'Owner-Operators', 'Payslips'].map((t) => (
                <span key={t} className="text-[11px] font-semibold text-cyan-300/80 bg-cyan-500/5 border border-cyan-500/15 px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-[#0D0D15] border border-amber-500/20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400"><CubeTransparentIcon className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Outsourcing — Carrier Brokerage</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">For brokers and 3PLs. Assign loads to external carriers, track MC numbers, customer assignments, and carrier payments.</p>
            <div className="flex flex-wrap gap-2">
              {['Carriers', 'Customers', 'MC Numbers', 'Carrier Pay', 'Margins'].map((t) => (
                <span key={t} className="text-[11px] font-semibold text-amber-300/80 bg-amber-500/5 border border-amber-500/15 px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES (CATEGORIZED) --- */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Everything you need, in one platform</h2>
          <p className="text-gray-400">From dispatch and fleet to accounting, billing, and multi-company administration — the complete operating system for freight & logistics.</p>
        </div>

        <div className="space-y-20">
          {featureGroups.map((group, gi) => (
            <div key={gi}>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-300 whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>{group.label}</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((f, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-[#0D0D15] border border-white/[0.05] hover:bg-white/[0.02] transition-all group">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner ${accentMap[group.accent]}`}>
                      {f.icon}
                    </div>
                    <h4 className="text-lg font-bold mb-3 text-gray-100">{f.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ROLES & PERMISSIONS --- */}
      <section id="roles" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/5 border-y border-blue-500/10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Built-in access control</span>
            <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>One platform, every role</h2>
            <p className="text-gray-400">From platform owners down to drivers — everyone sees exactly what they should, governed by granular per-user permissions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {roles.map((r, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0D0D15] border border-white/[0.06] hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">{r.icon}</div>
                <h3 className="text-base font-bold mb-2 text-gray-100">{r.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
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
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Small team seats</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Metered orders per month</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> One module (Regular or Outsourcing)</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Customers, carriers & fleet records</li>
               <li className="flex items-center gap-3 text-gray-600"><CheckCircleIcon className="w-5 h-5 text-gray-700 flex-shrink-0" /> No advanced accounting</li>
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
               <span className="text-5xl font-black">${billingCycle === 'month' ? '99' : '79'}</span>
               <span className="text-gray-500 font-medium">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-gray-200 flex-1">
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Larger team seats</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Higher monthly order volume</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Outsourcing & Regular modules</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Full fleet & driver management</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Accounting, payslips & invoices</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" /> Finance reports & PDF export</li>
            </ul>
            <Link to="/login" className="mt-8 block w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-bold shadow-lg shadow-blue-600/25 transition-colors">Get Professional</Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#0D0D15] border border-gray-800 rounded-3xl p-8 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-white">Enterprise</h3>
            <p className="text-sm text-gray-400 mb-6">For large organizations requiring unlimited scale.</p>
            <div className="mb-8">
               <span className="text-5xl font-black">${billingCycle === 'month' ? '249' : '199'}</span>
               <span className="text-gray-500 font-medium">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-gray-300 flex-1">
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Unlimited users & orders</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Both modules, all features</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Custom subdomains</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Super Admin dashboard</li>
               <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> Priority support</li>
            </ul>
            <Link to="/login" className="mt-8 block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-center font-bold transition-colors">Get Enterprise</Link>
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
                <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
                <a href="#modules" className="hover:text-blue-400 transition-colors">Modules</a>
                <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
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
