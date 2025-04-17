'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Approval = {
  studentId: string;
  type: string;
  fileName: string;
  status: string;
  reviewedBy: string;
  reviewedAt: string;
};

export default function DocumentApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllApprovals = async () => {
      const snapshot = await getDocs(collectionGroup(db, 'documentStatus'));

      const list: Approval[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const pathSegments = doc.ref.path.split('/');
        const studentId = pathSegments[1]; // users/{studentId}/documentStatus/{docId}
        return {
          studentId,
          type: data.type,
          fileName: data.fileName,
          status: data.status,
          reviewedBy: data.reviewedBy || '',
          reviewedAt: data.reviewedAt?.toDate().toLocaleString() || '',
        };
      });

      setApprovals(list);
      setLoading(false);
    };

    fetchAllApprovals();
  }, []);

  const exportCSV = () => {
    const header = ['Student ID', 'Document Type', 'File Name', 'Status', 'Reviewed By', 'Reviewed At'];
    const rows = approvals.map((a) => [
      a.studentId,
      a.type,
      a.fileName,
      a.status,
      a.reviewedBy,
      a.reviewedAt,
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'document_approvals.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-6xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Document Approval Export</h1>
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download CSV
        </button>
      </div>

      {loading ? (
        <p>Loading approvals...</p>
      ) : approvals.length === 0 ? (
        <p>No document approvals found.</p>
      ) : (
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Student ID</th>
              <th className="p-2 border">Document Type</th>
              <th className="p-2 border">File Name</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Reviewed By</th>
              <th className="p-2 border">Reviewed At</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((a, i) => (
              <tr key={i}>
                <td className="p-2 border">{a.studentId}</td>
                <td className="p-2 border">{a.type}</td>
                <td className="p-2 border">{a.fileName}</td>
                <td className="p-2 border">{a.status}</td>
                <td className="p-2 border">{a.reviewedBy}</td>
                <td className="p-2 border">{a.reviewedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
