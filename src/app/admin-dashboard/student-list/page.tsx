'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

type Student = {
  id: string;
  email: string;
  role: string;
  createdAt?: any;
};

export default function StudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const studentList: Student[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'student') {
          studentList.push({
            id: doc.id,
            email: data.email,
            role: data.role,
            createdAt: data.createdAt?.toDate()?.toLocaleString() || '',
          });
        }
      });

      setStudents(studentList);
      setLoading(false);
    };

    fetchStudents();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4">👩‍🎓 All Registered Students</h1>

      {loading ? (
        <p>Loading student list...</p>
      ) : students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul className="space-y-4">
          {students.map((student) => (
            <li key={student.id} className="border p-4 rounded shadow-sm">
              <div className="mb-2">
                <p className="font-semibold">{student.email}</p>
                <p className="text-sm text-gray-500">UID: {student.id}</p>
                <p className="text-sm text-gray-500">Created: {student.createdAt}</p>
              </div>
              <div className="flex gap-4">
                <Link
                  href={`/admin-dashboard/student/${student.id}/documents`}
                  className="text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  View Documents
                </Link>
                <Link
                  href={`/admin-dashboard/student/${student.id}/sop`}
                  className="text-white bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 text-sm"
                >
                  View SOP
                </Link>
                <Link
                   href={`/admin-dashboard/student/${student.id}/universities`}
                  className="text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                 View Universities
                </Link>

              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
