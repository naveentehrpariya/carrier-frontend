import React from 'react';
import { Link } from 'react-router-dom';

export default function CMCHomepage() {
  return (
    <div className="min-h-screen bg-[#0B0E1A] text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-md bg-red-500" />
          <span className="text-lg font-semibold">Cross Miles Carrier</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white">Log in</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Move freight faster with a modern carrier management cloud
            </h1>
            <p className="mt-4 text-gray-300 text-base md:text-lg">
              All-in-one platform for orders, customers, drivers, and billing with multi-tenant controls for teams of any size.
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <Link to="/signup" className="px-5 py-3 rounded-md bg-red-600 hover:bg-red-700 font-medium">Start free trial</Link>
              <Link to="/contact" className="px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 font-medium">Request demo</Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">99.99%</div>
                <div className="text-xs text-gray-400 mt-1">Uptime</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">10k+</div>
                <div className="text-xs text-gray-400 mt-1">Orders daily</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-gray-400 mt-1">Carriers</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="h-64 md:h-96 rounded-lg bg-gradient-to-br from-red-600/30 to-purple-600/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Orders & Billing', desc: 'Create, track, and invoice shipments in one place.' },
            { title: 'Customers & Carriers', desc: 'Manage relationships, contracts, and compliance.' },
            { title: 'Teams & Permissions', desc: 'Granular roles with multi-tenant isolation.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 rounded-lg p-5 border border-white/10">
              <div className="h-8 w-8 rounded-md bg-red-600/70" />
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-400 flex items-center justify-between">
          <div>© {new Date().getFullYear()} Cross Miles Carrier Inc.</div>
          <div className="flex items-center space-x-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}