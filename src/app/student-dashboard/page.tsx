'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

interface University {
  id?: string;
  universityName: string;
  course: string;
  intake: string;
  deadline: string;
  status: string;
  priority: number;
  comments: string;
  link: string;
}

export default function StudentDashboard() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState<University>({
    universityName: '',
    course: '',
    intake: '',
    deadline: '',
    status: '',
    priority: 1,
    comments: '',
    link: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const user = auth.currentUser;

  const fetchUniversities = async () => {
    if (!user) return;
    const ref = collection(db, 'users', user.uid, 'universities');
    onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as University[];
      setUniversities(data);
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchUniversities();
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const ref = collection(db, 'users', user.uid, 'universities');

    if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'universities', editingId);
      const { id, ...formData } = form;
      await updateDoc(docRef, formData);
      setEditingId(null);
    } else {
      await addDoc(ref, {
        ...form,
        priority: Number(form.priority),
        createdAt: serverTimestamp(),
      });
    }

    setForm({
      universityName: '',
      course: '',
      intake: '',
      deadline: '',
      status: '',
      priority: 1,
      comments: '',
      link: '',
    });
  };

  const handleEdit = (university: University) => {
    setForm(university);
    setEditingId(university.id!);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'universities', id);
    await deleteDoc(docRef);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-4">🎓 Student Panel</h2>
        <Link href="/student-dashboard" className="hover:text-blue-400">🎯 University Tracker</Link>
        <Link href="/student-dashboard/sop" className="hover:text-blue-400">📄 SOP Form</Link>
        <Link href="/student-dashboard/documents" className="hover:text-blue-400">📁 Documents</Link>
        <Link href="/student-dashboard/documents" className="hover:text-blue-400">✅ Approval Status</Link>
        <div className="mt-auto"><LogoutButton /></div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">🎯 University Tracker</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 bg-white p-4 rounded shadow">
          <input className="p-2 border rounded" placeholder="University Name" value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })} required />
          <input className="p-2 border rounded" placeholder="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required />
          <input className="p-2 border rounded" placeholder="Intake" value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })} required />
          <input className="p-2 border rounded" type="date" placeholder="Deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          <input className="p-2 border rounded" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <input className="p-2 border rounded" type="number" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
          <input className="p-2 border rounded" placeholder="Portal Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {editingId ? 'Update University' : 'Add University'}
          </button>
        </form>

        {/* KPI Cards (example) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Universities Added</h3>
            <p className="text-2xl font-bold">{universities.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Prioritized</h3>
            <p className="text-2xl font-bold">{universities.filter(u => u.priority <= 2).length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Status: Applied</h3>
            <p className="text-2xl font-bold">{universities.filter(u => u.status.toLowerCase().includes('applied')).length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {universities.map((uni) => (
            <div key={uni.id} className="p-4 border rounded shadow bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{uni.universityName}</h2>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(uni)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(uni.id!)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
              <p><strong>Course:</strong> {uni.course}</p>
              <p><strong>Intake:</strong> {uni.intake}</p>
              <p><strong>Deadline:</strong> {uni.deadline}</p>
              <p><strong>Status:</strong> {uni.status}</p>
              <p><strong>Priority:</strong> {uni.priority}</p>
              <p><strong>Link:</strong> <a className="text-blue-600 underline" href={uni.link} target="_blank">{uni.link}</a></p>
              <p><strong>Comments:</strong> {uni.comments}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
