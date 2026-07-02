import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { token, user } = useContext(AuthContext);

  const features = [
    {
      title: 'Equipment Inventory',
      desc: 'Track lab devices, check real-time availability, and coordinate resources efficiently.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      title: 'Booking & Scheduling',
      desc: 'Seamless booking and reservations with built-in conflict resolution and rules.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Utilization & Analytics',
      desc: 'Monitor equipment duty-cycles, view resource analytics, and export custom reports.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Role-Based Dashboards',
      desc: 'Custom workflows and menus for students, technicians, managers, and system admins.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white overflow-hidden relative font-sans">
      {/* Background Neon Blur */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-violet-900/15 blur-[130px] pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/[0.05] relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Lab Resource Utilization
          </span>
        </div>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition duration-200 text-sm font-medium">
                Dashboard
              </Link>
              <span className="text-xs text-gray-500 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full text-purple-400">
                {user?.role}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 hover:text-purple-400 transition duration-200 text-sm font-medium">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition duration-200 text-sm font-medium shadow-md shadow-purple-500/10">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-purple-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
          Research Equipment Management Portal
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">
          Lab Resource Utilization Platform
        </h1>
        
        <p className="mt-6 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          An intelligent platform designed to track, schedule, maintain, and report laboratory assets. Elevate department efficiency with role-based access control.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to={token ? "/dashboard" : "/login"}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-xl shadow-purple-500/20 active:scale-[0.98] cursor-pointer"
          >
            {token ? 'Go to Dashboard' : 'Access the Platform'}
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white font-semibold transition duration-200"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Key Modules & Services</h2>
          <p className="text-gray-400 mt-2">Comprehensive suite built for modern scientific and educational labs</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04] group hover:-translate-y-1">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 text-center text-sm text-gray-600 relative z-10 bg-[#0b0c10]">
        &copy; {new Date().getFullYear()} Lab Resource Utilization Platform. Built with Spring Boot, React, and TailwindCSS.
      </footer>
    </div>
  );
};

export default Home;
