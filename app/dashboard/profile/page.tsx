'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);     // ← NEW
  const [uploading, setUploading] = useState(false);
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
        setAvatarUrl(data.avatar_url || null);
      }
    };
    loadProfile();
  }, []);

  // NEW: Upload profile picture
  const uploadAvatar = async (file: File) => {
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabaseBrowser.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrl);

    // Update profile with new avatar URL
    await supabaseBrowser
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id);

    setUploading(false);
    alert('✅ Profile picture updated!');
  };

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

        {/* NEW: Avatar Upload Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-200 mb-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl text-gray-400">
                👤
              </div>
            )}
          </div>

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-3xl text-lg font-medium">
            {uploading ? 'Uploading...' : 'Upload Profile Picture'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

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
