"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TroubleshootPage() {
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string; error?: string; result?: any }>({
    success: false,
    message: "Testing database connection...",
  });

  const [initStatus, setInitStatus] = useState<{ success: boolean; message: string; error?: string }>({
    success: false,
    message: "Waiting to test DB initialization...",
  });

  useEffect(() => {
    // Test database connection
    fetch("/api/test-db")
      .then((response) => response.json())
      .then((data) => {
        setDbStatus(data);
        
        // Only try to initialize if connection is successful
        if (data.success) {
          setInitStatus({ success: false, message: "Testing database initialization..." });
          
          // Test database initialization
          fetch("/api/init")
            .then((response) => response.json())
            .then((initData) => {
              setInitStatus(initData);
            })
            .catch((error) => {
              setInitStatus({
                success: false,
                message: "Error initializing database",
                error: error.message,
              });
            });
        }
      })
      .catch((error) => {
        setDbStatus({
          success: false,
          message: "Error connecting to database",
          error: error.message,
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Database Troubleshooting</h1>
        
        <div className="space-y-6">
          {/* Database Connection Status */}
          <div className="p-4 rounded-lg border bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Database Connection</h2>
            <div className={`p-3 rounded ${dbStatus.success ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
              <p className="font-medium">{dbStatus.message}</p>
              {dbStatus.error && <p className="text-red-300 mt-1">{dbStatus.error}</p>}
              {dbStatus.result && (
                <pre className="mt-2 p-2 bg-gray-700/50 rounded text-sm">
                  {JSON.stringify(dbStatus.result, null, 2)}
                </pre>
              )}
            </div>
          </div>
          
          {/* Database Initialization Status */}
          <div className="p-4 rounded-lg border bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Database Initialization</h2>
            <div className={`p-3 rounded ${initStatus.success ? 'bg-green-500/20 border-green-500/50' : 'bg-yellow-500/20 border-yellow-500/50'}`}>
              <p className="font-medium">{initStatus.message}</p>
              {initStatus.error && <p className="text-red-300 mt-1">{initStatus.error}</p>}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-4 mt-6">
            <Link href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
              Back to Home
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 