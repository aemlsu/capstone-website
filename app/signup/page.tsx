'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'teacher' | 'hod' | 'hoc' | 'school_admin'>('teacher');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Ap/Esp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'teacher') router.push('/dashboard/teacher');
        else router.push('/dashboard/admin');
      }
    };
    checkAuth();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: activeTab,
          department: (activeTab === 'hoc' || activeTab === 'school_admin') ? null : department,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      alert(`✅ ${activeTab === 'school_admin' ? 'School Admin' : activeTab.toUpperCase()} account created successfully!`);
      router.push('/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center text-black mb-2">Create Account</h1>
        <p className="text-center text-gray-600 mb-8">Join TPS EduShift Support</p>

        {/* Role Tabs - Added School Admin */}
        <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-3xl p-1 mb-8">
          <button onClick={() => setActiveTab('teacher')} className={`py-4 text-sm font-medium rounded-3xl transition-all ${activeTab === 'teacher' ? 'bg-white shadow-sm text-black' : 'text-gray-700 hover:bg-gray-200'}`}>Teacher</button>
          <button onClick={() => setActiveTab('hod')} className={`py-4 text-sm font-medium rounded-3xl transition-all ${activeTab === 'hod' ? 'bg-white shadow-sm text-black' : 'text-gray-700 hover:bg-gray-200'}`}>HoD</button>
          <button onClick={() => setActiveTab('hoc')} className={`py-4 text-sm font-medium rounded-3xl transition-all ${activeTab === 'hoc' ? 'bg-white shadow-sm text-black' : 'text-gray-700 hover:bg-gray-200'}`}>HoC</button>
          <button onClick={() => setActiveTab('school_admin')} className={`py-4 text-sm font-medium rounded-3xl transition-all ${activeTab === 'school_admin' ? 'bg-white shadow-sm text-black' : 'text-gray-700 hover:bg-gray-200'}`}>School Admin</button>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-3xl px-6 py-4 text-black focus:outline-none focus:border-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-3xl px-6 py-4 text-black focus:outline-none focus:border-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-3xl px-6 py-4 text-black focus:outline-none focus:border-blue-500" required />
          </div>

          {/* Department field shown only for Teacher and HoD */}
          {(activeTab === 'teacher' || activeTab === 'hod') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department / Subject</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border border-gray-300 rounded-3xl px-6 py-4 text-black focus:outline-none focus:border-blue-500">
                <option value="Ap/Esp">Ap/Esp</option>
                <option value="English">English</option>
                <option value="Filipino">Filipino</option>
                <option value="ICT/TLE">ICT/TLE</option>
                <option value="MAPEH">MAPEH</option>
                <option value="Math">Math</option>
                <option value="MSCS">MSCS</option>
                <option value="Science">Science</option>
                <option value="KG">KG</option>
                <option value="G1 & G2">G1 & G2</option>
              </select>
            </div>
          )}

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-3xl font-semibold text-lg transition">
            {loading ? 'Creating Account...' : `Create ${activeTab === 'school_admin' ? 'School Admin' : activeTab.toUpperCase()} Account`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
        </p>
      </div>
    </div>
  );
}
