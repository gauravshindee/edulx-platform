'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

interface Student {
  id: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const studentList: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'student') {
          studentList.push({ id: doc.id, ...data } as Student);
        }
      });
      setStudents(studentList);
    };

    fetchStudents();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-4">👨‍💼 Admin Panel</h2>
        <Link href="/admin-dashboard" className="hover:text-blue-400">🏠 Dashboard Home</Link>
        <Link href="/admin-dashboard/student-list" className="hover:text-blue-400">📋 Student List</Link>
        <Link href="/admin-dashboard/export-approvals" className="hover:text-blue-400">📁 Export Approvals</Link>
        <div className="mt-auto"><LogoutButton /></div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">👨‍💼 Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">Here you&apos;ll manage students, view their details, and oversee applications.</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-semibold">{students.length}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">Applications</p>
            <p className="text-2xl font-semibold">{students.length * 2}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">Pending Docs</p>
            <p className="text-2xl font-semibold text-yellow-600">{students.length * 3}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
