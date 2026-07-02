import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RESEARCHER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  const roles = [
    { value: 'RESEARCHER', label: 'Student / Researcher' },
    { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
    { value: 'LAB_MANAGER', label: 'Lab Manager' },
    { value: 'DEPARTMENT_HEAD', label: 'Department Head' },
    { value: 'INSTITUTION_ADMIN', label: 'Institution Administrator' },
    { value: 'SYSTEM_ADMIN', label: 'System Administrator' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] px-4 relative overflow-hidden font-sans">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-purple-500/30">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-purple-500/10 text-purple-400 mb-3 border border-purple-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-gray-400 mt-2 text-sm">Register a new lab resource profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Priya Dharshini"
              className="w-full bg-[#16171d] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="w-full bg-[#16171d] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#16171d] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="role">
              Designated Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#16171d] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-200"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#16171d] text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition duration-200">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
