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
                  <a href="https://kahoot.it" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/kahoot.png" alt="Kahoot" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-purple-700">Kahoot!</h3>
                    <p className="text-gray-600 mt-3">Fun, interactive quizzes and live games.</p>
                  </a>

                  <a href="https://blooket.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/blooket.png" alt="Blooket" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-red-600">Blooket</h3>
                    <p className="text-gray-600 mt-3">Game-based learning platform.</p>
                  </a>

                  <a href="https://gimkit.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/gimkit.png" alt="GimKit" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-pink-600">GimKit</h3>
                    <p className="text-gray-600 mt-3">Live learning games with money &amp; power-ups.</p>
                  </a>

                  <a href="https://www.mentimeter.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/mentimeter.png" alt="Mentimeter" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Mentimeter</h3>
                    <p className="text-gray-600 mt-3">Interactive presentations and polls.</p>
                  </a>

                  {/* New ones added */}
                  <a href="https://wordwall.net" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/wordwall.png" alt="Wordwall" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Wordwall</h3>
                    <p className="text-gray-600 mt-3">Interactive games and activities.</p>
                  </a>

                  <a href="https://bamboozle.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/bamboozle.png" alt="Bamboozle" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Bamboozle</h3>
                    <p className="text-gray-600 mt-3">Fun review games.</p>
                  </a>

                  <a href="https://padlet.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/padlet.png" alt="Padlet" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Padlet</h3>
                    <p className="text-gray-600 mt-3">Collaborative digital bulletin boards.</p>
                  </a>
                </>
              )}

              {/* AI Tools for Teachers */}
              {toolsSubTab === 'ai' && (
                <>
                  <a href="https://grok.x.ai" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/grok.png" alt="Grok" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Grok</h3>
                    <p className="text-gray-600 mt-3">xAI's helpful AI assistant.</p>
                  </a>
                  <a href="https://chatgpt.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/chatgpt.png" alt="ChatGPT" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-green-600">ChatGPT</h3>
                    <p className="text-gray-600 mt-3">OpenAI's powerful conversational AI.</p>
                  </a>
                  <a href="https://gemini.google.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/gemini.png" alt="Gemini" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-blue-600">Gemini</h3>
                    <p className="text-gray-600 mt-3">Google's multimodal AI.</p>
                  </a>
                  <a href="https://notebooklm.google.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/notebooklm.png" alt="NotebookLM" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-indigo-600">NotebookLM</h3>
                    <p className="text-gray-600 mt-3">Turn notes into podcasts &amp; summaries.</p>
                  </a>
                  <a href="https://copilot.microsoft.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/copilot.png" alt="Copilot" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Copilot</h3>
                    <p className="text-gray-600 mt-3">Microsoft's AI assistant.</p>
                  </a>
                  <a href="https://www.perplexity.ai" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/perplexity.png" alt="Perplexity" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Perplexity</h3>
                    <p className="text-gray-600 mt-3">AI-powered research &amp; answers.</p>
                  </a>
                  <a href="https://tome.app" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/tome.png" alt="Tome" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-3xl font-bold">Tome</h3>
                    <p className="text-gray-600 mt-3">AI presentation generator.</p>
                  </a>
                </>
              )}

              {/* LMS / Classroom Platforms */}
              {toolsSubTab === 'lms' && (
                <>
                  <a href="https://genyo.com.ph" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/genyo.png" alt="Genyo" className="w-40 h-20 object-contain mb-6" />
                    <h3 className="text-3xl font-bold text-blue-600">Genyo</h3>
                    <p className="text-gray-600 mt-3">Philippine e-Learning platform.</p>
                  </a>
                  <a href="https://classroom.google.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/google-classroom.png" alt="Google Classroom" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Google Classroom</h3>
                    <p className="text-black mt-3">Classroom management &amp; assignments.</p>
                  </a>
                  <a href="https://padlet.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/padlet.png" alt="Padlet" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Padlet</h3>
                    <p className="text-gray-600 mt-3">Collaborative bulletin boards.</p>
                  </a>
                  <a href="https://scratch.mit.edu" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/scratch.png" alt="Scratch" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Scratch</h3>
                    <p className="text-gray-600 mt-3">Block-based programming for students.</p>
                  </a>
                  <a href="https://www.geogebra.org" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/geogebra.png" alt="GeoGebra" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">GeoGebra</h3>
                    <p className="text-gray-600 mt-3">Interactive math &amp; science tools.</p>
                  </a>
                  <a href="https://phet.colorado.edu" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/phet.png" alt="PhET" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">PhET Simulations</h3>
                    <p className="text-gray-600 mt-3">Free science simulations.</p>
                    </a>
                                      <a href="https://ascend-lms-three.vercel.app" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/Ascend.png" alt="PhET" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">Ascend</h3>
                    <p className="text-gray-600 mt-3">Modern LMS for personalized learning journeys.</p>
                      </a>
                                      <a href="https://www.codemonkey.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/IReady.png" alt="PhET" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">i-Ready</h3>
                    <p className="text-gray-600 mt-3">Adaptive diagnostic and personalized instruction.</p>
                      </a>
                                      <a href="https://www.codemonkey.com" target="_blank" className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition flex flex-col items-center text-center">
                    <img src="/images/Codemonkey.png" alt="PhET" className="w-28 h-28 object-contain mb-6" />
                    <h3 className="text-black font-bold">CodeMonkey</h3>
                    <p className="text-gray-600 mt-3">Fun coding games and programming for students.</p>
                  </a>
                </>
              )}
            </div>
          </>
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