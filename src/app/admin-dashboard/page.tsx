'use client';

import LogoutButton from '@/components/LogoutButton';

export default function AdminDashboard() {
  return (
    <main className="max-w-4xl mx-auto p-8 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🧑‍💼 Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <p>Here you'll manage students, view their details, and oversee applications.</p>
    </main>
  );
}
