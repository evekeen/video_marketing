'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    productDescription: '',
    problem: '',
    targetAudience: ''
  });

  useEffect(() => {
    const savedData = localStorage.getItem('reelGeneratorFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reelGeneratorFormData', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams({
      productDescription: formData.productDescription,
      problem: formData.problem,
      targetAudience: formData.targetAudience
    });
    
    router.push(`/scenarios?${queryParams.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Instagram Reel Scenario Generator
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Product Description
            </label>
            <textarea
              id="productDescription"
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your product in detail..."
              value={formData.productDescription}
              onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
              Problem It Solves
            </label>
            <textarea
              id="problem"
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="What problem does your product solve?"
              value={formData.problem}
              onChange={(e) => setFormData({...formData, problem: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <textarea
              id="targetAudience"
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Who is your target audience?"
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-md font-medium hover:bg-purple-700 transition duration-200"
          >
            Generate Scenarios
          </button>
        </form>
      </div>
    </main>
  );
}
