import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, ShoppingCart, Tag, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { QRCodeSVG } from 'qrcode.react';
import { Reviews } from '../components/Reviews.tsx';
import { DigitalCard } from '../components/DigitalCard.tsx';
import { useToast } from '../context/ToastContext.tsx';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        const found = data.items.find((i: any) => i.id === parseInt(id || '0'));
        setItem(found);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="h-10 bg-slate-800 rounded-lg w-48 animate-pulse"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center flex-col text-center px-4">
        <h2 className="text-3xl font-display font-bold text-cream-50 mb-4">Item Not Found</h2>
        <Link to="/menu" className="text-amber-500 hover:text-amber-400 font-medium">Return to Menu</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/menu" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
        
        <div className="bento-card rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="md:w-1/2 relative h-64 md:h-auto bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700/30">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
            )}
            {item.isSpecialOffer && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <Tag className="w-4 h-4" /> Special Offer
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-display font-bold text-cream-50">{item.name}</h1>
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="bg-slate-900 p-2 rounded-full text-slate-400 hover:text-amber-500 border border-slate-800 transition-colors"
                  title="Show QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
              <span className="inline-block bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                {item.category}
              </span>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                {item.description}
              </p>
              
              {showQR && (
                <div className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center animate-fade-in">
                  <div className="bg-white p-2 rounded-xl mb-3">
                    <QRCodeSVG 
                      value={window.location.href} 
                      size={150}
                      level="H"
                    />
                  </div>
                  <p className="text-sm text-slate-400 text-center">Scan to open this item on your mobile device</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-800/60 pt-6">
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm text-slate-400">Price</span>
                <span className="text-4xl font-display font-bold text-amber-500">₹{item.price}</span>
              </div>
              
              <button
                disabled={!item.isAvailable}
                onClick={() => {
                  addToCart({
                    menuItemId: item.id,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: 1,
                    imageUrl: item.imageUrl
                  });
                  if (navigator.vibrate) navigator.vibrate(50);
                  // addToast handled by CartContext already, but we can keep it here if needed or remove alert
                }}
                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all text-lg ${
                  item.isAvailable 
                    ? 'btn-neumorphic text-cream-50' 
                    : 'bg-slate-800/30 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <ShoppingCart className="w-6 h-6" /> {item.isAvailable ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>
          </div>
        </div>
        <DigitalCard item={item} />
        <Reviews menuItemId={item.id} />
      </div>
    </div>
  );
}
