

export default function SecurityPage() {
  return (
    <>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-black mb-6">Security &amp; Privacy Policy</h1>
          <div className="prose text-lg text-gray-800">
            <p><strong>Data is private by design.</strong></p>
            <ul className="list-disc pl-6 space-y-4">
              <li>Reflections can be posted anonymously</li>
              <li>Only HoD/Admin can see full analytics</li>
              <li>All data is stored in Supabase with Row Level Security</li>
              <li>No data is shared with third parties</li>
            </ul>
            <p className="mt-10 text-sm text-gray-500">This platform was built as part of your capstone research.</p>
          </div>
        </div>
    </>
  );
}