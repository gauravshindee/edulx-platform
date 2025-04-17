'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SOPFormPage() {
  const user = auth.currentUser;
  const userId = user?.uid;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    schoolDetails: '',
    bachelorsDetails: '',
    mastersDetails: '',
    internshipDetails: '',
    sopAnswers: Array(20).fill(''),
  });

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
      if (!userId) return;
      const docRef = doc(db, 'users', userId, 'sopResponses');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setForm(snapshot.data());
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSOPAnswerChange = (index: number, value: string) => {
    const newAnswers = [...form.sopAnswers];
    newAnswers[index] = value;
    setForm({ ...form, sopAnswers: newAnswers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const docRef = doc(db, 'users', userId, 'sopResponses');
    await setDoc(docRef, {
      ...form,
      updatedAt: serverTimestamp()
    });

    alert('SOP saved successfully!');
  };

  if (loading) return <div className="p-10">Loading form...</div>;

  return (
    <main className="max-w-5xl mx-auto p-6 mt-8">
      <h1 className="text-3xl font-bold mb-6">📝 SOP Form</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal & Academic Details */}
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Personal & Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="fullName" placeholder="Full Name (as per passport)" className="p-2 border rounded" value={form.fullName} onChange={handleChange} />
            <input name="dateOfBirth" placeholder="Date of Birth" type="date" className="p-2 border rounded" value={form.dateOfBirth} onChange={handleChange} />
            <input name="phoneNumber" placeholder="Phone Number" className="p-2 border rounded" value={form.phoneNumber} onChange={handleChange} />
            <input name="address" placeholder="Address" className="p-2 border rounded" value={form.address} onChange={handleChange} />
            <textarea name="schoolDetails" placeholder="School name, grades, start & end dates" className="p-2 border rounded col-span-2" value={form.schoolDetails} onChange={handleChange} />
            <textarea name="bachelorsDetails" placeholder="Bachelor's university, grades, period" className="p-2 border rounded col-span-2" value={form.bachelorsDetails} onChange={handleChange} />
            <textarea name="mastersDetails" placeholder="Master's university, grades, period" className="p-2 border rounded col-span-2" value={form.mastersDetails} onChange={handleChange} />
            <textarea name="internshipDetails" placeholder="Internship details, position, area of work" className="p-2 border rounded col-span-2" value={form.internshipDetails} onChange={handleChange} />
          </div>
        </section>

        {/* SOP Questions */}
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">SOP Questions</h2>
          <div className="space-y-6">
            {sopQuestions.map((question, idx) => (
              <div key={idx}>
                <label className="block mb-2 font-medium">{idx + 1}. {question}</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  value={form.sopAnswers[idx]}
                  onChange={(e) => handleSOPAnswerChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">
          Save SOP
        </button>
      </form>
    </main>
  );
}
