'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function SignupPage() {
  const router = useRouter();
  const [isHoDMode, setIsHoDMode] = useState(false); // false = teacher self-register, true = HoD creates for teacher
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Ap/Esp');

  const departments = [
    'Ap/Esp', 'Arabic', 'English', 'Filipino', 'ICT/TLE',
    'MAPEH', 'Math', 'MSCS', 'Science', 'KG', 'G1 & G2'
  ];

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setCurrentUserRole(profile?.role || null);
      }
    };
    checkCurrentUser();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const finalRole = isHoDMode ? 'teacher' : 'teacher'; // Teachers always register as teacher

    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: finalRole,
          department: department,
        }
      }
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Account created successfully! Please check your email to confirm.');
      // Auto redirect after success for self-register
      if (!isHoDMode) {
        setTimeout(() => router.push('/login'), 2000);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <div className=" flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full">
          <h1 className="text-5xl font-bold text-black text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-600 text-xl mb-10">Join the Test platform</p>

          {/* Toggle between modes */}
          <div className="flex bg-gray-100 rounded-3xl p-1 mb-10">
            <button
              onClick={() => setIsHoDMode(false)}
              className={`flex-1 py-4 text-xl font-medium rounded-3xl transition ${!isHoDMode ? 'bg-white shadow text-black' : 'text-gray-600'}`}
            >
              Register as Teacher
            </button>
            <button
              onClick={() => setIsHoDMode(true)}
              className={`flex-1 py-4 text-xl font-medium rounded-3xl transition ${isHoDMode ? 'bg-white shadow text-black' : 'text-gray-600'}`}
              disabled={currentUserRole !== 'hod' && currentUserRole !== 'admin'}
            >
              Create for Teacher (HoD only)
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div>
              <label className="block text-xl text-black mb-3">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-xl text-black mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black"
                placeholder="teacher@school.com"
              />
            </div>

            <div>
              <label className="block text-xl text-black mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xl text-black mb-3">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black bg-white"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl text-2xl font-semibold transition disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : isHoDMode ? 'Create Teacher Account' : 'Register as Teacher'}
            </button>
          </form>

          {message && (
            <p className={`mt-6 text-center text-lg ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <p className="text-center mt-8 text-gray-600">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-blue-600 hover:underline font-medium">
              Login here
            </button>
          </p>
        </div>
      </div>
    </>
  );
}