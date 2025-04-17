"use client";

import { useState } from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { FuturisticButton } from "../futuristic-button";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="p-6 rounded-lg bg-gray-900/70 backdrop-blur-lg border border-gray-700 w-full max-w-md mx-auto">
      <div className="space-y-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-100 text-center">Admin Login</h2>
        <p className="text-sm text-gray-400 text-center">
          Enter your credentials to access the admin dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 mb-4 text-sm rounded-md bg-red-500/20 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>

        <FuturisticButton
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Logging in..." : "Login"}
        </FuturisticButton>
      </form>
    </div>
  );
} 