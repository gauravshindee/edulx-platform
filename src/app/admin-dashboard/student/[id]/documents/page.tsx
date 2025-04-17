'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
} from 'firebase/firestore';
import { auth, db, storage } from '@/lib/firebase';

const DOCUMENT_TYPES = [
  'Passport Size Professional Picture',
  'Passport PDF (Back and Front)',
  '10th / 12th Certificate / Marksheet',
  'Degree and Transcripts / Marksheets',
  'APS Certificate',
  'IELTS / German Language Certificate',
  'LOR 1 - Company',
  'LOR 2 - Professor',
  'SOP / Motivation Questionnaire Filled',
  'Research Work',
  'Project Work',
  'Internship Letters',
  'Additional Extra-Curricular Certificates',
  'Entrance Exam Certificates',
  'Bachelors / Masters Course Module',
  'Grading System PDF',
  'Other Relevant Documents',
  'Others',
];

type Version = {
  url: string;
  fileName: string;
  uploadedAt: string;
  status?: string;
};

export default function AdminStudentDocumentsPage() {
  const { id: studentId } = useParams();
  const [uploads, setUploads] = useState<{ [key: string]: Version[] }>({});
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      DOCUMENT_TYPES.forEach((type) => loadVersions(studentId as string, type));
      loadStatuses(studentId as string);
    }
  }, [studentId]);

  const loadStatuses = async (uid: string) => {
    const statusSnap = await getDocs(collection(db, 'users', uid, 'documentStatus'));
    const result: { [key: string]: string } = {};
    statusSnap.forEach((doc) => {
      const data = doc.data();
      result[doc.id] = data.status;
    });
    setStatuses(result);
  };

  const loadVersions = async (uid: string, type: string) => {
    const path = `documents/${uid}/${type}`;
    const listRef = ref(storage, path);

    try {
      const result = await listAll(listRef);

      const versionList = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const key = `${type}_${item.name}`;
          return {
            url,
            fileName: item.name,
            uploadedAt: new Date(parseInt(item.name.split('_')[0])).toLocaleString(),
            status: statuses[key] || 'pending',
          };
        })
      );

      setUploads((prev) => ({ ...prev, [type]: versionList.reverse() }));
    } catch (error) {
      console.error('Error loading versions for', type, error);
    }

    setLoading(false);
  };

  const handleStatusChange = async (type: string, fileName: string, status: string) => {
    if (!studentId) return;
    const key = `${type}_${fileName}`;
    const docRef = doc(db, 'users', studentId as string, 'documentStatus', key);

    await setDoc(docRef, {
      type,
      fileName,
      status,
      reviewedBy: auth.currentUser?.email || 'admin',
      reviewedAt: new Date(),
    });

    setStatuses((prev) => ({ ...prev, [key]: status }));
  };

  return (
    <main className="max-w-6xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">📂 Student Document Viewer + Approval</h1>
      <p className="text-sm mb-8 text-gray-600">Showing documents for student ID: <span className="font-mono">{studentId}</span></p>

      {loading && <p>Loading document versions...</p>}

      <div className="space-y-8">
        {DOCUMENT_TYPES.map((type) => (
          <section key={type} className="border rounded p-4 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-2">{type}</h2>
            {uploads[type]?.length ? (
              <ul className="space-y-3">
                {uploads[type].map((v, i) => {
                  const key = `${type}_${v.fileName}`;
                  const currentStatus = statuses[key] || 'pending';
                  return (
                    <li key={i} className="text-sm border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {v.fileName}
                        </a>{' '}
                        <span className="text-gray-500">({v.uploadedAt})</span>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <label className="mr-2 font-medium">Status:</label>
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(type, v.fileName, e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="approved">✅ Approved</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No uploads found.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
