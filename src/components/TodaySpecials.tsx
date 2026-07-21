import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext.tsx';

export function TodaySpecials() {
  const [specials, setSpecials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          // Shuffle and pick 3
          const shuffled = [...data.items].sort(() => 0.5 - Math.random());
          setSpecials(shuffled.slice(0, 3));
        }
      });
  }, []);

  useEffect(() => {
    if (specials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % specials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [specials]);

  if (specials.length === 0) return null;

  const currentItem = specials[currentIndex];

  return (
    <div className="w-full bg-slate-900 border-y border-amber-500/20 py-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-red-500/30">
            <Clock className="w-3 h-3" />
            Limited Time
          </div>
          <span className="text-cream-50 font-display font-medium text-lg">Today's Specials</span>
        </div>

        <div className="flex-1 w-full max-w-xl h-16 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700"
            >
              <div className="flex items-center gap-4">
                {currentItem.imageUrl && (
                  <img src={currentItem.imageUrl} alt={currentItem.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div>
                  <h4 className="text-cream-50 font-medium">{currentItem.name}</h4>
                  <p className="text-amber-500 font-bold">₹{parseFloat(currentItem.price).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(currentItem)}
                  className="bg-amber-500 text-cream-950 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors"
                >
                  Add
                </button>
                <Link to={`/item/${currentItem.id}`} className="p-1.5 text-slate-400 hover:text-cream-50 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-1">
          {specials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-amber-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
