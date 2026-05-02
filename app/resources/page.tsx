'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ResourcesPage() {
  const [isHoDOrAdmin, setIsHoDOrAdmin] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'tools' | 'official'>('resources');
  const [toolsSubTab, setToolsSubTab] = useState<'game' | 'ai' | 'lms'>('game');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadCategory, setUploadCategory] = useState('General');

  const loadRole = async () => {
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (user) {
      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsHoDOrAdmin(profile?.role === 'hod' || profile?.role === 'admin');
    }
  };

  const fetchResources = async () => {
    const { data } = await supabaseBrowser
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    setResources(data || []);
  };

  useEffect(() => {
    loadRole();
    fetchResources();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isHoDOrAdmin) return;

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from('resources')
      .upload(fileName, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    let category = 'General';
    if (activeTab === 'tools') category = 'Teaching Tools & Platforms';
    if (activeTab === 'official') category = 'Official Documents';
    if (activeTab === 'resources') category = uploadCategory;

    await supabaseBrowser
      .from('resources')
      .insert({
        title: file.name,
        name: file.name,
        file_path: fileName,
        category: category
      });

    alert(`✅ Uploaded to ${category}!`);
    await fetchResources();
    setUploading(false);
    e.target.value = '';
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabaseBrowser.storage
        .from('resources')
        .download(filePath);
      if (error) throw error;

      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Download failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!isHoDOrAdmin) return;
    if (!confirm('Delete this file permanently?')) return;

    await supabaseBrowser.storage.from('resources').remove([filePath]);
    await supabaseBrowser.from('resources').delete().eq('id', id);
    fetchResources();
  };

  const filteredResources = resources.filter(r => {
    if (activeTab === 'resources') return categoryFilter === 'all' || r.category === categoryFilter;
    if (activeTab === 'tools') return r.category === 'Teaching Tools & Platforms';
    if (activeTab === 'official') return r.category === 'Official Documents';
    return true;
  });

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-2">Resource Library</h1>
        <p className="text-3xl text-white/90 mb-8">Teaching materials & resources</p>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/30">
          <button onClick={() => setActiveTab('resources')} className={`px-10 py-4 text-xl font-medium rounded-t-3xl transition ${activeTab === 'resources' ? 'bg-white/95 text-black' : 'text-white'}`}>
            Resources
          </button>
          <button onClick={() => setActiveTab('tools')} className={`px-10 py-4 text-xl font-medium rounded-t-3xl transition ${activeTab === 'tools' ? 'bg-white/95 text-black' : 'text-white'}`}>
            Teaching Tools & Platforms
          </button>
          <button onClick={() => setActiveTab('official')} className={`px-10 py-4 text-xl font-medium rounded-t-3xl transition ${activeTab === 'official' ? 'bg-white/95 text-black' : 'text-white'}`}>
            Official Documents
          </button>
        </div>

        {/* Upload Button */}
        {isHoDOrAdmin && activeTab === 'resources' && (
          <div className="mb-8">
            <label className="flex items-center gap-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-xl font-medium cursor-pointer inline-flex">
              <Upload size={28} />
              Upload Resource
              <input type="file" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* ====================== TEACHING TOOLS & PLATFORMS ====================== */}
        {activeTab === 'tools' && (
          /* ... existing tools code remains unchanged ... */
          <></>
        )}

        {/* ====================== OFFICIAL DOCUMENTS TAB ====================== */}
        {activeTab === 'official' && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Official Documents &amp; Authorities</h3>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* TPS Logo */}
              <a href="https://www.tpsdubai.com/" target="_blank" rel="noopener noreferrer"
                 className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                <img src="/images/tps-logo.png" alt="The Philippine School" className="h-28 object-contain mb-4" />
                <p className="font-medium text-black">The Philippine School</p>
              </a>

              {/* KHDA Logo */}
              <a href="https://khda.gov.ae/en" target="_blank" rel="noopener noreferrer"
                 className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                <img src="/images/khda-logo.png" alt="KHDA" className="h-28 object-contain mb-4" />
                <p className="font-medium text-black">KHDA - Dubai</p>
              </a>

              {/* MOE Logo */}
              <a href="https://www.moe.gov.ae/" target="_blank" rel="noopener noreferrer"
                 className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                <img src="/images/moe-logo.png" alt="MOE" className="h-28 object-contain mb-4" />
                <p className="font-medium text-black">Ministry of Education - UAE</p>
              </a>
            </div>
          </div>
        )}

        {/* Resources & Official Documents List */}
        {activeTab !== 'tools' && (
          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <p className="text-xl text-white/80 py-12 text-center">No resources found in this section yet.</p>
            ) : (
              filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <FileText size={36} className="text-black" />
                    <div>
                      <p className="text-2xl text-black">{resource.title || resource.name}</p>
                      <p className="text-gray-500 text-lg">{resource.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleDownload(resource.file_path, resource.title || resource.name)} className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-lg font-medium">
                      <Download size={24} /> Download
                    </button>
                    {isHoDOrAdmin && (
                      <button onClick={() => handleDelete(resource.id, resource.file_path)} className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl text-lg font-medium">
                        <Trash2 size={24} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
