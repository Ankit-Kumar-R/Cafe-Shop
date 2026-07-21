import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, dbUser, loading, getToken } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    if (requireAdmin) {
      const checkAdmin = async () => {
        try {
          // First check token custom claims
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims.admin === true) {
            setIsAuthorized(true);
            return;
          }
          
          // Strict server-side validation API
          const token = await getToken();
          const res = await fetch('/api/admin/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } catch (error) {
          setIsAuthorized(false);
        }
      };
      checkAdmin();
    } else {
      setIsAuthorized(true);
    }
  }, [user, loading, requireAdmin, getToken]);

  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
