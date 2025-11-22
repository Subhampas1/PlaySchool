import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import { User } from "../types";
import { api } from "../services/api";

interface LoginProps {
  onLogin: (user: User, token: string) => void;
  onBackToHome: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToHome }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Using the real backend API. No demo/test account autofill is provided.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (!email || !password) {
      setError("Please enter an email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const { user, token } = await api.login(email, password);
      onLogin(user, token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // No demo hint handler — users must enter real credentials.

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="p-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-300 to-sky-300 rounded-full flex items-center justify-center">
            <span className="text-4xl">🧸</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Tiny Toddlers Playschool
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Welcome! Please log in with your email and password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              autoComplete="email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 text-lg font-bold text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-rose-400 to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            onClick={onBackToHome}
            className="mt-6 text-sm text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 transition-colors"
          >
            &larr; Back to Home
          </button>

          {/* Demo/test account hints removed — use real backend credentials. */}
        </Card>
      </div>
    </div>
  );
};

export default Login;
