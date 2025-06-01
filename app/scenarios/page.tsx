'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Scenario {
  id: number;
  title: string;
  description: string;
  selected: boolean;
}

function ScenariosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const productDescription = searchParams.get('productDescription') || '';
  const problem = searchParams.get('problem') || '';
  const targetAudience = searchParams.get('targetAudience') || '';

  const generateScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productDescription,
          problem,
          targetAudience,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenarios');
      }

      const data = await response.json();
      setScenarios(data.scenarios);
    } catch (err) {
      setError('Failed to generate scenarios. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productDescription, problem, targetAudience]);

  useEffect(() => {
    if (!productDescription || !problem || !targetAudience) {
      router.push('/');
      return;
    }

    generateScenarios();
  }, [productDescription, problem, targetAudience, router, generateScenarios]);

  const toggleScenario = (id: number) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === id 
        ? { ...scenario, selected: !scenario.selected }
        : scenario
    ));
  };

  const selectedScenarios = scenarios.filter(s => s.selected);

  const exportSelected = () => {
    const text = selectedScenarios
      .map(s => `${s.id}. ${s.title}: ${s.description}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-reel-scenarios.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating creative scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Generated Reel Scenarios
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              New Generation
            </button>
            {selectedScenarios.length > 0 && (
              <button
                onClick={exportSelected}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
              >
                Export Selected ({selectedScenarios.length})
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Product Details:</h2>
          <p className="text-sm text-gray-600 mb-1"><strong>Description:</strong> {productDescription}</p>
          <p className="text-sm text-gray-600 mb-1"><strong>Problem:</strong> {problem}</p>
          <p className="text-sm text-gray-600"><strong>Target Audience:</strong> {targetAudience}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                scenario.selected 
                  ? 'ring-2 ring-purple-600 bg-purple-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => toggleScenario(scenario.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex-1">
                  {scenario.id}. {scenario.title}
                </h3>
                <input
                  type="checkbox"
                  checked={scenario.selected}
                  onChange={() => toggleScenario(scenario.id)}
                  className="ml-3 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p className="text-gray-600 text-sm">{scenario.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ScenariosContent />
    </Suspense>
  );
}