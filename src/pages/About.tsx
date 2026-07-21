import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { AddFeedback } from '../components/AddFeedback.tsx';

import heroBg from '../assets/images/coffee_bento_4_1782844894238.jpg';

export function About() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const fetchFeedback = () => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => setTestimonials(data.feedback || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background ambient lighting and floating shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[150px] opacity-40 pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] opacity-30 pointer-events-none animate-[pulse_12s_ease-in-out_infinite_reverse]" />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Asymmetrical Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center mb-40 relative">
          
          {/* Typography & Narrative (5 cols) - Overlapping the media on desktop */}
          <div className="lg:col-span-5 relative z-30 lg:-mr-12 lg:mt-16 order-2 lg:order-1">
            <div className="backdrop-blur-xl bg-[#0a0a0a]/80 border border-white/5 p-10 md:p-14 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-900 opacity-50" />
              
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-cream-50 mb-8 drop-shadow-xl relative inline-block">
                Our Story
                <span className="absolute bottom-2 left-0 w-0 h-1 bg-amber-500 transition-all duration-700 ease-out group-hover:w-full"></span>
              </h2>
              
              <div className="space-y-8">
                <p className="text-gray-400 font-sans tracking-wide leading-relaxed text-sm md:text-base font-light">
                  Born out of a passion for community and exceptional coffee, AK Cafe SHOP opened its doors near St. Columba's College to provide a sanctuary for students, locals, and coffee aficionados alike.
                </p>
                <p className="text-gray-400 font-sans tracking-wide leading-relaxed text-sm md:text-base font-light">
                  We source our beans from ethical farms and roast them with precision. Every cup poured is a testament to our dedication to the craft. Whether you're pulling an all-nighter, catching up with friends, or simply seeking a quiet moment, our doors are open for you.
                </p>
              </div>
              
              {/* Animated Stats Counter */}
              <div className="flex gap-16 pt-12 mt-12 border-t border-white/10">
                <div className="group/stat cursor-default">
                  <h4 className="font-display font-bold text-4xl text-amber-500 mb-2 transition-transform duration-500 group-hover/stat:-translate-y-2">
                    <span className="animate-[fade-in_2s_ease-out]">5+</span>
                  </h4>
                  <p className="text-gray-500 font-sans tracking-widest text-xs uppercase font-medium">Years of Excellence</p>
                </div>
                <div className="group/stat cursor-default">
                  <h4 className="font-display font-bold text-4xl text-amber-500 mb-2 transition-transform duration-500 group-hover/stat:-translate-y-2">
                    <span className="animate-[fade-in_2.5s_ease-out]">10k+</span>
                  </h4>
                  <p className="text-gray-500 font-sans tracking-widest text-xs uppercase font-medium">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Parallax Media Frame (7 cols) */}
          <div className="lg:col-span-7 relative z-20 order-1 lg:order-2">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[2.5rem] p-4 lg:p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] transform transition-transform duration-1000 hover:scale-[1.02]">
              <div className="relative h-[500px] lg:h-[750px] rounded-[2rem] overflow-hidden group/media shadow-inner bg-slate-900">
                <img 
                  src={heroBg} 
                  alt="Premium Cafe interior" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover/media:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a]/80 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay"></div>
                
                {/* Interactive Hotspot 1 */}
                <div className="absolute top-[40%] left-[30%] group/hotspot">
                  <div className="w-6 h-6 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center animate-ping absolute inset-0"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-500/80 backdrop-blur-sm border-2 border-white cursor-pointer relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.8)] transition-transform hover:scale-125"></div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 p-4 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl opacity-0 translate-y-4 group-hover/hotspot:opacity-100 group-hover/hotspot:translate-y-0 transition-all duration-300 pointer-events-none z-20">
                    <h5 className="text-cream-50 font-bold font-display mb-1">Espresso Bar</h5>
                    <p className="text-gray-400 text-xs font-sans tracking-wide">Where our master baristas craft perfection.</p>
                  </div>
                </div>

                {/* Interactive Hotspot 2 */}
                <div className="absolute bottom-[30%] right-[35%] group/hotspot">
                  <div className="w-6 h-6 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center animate-ping absolute inset-0 delay-500"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-500/80 backdrop-blur-sm border-2 border-white cursor-pointer relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.8)] transition-transform hover:scale-125"></div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 p-4 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl opacity-0 -translate-y-4 group-hover/hotspot:opacity-100 group-hover/hotspot:translate-y-0 transition-all duration-300 pointer-events-none z-20">
                    <h5 className="text-cream-50 font-bold font-display mb-1">Latte Art</h5>
                    <p className="text-gray-400 text-xs font-sans tracking-wide">Signature pours made with silky microfoam.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating UI Decorative Elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 backdrop-blur-lg bg-white/5 border border-white/10 rounded-full shadow-2xl z-10 animate-[bounce_8s_ease-in-out_infinite] hidden lg:block"></div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-cream-50 mb-4">Our Core Values</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">The principles that guide everything we do, from bean to cup.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Ethical Sourcing",
                desc: "We work directly with farmers to ensure fair wages and sustainable agricultural practices.",
                icon: "🌱"
              },
              {
                title: "Artisanal Craft",
                desc: "Every pastry is baked fresh daily, and every espresso shot is dialed in to perfection.",
                icon: "☕"
              },
              {
                title: "Community First",
                desc: "We are more than a cafe; we are a gathering place. We actively support local artists and events.",
                icon: "🤝"
              }
            ].map((value, idx) => (
              <div key={idx} className="bento-card p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="text-4xl mb-6">{value.icon}</div>
                <h3 className="text-xl font-bold text-cream-50 mb-4">{value.title}</h3>
                <p className="text-slate-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Masonry Grid */}
        {testimonials.length > 0 && (
          <div className="pt-16 border-t border-slate-800/50">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-cream-50 mb-4">What Our Guests Say</h2>
              <p className="text-slate-400">Real feedback from the AK Cafe community.</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bento-card p-6 rounded-3xl break-inside-avoid relative overflow-hidden group">
                  <Quote className="absolute -top-4 -right-4 w-24 h-24 text-slate-800/20 transform rotate-12 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-1 mb-4 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'text-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-cream-50 italic mb-6 relative z-10 leading-relaxed text-sm md:text-base">
                    "{testimonial.review}"
                  </p>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.user?.name ? testimonial.user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-cream-50 text-sm">{testimonial.user?.name || 'Anonymous Guest'}</p>
                      <p className="text-xs text-slate-400">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-24 max-w-2xl mx-auto">
          <AddFeedback onFeedbackSubmitted={fetchFeedback} />
        </div>
      </div>
    </div>
  );
}
