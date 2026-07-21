import React from 'react';
import img1 from '../assets/images/3d_coffee_hero_1782843664011.jpg';
import img2 from '../assets/images/fashionable_cafe_1782843707392.jpg';
import img3 from '../assets/images/coffee_bento_1_1782844372532.jpg';
import img4 from '../assets/images/coffee_bento_2_1782844864722.jpg';
import img5 from '../assets/images/coffee_bento_3_1782844878219.jpg';
import img6 from '../assets/images/coffee_bento_4_1782844894238.jpg';

export function Gallery() {
  const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1507133750073-1f190e2270dd?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-cream-50 mb-4">Our Gallery</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A glimpse into the cozy atmosphere, fresh pastries, and expertly crafted beverages at AK Cafe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((src, idx) => (
            <div key={idx} className="bento-card overflow-hidden rounded-3xl group relative h-64 md:h-80">
              <img 
                src={src} 
                alt={`Gallery image ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
