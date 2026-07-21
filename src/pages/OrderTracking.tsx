import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { CheckCircle2, Clock, Package, ChefHat, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function OrderTracking() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app this could use WebSockets for real-time updates.
    // Here we'll poll every 10 seconds.
    const fetchOrder = () => {
      fetch(`/api/orders/track/${token}`)
        .then(res => res.ok ? res.json() : Promise.reject('Order not found'))
        .then(data => {
          setOrder(data.order);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bento-card rounded-3xl p-8 md:p-12 animate-pulse h-96 bg-slate-900 border border-slate-800"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-cream-50 mb-4">Order Not Found</h2>
          <p className="text-slate-400 mb-8">We couldn't find an order with token: {token}</p>
          <Link to="/" className="text-amber-500 hover:text-amber-400 font-medium">Return Home</Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'pending', label: 'Order Received', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'out_for_delivery', label: 'Ready for Pickup / Out for Delivery', icon: Package },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const targetHeight = `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        
        <div className="bento-card rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-2">Order Tracking</h1>
            <p className="text-amber-500 font-mono text-xl tracking-widest mb-6">#{order.orderToken}</p>
            
            {(order.status === 'pending' || order.status === 'preparing') && (
              <div className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium text-amber-500/80 uppercase tracking-wider mb-1">Estimated Wait Time</span>
                <span className="text-2xl font-bold font-display text-amber-400">
                  {Math.max(0, 15 - Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000))} mins
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            {/* Connecting line background */}
            <div className="absolute left-8 md:left-1/2 top-8 bottom-8 w-1 bg-slate-800 md:-translate-x-1/2 rounded-full"></div>

            {/* Active connecting line (Progress Bar) */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: targetHeight }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-8 md:left-1/2 top-8 w-1 bg-amber-500 md:-translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ maxHeight: 'calc(100% - 4rem)' }}
            ></motion.div>
            
            <div className="space-y-12">
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <motion.div 
                    key={step.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2, duration: 0.5 }}
                    className="relative flex flex-col md:flex-row items-center md:justify-between gap-6 z-10"
                  >
                    
                    <div className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start md:order-last'}`}>
                      <motion.div 
                        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                        className={`
                        hidden md:block text-right px-6
                        ${isActive ? 'text-cream-50 font-bold text-lg' : isCompleted ? 'text-slate-300' : 'text-slate-600'}
                      `}>
                        {step.label}
                      </motion.div>
                    </div>

                    <motion.div 
                      animate={isActive ? { scale: [1, 1.1, 1], boxShadow: ['0px 0px 0px rgba(245,158,11,0)', '0px 0px 20px rgba(245,158,11,0.5)', '0px 0px 0px rgba(245,158,11,0)'] } : { scale: 1, boxShadow: 'none' }}
                      transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                      className={`
                      w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-xl transition-colors duration-500
                      ${isActive ? 'bg-amber-600 text-cream-50 ring-4 ring-amber-500/20' : 
                        isCompleted ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'}
                    `}>
                      <Icon className="w-8 h-8" />
                    </motion.div>

                    <div className="md:hidden flex-1 w-full text-left pl-6">
                      <motion.span 
                        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                        className={`
                        ${isActive ? 'text-cream-50 font-bold text-lg' : isCompleted ? 'text-slate-300' : 'text-slate-600'}
                      `}>
                        {step.label}
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
