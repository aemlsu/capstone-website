'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      const { data } = await supabaseBrowser
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setSchool(data.school || '');
      }
    };
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await supabaseBrowser
      .from('profiles')
      .update({ full_name: fullName, school })
      .eq('id', profile.id);
    setSaving(false);
    alert('Profile updated successfully!');
  };

  return (
    <>
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-black mb-8">Profile</h1>

          <div className="space-y-8">
            <div>
              <label className="block text-xl font-medium text-black mb-2">Email</label>
              <p className="text-2xl text-gray-900">{profile?.email}</p>
            </div>

            <div>
              <label className="block text-xl font-medium text-black mb-2">Role</label>
              <p className="text-2xl text-gray-900 capitalize">{profile?.role}</p>
            </div>

            <div>
              <label className="block text-xl font-medium text-black mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black"
              />
            </div>

            <div>
              <label className="block text-xl font-medium text-black mb-2">School</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-6 py-5 border border-gray-300 rounded-3xl text-xl text-black"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl text-2xl font-semibold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
    </>
  );
}