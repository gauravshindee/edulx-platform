'use client';

import { useEffect, useState } from 'react';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
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

export default function DocumentUploadPage() {
  const user = auth.currentUser;
  const [uploads, setUploads] = useState<{ [key: string]: Version[] }>({});
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      DOCUMENT_TYPES.forEach((type) => loadVersions(type));
      loadStatuses();
    }
  }, [user]);

  const loadStatuses = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, 'users', user.uid, 'documentStatus'));
    const result: { [key: string]: string } = {};
    snap.forEach((doc) => {
      result[doc.id] = doc.data().status;
    });
    setStatuses(result);
  };

  const loadVersions = async (type: string) => {
    if (!user) return;
    const path = `documents/${user.uid}/${type}`;
    const listRef = ref(storage, path);
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
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoadingType(type);

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `documents/${user.uid}/${type}/${fileName}`);

    try {
      await uploadBytes(storageRef, file);
      await addDoc(collection(db, 'users', user.uid, 'documents'), {
        type,
        fileName,
        uploadedAt: serverTimestamp(),
      });

      await loadVersions(type);
      alert('Upload successful!');
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    } finally {
      setLoadingType(null);
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return '✅ Approved';
      case 'rejected':
        return '❌ Rejected';
      case 'pending':
      default:
        return '⏳ Pending';
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-6">📁 Document Upload with Versioning</h1>

      <div className="space-y-8">
        {DOCUMENT_TYPES.map((type) => (
          <section key={type} className="border rounded p-4 bg-gray-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{type}</h2>
              <input
                type="file"
                onChange={(e) => handleUpload(e, type)}
                className="block"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {loadingType === type && <p className="text-blue-600">Uploading...</p>}

            {uploads[type]?.length ? (
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                {uploads[type].map((v, i) => (
                  <li key={i}>
                    <div className="flex justify-between items-center">
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
                      <span className="text-sm text-gray-700">{getStatusLabel(v.status)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No uploads yet.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
