'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase';   // ← Added

export default function TransitionToolkit() {
  const [activeTab, setActiveTab] = useState<'images' | 'assessment'>('images');

  // NEW: Form state for self assessment
  const [ratings, setRatings] = useState({
    curriculum: 3,
    classroom: 3,
    cultural: 3,
    assessment: 3,
    technology: 3,
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: { user } } = await supabaseBrowser.auth.getUser();

    const { error } = await supabaseBrowser
      .from('self_assessments')
      .insert({
        author_id: user?.id,
        curriculum: ratings.curriculum,
        classroom: ratings.classroom,
        cultural: ratings.cultural,
        assessment: ratings.assessment,
        technology: ratings.technology,
        notes: notes.trim(),
      });

    if (error) {
      alert('Failed to submit: ' + error.message);
    } else {
      alert('✅ Monthly Self Assessment submitted successfully!');
      // Reset form
      setRatings({ curriculum: 3, classroom: 3, cultural: 3, assessment: 3, technology: 3 });
      setNotes('');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-bold text-white">Transition Toolkit</h1>
        <Link 
          href="/dashboard/teacher" 
          className="text-white hover:underline text-xl flex items-center gap-2"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-3xl shadow-inner p-1 mb-10 w-fit">
        <button
          onClick={() => setActiveTab('images')}
          className={`px-10 py-4 rounded-3xl font-medium transition ${
            activeTab === 'images' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Toolkit Resources
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-10 py-4 rounded-3xl font-medium transition ${
            activeTab === 'assessment' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Monthly Self Assessment
        </button>
      </div>

      {/* IMAGES TAB - unchanged */}
      {activeTab === 'images' && (
        <div className="space-y-12">
          <div>
            <img 
              src="/images/toolkit-1.jpg" 
              alt="Toolkit Resource 1" 
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>
          <div>
            <img 
              src="/images/toolkit-2.jpg" 
              alt="Toolkit Resource 2" 
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>
          <div>
            <img 
              src="/images/toolkit-3.jpg" 
              alt="Toolkit Resource 3" 
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* MONTHLY SELF ASSESSMENT TAB */}
      {activeTab === 'assessment' && (
        <div className="bg-white rounded-3xl p-10 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-4 text-center">Monthly Self Assessment</h2>
          
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10">
            <p className="text-black text-center leading-relaxed">
              Please rate your current confidence level in each area.<br />
              <span className="font-medium">1 = Not confident at all</span> — 
              <span className="font-medium">5 = Extremely confident</span><br />
              This is your <strong>monthly self-assessment</strong> for personal growth and development.
            </p>
          </div>

          <p className="text-center text-gray-600 mb-10">Rate your current confidence level</p>

          <form onSubmit={handleSubmitAssessment} className="space-y-8">
            <div>
              <label className="block text-black font-medium mb-2">1. Implementing UAE Curriculum &amp; Standards</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={ratings.curriculum}
                onChange={(e) => setRatings(prev => ({ ...prev, curriculum: Number(e.target.value) }))}
                className="w-full accent-blue-600" 
              />
              <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
            </div>

            <div>
              <label className="block text-black font-medium mb-2">2. Classroom Management in UAE Context</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={ratings.classroom}
                onChange={(e) => setRatings(prev => ({ ...prev, classroom: Number(e.target.value) }))}
                className="w-full accent-blue-600" 
              />
              <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
            </div>

            <div>
              <label className="block text-black font-medium mb-2">3. Cultural &amp; Social Adaptation</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={ratings.cultural}
                onChange={(e) => setRatings(prev => ({ ...prev, cultural: Number(e.target.value) }))}
                className="w-full accent-blue-600" 
              />
              <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
            </div>

            <div>
              <label className="block text-black font-medium mb-2">4. Assessment &amp; Feedback Practices</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={ratings.assessment}
                onChange={(e) => setRatings(prev => ({ ...prev, assessment: Number(e.target.value) }))}
                className="w-full accent-blue-600" 
              />
              <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
            </div>

            <div>
              <label className="block text-black font-medium mb-2">5. Technology Integration in Teaching</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={ratings.technology}
                onChange={(e) => setRatings(prev => ({ ...prev, technology: Number(e.target.value) }))}
                className="w-full accent-blue-600" 
              />
              <div className="flex justify-between text-sm text-gray-500"><span>1</span><span>5</span></div>
            </div>

            <div>
              <label className="block text-black font-medium mb-2">Additional Notes / Reflections</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 border rounded-3xl p-6" 
                placeholder="Any thoughts or areas you want to improve..." 
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-6 rounded-3xl text-xl font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Monthly Self Assessment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
