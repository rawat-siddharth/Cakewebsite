import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Sparkles } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full bg-[#FFF0F4] border border-[#F3DFE5] flex items-center justify-center text-[#D83A6F] animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="mt-4 text-xs tracking-wider uppercase font-semibold text-[#D83A6F]">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
