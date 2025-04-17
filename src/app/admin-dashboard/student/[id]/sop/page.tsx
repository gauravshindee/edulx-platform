'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';

export default function AdminSOPViewer() {
  const { id: studentId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sopQuestions = [
    "What motivated you to pursue higher education in your chosen field of study?",
    "How did your academic and personal experiences lead you to this specific program and university?",
    "What are your short-term and long-term career goals, and how does this program align with them?",
    "Can you describe any relevant research or projects you have been involved in and how they relate to your academic interests?",
    "What unique qualities, skills, or experiences do you bring to the university and your chosen program?",
    "How will you contribute to the academic and cultural diversity of the university community?",
    "Are there any specific professors, research centers, or resources at the university that attracted you to the program?",
    "Have you overcome any challenges or obstacles in your academic journey, and how have they shaped your aspirations?",
    "What are your specific areas of interest within your field of study, and how do you plan to explore them during your academic career?",
    "Can you highlight any extracurricular activities, leadership roles, or volunteer experiences that demonstrate your commitment to your chosen field or showcase your leadership skills?",
    "How do you see yourself contributing to the university's values, mission, or goals?",
    "Are there any relevant accomplishments, awards, or publications that you would like to mention?",
    "What do you hope to gain from this program, both academically and personally?",
    "How do you plan to use your education and knowledge to make a positive impact on society or your field?",
    "Can you provide examples of your ability to work collaboratively with others or your adaptability in different environments?",
    "Are there any specific courses or aspects of the program that you are particularly excited about?",
    "How do your academic and research interests align with current trends or challenges in your field?",
    "Can you discuss any innovative ideas or projects you hope to pursue during your time at the university?",
    "How do you plan to balance your academic responsibilities with any other commitments or obligations?",
    "Do you have any specific questions or concerns about the program or university that you would like to address in your SOP?"
  ];

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'users', studentId as string, 'sopResponses');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setData(snapshot.data());
      }
      setLoading(false);
    };
    fetchData();
  }, [studentId]);

  if (loading) return <p className="p-6">Loading SOP...</p>;
  if (!data) return <p className="p-6">No SOP submitted by this student.</p>;

  return (
    <main className="max-w-5xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4">📝 SOP Answers</h1>

      <section className="mb-8 bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Personal & Academic Info</h2>
        <p><strong>Full Name:</strong> {data.fullName}</p>
        <p><strong>DOB:</strong> {data.dateOfBirth}</p>
        <p><strong>Phone:</strong> {data.phoneNumber}</p>
        <p><strong>Address:</strong> {data.address}</p>
        <p><strong>School:</strong> {data.schoolDetails}</p>
        <p><strong>Bachelor's:</strong> {data.bachelorsDetails}</p>
        <p><strong>Master's:</strong> {data.mastersDetails}</p>
        <p><strong>Internship:</strong> {data.internshipDetails}</p>
      </section>

      <section className="space-y-6">
        {sopQuestions.map((q, idx) => (
          <div key={idx} className="border-b pb-4">
            <h3 className="font-medium mb-2">{idx + 1}. {q}</h3>
            <p className="text-gray-700 whitespace-pre-line">{data.sopAnswers?.[idx] || 'Not answered'}</p>
          </div>
        ))}
      </section>
      
    </main>
  );
}
