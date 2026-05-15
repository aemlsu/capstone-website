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

  // NEW: Helper to clean file names (fixes your upload error)
  const sanitizeFileName = (name: string): string => {
    return `${Date.now()}-${name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')}`;
  };

  // ADDED: Favorites feature
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const loadFavorites = async () => {
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (user) {
      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('favorites')
        .eq('id', user.id)
        .single();
      setFavorites(profile?.favorites || []);
    }
  };

  const toggleFavorite = async (toolName: string) => {
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    const isFavorite = favorites.includes(toolName);
    const newFavorites = isFavorite
      ? favorites.filter(f => f !== toolName)
      : [...favorites, toolName];

    const { error } = await supabaseBrowser
      .from('profiles')
      .update({ favorites: newFavorites })
      .eq('id', user.id);

    if (!error) setFavorites(newFavorites);
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
    loadFavorites();
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

  const filteredResources = resources.filter(r => {
    if (activeTab === 'resources') return categoryFilter === 'all' || r.category === categoryFilter;
    if (activeTab === 'tools') return r.category === 'Teaching Tools & Platforms';
    if (activeTab === 'official') return r.category === 'Official Documents';
    return true;
  });

  // ADDED: Search + A-Z sorting on top of your existing filteredResources
  const displayedResources = filteredResources
    .filter(r => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (r.title || '').toLowerCase().includes(term) ||
        (r.name || '').toLowerCase().includes(term) ||
        (r.category || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));

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

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search resources, documents, or tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-5 border border-white/30 bg-white/10 text-white placeholder:text-white/60 rounded-3xl text-xl focus:outline-none focus:border-white"
          />
        </div>

        {/* NEW INSTRUCTIONS - only shown in Resources tab */}
        {activeTab === 'resources' && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8">
            <p className="text-black text-center leading-relaxed text-lg">
              This section provides you with research-based materials that you can read anytime to support and improve your teaching practices and professional growth.
            </p>
          </div>
        )}

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
          <>
            {/* Sub-tabs */}
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Game-Based Learning Tools */}
              {toolsSubTab === 'game' && (
                <>
                  <a href="https://kahoot.it" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Kahoot!'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Kahoot!') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/kahoot.png" alt="Kahoot" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-purple-700">Kahoot!</h3>
                    <p className="text-gray-600 mt-3">Fun, interactive quizzes and live games.</p>
                  </a>
                  <a href="https://blooket.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Blooket'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Blooket') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/blooket.png" alt="Blooket" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-red-600">Blooket</h3>
                    <p className="text-gray-600 mt-3">Game-based learning platform.</p>
                  </a>
                  <a href="https://gimkit.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('GimKit'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('GimKit') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/gimkit.png" alt="GimKit" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-pink-600">GimKit</h3>
                    <p className="text-gray-600 mt-3">Live learning games with money & power-ups.</p>
                  </a>
                  <a href="https://www.mentimeter.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Mentimeter'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Mentimeter') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/mentimeter.png" alt="Mentimeter" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Mentimeter</h3>
                    <p className="text-gray-600 mt-3">Interactive presentations and polls.</p>
                  </a>
                  <a href="https://wordwall.net" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Wordwall'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Wordwall') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/wordwall.png" alt="Wordwall" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Wordwall</h3>
                    <p className="text-gray-600 mt-3">Interactive games and activities.</p>
                  </a>
                  <a href="https://bamboozle.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Bamboozle'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Bamboozle') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/bamboozle.png" alt="Bamboozle" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Bamboozle</h3>
                    <p className="text-gray-600 mt-3">Fun review games.</p>
                  </a>
                  <a href="https://padlet.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Padlet'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Padlet') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/padlet.png" alt="Padlet" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Padlet</h3>
                    <p className="text-gray-600 mt-3">Collaborative digital bulletin boards.</p>
                  </a>
                </>
              )}

              {/* AI Tools for Teachers */}
              {toolsSubTab === 'ai' && (
                <>
                  <a href="https://grok.x.ai" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Grok'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Grok') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/grok.png" alt="Grok" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Grok</h3>
                    <p className="text-gray-600 mt-3">xAI's helpful AI assistant.</p>
                  </a>
                  <a href="https://chatgpt.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('ChatGPT'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('ChatGPT') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/chatgpt.png" alt="ChatGPT" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-green-600">ChatGPT</h3>
                    <p className="text-gray-600 mt-3">OpenAI's powerful conversational AI.</p>
                  </a>
                  <a href="https://gemini.google.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Gemini'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Gemini') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/gemini.png" alt="Gemini" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-blue-600">Gemini</h3>
                    <p className="text-gray-600 mt-3">Google's multimodal AI.</p>
                  </a>
                  <a href="https://notebooklm.google.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('NotebookLM'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('NotebookLM') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/notebooklm.png" alt="NotebookLM" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-indigo-600">NotebookLM</h3>
                    <p className="text-gray-600 mt-3">Turn notes into podcasts & summaries.</p>
                  </a>
                  <a href="https://copilot.microsoft.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Copilot'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Copilot') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/copilot.png" alt="Copilot" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Copilot</h3>
                    <p className="text-gray-600 mt-3">Microsoft's AI assistant.</p>
                  </a>
                  <a href="https://www.perplexity.ai" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Perplexity'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Perplexity') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/perplexity.png" alt="Perplexity" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Perplexity</h3>
                    <p className="text-gray-600 mt-3">AI-powered research & answers.</p>
                  </a>
                  <a href="https://tome.app" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Tome'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Tome') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/tome.png" alt="Tome" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Tome</h3>
                    <p className="text-gray-600 mt-3">AI presentation generator.</p>
                  </a>
                </>
              )}

              {/* LMS / Classroom Platforms */}
              {toolsSubTab === 'lms' && (
                <>
                  <a href="https://idiwa.com.ph/TPSUAE/login.aspx" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Genyo'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Genyo') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/genyo.png" alt="Genyo" className="w-40 h-20 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-blue-600">Genyo</h3>
                    <p className="text-gray-600 mt-3">Philippine e-Learning platform.</p>
                  </a>
                  <a href="https://classroom.google.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Google Classroom'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Google Classroom') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/google-classroom.png" alt="Google Classroom" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Google Classroom</h3>
                    <p className="text-black mt-3">Classroom management & assignments.</p>
                  </a>
                  <a href="https://padlet.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Padlet'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Padlet') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/padlet.png" alt="Padlet" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Padlet</h3>
                    <p className="text-gray-600 mt-3">Collaborative digital bulletin boards.</p>
                  </a>
                  <a href="https://scratch.mit.edu" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Scratch'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Scratch') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/scratch.png" alt="Scratch" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Scratch</h3>
                    <p className="text-gray-600 mt-3">Block-based programming for students.</p>
                  </a>
                  <a href="https://www.geogebra.org" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('GeoGebra'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('GeoGebra') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/geogebra.png" alt="GeoGebra" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">GeoGebra</h3>
                    <p className="text-gray-600 mt-3">Interactive math & science tools.</p>
                  </a>
                  <a href="https://phet.colorado.edu" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('PhET Simulations'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('PhET Simulations') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/phet.png" alt="PhET" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">PhET Simulations</h3>
                    <p className="text-gray-600 mt-3">Free science simulations.</p>
                  </a>
                  <a href="https://ascend-lms-three.vercel.app" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('Ascend'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('Ascend') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/Ascend.png" alt="Ascend" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Ascend</h3>
                    <p className="text-gray-600 mt-3">Modern LMS for personalized learning.</p>
                  </a>
                  <a href="https://www.i-ready.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('i-Ready'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('i-Ready') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/IReady.png" alt="i-Ready" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">i-Ready</h3>
                    <p className="text-gray-600 mt-3">Adaptive diagnostic and personalized instruction.</p>
                  </a>
                  <a href="https://www.codemonkey.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center relative">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite('CodeMonkey'); }}
                      className="absolute top-4 right-4 text-3xl transition"
                    >
                      {favorites.includes('CodeMonkey') ? '❤️' : '♡'}
                    </button>
                    <img src="/images/Codemonkey.png" alt="CodeMonkey" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">CodeMonkey</h3>
                    <p className="text-gray-600 mt-3">Fun coding games and programming for students.</p>
                  </a>
                </>
              )}
            </div>
          </>
        )}

        {/* ====================== OFFICIAL DOCUMENTS TAB ====================== */}
        {activeTab === 'official' && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Official Documents &amp; Authorities</h3>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              <a href="https://www.tpsdubai.com/" target="_blank" rel="noopener noreferrer" className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                <img src="/images/tps-logo.png" alt="The Philippine School" className="h-28 object-contain mb-4" />
                <p className="font-medium text-black">The Philippine School</p>
              </a>
              <a href="https://khda.gov.ae/en" target="_blank" rel="noopener noreferrer" className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                <img src="/images/khda-logo.png" alt="KHDA" className="h-28 object-contain mb-4" />
                <p className="font-medium text-black">KHDA - Dubai</p>
              </a>
              <a href="https://www.moe.gov.ae/" target="_blank" rel="noopener noreferrer" className="group bg-white/95 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                <img src="/images/moe-logo.png" alt="MOE" className="h-28 object-contain mb-4" />
                <p className="font-medium text-black">Ministry of Education - UAE</p>
              </a>
            </div>
          </div>
        )}

        {/* Resources & Official Documents List */}
        {activeTab !== 'tools' && (
          <div className="space-y-4">
            {displayedResources.length === 0 ? (
              <p className="text-xl text-white/80 py-12 text-center">No resources found in this section yet.</p>
            ) : (
              displayedResources.map((resource) => (
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
