'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type University = {
  id: string;
  universityName: string;
  course: string;
  intake: string;
  deadline: string;
  status: string;
  priority: number;
  comments: string;
  link: string;
};

export default function AdminUniversityTrackerPage() {
  const { id: studentId } = useParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      const ref = collection(db, 'users', studentId as string, 'universities');
      const snapshot = await getDocs(ref);
      const list: University[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          universityName: data.universityName,
          course: data.course,
          intake: data.intake,
          deadline: data.deadline,
          status: data.status,
          priority: data.priority,
          comments: data.comments,
          link: data.link,
        };
      });
      
      setUniversities(list);
      setLoading(false);
    };

    fetchUniversities();
  }, [studentId]);

  return (
    <main className="max-w-6xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">🎓 University Tracker</h1>
      <p className="text-sm text-gray-500 mb-4">Showing university applications for UID: <span className="font-mono">{studentId}</span></p>

      {loading ? (
        <p>Loading universities...</p>
      ) : universities.length === 0 ? (
        <p>No university applications found for this student.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universities.map((uni) => (
            <div key={uni.id} className="border rounded p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-1">{uni.universityName}</h2>
              <p><strong>Course:</strong> {uni.course}</p>
              <p><strong>Intake:</strong> {uni.intake}</p>
              <p><strong>Deadline:</strong> {uni.deadline}</p>
              <p><strong>Status:</strong> {uni.status}</p>
              <p><strong>Priority:</strong> {uni.priority}</p>
              <p><strong>Link:</strong> <a href={uni.link} className="text-blue-600 underline" target="_blank">{uni.link}</a></p>
              <p><strong>Comments:</strong> {uni.comments}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
