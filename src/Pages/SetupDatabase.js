// src/pages/SetupDatabase.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setupDatabase } from "../Firebase/initFirestore";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function SetupDatabase() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // store JSX
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async () => {
    setLoading(true);
    setMessage(
      <span className="flex items-center gap-2">
        <Clock className="w-5 h-5" /> Setting up database... Please wait.
      </span>
    );

    try {
      const result = await setupDatabase();

      if (result.success) {
        setMessage(
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {result.message}
          </span>
        );
        setSuccess(true);
      } else {
        setMessage(
          <span className="flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Error: {result.error}
          </span>
        );
      }
    } catch (error) {
      setMessage(
        <span className="flex items-center gap-2">
          <XCircle className="w-5 h-5" /> Error: {error.message}
        </span>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f5ee] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-xl">
        <h1 className="text-3xl font-black font-serif text-[#0d2018] mb-4">
          Firebase Database Setup
        </h1>

        <p className="text-gray-600 mb-6">
          This will create all necessary collections in your Firestore database.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            This will create placeholder documents. You can delete them after adding real data.
          </p>
        </div>

        <button
          onClick={handleSetup}
          disabled={loading || success}
          className="w-full bg-[#0d4a2f] hover:bg-[#1a6b43] text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 mb-4"
        >
          {loading ? "Setting up..." : "Initialize Database"}
        </button>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm ${success
                ? "bg-green-50 text-green-700"
                : message.props.children[1]?.props?.children?.startsWith("Error")
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
              }`}
          >
            {message}
          </div>
        )}

        {success && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Setup Complete!
              </h3>
              <p className="text-sm text-green-700">
                Your database is ready. You can now:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-green-700">
                <li>Go to Firebase Console to view your collections</li>
                <li>Start adding admin data</li>
                <li>Create test users</li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}