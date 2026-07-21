import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart, Tag, Printer, Mic, MicOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function Cart() {
  const { items, updateQuantity, removeFromCart, total, subtotal, discount, activePromotion, clearCart, isListening, startListening, stopListening, speechFeedback } = useCart();
  const { user, dbUser, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleCheckout = async () => {
    if (!user) {
      addToast('Please sign in to complete checkout.', 'error');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const payload = {
        items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        pointsToRedeem,
        source: 'QR_SCAN'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        addToast('Order placed successfully!', 'success');
        navigate(`/track/${data.order.orderToken}`);
      } else {
        addToast('Failed to place order.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error placing order.', 'error');
    }
    setLoading(false);
  };

  const finalTotal = Math.max(0, (total * 1.05) - (pointsToRedeem * 0.1));

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 mb-6">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold text-cream-50 mb-4">Your cart is empty</h2>
        <p className="text-slate-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/menu" className="bg-amber-600 hover:bg-amber-500 text-cream-50 px-8 py-3 rounded-full font-medium transition-colors">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="pt-24 pb-16 min-h-screen no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-display font-bold text-cream-50 mb-2">Shopping Cart</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    isListening ? 'bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse' : 'bg-slate-900 text-slate-400 hover:text-amber-500 border border-slate-800'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? 'Listening...' : 'Voice Order'}
                </button>
                {speechFeedback && (
                  <span className="text-sm text-amber-500 animate-fade-in">{speechFeedback}</span>
                )}
              </div>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              <Printer className="w-5 h-5" /> Print Receipt
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.menuItemId} className="bento-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                ) : (
                  <div className="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center text-slate-600">No Img</div>
                )}
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-display font-bold text-cream-50 mb-2">{item.name}</h3>
                  <p className="text-amber-500 font-bold">₹{item.price}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800">
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-cream-50">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.menuItemId)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-500 bg-slate-950 rounded-lg border border-slate-800 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bento-card rounded-3xl p-8 sticky top-28">
              <h3 className="text-2xl font-display font-bold text-cream-50 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-cream-50">₹{subtotal.toFixed(2)}</span>
                </div>
                {activePromotion && (
                  <div className="flex justify-between items-center text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {activePromotion.name} (-{activePromotion.discountPercentage}%)
                    </span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (5%)</span>
                  <span className="text-cream-50">₹{(total * 0.05).toFixed(2)}</span>
                </div>
                {pointsToRedeem > 0 && (
                  <div className="flex justify-between text-amber-500">
                    <span>Loyalty Discount ({pointsToRedeem} pts)</span>
                    <span>-₹{(pointsToRedeem * 0.1).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {dbUser && dbUser.loyaltyPoints > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-amber-500">Your Loyalty Points: {dbUser.loyaltyPoints}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max={Math.min(dbUser.loyaltyPoints, (total * 1.05) / 0.1)} 
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="text-sm text-cream-50">{pointsToRedeem} pts</span>
                  </div>
                  <p className="text-xs text-amber-500/70 mt-1">10 pts = ₹1 discount</p>
                </div>
              )}
              
              <div className="border-t border-slate-800 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-cream-50 font-medium">Total</span>
                  <span className="text-3xl font-display font-bold text-amber-500">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-cream-50 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    Checkout <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {!user && (
                <p className="text-sm text-center text-amber-500 mt-4">
                  Please <button onClick={() => {}} className="underline underline-offset-2">Sign in</button> to place an order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Print-only receipt format */}
      <div className="print-only hidden">
        <div className="print-ticket">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>AK Cafe SHOP</h1>
            <p style={{ margin: '5px 0' }}>123 Brew Lane, Coffee City</p>
            <p style={{ margin: '5px 0' }}>{new Date().toLocaleString()}</p>
            <p style={{ margin: '5px 0' }}>--------------------------------</p>
          </div>
          
          <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>Item</th>
                <th style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>Qty</th>
                <th style={{ textAlign: 'right', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.menuItemId}>
                  <td style={{ paddingTop: '5px' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', paddingTop: '5px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', paddingTop: '5px' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {activePromotion && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Discount ({activePromotion.discountPercentage}%):</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Taxes (5%):</span>
              <span>₹{(total * 0.05).toFixed(2)}</span>
            </div>
            {pointsToRedeem > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Points Redeemed:</span>
                <span>-₹{(pointsToRedeem * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
              <span>TOTAL:</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '5px 0' }}>--------------------------------</p>
            <p style={{ margin: '10px 0', fontSize: '14px' }}>Thank you for your visit!</p>
            <p style={{ margin: '5px 0', fontSize: '10px' }}>Please come again.</p>
          </div>
        </div>
      </div>
    </>
  );
}
