'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const navItems = [
  { title: 'Dashboard', path: '/student-dashboard' },
  { title: 'University Tracker', path: '/student-dashboard' },
  { title: 'SOP & Personal Info', path: '/student-dashboard/sop' },
  { title: 'Document Upload', path: '/student-dashboard/documents' },
  { title: 'Logout', path: '/student-dashboard/logout' }, // Optional if you want a route
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-8">🎓 Edulx</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-4 py-2 rounded hover:bg-gray-700 transition ${
                pathname === item.path ? 'bg-gray-700' : ''
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
