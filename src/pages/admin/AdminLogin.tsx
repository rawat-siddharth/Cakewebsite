import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Database,
  Key
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const { signIn, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in as admin
  if (isAdmin) {
    navigate('/admin', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);
      if (result.success) {
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Invalid credentials or unauthorized role.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#2A1810]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2A1810]">
            Cake<span className="text-[#D83A6F]">n</span>Crave
          </span>
        </Link>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#F3DFE5] text-xs font-semibold text-[#D83A6F]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Staff & Baker Portal</span>
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold text-[#2A1810]">
          Admin Console Sign In
        </h2>
        <p className="mt-1 text-xs text-[#2A1810]/60">
          Sign in to manage eggless cakes, prices, categories, and orders.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#F3DFE5] shadow-sm space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between text-[11px] p-2.5 rounded-2xl bg-[#FFF5F7] border border-[#F3DFE5]">
            <span className="flex items-center gap-1.5 text-[#2A1810]/80">
              <Database className="w-3.5 h-3.5 text-[#D83A6F]" />
              <span>Auth Backend:</span>
            </span>
            <span className="font-semibold text-[#D83A6F]">
              {configured ? 'Supabase Auth & RLS' : 'Sandbox (Setup Guide Below)'}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Sign in error</p>
                <p className="text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cakencrave.com"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Verifying Permissions...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Controlled Admin Provisioning Guide Toggle */}
          <div className="pt-2 border-t border-[#F3DFE5] text-center">
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="inline-flex items-center gap-1.5 text-xs text-[#D83A6F] hover:underline font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showSetupGuide ? 'Hide First Admin Setup Guide' : 'How to Provision First Admin in Supabase'}</span>
            </button>

            {showSetupGuide && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FFF5F7] border border-[#F3DFE5] text-left text-xs space-y-3">
                <p className="font-bold text-[#2A1810]">
                  How to grant Admin Access securely:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[#2A1810]/80 text-[11px] leading-relaxed">
                  <li>
                    Open your Supabase Dashboard &rarr; <strong>Authentication &rarr; Users</strong> and click <strong>Add User</strong>.
                  </li>
                  <li>
                    Copy the newly created user's <strong>UUID</strong>.
                  </li>
                  <li>
                    Open <strong>SQL Editor</strong> and execute:
                    <pre className="p-2 mt-1 bg-white border border-[#F3DFE5] rounded-lg text-[10px] font-mono text-[#2A1810] overflow-x-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin');`}
                    </pre>
                  </li>
                  <li>
                    Return here and sign in with the email and password!
                  </li>
                </ol>
                {!configured && (
                  <div className="pt-2 border-t border-[#F3DFE5] text-[10px] text-[#2A1810]/70">
                    <span className="font-semibold text-[#D83A6F]">Local Demo / Sandbox Credentials:</span><br />
                    Email: <code className="font-mono font-bold">admin@cakencrave.com</code><br />
                    Password: <code className="font-mono font-bold">JaipurCakes@2026</code>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-[#2A1810]/60 hover:text-[#D83A6F]">
              &larr; Return to Customer Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
