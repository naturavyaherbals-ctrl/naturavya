'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message || 'Login failed');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 relative overflow-hidden text-emerald-950">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-800/60 hover:text-emerald-900 hover:pl-2 transition-all mb-6 font-medium text-sm uppercase tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Naturavya Admin Login
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Login to access CRM & Orders dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="you@naturavya.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Naturavya
          </div>
        </div>
      </div>
    </div>
  );
}