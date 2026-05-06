'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AskQuestionPage() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('General');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('General');

  const fetchQuestions = async () => {
    const { data } = await supabaseBrowser
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    setAllPosts(data || []);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setCurrentUserId(user?.id || null);
      console.log('Current User ID:', user?.id);   // ← Debug log
    };
    getCurrentUser();
    fetchQuestions();
  }, []);

  const mainQuestions = allPosts.filter((post) => !post.parent_id);

  const getReplies = (parentId: string) => {
    return allPosts.filter((p) => p.parent_id === parentId);
  };

  // Delete with full error reporting
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question permanently?')) return;

    console.log('Attempting to delete post ID:', id);

    const { error } = await supabaseBrowser
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete Error:', error);
      alert('DELETE FAILED\n\nError: ' + error.message + '\n\nCheck console for details');
    } else {
      alert('✅ Question deleted successfully');
      fetchQuestions();
    }
  };

  // Start editing
  const startEdit = (post: any) => {
    setEditingId(post.id);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditCategory(post.category || 'General');
  };

  // Save edit with full error reporting
  const saveEdit = async () => {
    if (!editingId) return;

    console.log('Attempting to update post ID:', editingId);

    const { error } = await supabaseBrowser
      .from('questions')
      .update({
        title: editTitle || 'Untitled Question',
        content: editContent,
        category: editCategory,
      })
      .eq('id', editingId);

    if (error) {
      console.error('Update Error:', error);
      alert('UPDATE FAILED\n\nError: ' + error.message + '\n\nCheck console for details');
    } else {
      alert('✅ Changes saved successfully');
      setEditingId(null);
      fetchQuestions();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const { data: { user } } = await supabaseBrowser.auth.getUser();

    const { error } = await supabaseBrowser
      .from('questions')
      .insert({
        title: newTitle || 'Untitled Question',
        content: newContent,
        category: category,
        author_id: user?.id,
      });

    if (!error) {
      setNewTitle('');
      setNewContent('');
      fetchQuestions();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-8">Recent Questions</h1>

        {/* Post new question form */}
        <form onSubmit={handlePostQuestion} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl mb-12">
          <input
            type="text"
            placeholder="Question title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-4 rounded-2xl border mb-4 text-black"
          />
          <textarea
            placeholder="Write your question here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-2xl border text-black mb-6"
          />
          <div className="flex gap-4 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white text-black px-6 py-3 rounded-3xl border"
            >
              <option value="General">General</option>
              <option value="Ap/Esp">Ap/Esp</option>
              <option value="Arabic">Arabic</option>
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
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-3xl font-medium">
              Post Question
            </button>
          </div>
        </form>

        {/* Questions list */}
        <div className="space-y-8">
          {mainQuestions.length === 0 ? (
            <p className="text-white text-center py-12">No questions yet. Be the first to ask!</p>
          ) : (
            mainQuestions.map((q) => {
              const replies = getReplies(q.id);
              const isOwnPost = currentUserId && q.author_id === currentUserId;
              const isEditing = editingId === q.id;

              return (
                <div key={q.id} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-4 rounded-2xl border mb-4 text-black"
                        placeholder="Question title"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="w-full p-4 rounded-2xl border text-black mb-4"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="bg-white text-black px-6 py-3 rounded-3xl border mb-4"
                      >
                        <option value="General">General</option>
                        <option value="Ap/Esp">Ap/Esp</option>
                        <option value="Arabic">Arabic</option>
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

                      <div className="flex gap-4">
                        <button onClick={saveEdit} className="bg-green-600 text-white px-6 py-3 rounded-3xl">Save Changes</button>
                        <button onClick={cancelEdit} className="bg-gray-500 text-white px-6 py-3 rounded-3xl">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-semibold text-black">{q.title || 'Untitled Question'}</h3>
                        {isOwnPost && (
                          <div className="flex gap-3">
                            <button onClick={() => startEdit(q)} className="text-blue-600 hover:text-blue-700">✏️ Edit</button>
                            <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-700">🗑️ Delete</button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-900 mt-3 text-[17px]">{q.content}</p>
                      <p className="text-xs text-gray-500 mt-6">
                        Posted in <span className="font-medium">{q.category}</span>
                      </p>
                    </>
                  )}

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-10 space-y-6">
                      {replies.map((reply) => (
                        <div key={reply.id} className="pl-8 border-l-4 border-blue-200">
                          <p className="text-gray-600 text-sm">↳ Reply from HoD/Admin</p>
                          <p className="text-gray-800 mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
