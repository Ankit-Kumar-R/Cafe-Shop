import React, { useState } from 'react';
import { Coffee, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';

export function Footer() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { signIn, dbUser, user } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    if (!user) {
      await signIn();
    }
    // AuthContext syncs dbUser. The modal can redirect or just let them click a button to go to dashboard.
    navigate('/admin');
    setShowAdminModal(false);
  };

  return (
    <footer className="bg-slate-950/40 pt-16 pb-8 border-t border-amber-glow mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Card */}
          <div className="md:col-span-5 bento-card rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none transform translate-x-4 -translate-y-4">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 animate-[spin_20s_linear_infinite]">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </div>
            
            <div className="space-y-4 relative z-10">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Coffee className="w-7 h-7 text-cream-50" />
                </div>
                <span className="font-display font-bold text-3xl tracking-tight text-cream-50 drop-shadow-md">
                  AK Cafe<span className="text-amber-500 text-xl ml-1">SHOP</span>
                </span>
              </Link>
              <p className="text-slate-300 text-sm leading-relaxed mt-4 max-w-sm">
                Premium blends, warm ambiance, and unforgettable moments. Experience the art of fine coffee near St. Columba's College.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700/50">
              <h3 className="font-display font-semibold text-sm text-slate-400 mb-4 uppercase tracking-widest">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-amber-500 hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-amber-500 hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-amber-500 hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Links Card */}
          <div className="md:col-span-3 bento-card rounded-3xl p-8 shadow-2xl">
            <h3 className="font-display font-semibold text-lg text-cream-50 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> Quick Links
            </h3>
            <ul className="space-y-3">
              {['Home', 'Menu', 'About', 'Book Table', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-slate-400 hover:text-amber-500 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-px bg-amber-500 transition-all duration-300 group-hover:w-4"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Card */}
          <div className="md:col-span-4 bento-card rounded-3xl p-8 shadow-2xl">
            <h3 className="font-display font-semibold text-lg text-cream-50 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> Contact Info
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-slate-300 text-sm group">
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-300 shadow-lg">
                  <MapPin className="w-5 h-5 text-amber-500" />
                </div>
                <span className="mt-1">Near St. Columba's College,<br />Hazaribag, Jharkhand 825301</span>
              </li>
              <li className="flex items-center gap-4 text-slate-300 text-sm group">
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-300 shadow-lg">
                  <Phone className="w-5 h-5 text-amber-500" />
                </div>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-4 text-slate-300 text-sm group">
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-300 shadow-lg">
                  <Mail className="w-5 h-5 text-amber-500" />
                </div>
                <span>hello@akcafeshop.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
            &copy; {new Date().getFullYear()} AK Cafe SHOP. All rights reserved.
            <button onClick={() => setShowAdminModal(true)} className="opacity-30 hover:opacity-100 transition-opacity p-1 ml-2 bg-slate-800 rounded-full hover:bg-slate-700 shadow-inner" title="Owner Access">
              <Shield className="w-4 h-4 text-amber-500" />
            </button>
          </p>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bento-card p-8 rounded-3xl max-w-sm w-full relative">
            <button 
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-cream-50 font-display">Owner Access</h3>
              <p className="text-slate-400 text-sm mt-2">Secure gateway for administrators</p>
            </div>
            
            <button
              onClick={handleAdminLogin}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-cream-50 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20"
            >
              {user ? 'Proceed to Dashboard' : 'Authenticate with Google'}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
