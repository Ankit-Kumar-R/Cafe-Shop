import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ShoppingCart, Tag, Search, Mic, MicOff, QrCode, X } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { QRCodeSVG } from 'qrcode.react';

import heroBg from '../assets/images/coffee_bento_3_1782844878219.jpg';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  isSpecialOffer: boolean;
  isAvailable: boolean;
}

export function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState('');
  const [qrItem, setQrItem] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setSearchQuery(transcript);
        
        // Try to find a matching item to add to cart
        if (items.length > 0) {
           const match = items.find(item => transcript.includes(item.name.toLowerCase()));
           if (match) {
             addToCart({
               menuItemId: match.id,
               name: match.name,
               price: parseFloat(match.price),
               quantity: 1,
               imageUrl: match.imageUrl
             });
             setSpeechFeedback(`Added ${match.name} to cart!`);
             setTimeout(() => setSpeechFeedback(''), 3000);
           } else {
             setSpeechFeedback(`Searching for "${transcript}"...`);
             setTimeout(() => setSpeechFeedback(''), 3000);
           }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setSpeechFeedback('Failed to recognize speech. Please try again.');
        setTimeout(() => setSpeechFeedback(''), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [items, addToCart]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setSpeechFeedback('Listening...');
      } else {
        setSpeechFeedback('Speech recognition is not supported in your browser.');
        setTimeout(() => setSpeechFeedback(''), 3000);
      }
    }
  };

  const categories = ['All', ...new Set(items.map(i => i.category))];
  
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-10 bg-slate-800 rounded-lg w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-slate-800 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-24 bg-slate-800 rounded-full animate-pulse"></div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bento-card rounded-3xl h-[420px] bg-slate-900 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Menu Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${heroBg})`, backgroundPositionY: '60%' }} 
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        
        <div className="relative z-10 text-center px-4 mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold text-cream-50 mb-4"
          >
            Our Menu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 max-w-2xl mx-auto text-lg"
          >
            Handcrafted beverages and artisanal pastries made fresh daily.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <input
            type="text"
            placeholder="Search for coffee, pastries... or say 'add espresso'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-14 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors shadow-lg"
          />
          <Search className="absolute left-4 top-4 text-slate-500 w-6 h-6" />
          <button 
            onClick={toggleListening}
            className={`absolute right-4 top-3.5 p-1 rounded-full transition-colors ${isListening ? 'bg-amber-500 text-slate-900 animate-pulse' : 'text-slate-500 hover:text-amber-500 hover:bg-slate-800'}`}
            title="Search by voice"
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          {/* Speech Feedback Message */}
          {speechFeedback && (
            <div className="absolute top-16 left-0 right-0 text-center">
              <span className="inline-block bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/30 shadow-lg backdrop-blur-md">
                {speechFeedback}
              </span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all shadow-md ${
                activeCategory === category 
                  ? 'btn-neumorphic text-cream-50 scale-105' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 backdrop-blur-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bento-card rounded-3xl overflow-hidden group flex flex-col p-2 border border-slate-800/60 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-900 shadow-inner border border-slate-700/30 m-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                )}
                {item.isSpecialOffer && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Tag className="w-3 h-3" /> Special Offer
                  </div>
                )}
                <button
                  onClick={() => setQrItem(item)}
                  className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-full text-slate-300 hover:text-amber-500 hover:bg-slate-800 transition-colors shadow-lg border border-slate-700/50"
                  title="Scan for details"
                >
                  <QrCode className="w-5 h-5" />
                </button>
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-slate-900 text-cream-50 px-4 py-2 rounded-full font-medium border border-slate-700">Sold Out</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-display font-bold text-cream-50">{item.name}</h3>
                  <span className="text-amber-500 font-bold text-xl drop-shadow-md">₹{item.price}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-2">{item.description}</p>
                
                <button
                  disabled={!item.isAvailable}
                  onClick={() => addToCart({
                    menuItemId: item.id,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: 1,
                    imageUrl: item.imageUrl
                  })}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    item.isAvailable 
                      ? 'btn-neumorphic text-cream-50' 
                      : 'bg-slate-800/30 text-slate-500 cursor-not-allowed shadow-none border border-slate-800'
                  }`}
                >
                  <Plus className="w-5 h-5" /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bento-card p-8 rounded-3xl max-w-sm w-full text-center border border-slate-700 shadow-2xl"
            >
              <button 
                onClick={() => setQrItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-cream-50 bg-slate-800/50 hover:bg-slate-700 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-display font-bold text-cream-50 mb-2">{qrItem.name}</h3>
              <p className="text-slate-400 mb-6 text-sm">Scan to view mobile-friendly details</p>
              
              <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-inner">
                <QRCodeSVG 
                  value={`${window.location.origin}/item/${qrItem.id}`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <p className="text-amber-500 font-medium font-mono text-sm">
                Point your camera at the screen
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
