"use client";

import { useEffect, useState } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { useAuth } from "@/lib/providers/auth-provider";
import Dashboard from "@/components/layout/dashboard";

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize database schema
    fetch("/api/init")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setInitialized(true);
        } else {
          console.error("Failed to initialize database:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error initializing database:", error);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-pulse text-blue-500 text-2xl mb-4">
            Loading...
          </div>
          <p className="text-gray-400">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <AdminLoginForm />
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <Dashboard />
        </div>
      )}
    </div>
  );
} 