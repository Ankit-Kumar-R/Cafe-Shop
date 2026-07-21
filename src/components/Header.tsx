import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Coffee, ShoppingCart, Menu, X, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dbUser, signIn, signOut } = useAuth();
  const { items } = useCart();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Book Table', path: '/book' },
    { name: 'Contact', path: '/contact' },
  ];

  const cartItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      fetch(`/api/menu?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.items.filter((item: any) => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ingredients?.some((ing: string) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
          ).slice(0, 5));
          setIsSearchOpen(true);
        })
        .catch(console.error);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-amber-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
            <Coffee className="w-8 h-8" />
            <span className="font-display font-bold text-2xl tracking-tight text-cream-50">AK Cafe<span className="text-amber-500 text-lg ml-1">SHOP</span></span>
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 2 && setIsSearchOpen(true)}
                className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-cream-50 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>
            
            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bento-card rounded-2xl shadow-xl overflow-hidden z-50">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate('/menu');
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    aria-label={`Go to ${item.name}`}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800/50 flex items-center justify-between transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-cream-50">{item.name}</p>
                      <p className="text-xs text-slate-400 truncate">{item.category}</p>
                    </div>
                    <span className="text-amber-500 font-bold text-sm">₹{item.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${location.pathname === link.path ? 'text-amber-500' : 'text-cream-100 hover:text-amber-400'} font-medium transition-colors`}
              >
                {link.name}
              </Link>
            ))}
            {dbUser?.role === 'admin' && (
              <Link to="/admin" className="text-cream-100 hover:text-amber-400 font-medium transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => document.documentElement.classList.toggle('light-theme')}
              className="text-cream-100 hover:text-amber-400 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <Link to="/cart" className="relative text-cream-100 hover:text-amber-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-cream-100 hover:text-amber-400" aria-label="View Profile">
                  <User className="w-5 h-5" />
                  <span className="hidden lg:block text-sm font-medium">{user.displayName || 'Profile'}</span>
                </Link>
                <button onClick={signOut} aria-label="Logout" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                aria-label="Sign In"
                className="bg-amber-600 hover:bg-amber-500 text-cream-50 px-5 py-2 rounded-full font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative text-cream-100">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="text-cream-100 hover:text-amber-400 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-slate-900 border-l border-slate-800 z-50 md:hidden overflow-y-auto flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <span className="font-display font-bold text-xl tracking-tight text-cream-50">Menu</span>
                <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="text-slate-400 hover:text-amber-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 flex-1">
                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-cream-50 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  
                  {isSearchOpen && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bento-card rounded-xl shadow-xl overflow-hidden z-50 border border-slate-700/50">
                      {searchResults.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            navigate('/menu');
                            setSearchQuery('');
                            setIsSearchOpen(false);
                            setIsOpen(false);
                          }}
                          aria-label={`Go to ${item.name}`}
                          className="w-full text-left px-4 py-3 hover:bg-slate-800/50 flex items-center justify-between transition-colors border-b border-slate-800/50 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-cream-50">{item.name}</p>
                          </div>
                          <span className="text-amber-500 font-bold text-sm">₹{item.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${location.pathname === link.path ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' : 'text-cream-100 hover:bg-slate-800 hover:text-amber-400'}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {dbUser?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-xl text-lg font-medium text-cream-100 hover:bg-slate-800 hover:text-amber-400"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-800 bg-slate-950/50">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-cream-100 hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-5 h-5 text-amber-500" />
                      {user.displayName || 'Profile'}
                    </Link>
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      aria-label="Logout"
                      className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { signIn(); setIsOpen(false); }}
                    aria-label="Sign In"
                    className="w-full btn-neumorphic text-cream-50 py-4 rounded-xl font-medium transition-colors text-lg"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
