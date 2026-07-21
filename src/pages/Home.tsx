import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Coffee, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { TodaySpecials } from '../components/TodaySpecials.tsx';
import heroBg from '../assets/images/3d_coffee_hero_1782843664011.jpg';
import cafeBg from '../assets/images/fashionable_cafe_1782843707392.jpg';
import { ThreeCanvas } from '../components/ThreeCanvas.tsx';
import { useAudioManager } from '../hooks/useAudioManager.ts';
import { useMediaQuery } from '../hooks/useMediaQuery.ts';

export function Home() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useAudioManager();

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (!data.items) {
          setLoading(false);
          return;
        }
        const special = data.items.filter((i: any) => i.isSpecialOffer).slice(0, 5);
        if (special.length < 5) {
          const rest = data.items.filter((i: any) => !i.isSpecialOffer).slice(0, 5 - special.length);
          setFeaturedItems([...special, ...rest]);
        } else {
          setFeaturedItems(special);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % Math.max(featuredItems.length, 1));
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + Math.max(featuredItems.length, 1)) % Math.max(featuredItems.length, 1));

  return (
    <div className="flex flex-col relative w-full overflow-hidden">
      {/* Global 3D Canvas Background for Home */}
      {isDesktop && (
        <div className="fixed inset-0 z-0">
          <ThreeCanvas />
        </div>
      )}
      {/* Mobile Fallback Image */}
      {!isDesktop && (
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="absolute inset-0 bg-slate-950/80" />
        </div>
      )}

      {/* Bento Grid Hero Section */}
      <section className="relative pt-32 pb-20 bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/50 to-amber-950/10 z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[75vh]">
            
            {/* Main Text Content - Spans 7 cols */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 flex flex-col justify-center space-y-8 bento-card p-10 md:p-16 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-md border border-slate-800/50 relative overflow-hidden pointer-events-auto"
            >

              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
              
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-medium text-sm w-fit">
                <MapPin className="w-4 h-4" />
                Near St. Columba's College, Hazaribag
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-cream-50 tracking-tight leading-tight">
                Crafted Coffee for<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Curious Minds.</span>
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
                Experience the perfect blend of rich aromas and student-friendly vibes. 
                The ultimate spot in Hazaribag to study, connect, and relax.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link to="/menu" className="w-full sm:w-auto px-8 py-4 rounded-full btn-neumorphic text-cream-50 font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] scale-105 hover:scale-110">
                  Explore Menu <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/book" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-cream-50 font-semibold transition-all duration-300 border border-slate-700 shadow-md">
                  Book a Table
                </Link>
              </div>
            </motion.div>

            {/* Images Grid - Spans 5 cols */}
            <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-[600px] lg:h-auto pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="col-span-2 row-span-1 rounded-[2rem] overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-cream-50">Artisanal Beans</h3>
                  <p className="text-slate-300 text-sm">Ethically sourced, locally roasted.</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${cafeBg})` }} />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-transparent transition-colors duration-500" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="col-span-1 row-span-1 rounded-[2rem] bg-gradient-to-br from-amber-600 to-amber-800 p-6 flex flex-col justify-between text-cream-50 relative overflow-hidden group"
              >
                <div className="absolute -right-6 -top-6 text-amber-500/20 group-hover:rotate-12 transition-transform duration-500">
                  <Coffee className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <Star className="w-8 h-8 text-amber-300 mb-4" />
                  <h3 className="text-2xl font-bold font-display leading-tight">Voted #1<br/>Cafe in<br/>Hazaribag</h3>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Carousel */}
      <section className="py-24 bg-slate-950/80 md:bg-transparent relative overflow-hidden pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-cream-50 mb-4">Featured Selection</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Discover our handcrafted specialties, curated just for you.</p>
          </div>

          {loading ? (
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl rounded-3xl bento-card relative h-[400px] flex flex-col md:flex-row border border-slate-800">
                  <div className="w-full md:w-1/2 h-48 md:h-full bg-slate-900 animate-pulse border-r border-slate-800"></div>
                  <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="h-6 bg-slate-800 rounded-full w-24 mb-4 animate-pulse"></div>
                    <div className="h-10 bg-slate-800 rounded-lg w-3/4 mb-4 animate-pulse"></div>
                    <div className="h-20 bg-slate-800 rounded-lg w-full mb-6 animate-pulse"></div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="h-8 bg-slate-800 rounded-lg w-20 animate-pulse"></div>
                      <div className="h-12 bg-slate-800 rounded-xl w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : featuredItems.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-center">
                <button 
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="absolute left-0 z-20 p-3 bg-slate-900/80 backdrop-blur-md text-amber-500 rounded-full border border-amber-500/20 hover:bg-amber-600 hover:text-white transition-all transform -translate-x-4 md:-translate-x-6"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full max-w-4xl overflow-hidden rounded-3xl bento-card relative h-[400px]"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0 flex flex-col md:flex-row"
                    >
                      <div className="w-full md:w-1/2 h-48 md:h-full bg-slate-800">
                        {featuredItems[currentSlide].imageUrl ? (
                          <img src={featuredItems[currentSlide].imageUrl} alt={featuredItems[currentSlide].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700">
                            <Coffee className="w-20 h-20" />
                          </div>
                        )}
                      </div>
                      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        {featuredItems[currentSlide].isSpecialOffer && (
                          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-max">
                            Special Offer
                          </span>
                        )}
                        <h3 className="text-3xl font-display font-bold text-cream-50 mb-4">{featuredItems[currentSlide].name}</h3>
                        <p className="text-slate-400 mb-6 line-clamp-3">{featuredItems[currentSlide].description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-2xl font-bold text-amber-500">₹{featuredItems[currentSlide].price}</span>
                          <Link 
                            to="/menu" 
                            className="px-6 py-3 btn-neumorphic text-cream-50 rounded-xl font-medium transition-all hover:scale-105"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <button 
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="absolute right-0 z-20 p-3 bg-slate-900/80 backdrop-blur-md text-amber-500 rounded-full border border-amber-500/20 hover:bg-amber-600 hover:text-white transition-all transform translate-x-4 md:translate-x-6"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex justify-center mt-8 gap-2">
                {featuredItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentSlide === idx ? 'bg-amber-500 w-8' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features/Highlights */}
      <section className="py-24 bg-slate-950/90 md:bg-transparent relative z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Coffee,
                title: "Premium Roasts",
                desc: "Ethically sourced, freshly roasted beans delivering a rich and unforgettable flavor profile."
              },
              {
                icon: Star,
                title: "Cozy Ambiance",
                desc: "A warm, distraction-free environment perfect for deep work, study sessions, or casual meetups."
              },
              {
                icon: MapPin,
                title: "Prime Location",
                desc: "Conveniently located right next to St. Columba's College, making it the heart of student life."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-8 rounded-3xl bento-card group hover:border-amber-glow"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-display font-bold text-cream-50 mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 rounded-3xl overflow-hidden relative h-[500px] flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" 
              style={{ backgroundImage: `url(${cafeBg})` }} 
            />
            <div className="absolute inset-0 bg-slate-950/40" />
            <div className="relative z-10 text-center px-4">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-cream-50 mb-6">Designed for Focus & Comfort</h2>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto font-medium">Experience our newly redesigned modern interior, tailored for students and professionals seeking the perfect aesthetic escape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-900/90 md:bg-slate-900/50 border-t border-slate-800/50 relative z-10 backdrop-blur-sm pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-cream-50 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about our cafe and services.</p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "Do you offer vegan and gluten-free options?",
                a: "Yes! We have a wide variety of plant-based milks for all our beverages, and our bakery case always features several gluten-free and vegan pastries daily."
              },
              {
                q: "Can I reserve a table for a large group?",
                a: "Absolutely. You can use our 'Book Table' feature to reserve space for groups. For parties larger than 8, please contact us directly."
              },
              {
                q: "Do you have free Wi-Fi?",
                a: "We offer high-speed, complimentary Wi-Fi for all our guests. It's perfect for studying or remote work."
              },
              {
                q: "How does the loyalty program work?",
                a: "You earn points for every order placed through your account. Once you reach 1000 points, you automatically unlock Silver Tier rewards, including free drinks and discounts."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bento-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-cream-50 mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
