'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
    } else {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseBrowser.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'teacher') router.push('/dashboard/teacher');
        else router.push('/dashboard/admin');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-md mx-auto pt-32 px-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12">
          <h1 className="text-5xl font-bold text-black text-center mb-10">Welcome Back</h1>

          <form onSubmit={handleLogin} className="space-y-8">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black" placeholder="Email address" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black" placeholder="Password" />
            
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl text-2xl font-semibold">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center justify-center my-8">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="px-6 text-gray-500 text-xl">or</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <button onClick={() => router.push('/signup')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-3xl text-2xl font-semibold">
            Create New Account
          </button>

          {error && <p className="text-red-600 text-center mt-6">{error}</p>}
        </div>
      </div>
    </div>
  );
}