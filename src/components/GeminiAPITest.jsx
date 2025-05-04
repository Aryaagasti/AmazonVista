import React, { useState } from 'react';
import { testGeminiAPI } from '../services/geminiService';

export default function GeminiAPITest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await testGeminiAPI();
      console.log("Test API response:", response);
      
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      console.error("Error testing API:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md max-w-2xl mx-auto my-4">
      <h2 className="text-xl font-bold mb-4">Gemini API Test</h2>
      
      <button
        onClick={handleTestAPI}
        disabled={loading}
        className="bg-amazon_teal text-white px-4 py-2 rounded-md hover:bg-teal-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test Gemini API'}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          <h3 className="font-bold">Error:</h3>
          <p className="whitespace-pre-wrap">{error}</p>
          {result?.details && (
            <div className="mt-2 text-sm">
              <h4 className="font-bold">Details:</h4>
              <p className="whitespace-pre-wrap">{result.details}</p>
            </div>
          )}
        </div>
      )}
      
      {result && !error && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
          <h3 className="font-bold">Success!</h3>
          <div className="mt-2">
            <h4 className="font-bold">Response:</h4>
            {result.candidates && result.candidates[0] && result.candidates[0].content ? (
              <div className="bg-white p-3 rounded border mt-2">
                <p className="whitespace-pre-wrap">{result.candidates[0].content.parts[0].text}</p>
              </div>
            ) : (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-bold">API Format Used:</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">
{`curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY" \\
-H 'Content-Type: application/json' \\
-X POST \\
-d '{
  "contents": [{
    "parts":[{"text": "Explain how AI works"}]
    }]
   }'`}
        </pre>
      </div>
    </div>
  );
}
