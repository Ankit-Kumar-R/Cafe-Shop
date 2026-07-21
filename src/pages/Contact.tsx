import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export function Contact() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to send feedback or contact us.');
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const review = formData.get('message') as string;
    
    try {
      const token = await user.getIdToken();
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: 5, review })
      });
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert('Failed to send message.');
    }
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-900/20 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-cream-50 mb-6 drop-shadow-lg">Get in Touch</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base tracking-widest uppercase font-sans">
            Connect with us for inquiries, reservations, or curated coffee experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* Glassmorphic Form - Left Side, spans 7 cols, slightly overlapping */}
          <div className="lg:col-span-7 backdrop-blur-xl bg-white/[0.03] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-3xl p-10 md:p-14 relative z-20">
            <h3 className="text-3xl font-display font-bold text-cream-50 mb-8">Send a Message</h3>
            
            {success && (
              <div className="mb-8 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl font-medium shadow-inner">
                Message sent successfully! Thank you for reaching out.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-sans tracking-wider text-gray-400 mb-3 uppercase">Message</label>
                <textarea 
                  name="message"
                  required
                  rows={5}
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl px-6 py-4 text-cream-50 focus:outline-none focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300 resize-none shadow-inner"
                  placeholder="How can we elevate your coffee experience?"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 text-cream-50 py-5 rounded-2xl font-medium hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_15px_30px_rgba(217,119,6,0.4)]"
              >
                {loading ? 'Sending...' : (
                  <>
                    <span className="tracking-wide">Send Message</span> <Send className="w-5 h-5" />
                  </>
                )}
              </button>
              {!user && (
                <p className="text-center text-xs tracking-wide text-amber-500 mt-4">You must be signed in to send a message.</p>
              )}
            </form>
          </div>

          {/* Tactile Contact Cards - Right Side, spans 5 cols, shifted down for asymmetry */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:mt-24 relative z-10">
            
            <div className="backdrop-blur-md bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl hover:-translate-y-2 transition-transform duration-500 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-amber-500 mb-6 animate-[bounce_4s_infinite]">
                <MapPin className="w-7 h-7 drop-shadow-lg" />
              </div>
              <h4 className="text-cream-50 font-display text-xl mb-2">Location</h4>
              <p className="text-gray-400 text-sm tracking-wider font-sans leading-relaxed">Near St. Columba's College,<br />Hazaribag, Jharkhand 825301</p>
            </div>

            <div className="backdrop-blur-md bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl hover:-translate-y-2 transition-transform duration-500 group lg:-translate-x-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-amber-500 mb-6 animate-[bounce_5s_infinite]">
                <Phone className="w-7 h-7 drop-shadow-lg" />
              </div>
              <h4 className="text-cream-50 font-display text-xl mb-2">Phone</h4>
              <p className="text-gray-400 text-sm tracking-wider font-sans">+91 98765 43210</p>
            </div>

            <div className="backdrop-blur-md bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl hover:-translate-y-2 transition-transform duration-500 group lg:translate-x-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-amber-500 mb-6 animate-[bounce_6s_infinite]">
                <Mail className="w-7 h-7 drop-shadow-lg" />
              </div>
              <h4 className="text-cream-50 font-display text-xl mb-2">Email</h4>
              <p className="text-gray-400 text-sm tracking-wider font-sans">hello@akcafeshop.com</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
