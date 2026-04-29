'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <>
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-black mb-8">Settings</h1>

          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-medium text-black">Email Notifications</h3>
                <p className="text-gray-600">Receive updates on new replies and concerns</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-14 h-8 rounded-full transition ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${emailNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <p className="mt-16 text-gray-500 text-center">More settings will be added later.</p>
        </div>
    </>
  );
}