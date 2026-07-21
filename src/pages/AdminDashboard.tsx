import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Coffee, ShoppingBag, Calendar, MessageSquare, Plus, Trash2, Edit, MonitorPlay, Search, Tag, Star, Activity, Printer, Map as MapIcon, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { dbFirestore } from '../lib/firebase.ts';
import { collection, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900 rounded-3xl border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <p className="text-slate-400 mb-6">{this.state.error?.message || 'An unexpected error occurred while rendering the dashboard.'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const COLORS = ['#D97706', '#92400E', '#F59E0B', '#B45309', '#FCD34D'];

function FloorPlan() {
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    // We will initialize some tables if they don't exist, but listen to onSnapshot
    const unsubscribe = onSnapshot(collection(dbFirestore, 'tables'), (snapshot) => {
      const fetchedTables: any[] = [];
      snapshot.forEach(doc => {
        fetchedTables.push({ id: doc.id, ...doc.data() });
      });
      
      if (fetchedTables.length === 0) {
        // Initialize default layout
        const defaultLayout = [
          { id: 'T1', name: 'Table 1', isOccupied: false, x: 20, y: 20 },
          { id: 'T2', name: 'Table 2', isOccupied: true, x: 50, y: 20 },
          { id: 'T3', name: 'Table 3', isOccupied: false, x: 80, y: 20 },
          { id: 'T4', name: 'Table 4', isOccupied: false, x: 20, y: 50 },
          { id: 'T5', name: 'Table 5', isOccupied: true, x: 50, y: 50 },
          { id: 'T6', name: 'Table 6', isOccupied: false, x: 80, y: 50 },
          { id: 'T7', name: 'Table 7', isOccupied: false, x: 20, y: 80 },
          { id: 'T8', name: 'Table 8', isOccupied: false, x: 50, y: 80 },
          { id: 'T9', name: 'Table 9', isOccupied: false, x: 80, y: 80 },
        ];
        defaultLayout.forEach(async t => {
          await setDoc(doc(dbFirestore, 'tables', t.id), t);
        });
      } else {
        setTables(fetchedTables);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTableStatus = async (table: any) => {
    try {
      await updateDoc(doc(dbFirestore, 'tables', table.id), {
        isOccupied: !table.isOccupied
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-cream-50 mb-2">Floor Plan</h1>
      <p className="text-slate-400 mb-8">Real-time table occupancy status.</p>
      
      <div className="bento-card p-8 rounded-3xl relative h-[600px] w-full max-w-4xl border border-slate-800 bg-slate-900/50">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => toggleTableStatus(table)}
            style={{ left: `${table.x}%`, top: `${table.y}%`, transform: 'translate(-50%, -50%)' }}
            className={`absolute w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all hover:scale-105 shadow-xl ${
              table.isOccupied 
                ? 'bg-red-500/20 border-red-500 text-red-500 shadow-red-500/20' 
                : 'bg-green-500/20 border-green-500 text-green-500 shadow-green-500/20'
            }`}
          >
            <span className="font-display font-bold text-lg text-cream-50">{table.name}</span>
            <span className="text-xs mt-1 font-medium">{table.isOccupied ? 'Occupied' : 'Available'}</span>
          </button>
        ))}
        
        <div className="absolute bottom-8 right-8 flex gap-6 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-cream-50 font-medium">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-500"></div>
            Available
          </div>
          <div className="flex items-center gap-2 text-sm text-cream-50 font-medium">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-500"></div>
            Occupied
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { dbUser, getToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [analytics, setAnalytics] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // POS State
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posSearch, setPosSearch] = useState('');

  // Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSourceFilter, setOrderSourceFilter] = useState<'QR_SCAN' | 'OFFLINE'>('QR_SCAN');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  
  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const prevOrderCount = useRef(0);

  // Form States for Menu & Promos & Shifts
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', isSpecialOffer: false, isAvailable: true });
  const [newPromo, setNewPromo] = useState({ name: '', discountPercentage: '', startDate: '', endDate: '', isActive: true });
  const [newShift, setNewShift] = useState({ employeeName: '', role: '', shiftDate: '', startTime: '', endTime: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!dbUser || dbUser.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [dbUser, authLoading, navigate]);

  const { data: dashboardData, refetch: fetchData } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [anRes, menuRes, ordRes, bookRes, feedRes, promoRes, shiftRes, sentRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/menu'),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/feedback', { headers }),
        fetch('/api/admin/promotions', { headers }),
        fetch('/api/admin/shifts', { headers }),
        fetch('/api/admin/feedback/sentiment', { headers })
      ]);

      const anData = await anRes.json();
      const mData = await menuRes.json();
      const oData = await ordRes.json();
      const bData = await bookRes.json();
      const fData = await feedRes.json();
      const pData = await promoRes.json();
      const sData = await shiftRes.json();
      const sentData = await sentRes.json();
      
      return {
        analytics: anData,
        menuItems: mData.items || [],
        orders: oData.orders || [],
        bookings: bData.bookings || [],
        feedbacks: fData.feedback || [],
        promotions: pData.promotions || [],
        shifts: sData.shifts || [],
        sentiment: sentData.analysis || ''
      };
    },
    refetchInterval: 3000, // Poll every 3 seconds to simulate real-time onSnapshot
    enabled: !!dbUser && dbUser.role === 'admin'
  });

  useEffect(() => {
    if (dashboardData) {
      setAnalytics(dashboardData.analytics);
      setMenuItems(dashboardData.menuItems);
      
      const ordersArray = dashboardData.orders;
      if (prevOrderCount.current > 0 && ordersArray.length > prevOrderCount.current) {
        setToastMessage(`New order received!`);
        setTimeout(() => setToastMessage(''), 5000);
        const audio = new Audio('/bell.mp3');
        audio.play().catch(e => console.log('Audio play prevented', e));
      }
      prevOrderCount.current = ordersArray.length;
      
      setOrders(ordersArray);
      setBookings(dashboardData.bookings);
      setFeedbacks(dashboardData.feedbacks);
      setPromotions(dashboardData.promotions);
      setShifts(dashboardData.shifts);
      setSentimentAnalysis(dashboardData.sentiment);
      setLoading(false);
    }
  }, [dashboardData]);

  const exportDailySalesCSV = () => {
    if (!orders) return;
    const now = new Date();
    const last24HoursOrders = orders.filter((o: any) => {
      const orderDate = new Date(o.createdAt);
      return (now.getTime() - orderDate.getTime()) <= 24 * 60 * 60 * 1000;
    });

    if (last24HoursOrders.length === 0) {
      alert("No orders in the last 24 hours.");
      return;
    }

    const headers = ['Order ID', 'Date', 'Status', 'Total Amount', 'Items'];
    const csvRows = [headers.join(',')];

    last24HoursOrders.forEach((order: any) => {
      const itemsString = (order.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join('; ');
      csvRows.push([
        order.orderToken,
        new Date(order.createdAt).toISOString(),
        order.status,
        order.totalAmount,
        `"${itemsString}"`
      ].join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newPromo)
      });
      fetchData();
      setNewPromo({ name: '', discountPercentage: '', startDate: '', endDate: '', isActive: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromotion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const token = await getToken();
      await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newItem)
      });
      fetchData();
      setNewItem({ name: '', description: '', price: '', category: '', imageUrl: '', isSpecialOffer: false, isAvailable: true });
    } catch (err) {
      console.error(err);
    }
  };

  // POS logic
  const [posSuccess, setPosSuccess] = useState<any>(null);

  const filteredPosItems = useMemo(() => {
    return menuItems.filter(item => item.name.toLowerCase().includes(posSearch.toLowerCase()));
  }, [menuItems, posSearch]);

  const addToPos = (item: any) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const completePosOrder = async () => {
    if (posCart.length === 0) return;
    try {
      const token = await getToken();
      const totalAmount = posCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          items: posCart.map(i => ({ menuItemId: i.id, quantity: i.quantity, price: parseFloat(i.price) })),
          totalAmount,
          source: 'OFFLINE'
        })
      });
      const data = await res.json();
      setPosCart([]);
      fetchData();
      setPosSuccess({ orderToken: data.order.orderToken, estimatedTime: '15-20 mins' });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab !== 'pos') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        completePosOrder();
      }
      if (e.key === 'Escape') {
        setPosSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, posCart]);

  const handleDeleteMenu = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const token = await getToken();
      await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedOrders.length === 0) return;
    try {
      for (const id of selectedOrders) {
        await updateOrderStatus(id, status);
      }
      setSelectedOrders([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.source === orderSourceFilter &&
      (o.orderToken.toLowerCase().includes(orderSearch.toLowerCase()) || 
      (o.user?.name && o.user.name.toLowerCase().includes(orderSearch.toLowerCase())))
    );
  }, [orders, orderSearch, orderSourceFilter]);

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const downloadReport = () => {
    if (!analytics) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('AK Cafe SHOP - Sales & Analytics Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `Rs. ${analytics.totalRevenue.toFixed(2)}`],
        ['Pending Orders', analytics.pendingOrders],
        ['Active Bookings', analytics.activeBookings],
        ['Total Customers', analytics.totalCustomers],
      ],
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6] },
    });
    
    if (orders.length > 0) {
      const recentOrders = orders.slice(0, 10).map((o: any) => [
        o.orderToken, 
        `Rs. ${o.totalAmount}`, 
        o.status, 
        new Date(o.createdAt).toLocaleDateString()
      ]);
      
      doc.text('Recent Orders', 14, (doc as any).lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Order Token', 'Total Amount', 'Status', 'Date']],
        body: recentOrders,
        theme: 'striped',
        headStyles: { fillColor: [217, 119, 6] },
      });
    }
    
    doc.save(`revenue_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadCSV = () => {
    if (!analytics) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue,${analytics.totalRevenue}\n`;
    csvContent += `Pending Orders,${analytics.pendingOrders}\n`;
    csvContent += `Active Bookings,${analytics.activeBookings}\n`;
    csvContent += `Total Customers,${analytics.totalCustomers}\n\n`;
    
    if (orders.length > 0) {
      csvContent += "Order Token,Total Amount,Status,Date\n";
      orders.slice(0, 50).forEach((o: any) => {
        csvContent += `${o.orderToken},${o.totalAmount},${o.status},${new Date(o.createdAt).toLocaleDateString()}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = authLoading || (loading && !analytics);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row pt-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in">
          <div className="bg-amber-500 text-cream-950 font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cream-950 animate-pulse"></span>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 sidebar border-r border-slate-800 p-6 flex flex-col gap-2">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <LayoutDashboard className="w-5 h-5" /> Overview
        </button>
        <button onClick={() => setActiveTab('pos')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'pos' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <MonitorPlay className="w-5 h-5" /> POS System
        </button>
        <button onClick={() => setActiveTab('menu')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'menu' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <Coffee className="w-5 h-5" /> Menu
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <ShoppingBag className="w-5 h-5" /> Orders
        </button>
        <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'bookings' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <Calendar className="w-5 h-5" /> Bookings
        </button>
        <button onClick={() => setActiveTab('feedback')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'feedback' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <MessageSquare className="w-5 h-5" /> Feedback
        </button>
        <div className="my-2 border-t border-slate-800"></div>
        <button onClick={() => setActiveTab('floorplan')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'floorplan' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <MapIcon className="w-5 h-5" /> Floor Plan
        </button>
        <button onClick={() => setActiveTab('insights')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'insights' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <Activity className="w-5 h-5" />
          Insights
        </button>
        <button onClick={() => setActiveTab('promotions')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'promotions' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <Tag className="w-5 h-5" />
          Promotions
        </button>
        <button onClick={() => setActiveTab('shifts')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'shifts' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <Calendar className="w-5 h-5" />
          Employee Shifts
        </button>
        <button onClick={() => setActiveTab('tables')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'tables' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <LayoutDashboard className="w-5 h-5" />
          Table Status
        </button>
        <button onClick={() => setActiveTab('kitchen')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'kitchen' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <MonitorPlay className="w-5 h-5" />
          Kitchen View
        </button>
        <button onClick={() => setActiveTab('map')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'map' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}`}>
          <MapIcon className="w-5 h-5" />
          Delivery Map
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <ErrorBoundary>
          {isLoading ? (
            <div className="animate-pulse space-y-8 h-full">
              <div className="h-12 bg-slate-800/40 rounded-xl w-1/4 mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="h-40 bg-slate-800/40 rounded-[2rem]"></div>
                <div className="h-40 bg-slate-800/40 rounded-[2rem]"></div>
                <div className="h-40 bg-slate-800/40 rounded-[2rem]"></div>
                <div className="h-40 bg-slate-800/40 rounded-[2rem]"></div>
              </div>
              <div className="h-[450px] bg-slate-800/40 rounded-[2.5rem]"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && analytics && (
                <div className="relative">
                  <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-display font-bold text-cream-50 drop-shadow-lg">Dashboard Overview</h1>
                    <div className="flex gap-4">
                      <button onClick={downloadCSV} className="relative overflow-hidden bg-slate-800 hover:bg-slate-700 text-cream-50 px-6 py-3 rounded-full font-medium transition-all shadow-[0_5px_15px_-3px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.1)] active:scale-95 border border-white/5">
                        Export CSV
                      </button>
                      <button onClick={downloadReport} className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-cream-50 px-6 py-3 rounded-full font-medium transition-all shadow-[0_10px_20px_-5px_rgba(217,119,6,0.6),inset_0_2px_5px_rgba(255,255,255,0.3)] active:scale-95 border border-amber-400/30">
                        Export PDF
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Daily Revenue - Glowing Orange Claymorphism */}
                    <div className="relative p-8 rounded-[2rem] text-white bg-gradient-to-br from-amber-500 to-amber-600 shadow-[0_20px_40px_-10px_rgba(217,119,6,0.6),inset_0_4px_10px_rgba(255,255,255,0.4),inset_0_-4px_10px_rgba(0,0,0,0.2)] transform hover:-translate-y-2 transition-transform duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
                      <p className="text-white/90 text-sm font-bold tracking-widest uppercase mb-2 relative z-10 drop-shadow-md">Daily Revenue</p>
                      <p className="text-4xl font-display font-black relative z-10 drop-shadow-lg">₹{analytics.dailyRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    
                    {/* Monthly Revenue - Sleek Dark Frosted Glass */}
                    <div className="p-8 rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.05)] transform hover:-translate-y-2 transition-transform duration-300">
                      <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Monthly Revenue</p>
                      <p className="text-4xl font-display font-bold text-cream-50 drop-shadow-sm">₹{analytics.monthlyRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    
                    {/* Total Revenue - Prominent Card */}
                    <div className="p-8 rounded-[2rem] bg-slate-900/60 backdrop-blur-md border border-white/5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.02)] transform hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none"></div>
                      <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2 relative z-10">Total Revenue</p>
                      <p className="text-4xl font-display font-bold text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] relative z-10">₹{analytics.totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    
                    {/* Pending Orders - Notification Style */}
                    <div className="p-8 rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.05)] transform hover:-translate-y-2 transition-transform duration-300 relative">
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] border-4 border-slate-950 animate-bounce">
                        {analytics.pendingOrders || '0'}
                      </div>
                      <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Pending Orders</p>
                      <p className="text-4xl font-display font-bold text-cream-50">{analytics.pendingOrders || '0'}</p>
                    </div>
                  </div>

                  {/* 3D Line Chart Section */}
                  <div className="rounded-[2.5rem] p-8 h-[450px] bg-slate-900/50 backdrop-blur-2xl border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.02)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <h2 className="text-2xl font-display font-bold text-cream-50 mb-8 drop-shadow-sm relative z-10">Revenue Trend</h2>
                    <div className="relative z-10 h-full w-full pb-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.revenueTrend || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5}/>
                              <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="8" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} dx={-10} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', padding: '12px' }} 
                            itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#F59E0B" 
                            strokeWidth={5} 
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                            style={{ filter: 'url(#glow)' }}
                            activeDot={{ r: 8, fill: '#F59E0B', stroke: '#fff', strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 10px rgba(245,158,11,0.8))' } }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

        {activeTab === 'pos' && (
          <div className="flex flex-col h-full">
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-4">Point of Sale</h1>
            <p className="text-slate-400 mb-8 text-sm">Press <kbd className="bg-slate-800 px-2 py-1 rounded text-amber-500">F8</kbd> to complete order, <kbd className="bg-slate-800 px-2 py-1 rounded text-amber-500">Esc</kbd> to clear search.</p>
            
            <div className="flex flex-col lg:flex-row gap-8 flex-1 h-full min-h-0">
              <div className="flex-1 flex flex-col min-h-0">
                <input 
                  type="text" 
                  placeholder="Search menu items..." 
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-cream-50 focus:outline-none focus:border-amber-500 mb-6"
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 flex-1">
                  {filteredPosItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => addToPos(item)}
                      className="bento-card p-4 rounded-2xl text-left hover:border-amber-glow transition-all flex flex-col h-full"
                    >
                      <h3 className="font-bold text-cream-50 mb-2 flex-1">{item.name}</h3>
                      <p className="text-amber-500 font-bold">₹{item.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-96 bento-card rounded-3xl flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-xl font-bold text-cream-50">Current Order</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {posCart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-cream-50 font-bold text-sm">{item.name}</p>
                        <p className="text-slate-400 text-xs">₹{item.price} x {item.quantity}</p>
                      </div>
                      <p className="text-amber-500 font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {posCart.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Cart is empty
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400">Total</span>
                    <span className="text-3xl font-display font-bold text-cream-50">
                      ₹{posCart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={completePosOrder}
                    disabled={posCart.length === 0}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-cream-50 font-bold py-4 rounded-xl transition-colors"
                  >
                    Complete Order (F8)
                  </button>
                </div>
              </div>
            </div>

            {posSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bento-card p-8 rounded-3xl max-w-sm w-full text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-cream-50 mb-2">Order Successful</h3>
                  <p className="text-slate-400 mb-6">Transaction completed securely.</p>
                  
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-8">
                    <p className="text-sm text-slate-500 mb-1">Order Reference</p>
                    <p className="text-xl font-mono font-bold text-amber-500 mb-4">{posSuccess.orderToken}</p>
                    
                    <p className="text-sm text-slate-500 mb-1">Estimated Preparation</p>
                    <p className="text-lg font-bold text-cream-50">{posSuccess.estimatedTime}</p>
                  </div>
                  
                  <button 
                    onClick={() => setPosSuccess(null)}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-cream-50 font-bold py-3 rounded-xl transition-colors"
                  >
                    New Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-8">Menu Management</h1>
            <div className="bento-card rounded-3xl p-8 mb-12">
              <h2 className="text-xl font-display font-bold text-cream-50 mb-6">Add New Item</h2>
              <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-cream-50" />
                <input required placeholder="Category" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-cream-50" />
                <input required type="number" step="0.01" placeholder="Price (₹)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-cream-50" />
                <input placeholder="Image URL" value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-cream-50" />
                <textarea required placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-cream-50" />
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" checked={newItem.isSpecialOffer} onChange={e => setNewItem({...newItem, isSpecialOffer: e.target.checked})} className="w-5 h-5 accent-amber-500" />
                    Special Offer
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" checked={newItem.isAvailable} onChange={e => setNewItem({...newItem, isAvailable: e.target.checked})} className="w-5 h-5 accent-amber-500" />
                    Available
                  </label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-cream-50 px-6 py-3 rounded-xl font-medium transition-colors">Add Item</button>
                </div>
              </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="bento-card rounded-2xl p-6 relative">
                  {item.stockLevel < 10 && (
                    <span className="absolute top-4 right-4 bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30">
                      LOW STOCK ({item.stockLevel})
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-cream-50 mb-1 pr-16">{item.name}</h3>
                  <p className="text-amber-500 font-bold mb-4">₹{item.price}</p>
                  <button onClick={() => handleDeleteMenu(item.id)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-display font-bold text-cream-50">Live Order Board</h1>
                <div className="flex bg-slate-900 rounded-lg p-1 w-max">
                  <button
                    onClick={() => setOrderSourceFilter('OFFLINE')}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${orderSourceFilter === 'OFFLINE' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-cream-50'}`}
                  >
                    Offline Orders
                  </button>
                  <button
                    onClick={() => setOrderSourceFilter('QR_SCAN')}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${orderSourceFilter === 'QR_SCAN' ? 'bg-amber-600 text-cream-50' : 'text-slate-400 hover:text-cream-50'}`}
                  >
                    QR Scan Orders
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={exportDailySalesCSV}
                  className="bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-cream-50 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                >
                  Download CSV (24h)
                </button>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-cream-50 focus:border-amber-500 transition-colors"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                </div>
                {selectedOrders.length > 0 && (
                  <select
                    onChange={(e) => handleBulkUpdate(e.target.value)}
                    className="bg-amber-600 hover:bg-amber-500 text-cream-50 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none transition-colors appearance-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>Bulk Update...</option>
                    <option value="pending">Mark Pending</option>
                    <option value="preparing">Mark Preparing</option>
                    <option value="out_for_delivery">Mark Out for Delivery</option>
                    <option value="completed">Mark Completed</option>
                  </select>
                )}
              </div>
            </div>
            <div className="overflow-x-auto bento-card rounded-3xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-amber-500 rounded"
                        onChange={(e) => setSelectedOrders(e.target.checked ? filteredOrders.map(o => o.id) : [])}
                        checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      />
                    </th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 accent-amber-500 rounded"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedOrders([...selectedOrders, order.id]);
                            else setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 font-mono">#{order.orderToken}</td>
                      <td className="px-6 py-4">
                        <div>{order.user?.name || 'Guest'}</div>
                        <div className="text-xs text-slate-500">{order.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-500">₹{order.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                          {order.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                          order.status === 'completed' ? 'completed-badge bg-green-500/20 text-green-500 border border-green-500/30' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                          'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => {
                            const printWindow = window.open('', '', 'width=400,height=600');
                            if (!printWindow) return;
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Order Receipt #${order.orderToken}</title>
                                  <style>
                                    body { font-family: monospace; font-size: 14px; margin: 0; padding: 20px; color: black; }
                                    .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed black; padding-bottom: 10px; }
                                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                                    .total { font-weight: bold; font-size: 16px; margin-top: 10px; border-top: 1px dashed black; padding-top: 10px; text-align: right; }
                                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h2>AK Cafe Shop</h2>
                                    <p>Order #${order.orderToken}</p>
                                    <p>${new Date().toLocaleString()}</p>
                                    <p>Customer: ${order.user?.name || 'Guest'}</p>
                                  </div>
                                  <div class="items">
                                    <p>1x Custom Order</p>
                                  </div>
                                  <div class="total">
                                    Total: INR ${order.totalAmount}
                                  </div>
                                  <div class="footer">
                                    Thank you for your order!
                                  </div>
                                  <script>
                                    window.onload = function() { window.print(); window.close(); }
                                  </script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="p-2 text-slate-400 hover:text-amber-500 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                          title="Print Ticket"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-8">Table Bookings</h1>
            <div className="overflow-x-auto bento-card rounded-3xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Date / Time</th>
                    <th className="px-6 py-4">Guests</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-cream-50">{booking.name}</div>
                        <div className="text-xs text-slate-500">{booking.phone}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{booking.date} at {booking.time}</td>
                      <td className="px-6 py-4">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                          booking.status === 'accepted' || booking.status === 'completed' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                          'bg-red-500/20 text-red-500 border border-red-500/30'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accept</option>
                          <option value="declined">Decline</option>
                          <option value="completed">Complete</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No table bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-8">Customer Feedback</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedbacks.map(f => (
                <div key={f.id} className="bento-card p-6 rounded-3xl">
                  <div className="flex items-center gap-2 mb-3 text-amber-500 text-lg">
                    {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                  </div>
                  <p className="text-slate-300 mb-4">{f.review}</p>
                  <p className="text-slate-500 text-sm">- {f.user?.name || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'floorplan' && (
          <FloorPlan />
        )}

        {activeTab === 'insights' && (
          <div>
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-8">Data Insights</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bento-card rounded-3xl p-6 h-[400px]">
                <h2 className="text-xl font-display font-bold text-cream-50 mb-6">Peak Ordering Hours</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.peakHours || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#f59e0b' }}
                      cursor={{ fill: '#1e293b', opacity: 0.4 }}
                    />
                    <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bento-card rounded-3xl p-6 h-[400px]">
                <h2 className="text-xl font-display font-bold text-cream-50 mb-6">Trending Categories</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.trendingCategories || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(analytics?.trendingCategories || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#f59e0b' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#cbd5e1' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bento-card rounded-3xl p-6 mb-8">
              <h2 className="text-xl font-display font-bold text-cream-50 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                AI Sentiment Analysis
              </h2>
              {sentimentAnalysis ? (
                <div className="text-slate-300 markdown-body prose prose-invert prose-amber max-w-none">
                  {sentimentAnalysis.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line.replace(/\*/g, '')}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Gathering insights from recent feedback...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display font-bold text-cream-50">Kitchen View (Live)</h1>
              <div className="flex gap-2">
                 <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/30">
                   {orders.filter((o: any) => o.status === 'preparing' || o.status === 'pending').length} Active
                 </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders
                .filter((order: any) => order.status === 'pending' || order.status === 'preparing')
                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((order: any) => {
                  const waitTime = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
                  const isUrgent = waitTime > 15;
                  
                  return (
                    <div key={order.id} className={`bento-card rounded-2xl p-6 border-2 transition-all ${isUrgent ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold font-display text-cream-50">#{order.orderToken}</h3>
                          <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          order.status === 'preparing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        }`}>
                          {order.status.toUpperCase()}
                        </div>
                      </div>
                      
                      {isUrgent && (
                        <div className="mb-4 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-2 rounded-lg border border-red-500/30 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                           URGENT - WAITING {waitTime} MINS
                        </div>
                      )}

                      <div className="space-y-3 mb-6">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                            <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-md">{item.quantity}x</span>
                            <div className="flex-grow">
                              <p className="text-cream-50 font-medium">{item.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.specialInstructions && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs text-amber-500/70 font-bold mb-1 uppercase tracking-wider">Special Instructions</p>
                          <p className="text-amber-400 text-sm">{order.specialInstructions}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors text-sm"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition-colors text-sm"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  );
              })}
              {orders.filter((order: any) => order.status === 'pending' || order.status === 'preparing').length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <MonitorPlay className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-xl font-medium text-slate-500">No active orders</p>
                  <p className="text-slate-600 mt-2">Kitchen is clear!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display font-bold text-cream-50">Promotions & Discounts</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-cream-50">Active Promotions</h2>
                <div className="grid grid-cols-1 gap-4">
                  {promotions.map(promo => (
                    <div key={promo.id} className="bento-card p-6 rounded-3xl flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-cream-50 flex items-center gap-2">
                          <Tag className="w-5 h-5 text-amber-500" />
                          {promo.name}
                        </h3>
                        <p className="text-slate-400 mt-1">
                          Discount: <span className="text-amber-500 font-bold">{promo.discountPercentage}%</span>
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${promo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {promotions.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bento-card rounded-3xl">
                      <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No promotions found. Create one to get started!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bento-card p-6 rounded-3xl h-fit">
                <h2 className="text-xl font-bold text-cream-50 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  Create Promotion
                </h2>
                <form onSubmit={handleAddPromotion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Promotion Name</label>
                    <input type="text" required value={newPromo.name} onChange={e => setNewPromo({...newPromo, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" placeholder="e.g. Coffee Monday" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Discount %</label>
                    <input type="number" required min="1" max="100" value={newPromo.discountPercentage} onChange={e => setNewPromo({...newPromo, discountPercentage: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" placeholder="e.g. 15" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                      <input type="date" required value={newPromo.startDate} onChange={e => setNewPromo({...newPromo, startDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                      <input type="date" required value={newPromo.endDate} onChange={e => setNewPromo({...newPromo, endDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-cream-50 py-3 rounded-xl font-medium transition-colors mt-6">
                    Create Offer
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'shifts' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display font-bold text-cream-50">Employee Shifts</h1>
              <button 
                onClick={() => {
                  const doc = new jsPDF();
                  autoTable(doc, {
                    head: [['Employee', 'Role', 'Date', 'Start Time', 'End Time']],
                    body: shifts.map(s => [s.employeeName, s.role, new Date(s.shiftDate).toLocaleDateString(), s.startTime, s.endTime]),
                  });
                  doc.save('shifts-schedule.pdf');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-cream-50 px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Print Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-cream-50">Upcoming Shifts</h2>
                <div className="grid grid-cols-1 gap-4">
                  {shifts.map(shift => (
                    <div key={shift.id} className="bento-card p-6 rounded-3xl flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-cream-50 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-amber-500" />
                          {shift.employeeName} - {shift.role}
                        </h3>
                        <p className="text-slate-400 mt-2">
                          Date: <span className="text-cream-50 font-medium">{new Date(shift.shiftDate).toLocaleDateString()}</span>
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Time: {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={async () => {
                            if (!confirm('Delete this shift?')) return;
                            const token = await getToken();
                            await fetch(`/api/admin/shifts/${shift.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                            fetchData();
                          }}
                          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {shifts.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bento-card rounded-3xl">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No shifts assigned. Create one to get started!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bento-card p-6 rounded-3xl h-fit">
                <h2 className="text-xl font-bold text-cream-50 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  Assign Shift
                </h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const token = await getToken();
                  await fetch('/api/admin/shifts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(newShift)
                  });
                  fetchData();
                  setNewShift({ employeeName: '', role: '', shiftDate: '', startTime: '', endTime: '' });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Employee Name</label>
                    <input type="text" required value={newShift.employeeName} onChange={e => setNewShift({...newShift, employeeName: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                    <select required value={newShift.role} onChange={e => setNewShift({...newShift, role: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500">
                      <option value="">Select Role</option>
                      <option value="Barista">Barista</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Manager">Manager</option>
                      <option value="Cleaner">Cleaner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                    <input type="date" required value={newShift.shiftDate} onChange={e => setNewShift({...newShift, shiftDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                      <input type="time" required value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                      <input type="time" required value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-cream-50 focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-cream-50 py-3 rounded-xl font-medium transition-colors mt-6">
                    Assign Shift
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div>
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-8">Table Status Visualizer</h1>
            
            <div className="flex flex-wrap gap-6 mb-12">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500"></div>
                <span className="text-slate-400 text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500"></div>
                <span className="text-slate-400 text-sm">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500"></div>
                <span className="text-slate-400 text-sm">Reserved</span>
              </div>
            </div>

            <div className="bento-card p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply pointer-events-none"></div>
              
              {(() => {
                const TableGrid = () => {
                  const [tableStatuses, setTableStatuses] = useState<Record<number, string>>(() => {
                    const initial: Record<number, string> = {};
                    for (let i = 1; i <= 12; i++) {
                      initial[i] = i % 3 === 0 ? 'reserved' : i % 2 === 0 ? 'occupied' : 'available';
                    }
                    return initial;
                  });
                  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

                  useEffect(() => {
                    const handleClickOutside = () => setActiveDropdown(null);
                    document.addEventListener('click', handleClickOutside);
                    return () => document.removeEventListener('click', handleClickOutside);
                  }, []);
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                      {[...Array(12)].map((_, i) => {
                        const tableNumber = i + 1;
                        const status = tableStatuses[tableNumber];
                        const isActive = activeDropdown === tableNumber;

                        return (
                          <div 
                            key={tableNumber} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(isActive ? null : tableNumber);
                            }}
                            className={`relative p-6 rounded-2xl flex flex-col items-center justify-center aspect-square shadow-lg transition-all duration-300 cursor-pointer
                              ${status === 'available' ? 'bg-green-500/10 border border-green-500/30 hover:border-green-500' : ''}
                              ${status === 'occupied' ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500' : ''}
                              ${status === 'reserved' ? 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-500' : ''}
                              ${isActive ? 'scale-105 shadow-2xl z-20' : 'hover:scale-105 z-10'}
                            `}
                          >
                            <h3 className="text-2xl font-display font-bold text-cream-50 mb-2">T{tableNumber}</h3>
                            <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300
                              ${status === 'available' ? 'text-green-400' : ''}
                              ${status === 'occupied' ? 'text-red-400' : ''}
                              ${status === 'reserved' ? 'text-amber-400' : ''}
                            `}>
                              {status}
                            </span>
                            
                            {/* Decorative chairs */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-slate-700/50"></div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-slate-700/50"></div>
                            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-2 h-6 rounded-full bg-slate-700/50"></div>
                            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-2 h-6 rounded-full bg-slate-700/50"></div>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-[105%] left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 rounded-xl p-2 flex flex-col gap-1 z-50 shadow-2xl transition-all duration-200 ${isActive ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setTableStatuses(prev => ({...prev, [tableNumber]: 'available'})); setActiveDropdown(null); }}
                                className="px-4 py-2 text-sm font-medium text-left rounded-lg text-cream-50 hover:bg-white/10 hover:text-green-400 transition-colors"
                              >
                                Available
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setTableStatuses(prev => ({...prev, [tableNumber]: 'occupied'})); setActiveDropdown(null); }}
                                className="px-4 py-2 text-sm font-medium text-left rounded-lg text-cream-50 hover:bg-white/10 hover:text-red-400 transition-colors"
                              >
                                Occupied
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setTableStatuses(prev => ({...prev, [tableNumber]: 'reserved'})); setActiveDropdown(null); }}
                                className="px-4 py-2 text-sm font-medium text-left rounded-lg text-cream-50 hover:bg-white/10 hover:text-amber-400 transition-colors"
                              >
                                Reserved
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                };
                return <TableGrid />;
              })()}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-[800px] flex flex-col">
            <h1 className="text-3xl font-display font-bold text-cream-50 mb-8">Delivery Zones & Customer Density</h1>
            <div className="flex-1 bento-card rounded-3xl overflow-hidden relative">
              {/* Fallback styling for when Map loads or API key is missing */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 z-0">
                <p>Loading Map / API Key Required</p>
              </div>
              <div className="relative z-10 w-full h-full">
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                  <Map
                    defaultZoom={14}
                    defaultCenter={{ lat: 23.9925, lng: 85.3600 }}
                    mapId="DEMO_MAP_ID"
                    disableDefaultUI={true}
                  >
                    {/* Simulated customer locations */}
                    {[
                      { lat: 23.9950, lng: 85.3550 },
                      { lat: 23.9900, lng: 85.3650 },
                      { lat: 23.9850, lng: 85.3580 },
                      { lat: 23.9980, lng: 85.3620 },
                      { lat: 23.9880, lng: 85.3520 }
                    ].map((loc, idx) => (
                      <AdvancedMarker key={idx} position={loc}>
                        <div className="bg-amber-500 w-4 h-4 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                      </AdvancedMarker>
                    ))}
                    {/* Cafe Location */}
                    <AdvancedMarker position={{ lat: 23.9925, lng: 85.3600 }}>
                      <div className="bg-cream-50 text-slate-950 p-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-amber-600" /> AK Cafe
                      </div>
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              </div>
            </div>
          </div>
        )}
        </>
        )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
