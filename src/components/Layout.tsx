import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '../CartContext';

export const Header: React.FC = () => {
  const { cart } = useCart();
  const location = useLocation();

  const navItems = [
    { label: 'Catalog', path: '/' },
    { label: 'My Inquiries', path: '/inquiry' },
    { label: 'About SIF', path: '#' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-header shadow-sm border-b border-slate-100">
      <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-3xl font-bold text-primary italic font-headline tracking-tight">
            BOI-CSR
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-2xl font-headline tracking-tight transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? 'text-primary font-bold border-b-4 border-primary pb-1'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex bg-surface-container-low px-4 py-2 rounded-full items-center gap-2 border border-slate-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาโครงการ..."
              className="bg-transparent border-none focus:ring-0 text-on-surface-variant w-48 font-body text-xl"
            />
          </div>
          <Link to="/inquiry" className="p-3 rounded-full hover:bg-blue-50/50 transition-all relative">
            <ShoppingCart className="w-6 h-6 text-primary" />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </Link>
          <button className="p-3 rounded-full hover:bg-blue-50/50 transition-all">
            <User className="w-6 h-6 text-primary" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 w-full border-t-4 border-blue-100 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary text-2xl font-headline italic">
            BOI-CSR (Social Innovation Foundation)
          </span>
          <p className="font-body text-lg text-slate-500">
            © 2024 Social Innovation Foundation (SIF). All rights reserved. For inquiries: Nattakarm@sif.or.th
          </p>
        </div>
        <div className="flex gap-10 font-body text-lg">
          <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors">Admin</Link>
          <a href="#" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="text-slate-500 hover:text-primary transition-colors">Accessibility Support</a>
        </div>
      </div>
    </footer>
  );
};
