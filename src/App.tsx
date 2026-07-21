/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route } from 'react-router';
import { ReactLenis } from 'lenis/react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { Menu } from './pages/Menu.tsx';
import { About } from './pages/About.tsx';
import { Contact } from './pages/Contact.tsx';
import { Gallery } from './pages/Gallery.tsx';
import { BookTable } from './pages/BookTable.tsx';
import { Cart } from './pages/Cart.tsx';
import { Profile } from './pages/Profile.tsx';
import { OrderTracking } from './pages/OrderTracking.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { ItemDetails } from './pages/ItemDetails.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { useNotifications } from './hooks/useNotifications.ts';
import { LoadingOverlay } from './components/LoadingOverlay.tsx';
import { ScrollProgress } from './components/ScrollProgress.tsx';

function NotificationManager() {
  useNotifications();
  return null;
}

export default function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <div className="min-h-screen flex flex-col bg-slate-950">
        <ScrollProgress />
        <LoadingOverlay />
        <NotificationManager />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book" element={<BookTable />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/track/:token" element={<OrderTracking />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
}

