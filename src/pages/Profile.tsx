import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useNavigate } from 'react-router';
import { LogOut, Package, Calendar, Award } from 'lucide-react';

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { dbFirestore } from '../lib/firebase.ts';

export function Profile() {
  const { user, dbUser, signOut, getToken, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<{points: number, actions: any[]}>({ points: 0, actions: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const token = await getToken();
        
        const ordersRes = await fetch('/api/orders/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        
        const bookingsRes = await fetch('/api/bookings/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookingsData = await bookingsRes.json();
        
        const loyaltyRes = await fetch('/api/loyalty/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const loyaltyData = loyaltyRes.ok ? await loyaltyRes.json() : null;

        setOrders(ordersData.orders || []);
        setBookings(bookingsData.bookings || []);
        if (loyaltyData) {
          setLoyalty({ points: loyaltyData.loyaltyPoints, actions: loyaltyData.actions || [] });
        }

        // Fetch orders from Firestore as requested
        try {
          const q = query(
            collection(dbFirestore, 'orders'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const fsOrders: any[] = [];
          querySnapshot.forEach((doc) => {
            fsOrders.push({ id: doc.id, ...doc.data() });
          });
          setFirestoreOrders(fsOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (fsErr) {
          console.error("Failed to fetch from Firestore:", fsErr);
        }

      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user, authLoading, getToken, navigate]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      }
    } catch (err) {
      console.error('Failed to cancel booking', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bento-card rounded-3xl h-40 bg-slate-900 animate-pulse border border-slate-800 mb-12"></div>
          <div className="bento-card rounded-3xl h-64 bg-slate-900 animate-pulse border border-slate-800 mb-12"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bento-card rounded-3xl h-96 bg-slate-900 animate-pulse border border-slate-800"></div>
            <div className="bento-card rounded-3xl h-96 bg-slate-900 animate-pulse border border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bento-card rounded-3xl p-8 mb-12 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center text-4xl font-display font-bold text-slate-950">
            {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-1">{user.displayName || 'Guest User'}</h1>
            <p className="text-slate-400">{user.email}</p>
          </div>
          <button 
            onClick={() => { signOut(); navigate('/'); }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cream-50 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="bento-card rounded-3xl p-8 mb-12 border-amber-glow stat-gradient">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-display font-bold text-white">Loyalty Rewards</h2>
              </div>
              <p className="text-white/80">Earn points with every order to unlock free items.</p>
            </div>
            <div className={`text-center bg-black/20 p-6 rounded-2xl backdrop-blur-md min-w-[200px] ${loyalty.points > 0 ? 'animate-pulse' : ''}`}>
              <p className="text-[10px] opacity-70 uppercase font-bold text-white mb-1">Available Points</p>
              <p className="text-5xl font-black text-white">{loyalty.points}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-sm text-white/80 mb-2 font-bold">
              <span>Bronze Tier</span>
              <span>Silver Tier (1000 pts)</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((loyalty.points / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {loyalty.actions.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Recent Point Activity</h3>
              <div className="space-y-3">
                {loyalty.actions.slice(0, 3).map((action: any) => (
                  <div key={action.id} className="flex justify-between items-center bg-black/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-white text-sm">{action.actionDescription}</p>
                    <span className="text-white font-bold bg-white/20 px-3 py-1 rounded-full text-xs">
                      +{action.pointsEarned} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Order History */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-display font-bold text-cream-50">Order History</h2>
            </div>
            
            <div className="space-y-4">
              {orders.length === 0 && firestoreOrders.length === 0 ? (
                <p className="text-slate-500 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 text-center">No orders found.</p>
              ) : (
                [...orders, ...firestoreOrders.filter(fo => !orders.some(o => o.orderToken === fo.orderToken))]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(order => (
                  <div key={order.id || order.orderToken} className="block bento-card rounded-2xl p-6 hover:border-amber-glow transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-amber-500 font-bold">#{order.orderToken}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm mb-4">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-cream-50 text-base">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                      <Link to={`/track/${order.orderToken}`} className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
                        View Details
                      </Link>
                      <Link to="/menu" className="bg-slate-800 hover:bg-slate-700 text-cream-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Re-order Items
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Table Bookings */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-display font-bold text-cream-50">My Bookings</h2>
            </div>
            
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-slate-500 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 text-center">No table reservations.</p>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="bento-card rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-cream-50">{booking.date} at {booking.time}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        booking.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                        booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-slate-400 text-sm">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
