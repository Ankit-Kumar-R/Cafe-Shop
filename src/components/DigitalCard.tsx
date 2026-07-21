import React from 'react';
import { Sparkles, ShoppingBag, ChefHat, Leaf } from 'lucide-react';

export function DigitalCard({ item }: { item: any }) {
  if (!item) return null;

  return (
    <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
      
      <h3 className="text-2xl font-display font-bold text-cream-50 mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-amber-500" /> Discover the {item.name}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" /> The Story
            </h4>
            <p className="text-slate-300">
              A symphony of flavors awaits in every bite, meticulously crafted to balance rich textures with delicate sweetness. It's an unforgettable culinary journey designed to elevate your everyday moments.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5" /> What's Inside
            </h4>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Premium imported flour</li>
              <li>Organic Madagascar vanilla</li>
              <li>Locally sourced fresh ingredients</li>
              <li>Our secret house blend</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2 mb-2">
              <ChefHat className="w-5 h-5" /> Chef's Recipe
            </h4>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li><strong className="text-cream-50">1.</strong> Preheat oven to 180°C and prepare your baking tray.</li>
              <li><strong className="text-cream-50">2.</strong> Whisk dry ingredients until perfectly combined.</li>
              <li><strong className="text-cream-50">3.</strong> Fold in wet ingredients gently to keep the texture light.</li>
              <li><strong className="text-cream-50">4.</strong> Bake for 25 mins until golden brown. Serve warm!</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5" /> Good For You
            </h4>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
              <li>Rich in natural antioxidants</li>
              <li>Provides a sustained energy boost</li>
              <li>Crafted with zero artificial preservatives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
