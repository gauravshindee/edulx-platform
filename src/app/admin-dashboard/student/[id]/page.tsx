'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function AdminStudentDetailPage() {
  const { id: studentId } = useParams();
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [sopAnswers, setSopAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchAll();
    }
  }, [studentId]);

  const fetchAll = async () => {
    const userRef = doc(db, 'users', studentId as string);
    const userSnap = await getDoc(userRef);
    setStudentInfo(userSnap.data());

    const uniRef = collection(db, 'users', studentId as string, 'universities');
    const uniSnap = await getDocs(uniRef);
    const uniList = uniSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUniversities(uniList);

    const sopRef = doc(db, 'users', studentId as string, 'sop', 'answers');
    const sopSnap = await getDoc(sopRef);
    if (sopSnap.exists()) setSopAnswers(sopSnap.data());

    setLoading(false);
  };

  return (
    <main className="max-w-5xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4">📘 Student Detail Overview</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">👤 Student Info</h2>
            <p><strong>Email:</strong> {studentInfo?.email}</p>
            <p><strong>UID:</strong> {studentId}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">🎓 Universities</h2>
            {universities.map((uni) => (
              <div key={uni.id} className="border p-4 rounded mb-2 bg-white shadow">
                <p><strong>{uni.universityName}</strong> ({uni.course})</p>
                <p>Status: {uni.status} | Priority: {uni.priority}</p>
              </div>
            ))}
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">📄 SOP Answers</h2>
            {Object.entries(sopAnswers).map(([key, value]) => (
              <div key={key} className="mb-3">
                <p className="font-medium">{key}</p>
                <p className="text-sm text-gray-600">{value}</p>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">📁 Documents</h2>
            <p>
              View documents and approval statuses on{' '}
              <a
                className="text-blue-600 underline"
                href={`/admin-dashboard/student/${studentId}/documents`}
              >
                this page
              </a>
              .
            </p>
          </section>
        </>
      )}
    </main>
  );
}
