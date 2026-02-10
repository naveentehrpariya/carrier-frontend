import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const LogisticsSaaS = () => {
  const [billingCycle, setBillingCycle] = useState('month');
  const [activeFaq, setActiveFaq] = useState(null);
  const faqs = [
    { q: "How long does implementation take?", a: "Most fleets are up and running within 48 hours. Our team handles the data migration from your existing spreadsheets or legacy TMS." },
    { q: "Does it integrate with ELD providers?", a: "Yes, we have native integrations with Samsara, Motive, and Geotab to pull real-time telematics and HOS data." },
    { q: "Is there a limit on the number of users?", a: "Our Pro plan includes unlimited administrative users and driver app access at no extra cost." }
  ];

  return (
    <div className="bg-[#030308] text-white min-h-screen selection:bg-rose-500/30 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] bg-rose-600/10 blur-[120px] rounded-full -z-10 opacity-60" />

      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 bg-[#030308]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-rose-600 rounded-lg rotate-12 shadow-[0_0_20px_rgba(225,29,72,0.4)]" />
            <span className="text-xl font-extrabold tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>logistikore</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-gray-200 uppercase tracking-[0.2em]">
            <a href="#features" className="hover:text-white transition-all">Platform</a>
            <a href="#how" className="hover:text-white transition-all">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-all">Pricing</a>
          </div>
          <div className="flex gap-4">
            <button className="bg-white/5 border border-white/10 px-5 py-2 rounded-full text-xs font-bold hover:bg-white/10 transition-all">Demo</button>
            <Link to='/login' className="bg-rose-600 hover:bg-rose-500 px-6 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-rose-600/20">Sign In</Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-4 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">v2.0 is now live</span>
            </div>
            <h1 className="text-6xl lg:text-[60px] font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              The OS for <span className="text-gray-500">Modern</span> Logistics.
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Automate dispatch, real-time tracking, and automated billing in one unified cloud interface. Built for speed.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all">Get Started Free</button>
              <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">View Docs</button>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-blue-500/20 rounded-[32px] blur-2xl opacity-50" />
            <div className="relative bg-[#0D0D15] border border-white/10 rounded-[28px] p-2 overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200" className="rounded-[22px] opacity-90 group-hover:opacity-100 transition-all duration-700" alt="Dashboard" />
            </div>
          </div>
        </div>
      </section>

      <div className="py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] mb-8">Trusted by global freight leaders</p>
          <div className="flex justify-around items-center opacity-30 grayscale gap-8 flex-wrap">
            <span className="text-2xl font-black italic tracking-tighter">FEDEX</span>
            <span className="text-2xl font-black italic tracking-tighter">DHL</span>
            <span className="text-2xl font-black italic tracking-tighter">MAERSK</span>
            <span className="text-2xl font-black italic tracking-tighter">UPS</span>
            <span className="text-2xl font-black italic tracking-tighter">DB SCHENKER</span>
          </div>
        </div>
      </div>

      {/* --- CORE FEATURES GRID (New Component) --- */}
      <section id="features" className="container mx-auto px-6 py-32">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Built for the complexities of freight</h2>
          <p className="text-gray-400">Everything you need to scale your logistics business without the manual overhead.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Smart Dispatching', desc: 'AI-driven routing to find the most efficient path for every load.' },
            { title: 'Live Telematics', desc: 'Instant GPS updates and driver behavior monitoring from one map.' },
            { title: 'Auto-Invoicing', desc: 'Convert BOLs to invoices instantly with 99.9% accuracy.' },
            { title: 'Driver App', desc: 'Native iOS & Android apps for seamless driver communication.' },
            { title: 'Carrier Portal', desc: 'Dedicated login for your partners to manage bids and documents.' },
            { title: 'Deep Analytics', desc: 'Custom reports to analyze your margins per mile and driver performance.' }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-rose-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500 font-bold group-hover:scale-110 transition-transform">
                0{i+1}
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TESTIMONIAL (New Component) --- */}
      <section className="container mx-auto px-6">
        <div className="bg-gradient-to-br from-rose-600/20 to-transparent p-[1px] rounded-[40px]">
          <div className=" bg-dark2 rounded-[40px] p-12 text-center space-y-8 relative overflow-hidden">
            <div className="text-5xl opacity-20 absolute top-10 left-10">"</div>
            <p className="text-2xl md:text-3xl font-medium leading-relaxed italic" style={{ fontFamily: "'Outfit', sans-serif" }}>
              "Switching to Logistikore reduced our dispatch time by 40% in the first month. It's the cleanest software we've ever used."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full border border-white/10" />
              <div className="text-left">
                <p className="font-bold text-sm">Marcus Sterling</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Operations Director, PrimeFreight</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA / PRICING SECTION --- */}
      <section id="pricing" className="container mx-auto px-6 py-32">
        <div className=" rounded-[48px]   flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-5xl font-extrabold tracking-tighter leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Transparent pricing for global scale.</h2>
            <p className="text-gray-400">Join 500+ carriers moving freight faster.</p>
            <div className="flex gap-4">
              <button className="bg-rose-600 px-8 py-3 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20">Upgrade Now</button>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full bg-[#0D0D1E] border border-white/10 rounded-3xl p-10 relative">
            <div className="absolute -top-4 -right-4 bg-rose-600 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Most Popular</div>
            <h3 className="text-2xl font-bold mb-6">Professional Plan</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-extrabold tracking-tighter">$39</span>
              <span className="text-gray-500 text-sm font-bold uppercase">/ month</span>
            </div>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Unlimited Fleet Management</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Automated BOL Generation</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> API Access & Webhooks</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 24/7 Phone Support</li>
            </ul>
          </div>
        </div>
      </section>

 
 

        {/* --- FEATURE COMPARISON TABLE (New Component) --- */}
        <section className="container mx-auto px-6 py-32 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Compare Capabilities</h2>
            <p className="text-gray-500">Find the right fit for your fleet size.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] tracking-[0.2em] text-gray-500 uppercase">
                  <th className="py-6 px-4">Feature</th>
                  <th className="py-6 px-4">Starter</th>
                  <th className="py-6 px-4 text-rose-500">Professional</th>
                  <th className="py-6 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { f: 'Active Loads', s: '10', p: 'Unlimited', e: 'Unlimited' },
                  { f: 'Driver Mobile App', s: '✓', p: '✓', e: '✓' },
                  { f: 'Custom API Access', s: '-', p: '✓', e: '✓' },
                  { f: 'Multi-Tenant Controls', s: '-', p: '-', e: '✓' },
                  { f: 'White-label Invoices', s: '-', p: '✓', e: '✓' }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    <td className="py-6 px-4 font-medium text-gray-300">{row.f}</td>
                    <td className="py-6 px-4 text-gray-500">{row.s}</td>
                    <td className="py-6 px-4 font-bold text-rose-400">{row.p}</td>
                    <td className="py-6 px-4 text-gray-500">{row.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- FAQ ACCORDION (New Component) --- */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-extrabold mb-12 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>Questions? We have answers.</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/[0.02] transition-all"
                >
                  <span className="font-semibold text-gray-200">{faq.q}</span>
                  <span className={`text-rose-500 transition-transform ${activeFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {activeFaq === i && (
                  <div className="px-8 pb-6 text-sm text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 pt-12 pb-12">
          <div className="relative rounded-[48px] bg-rose-600 p-12 md:p-24 overflow-hidden text-center">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Ready to automate your fleet?
              </h2>
              <p className="text-rose-100 text-lg max-w-xl mx-auto font-medium">
                Join the hundreds of dispatchers and carriers who have reclaimed 20+ hours a week with Logistikore.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                <button className="bg-white text-rose-600 px-10 py-4 rounded-full font-bold shadow-xl hover:bg-gray-100 transition-all">
                  Start My 14-Day Free Trial
                </button>
                <button className="bg-rose-700/30 border border-rose-400/30 px-10 py-4 rounded-full font-bold hover:bg-rose-700/50 transition-all">
                  Schedule a Guided Tour
                </button>
              </div>
              <p className="text-rose-200/60 text-[10px] font-bold uppercase tracking-widest">No credit card required • Instant Setup</p>
            </div>
          </div>
        </section>

        <footer className="bg-dark2  mx-auto ">
              <div className='container'>
                  <div className='px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]'>
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-4 h-4 bg-rose-600 rounded rotate-12" />
                      LOGISTIKORE
                    </div>
                    <div className="flex gap-10">
                      <a href="#" className="hover:text-white transition-colors">Privacy</a>
                      <a href="#" className="hover:text-white transition-colors">Terms</a>
                      <a href="#" className="hover:text-white transition-colors">API</a>
                    </div>
                    <p>© 2025 All Rights Reserved</p>
              </div>
              </div>
        </footer>
    </div>
  );
};

export default LogisticsSaaS;