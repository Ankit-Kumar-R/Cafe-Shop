import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, User as UserIcon, Mail, Phone, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { TableCanvas } from '../components/TableCanvas.tsx';

export function BookTable() {
  const { dbUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      date: formData.get('date'),
      time: formData.get('time'),
      guests: formData.get('guests'),
      tableId: formData.get('tableId'),
      userId: dbUser?.id || null
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        setSelectedTableId(null);
      } else {
        alert('Booking failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error booking table');
    }
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-card rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-display font-bold text-cream-50 mb-4">Book a Table</h1>
            <p className="text-slate-400">Reserve your spot and enjoy our premium ambiance.</p>
          </div>

          {success && (
            <div className="mb-8 bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center">
              <h3 className="text-xl font-bold mb-2">Booking Requested!</h3>
              <p>We've received your request and will confirm shortly via email/phone.</p>
            </div>
          )}

          <TableCanvas onTableSelect={(id) => setSelectedTableId(id)} />

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Selected Table</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required name="tableId" readOnly value={selectedTableId || ''} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-amber-500 font-bold focus:outline-none transition-colors" placeholder="Please select a table from the 3D map" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Number of Guests</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select required name="guests" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required name="name" defaultValue={dbUser?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required type="email" name="email" defaultValue={dbUser?.email} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors" placeholder="john@example.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required name="phone" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required type="date" name="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required type="time" name="time" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-cream-50 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button disabled={loading || !selectedTableId} type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-cream-50 py-4 rounded-xl font-medium transition-colors disabled:opacity-50">
                {loading ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
