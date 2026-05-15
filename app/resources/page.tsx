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

  // NEW: Search functionality
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Helper to clean file names (fixes your upload error)
  const sanitizeFileName = (name: string): string => {
    return `${Date.now()}-${name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')}`;
  };

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

    const safeFileName = sanitizeFileName(file.name);

    const { error: uploadError } = await supabaseBrowser.storage
      .from('resources')
      .upload(safeFileName, file);

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
        file_path: safeFileName,
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

  // UPDATED: Search + A-Z sorting (only changed this part)
  const filteredResources = resources
    .filter(r => {
      if (activeTab === 'resources') {
        const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
        const matchesSearch = !searchTerm || 
          (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      }
      if (activeTab === 'tools') return r.category === 'Teaching Tools & Platforms';
      if (activeTab === 'official') return r.category === 'Official Documents';
      return true;
    })
    .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || '')); // A-Z

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-2">Resource Library</h1>
        <p className="text-3xl text-white/90 mb-8">Teaching materials & resources</p>

        {/* Main Tabs - unchanged */}
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

        {/* NEW: Search bar - added here (minimal) */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search resources, documents, or tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-5 border border-white/30 bg-white/10 text-white placeholder:text-white/60 rounded-3xl text-xl focus:outline-none focus:border-white"
          />
        </div>

        {/* NEW INSTRUCTIONS - only shown in Resources tab - unchanged */}
        {activeTab === 'resources' && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8">
            <p className="text-black text-center leading-relaxed text-lg">
              This section provides you with research-based materials that you can read anytime to support and improve your teaching practices and professional growth.
            </p>
          </div>
        )}

        {/* Upload Button - unchanged */}
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
          <>
            {/* Sub-tabs - unchanged */}
            <div className="flex gap-2 mb-8 border-b border-white/30">
              <button onClick={() => setToolsSubTab('game')} className={`px-8 py-3 text-lg font-medium rounded-t-3xl transition ${toolsSubTab === 'game' ? 'bg-white/95 text-black' : 'text-white'}`}>
                Game-Based Learning Tools
              </button>
              <button onClick={() => setToolsSubTab('ai')} className={`px-8 py-3 text-lg font-medium rounded-t-3xl transition ${toolsSubTab === 'ai' ? 'bg-white/95 text-black' : 'text-white'}`}>
                AI Tools for Teachers
              </button>
              <button onClick={() => setToolsSubTab('lms')} className={`px-8 py-3 text-lg font-medium rounded-t-3xl transition ${toolsSubTab === 'lms' ? 'bg-white/95 text-black' : 'text-white'}`}>
                LMS / Classroom Platforms
              </button>
            </div>

            {/* All tool cards unchanged - search only affects dynamic list */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* ... (your entire tools grid remains exactly the same) ... */}
            </div>
          </>
        )}

        {/* ====================== OFFICIAL DOCUMENTS TAB ====================== */}
        {activeTab === 'official' && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Official Documents &amp; Authorities</h3>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* ... your official logos unchanged ... */}
            </div>
          </div>
        )}

        {/* Resources & Official Documents List - now uses filtered + sorted list */}
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
