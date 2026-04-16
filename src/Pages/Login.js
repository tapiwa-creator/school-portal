// Pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { GraduationCap } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: authLoading } = useAuth();
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message || "";
  const isAdmin = role === "admin";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let email = form.email;
      if (form.email === "123") {
        email = "admin@school.com";
      } else if (form.email === "1234") {
        email = "student@school.com";
      } else if (!email.includes('@')) {
        email = `${form.email}@school.com`;
      }

      const result = await login(email, form.password);

      if (result && result.success) {
        if (!authLoading) {
          const from = location.state?.from?.pathname || `/${result.role}`;
          navigate(from, { replace: true });
        }
      } else {
        if (result?.error) {
          if (result.error.includes('user-not-found')) {
            setError(`No account found with email: ${email}. Please create an account first.`);
          } else if (result.error.includes('wrong-password')) {
            setError("Incorrect password. Please try again.");
          } else if (result.error.includes('invalid-email')) {
            setError("Invalid email format.");
          } else if (result.error.includes('too-many-requests')) {
            setError("Too many failed attempts. Please try again later.");
          } else if (result.error.includes('network-request-failed')) {
            setError("Network error. Please check your internet connection.");
          } else {
            setError(result.error);
          }
        } else {
          setError("Invalid credentials. Please check your ID and password.");
        }
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/login.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="text-center bg-white/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-[#0d4a2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0d4a2f] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .card-in { animation: cardIn 0.55s cubic-bezier(.22,1,.36,1) both; }
        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          width: 20px; height: 20px;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
        }

        .login-bg {
          background-image: url('/login.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: scroll;
          background-position: center center;
        }
        @media (min-width: 1280px) {
          .login-bg { background-position: center center; }
        }
        @media (min-width: 1024px) and (max-width: 1279px) {
          .login-bg { background-position: center center; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .login-bg { background-position: center center; }
        }
        @media (max-width: 767px) {
          .login-bg { background-position: center center; }
        }
      `}</style>

      <div className="login-bg min-h-screen flex items-center justify-center px-6 py-8 relative">

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Login Form Card - Reduced width */}
        <div
          className="card-in bg-white/95 backdrop-blur-sm w-full max-w-sm rounded-3xl overflow-hidden relative z-10 flex flex-col"
          style={{ boxShadow: "0 28px 70px rgba(0,0,0,0.25), 0 4px 18px rgba(0,0,0,0.15)" }}
        >
          {/* Header / Green Banner */}
          <div className="bg-[#0d4a2f] px-6 py-6 flex flex-col items-center gap-3">
            <Link
              to="/"
              className="self-start flex items-center gap-1.5 text-white hover:text-white/70 text-xs font-medium transition-colors duration-200 mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#22a86a] shadow-lg flex-shrink-0 bg-white p-0.5">
                <img src="/image.png" alt="Corner Stone Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-white font-bold text-lg font-serif tracking-wide">
                Corner Stone Primary
              </span>
            </div>
            <p className="text-white/60 text-xs tracking-wide">Welcome back — sign in to continue</p>

            {/* Role tabs */}
            <div className="mt-3 flex bg-[#0a3d26] rounded-full p-1 w-full max-w-xs">
              <button
                type="button"
                onClick={() => { setRole("student"); setError(""); setForm({ email: "", password: "" }); }}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${!isAdmin ? "bg-[#22a86a] text-white shadow-md" : "text-white/50 hover:text-white/80"}`}
                disabled={loading}
              >
                <GraduationCap className="w-4 h-4 inline-block" /> Student
              </button>
              <button
                type="button"
                onClick={() => { setRole("admin"); setError(""); setForm({ email: "", password: "" }); }}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isAdmin ? "bg-[#22a86a] text-white shadow-md" : "text-white/50 hover:text-white/80"}`}
                disabled={loading}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-6 bg-transparent flex-1">
            {successMessage && (
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-700 border border-green-200 mb-4 shadow-sm">
                <span>✅</span> {successMessage}
              </div>
            )}

            <h2 className="text-xl font-black font-serif text-[#0d2018] mb-1">
              {isAdmin ? "Admin Login" : "Student Login"}
            </h2>
            <p className="text-xs text-[#6b8f7a] mb-5">
              {isAdmin
                ? "Access the administration dashboard."
                : "Access your courses and learning portal."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ID / Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">
                  {isAdmin ? "Admin ID / Email" : "Student ID / Email"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={isAdmin ? "Enter admin ID or email" : "Enter student ID or email"}
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#3a5a48] tracking-wide uppercase">Password</label>
                  <Link to="/support" className="text-xs text-[#22a86a] hover:text-[#1a6b43] font-medium transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f7a]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 bg-white/90 text-[#0d2018] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22a86a]/40 focus:border-[#22a86a] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8f7a] hover:text-[#22a86a] transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0d4a2f] hover:bg-[#1a6b43] text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  `Sign In as ${isAdmin ? "Admin" : "Student"} →`
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-200 text-center">
              <p className="text-xs text-[#6b8f7a] leading-relaxed">
                Don't have an account?{" "}
                <Link
                  to="/create-account"
                  className="text-[#22a86a] hover:text-[#1a6b43] font-bold transition-colors duration-200 ml-1"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;